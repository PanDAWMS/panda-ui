from django.db import IntegrityError
from rest_api.notifications.models import Subscription
from rest_api.notifications.serializers import SubscriptionSerializer
from rest_api.oauth.permissions import GlobalPermission
from rest_framework import authentication, mixins, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated


class SubscriptionViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """
    List, create, or delete the current user's task subscriptions.

    Uses a ViewSet (not generic APIViews) so GlobalPermission's action->object_type
    mapping (which reads view.action, only set by ViewSets/routers) correctly maps
    create/destroy to the write/delete policy actions.
    """

    object_type = "notification"
    authentication_classes = [
        authentication.TokenAuthentication,
        authentication.SessionAuthentication,
    ]
    permission_classes = [IsAuthenticated, GlobalPermission]
    serializer_class = SubscriptionSerializer
    lookup_field = "jeditaskid"

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except IntegrityError as e:
            raise ValidationError("Already subscribed to this task.") from e
