"""
Development settings for the Django project.
"""

from .base import FRONTEND_BASE_URL, REST_FRAMEWORK
from .logging import LOGGING

DEBUG = True

# allow all hosts
ALLOWED_HOSTS = ["*"]

# Add django-extensions to installed apps for development
INSTALLED_APPS_DEV = [
    "django_extensions",
]

# CORS
CORS_ALLOWED_ORIGINS = [f"{FRONTEND_BASE_URL}"]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    "authorization",
    "content-type",
    "x-csrftoken",
]

# Make auth work with HTTP in development
SOCIAL_AUTH_REDIRECT_IS_HTTPS = False
# Make session work with HTTP in development
SESSION_COOKIE_SECURE = False
# CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SAMESITE = "Lax"

# Logging
for logger in LOGGING["loggers"]:
    if logger in ["django.utils.autoreload"]:
        continue
    LOGGING["loggers"][logger]["level"] = "DEBUG"
    LOGGING["loggers"][logger]["handlers"].append("console")

# Browsable API Renderer for development
REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] += ("rest_framework.renderers.BrowsableAPIRenderer",)
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
            ],
        },
    },
]
