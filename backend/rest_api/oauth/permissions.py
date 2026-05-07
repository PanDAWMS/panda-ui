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
    Custom permission to check if the authenticated user is a member of the specified experiment.

    Assumes that experiment membership is populated during OAuth token processing.
    """

    @property
    def authz(self):
        """Helper property to access the initialized AuthorizationService from the app config."""
        authz_service = apps.get_app_config("oauth").authz
        if not authz_service:
            raise "Failed to import AuthorizationService"  # Or raise a server error
        return authz_service

    def get_user_roles(self, user) -> list[str]:
        """Helper method to extract user roles from the request.user object."""
        return list(user.groups.values_list("name", flat=True))

    def has_permission(self, request, view):
        """Check if the user has permission based on their roles."""
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

        # if 'read' failed, check if they have 'write' or 'delete', because those should also allow 'read' access
        if act == "read":
            for higher_act in ["write", "delete"]:
                if self.authz.enforce(roles, obj_type, higher_act, obj_dict, params):
                    return True

        return False
