from django import template
from django.template.defaultfilters import stringfilter

register = template.Library()

@register.filter
def percentage(value, total):
    """
    Returns the percentage of value relative to total
    """
    try:
        value = int(value)
        total = int(total)
        if total == 0:
            return 0
        return round((value / total) * 100, 2)
    except (ValueError, TypeError, ZeroDivisionError):
        return 0