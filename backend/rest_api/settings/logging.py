"""
Logging settings for the Django project.
"""
import os
from .base import INSTALLED_APPS

LOG_LEVEL = os.getenv('PANDAUI_LOG_LEVEL', 'INFO')
LOG_PATH = os.getenv('PANDAUI_LOG_PATH', '/tmp/')

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
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
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
        "general_error" : {
            "handlers": ["general_error"],
            "level": "WARNING",
            "propagate": True,
        }
    },
}

# create a separate log file for each app
apps = [app_name.replace('rest_api.', '') for app_name in INSTALLED_APPS if app_name.startswith('rest_api.')]
for app_name in apps:
    LOGGING["handlers"][app_name] = {
        "level": LOG_LEVEL,
        "class": "logging.FileHandler",
        "filename": f"{LOG_PATH}{app_name}.log",
        "formatter": "verbose",
    }
    LOGGING["loggers"][app_name] = {
        "handlers": [app_name],
        "level": LOG_LEVEL,
        "propagate": True,
    }