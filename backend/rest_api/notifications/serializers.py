from rest_framework import serializers

from rest_api.notifications.models import Subscription


class SubscriptionSerializer(serializers.ModelSerializer):
    # Populated from a bulk lookup the view does once per list() call (see
    # SubscriptionViewSet.get_serializer_context) rather than a per-row query here.
    task_status = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = ["id", "jeditaskid", "created_at", "task_status"]
        read_only_fields = ["id", "created_at", "task_status"]

    def get_task_status(self, obj: Subscription) -> str | None:
        return self.context.get("task_statuses", {}).get(obj.jeditaskid)
