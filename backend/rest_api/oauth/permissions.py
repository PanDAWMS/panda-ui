import logging

from django.apps import apps
from rest_framework.permissions import BasePermission

_logger = logging.getLogger("oauth")
ACTION_MAP = {
    "list": "read",
    "retrieve": "read",
    "create": "write",
    "bulk_create": "write",
    "update": "write",
    "partial_update": "write",
    "destroy": "delete",
}


class GlobalPermission(BasePermission):
    """
    Attribute-Based and Role-Based Access Control (ABAC/RBAC) permission class for DRF views.

    Authorization Logic:
    1. Unauthenticated requests are rejected immediately (`False`).
    2. Direct rule evaluation: Evaluates `(roles, obj_type, action, obj_dict, params)` against policy rules.
    3. Implied read access: For `read` requests, users with `write` or `delete` permissions on the resource
       are automatically granted `read` access.
    4. Default-allow for read requests: If no explicit policy rule exists for the specified `(obj_type, 'read')`,
       `read` access is allowed by default for authenticated users.
    5. Default-deny for write/delete requests: Modification actions require explicit policy rules.
    """

    @property
    def authz(self):
        """Helper property to access the initialized AuthorizationService from the app config."""
        authz_service = apps.get_app_config("oauth").authz
        if not authz_service:
            raise ImportError("Failed to import AuthorizationService")
        return authz_service

    def get_user_roles(self, user) -> list[str]:
        """Helper method to extract user roles from the request.user object."""
        return list(user.groups.values_list("name", flat=True))

    def has_explicit_read_policy(self, obj_type: str) -> bool:
        """Returns True if any explicit policy rules exist for this object type on 'read'."""
        if hasattr(self.authz, "enforcer"):
            policies = self.authz.enforcer.get_filtered_policy(1, obj_type, "read")
            return len(policies) > 0
        return False

    def has_permission(self, request, view):
        """
        Determines whether the incoming request user is authorized to perform the requested action on a view.

        Args:
            request (Request): The incoming Django REST Framework request object.
            view (APIView): The DRF view handling the request. Expected attributes:
                - `object_type` (str, optional): Defaults to "unknown".
                - `action` (str, optional): DRF view action (e.g., 'list', 'retrieve', 'create').

        Returns:
            bool: True if the request is permitted, False otherwise.
        """
        if not request.user or not request.user.is_authenticated:
            return False

        roles = self.get_user_roles(request.user)
        action_drf = getattr(view, "action", request.method.lower())
        act = ACTION_MAP.get(action_drf, action_drf)
        if act in ["get", "head", "options"]:
            act = "read"
        obj_type = getattr(view, "object_type", "unknown")
        obj_dict = {}
        if view.kwargs.get("pk"):
            try:
                # Get the existing state of the object for ABAC checks
                instance = view.get_object()
                obj_dict.update(view.get_serializer(instance).data)
            except Exception as e:
                _logger.info(f"Failed to get object for permission check: {e}, leave obj_dict empty for now")
        params = request.data if isinstance(request.data, dict) else {}

        if self.authz.enforce(roles, obj_type, act, obj_dict, params):
            return True

        if act == "read":
            # if 'read' failed, check if they have 'write' or 'delete', because those should also allow 'read' access
            for higher_act in ["write", "delete"]:
                if self.authz.enforce(roles, obj_type, higher_act, obj_dict, params):
                    _logger.info("Granting read access as user have write or/and delete one")
                    return True
            # allow read action by default unless a rule explicitly set in policy for this object type
            if not self.has_explicit_read_policy(obj_type):
                _logger.info(f"Granting default read access as no explicit rules exist for {obj_type}")
                return True

        return False
