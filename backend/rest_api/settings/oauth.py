"""
Authentication settings for the REST API.
"""
import json
import os

AUTHENTICATION_BACKENDS = [
    'rest_api.oauth.backends.IamBackend',
    'django.contrib.auth.backends.ModelBackend',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# get the IAM configuration from the environment
INDIGO_IAM_CONFIG = json.loads(os.getenv('PANDAUI_AUTH_INDIGO_IAM'))
SOCIAL_AUTH_OIDC_OIDC_ENDPOINT = INDIGO_IAM_CONFIG['ENDPOINT']
SOCIAL_AUTH_IAM_KEY = INDIGO_IAM_CONFIG['CLIENT_ID']
SOCIAL_AUTH_IAM_SECRET = INDIGO_IAM_CONFIG['CLIENT_SECRET']
SOCIAL_AUTH_IAM_SCOPE = ['wlcg.groups']
SOCIAL_AUTH_IAM_EXTRA_DATA = ['id_token']

SOCIAL_AUTH_REDIRECT_IS_HTTPS = True
SOCIAL_AUTH_PIPELINE = (
    'social_core.pipeline.social_auth.social_details',
    'social_core.pipeline.social_auth.social_uid',
    'social_core.pipeline.social_auth.auth_allowed',
    'social_core.pipeline.social_auth.social_user',
    'social_core.pipeline.user.get_username',
    'social_core.pipeline.social_auth.associate_by_email',
    'social_core.pipeline.user.create_user',
    'social_core.pipeline.social_auth.associate_user',
    'social_core.pipeline.social_auth.load_extra_data',
    'social_core.pipeline.user.user_details',
)
LOGIN_REDIRECT_URL = '/api/oauth/redirect_after_login/'
FRONTEND_BASE_URL = os.getenv('PANDAUI_FRONTEND_BASE_URL', 'localhost')

# cookie settings
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True

