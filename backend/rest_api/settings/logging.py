"""
Logging settings for the Django project.
"""
import os
from .base import INSTALLED_APPS

LOG_LEVEL = os.getenv('PANDAUI_LOG_LEVEL', 'INFO')
LOG_PATH = os.getenv('PANDAUI_LOG_PATH', '/tmp') + '/'
LOG_MAX_BYTES = int(os.getenv('PANDAUI_LOG_MAX_BYTES', 100 * 1024 * 1024))

# base logging configuration
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{asctime} {levelname} {name} {message}",
            "style": "{",
        },
    },
    "handlers": {
        'null': {
            'level': LOG_LEVEL,
            'class': 'logging.NullHandler',
        },
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
        "file_django": {
            "level": LOG_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            'maxBytes': LOG_MAX_BYTES,
            'backupCount': 3,
            "filename": f"{LOG_PATH}django.log",
            "formatter": "verbose",
        },
        "file_request": {
            "level": LOG_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            'maxBytes': LOG_MAX_BYTES,
            'backupCount': 3,
            "filename": f"{LOG_PATH}request.log",
            "formatter": "verbose",
        },
        "general_error": {
            "level": "WARNING",
            "class": "logging.FileHandler",
            "filename": f"{LOG_PATH}general_error.log",
            "formatter": "verbose",
        }
    },
    "loggers": {
        "django": {
            "handlers": ["file_django", ],
            "level": "INFO",
            "propagate": True,
        },
        "django.request": {
            "handlers": ["file_request", ],
            "level": "ERROR",
            "propagate": False,
        },
        "django.security": {
            "handlers": ["file_request", ],
            "level": "ERROR",
            "propagate": False,
        },
        'django.utils.autoreload': {
            'level': 'CRITICAL',  # suppress autoreload logging
            'handlers': ['null'],
        },
    },
}

# create a separate log file for each app
apps = [app_name.replace('rest_api.', '') for app_name in INSTALLED_APPS if app_name.startswith('rest_api.')]
for app_name in apps:
    LOGGING["handlers"][app_name] = {
        "level": LOG_LEVEL,
        "class": "logging.handlers.RotatingFileHandler",
        'maxBytes': LOG_MAX_BYTES,
        'backupCount': 3,
        "filename": f"{LOG_PATH}{app_name}.log",
        "formatter": "verbose",
    }
    LOGGING["loggers"][app_name] = {
        "handlers": [app_name],
        "level": LOG_LEVEL,
        "propagate": True,
    }