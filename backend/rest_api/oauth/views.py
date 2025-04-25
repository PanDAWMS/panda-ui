# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
# Authors:
# Tatiana Korchuganova <tatiana.korchuganova@cern.ch>
# Paul Nilsson <paul.nilsson@cern.ch>

"""Views for the OAuth application."""

import logging

from django.shortcuts import redirect
from django.http import JsonResponse, HttpRequest, HttpResponse
from django.conf import settings
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from rest_api.oauth.utils import preserve_cookies
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

_logger = logging.getLogger('oauth')


@login_required
def redirect_after_login_view(request: HttpRequest) -> HttpResponse:
    """
    Redirect user to the URL stored in the session after successful login.

    Args:
        request (HttpRequest): The HTTP request object.
    Returns:
        HttpResponse: The HTTP response object with a redirect to the frontend.
    """
    response = redirect(f'{settings.FRONTEND_BASE_URL}/login/callback/?next=/{request.session.get("next", "")}')
    response = preserve_cookies(request, response)
    _logger.debug(f"Setting cookies: {response.cookies}")

    return response


def logout_view(request: HttpRequest) -> JsonResponse:
    """
    Logout view that logout the user, clears the session and deletes the session cookie.

    Args:
        request (HttpRequest): The HTTP request object.
    Returns:
        JsonResponse: The JSON response indicating successful logout.
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

    def get(self, request: HttpRequest) -> JsonResponse:
        """
        Return user information.

        Args:
            request (HttpRequest): The HTTP request object.
        Returns:
            JsonResponse: The JSON response containing user information.
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

    def get(self, request: HttpRequest) -> JsonResponse:
        """
        Return user token.

        Args:
            request (HttpRequest): The HTTP request object.
        Returns:
            JsonResponse: The JSON response containing the user's token.
        """
        user = request.user
        token = user.auth_token.key if user.is_authenticated else None

        return JsonResponse({"token": token})
