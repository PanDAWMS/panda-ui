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


def associate_by_email(backend, details, user=None, *args, **kwargs):
    """
    Associates the current authentication with a user in the database who has the same email address.

    Args:
        backend: The authentication backend in use.
        details (dict): A dictionary containing user details, including the email address.
        user (optional): The currently authenticated user, if any.
        *args: Additional positional arguments.
        **kwargs: Additional keyword arguments.

    Returns:
        dict or None: A dictionary with the associated user and a flag indicating if the user is new,
        or None if no association is made.

    Notes:
        This function is not fully secure unless the authentication provider enforces email verification.
        Without verification, a user could potentially take over another account by using the same
        (unvalidated) email address. This pipeline entry is disabled by default.
    """
    if user:
        return None

    email = details.get("email")
    if email:
        # Try to associate accounts registered with the same email address
        users = list(backend.strategy.storage.user.get_users_by_email(email))
        if len(users) == 0:
            return None
        if len(users) > 1:
            return {"user": sorted(users, key=lambda x: x.date_joined)[0], "is_new": False}
        return {"user": users[0], "is_new": False}
    return None
