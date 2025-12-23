from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from datetime import datetime, timedelta
from .models import PageView, ContentInteraction, UserActivity

User = get_user_model()


def get_analytics_data():
    """
    Function to gather analytics data for the dashboard
    """
    # Calculate date range (last 30 days)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    # Total page views
    total_views = PageView.objects.filter(
        timestamp__range=[start_date, end_date]
    ).count()
    
    # Total unique visitors
    unique_visitors = PageView.objects.filter(
        timestamp__range=[start_date, end_date]
    ).values('ip_address').distinct().count()
    
    # Total user activities
    total_activities = UserActivity.objects.filter(
        timestamp__range=[start_date, end_date]
    ).count()
    
    # Content interactions by type
    content_interactions = ContentInteraction.objects.filter(
        timestamp__range=[start_date, end_date]
    ).values('content_type').annotate(count=Count('id'))
    
    # User activity by day (last 7 days)
    week_start = end_date - timedelta(days=7)
    daily_activities = UserActivity.objects.filter(
        timestamp__range=[week_start, end_date]
    ).extra(select={'day': 'date(timestamp)'}).values('day').annotate(
        count=Count('id')
    ).order_by('day')
    
    # Top pages viewed
    top_pages = PageView.objects.filter(
        timestamp__range=[start_date, end_date],
        page__isnull=False
    ).values('page__title').annotate(
        count=Count('id')
    ).order_by('-count')[:5]
    
    # User activity by role
    user_activity_by_role = UserActivity.objects.filter(
        timestamp__range=[start_date, end_date]
    ).values('user__groups__name').annotate(
        count=Count('id')
    ).exclude(user__groups__name__isnull=True)
    
    return {
        'total_views': total_views,
        'unique_visitors': unique_visitors,
        'total_activities': total_activities,
        'content_interactions': list(content_interactions),
        'daily_activities': list(daily_activities),
        'top_pages': list(top_pages),
        'user_activity_by_role': list(user_activity_by_role),
    }


def analytics_dashboard_api(request):
    """
    API endpoint to provide analytics data for charts
    """
    data = get_analytics_data()
    return JsonResponse(data)


def analytics_page_view(request):
    """
    View for the analytics dashboard page
    """
    context = {
        'analytics_data': get_analytics_data()
    }
    return render(request, 'analyticsmanagement/analytics_dashboard.html', context)