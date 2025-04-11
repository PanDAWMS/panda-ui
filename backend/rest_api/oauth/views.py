from django.shortcuts import redirect
from django.http import JsonResponse
from django.conf import settings
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required

import logging

from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from rest_api.oauth.utils import preserve_cookies

_logger = logging.getLogger('oauth')


@login_required
def redirect_after_login_view(request):
    """
    Redirect user to the URL stored in the session after successful login.
    """
    response = redirect(f'{settings.FRONTEND_BASE_URL}/login/callback/?next=/{request.session.get("next", "")}')
    response = preserve_cookies(request, response)
    _logger.debug(f"Setting cookies: {response.cookies}")
    return response


def logout_view(request):
    """
    Logout view that logout the user, clears the session and deletes the session cookie.
    """
    logout(request)
    response = JsonResponse({'message': 'Logged out successfully'})
    response.delete_cookie('sessionid')
    return response


class UserInfo(APIView):
    """
    User information view.

    * Requires authentication.
    """
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Return user information.
        """
        user = request.user
        user_info = {
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "groups": list(user.groups.values_list('name', flat=True)),
            "permissions": list(user.get_all_permissions()),
        }
        return JsonResponse(user_info)


class UserToken(APIView):
    """
    User token view, returns the user's token that can be used for API calls.

    * Requires auth
    """
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Return user token.
        """
        user = request.user
        token = user.auth_token.key if user.is_authenticated else None
        return JsonResponse({"token": token})
