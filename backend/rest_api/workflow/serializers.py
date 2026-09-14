from rest_api.workflow.models import Workflow, WorkflowData, WorkflowStep
from rest_framework.serializers import IntegerField, ModelSerializer


class StepLiteSerializer(ModelSerializer):
    class Meta:
        model = WorkflowStep
        fields = ["step_id", "target_id", "name", "type", "status", "start_time", "end_time"]


class StepSerializer(ModelSerializer):
    class Meta:
        model = WorkflowStep
        fields = "__all__"


class DataLiteSerializer(ModelSerializer):
    class Meta:
        model = WorkflowData
        fields = ["data_id", "name", "type", "status", "target_id"]


class DataSerializer(ModelSerializer):
    class Meta:
        model = WorkflowData
        fields = "__all__"


class WorkflowSerializer(ModelSerializer):
    class Meta:
        model = Workflow
        fields = "__all__"


class WorkflowListSerializer(ModelSerializer):
    total_steps = IntegerField(read_only=True)
    pending_steps = IntegerField(read_only=True)
    active_steps = IntegerField(read_only=True)
    completed_steps = IntegerField(read_only=True)
    failed_steps = IntegerField(read_only=True)
    total_data_items = IntegerField(read_only=True)

    class Meta:
        model = Workflow
        fields = [
            "workflow_id",
            "name",
            "status",
            "start_time",
            "end_time",
            "total_steps",
            "pending_steps",
            "active_steps",
            "completed_steps",
            "failed_steps",
            "total_data_items",
        ]


class WorkflowDetailSerializer(ModelSerializer):
    steps = StepLiteSerializer(many=True, read_only=True)
    data_items = DataLiteSerializer(many=True, read_only=True)

    class Meta:
        model = Workflow
        fields = "__all__"
