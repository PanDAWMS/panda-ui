"""
Django settings for rest_api project.

"""

import os
from pathlib import Path

from django.utils.csp import CSP

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv("PANDAUI_SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv("PANDAUI_DEBUG", default=False)

# SECURITY WARNING: do not use [*] in production, it is a list of host/domain names  this app is allowed to serve
ALLOWED_HOSTS = os.getenv("PANDAUI_ALLOWED_HOSTS", default="").split(",")

# Application definition
INSTALLED_APPS = [
    # websockets
    "daphne",
    "channels",
    # django essentials
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # CORS headers
    "corsheaders",
    # DRF
    "rest_framework",
    "rest_framework.authtoken",
    # apps
    "rest_api.job",
    "rest_api.oauth",
    "rest_api.search",
    "rest_api.task",
    "rest_api.aide",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.csp.ContentSecurityPolicyMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    },
}

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.TokenAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_RENDERER_CLASSES": ("rest_framework.renderers.JSONRenderer",),
    "DEFAULT_VERSIONING_CLASS": "rest_framework.versioning.URLPathVersioning",
    "DEFAULT_VERSION": "v1",
    "ALLOWED_VERSIONS": ["v1", "v2"],
    "VERSION_PARAM": "version",
}

ROOT_URLCONF = "rest_api.urls"

ASGI_APPLICATION = "rest_api.asgi.application"
WSGI_APPLICATION = "rest_api.wsgi.application"

# internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = False


# UI frontend and backend URLs
FRONTEND_BASE_URL = os.getenv("PANDAUI_FRONTEND_BASE_URL", None)
if not FRONTEND_BASE_URL or (isinstance(FRONTEND_BASE_URL, str) and not FRONTEND_BASE_URL.startswith("http")):
    raise ValueError("PANDAUI_FRONTEND_BASE_URL environment variable is not set or does not start with http(s)")

# PanDA API URL
PANDA_SERVER_API_URL = os.getenv("PANDA_SERVER_API_URL", None)
if not PANDA_SERVER_API_URL:
    raise ValueError("PANDA_SERVER_API_URL environment variable is not set")


SECURE_CSP = {
    "default-src": [CSP.SELF],
    "connect-src": [
        CSP.SELF,
        "https:",
        "wss:",
    ],
}
