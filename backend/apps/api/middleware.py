import time
import re
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.core.cache import cache
from .models import APIIntegration, APIIntegrationLog
from django.utils import timezone


class APIKeyAuthMiddleware(MiddlewareMixin):
    """
    Middleware to handle API key authentication and rate limiting
    """
    def process_request(self, request):
        # Skip authentication for admin and static/media files
        if request.path.startswith('/django-admin/') or \
           request.path.startswith('/static/') or \
           request.path.startswith('/media/'):
            return None

        # Only process API requests
        if not request.path.startswith('/api/'):
            return None

        # Extract API key from header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Api-Key '):
            # For backward compatibility, also check query parameter
            api_key = request.GET.get('api_key', '')
            if not api_key:
                if request.path.startswith('/api/markers/') or request.path.startswith('/api/challenges/'):
                    # For read-only endpoints, allow unauthenticated access
                    return None
                return JsonResponse({
                    'error': 'API key is required. Use header: Authorization: Api-Key <your-key>'
                }, status=401)
        else:
            api_key = auth_header.replace('Api-Key ', '').strip()

        try:
            integration = APIIntegration.objects.get(api_key=api_key)
        except APIIntegration.DoesNotExist:
            return JsonResponse({'error': 'Invalid API key'}, status=401)

        # Check if integration is active
        if not integration.is_active:
            return JsonResponse({'error': 'API key is inactive'}, status=401)

        # Check IP whitelist if configured
        ip_address = self.get_client_ip(request)
        if integration.ip_whitelist:
            allowed_ips = [ip.strip() for ip in integration.ip_whitelist.split(',')]
            if allowed_ips and ip_address not in allowed_ips:
                return JsonResponse({'error': 'IP address not allowed'}, status=403)

        # Check rate limiting
        if self.is_rate_limited(integration, ip_address):
            return JsonResponse({'error': 'Rate limit exceeded'}, status=429)

        # Store integration in request for later use
        request.api_integration = integration
        request.api_key = api_key
        
        return None

    def process_response(self, request, response):
        # Log API request if this is an API request and has an integration
        if (hasattr(request, 'api_integration') and 
            request.path.startswith('/api/') and 
            not request.path.startswith('/api/integrations/')):
            
            # Calculate response time
            start_time = getattr(request, 'start_time', time.time())
            response_time = time.time() - start_time

            # Create log entry
            APIIntegrationLog.objects.create(
                integration=request.api_integration,
                endpoint=request.path,
                method=request.method,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                response_status=response.status_code,
                response_time=response_time
            )

        return response

    def process_view(self, request, view_func, view_args, view_kwargs):
        # Record start time for response time calculation
        request.start_time = time.time()
        
        # Check if integration is set and has allowed endpoints restriction
        if hasattr(request, 'api_integration'):
            integration = request.api_integration
            if integration.allowed_endpoints:
                allowed_endpoints = [ep.strip() for ep in integration.allowed_endpoints.split(',')]
                # Check if current path matches any of the allowed endpoints
                path_matches = False
                for endpoint in allowed_endpoints:
                    # Support both exact matches and pattern matches
                    if request.path == f'/api{endpoint}' or \
                       re.match(r'^/api' + endpoint.replace('*', '.*') + '/?$', request.path):
                        path_matches = True
                        break
                
                if not path_matches:
                    return JsonResponse({
                        'error': f'Access to {request.path} is not allowed for this API key'
                    }, status=403)

        return None

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def is_rate_limited(self, integration, ip_address):
        # Create a cache key based on integration ID and IP
        cache_key = f"api_rate_limit_{integration.id}_{ip_address}_{timezone.now().hour}"
        
        # Get current count
        current_count = cache.get(cache_key, 0)
        
        # Increment count
        current_count += 1
        cache.set(cache_key, current_count, timeout=3600)  # 1 hour timeout
        
        # Check if count exceeds rate limit
        return current_count > integration.rate_limit