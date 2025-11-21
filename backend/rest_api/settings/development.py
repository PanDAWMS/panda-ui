"""
Development settings for the Django project.
"""

from .logging import LOGGING
from .oauth import REST_FRAMEWORK

DEBUG = True

# allow all hosts
ALLOWED_HOSTS = ["*"]

# Frontend URL
FRONTEND_BASE_URL = "http://aipanda033.cern.ch:8000"

# CORS
CORS_ALLOWED_ORIGINS = []
for x in range(0, 9):
    CORS_ALLOWED_ORIGINS.append(f"http://aipanda033.cern.ch:800{x}")  # all open ports
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    "authorization",
    "content-type",
    "x-csrftoken",
]
CORS_ALLOW_ALL_ORIGINS = True

# Make auth work with HTTP in development
SOCIAL_AUTH_REDIRECT_IS_HTTPS = False
# Make session work with HTTP in development
SESSION_COOKIE_SECURE = False
# CSRF_COOKIE_SECURE = False
SESSION_COOKIE_DOMAIN = ".cern.ch"
SESSION_COOKIE_SAMESITE = "Lax"

# Logging
for logger in LOGGING["loggers"]:
    LOGGING["loggers"][logger]["level"] = "DEBUG"
    LOGGING["loggers"][logger]["handlers"].append("console")

REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] += ("rest_framework.renderers.BrowsableAPIRenderer",)
