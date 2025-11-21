"""
Django settings for rest_api project.

"""

import os
from pathlib import Path

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
    # django essentials
    # 'django.contrib.admin',
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
    "rest_api.oauth",
    "rest_api.job",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "rest_api.urls"

WSGI_APPLICATION = "rest_api.wsgi.application"

# session settings
SESSION_ENGINE = "django.contrib.sessions.backends.cached_db"
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_DOMAIN = ".cern.ch"
SESSION_COOKIE_SAMESITE = "Lax"

# internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = False


# static files (CSS, JavaScript, Images)
STATIC_URL = "static/"

# PanDA API URL
PANDA_SERVER_API_URL = os.getenv("PANDA_SERVER_API_URL", None)
if not PANDA_SERVER_API_URL:
    raise ValueError("PANDA_API_URL environment variable is not set")
