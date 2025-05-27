from rest_framework import permissions

class IsExperimentMember(permissions.BasePermission):
    """
    Custom permission to check if the authenticated user is a member of the specified experiment.

    Assumes that experiment membership is populated during OAuth token processing.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.has_perm("rest_api.can_see_experiment_data")