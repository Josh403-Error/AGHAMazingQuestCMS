from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from .views import get_analytics_data


@method_decorator(login_required, name='dispatch')
class AnalyticsDashboardView(TemplateView):
    template_name = 'analyticsmanagement/analytics_dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['analytics_data'] = get_analytics_data()
        return context