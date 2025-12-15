from rest_api.task.models import JediTask
from rest_framework import serializers


class TaskFullSerializer(serializers.ModelSerializer):
    class Meta:
        model = JediTask
        fields = "__all__"


class TaskBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = JediTask
        fields = [
            "jeditaskid",
            "taskname",
            "status",
            "tasktype",
        ]
