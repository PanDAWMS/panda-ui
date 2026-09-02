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

import logging

from django.contrib.auth import get_user_model
from django.db import transaction
from social_django.models import UserSocialAuth

_logger = logging.getLogger("oauth")


def merge_social_users(strategy, details, backend, *args, user=None, **kwargs):
    """
    Merge duplicate Django users that share the same email across different
    social-auth providers, so that all social accounts are linked to a single
    canonical application user.

    Args:
        strategy: social-auth strategy object (pipeline context).
        details (dict): user details extracted from the provider; must contain
            the email field.
        backend: authentication backend (provider) instance.
        user: existing Django user instance, if already resolved earlier in
            the pipeline.

    Returns:
        dict | None:
            - {"user": primary_user} if a user with the given email exists
              (after merging duplicates if needed).
            - None if no email is provided or no matching users exist.
    """
    email = details.get("email", None)
    if not email:
        return None

    auth_user_model = get_user_model()
    users = list(auth_user_model.objects.filter(email__iexact=email).values("id"))
    if len(users) == 0:
        return None

    user_ids = sorted([u["id"] for u in users])
    primary_user_id = user_ids[0]
    duplicates = user_ids[1:]
    if len(duplicates) > 0:
        with transaction.atomic():
            # update associated user for all other providers
            UserSocialAuth.objects.filter(user_id__in=duplicates).update(user_id=primary_user_id)
            # mark duplicated users as inactive to clean up later
            auth_user_model.objects.filter(id__in=duplicates).update(is_active=0)
        _logger.debug(f"Found {len(duplicates)} social user duplicates -> merged them with {primary_user_id} user_id")

    # pass primary user object into pipeline
    primary_user = auth_user_model.objects.get(id=primary_user_id)
    return {"user": primary_user}
