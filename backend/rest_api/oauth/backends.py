
from social_core.backends.open_id_connect import OpenIdConnectAuth
from django.conf import settings
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import AuthenticationFailed
from rest_api.oauth.utils import update_user_groups
import logging
_logger = logging.getLogger('oauth')


class IamBackend(OpenIdConnectAuth):
    """
    Class for Indigo IAM authentication backend
    """
    name = 'iam'
    OIDC_ENDPOINT = settings.SOCIAL_AUTH_OIDC_OIDC_ENDPOINT
    TOKEN_ENDPOINT_AUTH_METHOD = 'client_secret_post'
    REDIRECT_STATE = True
    ID_KEY = 'email'

    def auth_complete(self, *args, **kwargs):
        """
        Override the auth_complete method to handle the response from the OIDC provider.
        Create a DRF Token for the user and put it in cookies.
        """
        user = super().auth_complete(*args, **kwargs)
        _logger.debug(f'User details: {user}')

        if not user.is_authenticated:
            _logger.error('User not authenticated')
            raise AuthenticationFailed("Failed to complete authentication")

        # Create a DRF Token for the user
        token, created = Token.objects.get_or_create(user=user)
        if created:
            _logger.info(f'Created new token for user {user.username}')
        else:
            _logger.info(f'Using existing token for user {user.username}')

        return user

    def user_data(self, access_token, *args, **kwargs):
        """
        Load user data from the service
        """
        user_data = super().user_data(access_token, *args, **kwargs)
        _logger.debug(f'User data: {user_data}')
        if 'wlcg.groups' in user_data and ['wlcg.groups'] and len(user_data['wlcg.groups']) > 0:
            is_success = update_user_groups(user_data['email'], user_data['wlcg.groups'])
            _logger.debug(f"User groups update status: {is_success}, user: {user_data['email']}, groups: {user_data['wlcg.groups']}")
        return user_data



