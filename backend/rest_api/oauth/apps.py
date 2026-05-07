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

"""Apps.py for the OAuth application."""
import logging

from django.apps import AppConfig
from django.conf import settings
from panda_authz.service import AuthorizationService

_logger = logging.getLogger("oauth")


class OauthConfig(AppConfig):
    """Django AppConfig for the OAuth application."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "rest_api.oauth"
    authz = None  # Placeholder for the authorization service instance

    def ready(self):
        # import signals so that they are registered
        import rest_api.signals  # noqa: F401

        # Initialize authorization service
        try:
            self.authz = AuthorizationService(settings.AUTHORIZATION_POLICY_PATH)
            _logger.debug(f"Total policies loaded: {len(self.authz.enforcer.get_policy())} from {settings.AUTHORIZATION_POLICY_PATH}")
        except Exception as e:
            raise f"Critical: AuthorizationService failed: {e}"
