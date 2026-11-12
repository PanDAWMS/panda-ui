from rest_api.notifications.models import Subscription
from rest_framework import serializers


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ["id", "jeditaskid", "created_at"]
        read_only_fields = ["id", "created_at"]
