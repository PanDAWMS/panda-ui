from rest_api.common.serializers.fields import ParsedJsonField
from rest_api.task.models import JediDataset, JediTask
from rest_framework.serializers import IntegerField, ModelSerializer


class TaskDefinitionParamsField(ParsedJsonField):
    """
    Filters out internal params to avoid propagating to the API
    """

    EXCLUDE_FIELDS = [
        "jobParameters",
        "buildSpec",
        "mergeSpec",
        "log",
    ]

    def to_representation(self, value):
        data = super().to_representation(value)
        if not isinstance(data, dict):
            return data
        return {key: val for key, val in data.items() if key not in self.EXCLUDE_FIELDS}


class TaskFullSerializer(ModelSerializer):
    params_json = TaskDefinitionParamsField(source="params.taskparams", read_only=True)

    class Meta:
        model = JediTask
        fields = "__all__"


class TaskBasicSerializer(ModelSerializer):
    files_total = IntegerField(read_only=True)
    files_finished = IntegerField(read_only=True)
    files_failed = IntegerField(read_only=True)
    files_missing = IntegerField(read_only=True)

    class Meta:
        model = JediTask
        fields = [
            "jeditaskid",
            "taskname",
            "username",
            "status",
            "tasktype",
            "creationdate",
            "starttime",
            "endtime",
            "files_total",
            "files_finished",
            "files_failed",
            "files_missing",
        ]


class TaskDatasetSerializer(ModelSerializer):
    class Meta:
        model = JediDataset
        fields = [
            "jeditaskid",
            "datasetid",
            "datasetname",
            "containername",
            "type",
            "status",
            "state",
            "creationtime",
            "modificationtime",
            "masterid",
            "nfiles",
            "nfilesfinished",
            "nfilesfailed",
            "nfilesmissing",
            "nfilesused",
            "nfilestobeused",
            "nfileswaiting",
            "nfilesonhold",
            "nevents",
            "neventstobeused",
            "neventsused",
        ]
