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

"""URLs for the OAuth application."""

import rest_api.oauth.views as oauth_views
from django.urls import include, path

urlpatterns = [
    path("", include("social_django.urls", namespace="social")),
    path(
        "redirect_after_login/",
        oauth_views.redirect_after_login_view,
        name="redirect_after_login",
    ),
    path("logout/", oauth_views.logout_view, name="logout"),
    path("userinfo/", oauth_views.UserInfo.as_view(), name="user_info"),
    path("usertoken/", oauth_views.UserToken.as_view(), name="user_token"),
]
