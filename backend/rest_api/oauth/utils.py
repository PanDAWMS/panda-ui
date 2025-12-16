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

"""Utils for OAuth2."""

import logging

from django.contrib.auth.models import Group, User
from django.http import HttpRequest, HttpResponse

_logger = logging.getLogger("oauth")


def preserve_cookies(request: HttpRequest, response: HttpResponse) -> HttpResponse:
    """
    Copy cookies from the request to the response for redirect to frontend.

    Args:
        request (HttpRequest): The HTTP request object.
        response (HttpResponse): The HTTP response object.
    Returns:
        HttpResponse: The modified response object with copied cookies.
    """
    # Copy cookies from the request to the response
    for cookie in request.COOKIES:
        if cookie in {"csrftoken", "sessionid"}:
            response.set_cookie(
                cookie,
                request.COOKIES[cookie],
                httponly=False,
                secure=False,
                samesite="Lax",
            )

    # Set the token in cookies
    if request.user.is_authenticated and "pandauitoken" not in response.cookies:
        response.set_cookie(
            "pandauitoken",
            request.user.auth_token.key,
            httponly=True,
            secure=False,
            samesite="Strict",
        )

    return response


def update_user_groups(email: str, user_groups: list[str]) -> bool:
    """
    Add user groups to the user in Django based on the email and user groups from IAM.

    Args:
        email (str): The email of the user.
        user_groups (list[str]): The user groups set in IAM.
    Returns:
        bool: True if the user groups were successfully updated, False otherwise.
    """
    # get user objects by email
    users = User.objects.filter(email=email)
    if not users.exists() or len(users) == 0:
        _logger.error(f"There is no user with this email {email}")
        return False

    # add new groups to users
    for group in user_groups:
        if not Group.objects.filter(name=group).exists():
            group_object = Group.objects.create(name=group)
            group_object.save()
        for user in users:
            if not user.groups.filter(name=group).exists():
                user.groups.add(Group.objects.get(name=group))
                user.save()

    return True
