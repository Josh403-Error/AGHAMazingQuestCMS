"""Expose unified settings as the default settings module.

This file allows `DJANGO_SETTINGS_MODULE='config.settings'` to work and
keeps the main settings in `unified.py` which is optimized for the CMS functionality.
"""
from .unified import *  # noqa: F401,F403