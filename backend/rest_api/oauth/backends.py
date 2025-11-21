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

"""Backend for Indigo IAM authentication."""

import logging
from typing import Any

from django.conf import settings
from rest_api.oauth.utils import update_user_groups
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import AuthenticationFailed
from social_core.backends.open_id_connect import OpenIdConnectAuth

_logger = logging.getLogger("oauth")


class IamBackend(OpenIdConnectAuth):
    """Class for Indigo IAM authentication backend."""

    name = "iam"
    OIDC_ENDPOINT = settings.SOCIAL_AUTH_OIDC_OIDC_ENDPOINT
    TOKEN_ENDPOINT_AUTH_METHOD = "client_secret_post"
    REDIRECT_STATE = True
    ID_KEY = "email"

    def auth_complete(self, *args: Any, **kwargs: Any) -> Any:
        """
        Override the auth_complete method to handle the response from the OIDC provider.

        Create a DRF Token for the user and put it in cookies.

        Args:
            *args: Positional arguments.
            **kwargs: Keyword arguments.
        Returns:
            Any: The authenticated user.
        """
        user = super().auth_complete(*args, **kwargs)
        _logger.debug(f"User details: {user}")

        if not user.is_authenticated:
            _logger.error("User not authenticated")
            raise AuthenticationFailed("Failed to complete authentication")

        # Create a DRF Token for the user
        token, created = Token.objects.get_or_create(user=user)
        if created:
            _logger.info(f"Created new token for user {user.username}")
        else:
            _logger.info(f"Using existing token for user {user.username}")

        #  .. use the token for something ..
        if token:
            pass  # to bypass pylint complaint

        return user

    def user_data(self, access_token: Any, *args: Any, **kwargs: Any) -> dict[str, Any]:
        """
        Load user data from the service.

        Args:
            access_token (Any): The access token.
            *args: Positional arguments.
            **kwargs: Keyword arguments.
        Returns:
            dict[str, Any]: The user data.
        """
        user_data = super().user_data(access_token, *args, **kwargs)
        _logger.debug(f"User data: {user_data}")

        if "wlcg.groups" in user_data and len(user_data["wlcg.groups"]) > 0:
            is_success = update_user_groups(user_data["email"], user_data["wlcg.groups"])
            _logger.debug(f"User groups update status: {is_success}, user: {user_data['email']}, groups: {user_data['wlcg.groups']}")

        return user_data
