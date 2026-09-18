import ast

from rest_api.workflow.models import Workflow, WorkflowData, WorkflowStep
from rest_framework.serializers import IntegerField, ModelSerializer, SerializerMethodField


class StepLiteSerializer(ModelSerializer):
    class Meta:
        model = WorkflowStep
        fields = ["step_id", "target_id", "name", "type", "status", "start_time", "end_time"]


class StepSerializer(ModelSerializer):
    definition_json = SerializerMethodField()

    class Meta:
        model = WorkflowStep
        fields = "__all__"

    def get_definition_json(self, obj):
        """Parses str to JSON and makes it safe for frontend"""
        raw_data = obj.definition_json
        if not raw_data:
            return None
        # if it is already a dict, return as is
        if isinstance(raw_data, dict):
            return raw_data
        try:
            # safely parse and handle None, True, False, single quotes etc
            return ast.literal_eval(raw_data)
        except (ValueError, SyntaxError):
            return None


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
            "username",
            "status",
            "creation_time",
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
    steps = StepSerializer(many=True, read_only=True)
    data_items = DataSerializer(many=True, read_only=True)

    class Meta:
        model = Workflow
        fields = "__all__"
