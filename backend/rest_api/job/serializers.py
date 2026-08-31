import logging

from django.db import models
from rest_api.job.models import ErrorDescription, JobsActive4
from rest_framework import serializers

_logger = logging.getLogger("job")


class JobSerializer(serializers.Serializer):
    """
    Only standard necessary fields
    """

    pandaid = serializers.IntegerField()
    jedi_task_id = serializers.IntegerField()
    jobstatus = serializers.CharField(allow_null=True)
    creationtime = serializers.DateTimeField()
    starttime = serializers.DateTimeField(allow_null=True)
    endtime = serializers.DateTimeField(allow_null=True)
    statechangetime = serializers.DateTimeField(allow_null=True)
    computingsite = serializers.CharField(allow_null=True)
    produsername = serializers.CharField(allow_null=True)


class JobDetailSerializer(serializers.Serializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Populate self.fields dynamically during initialization
        for field in JobsActive4._meta.get_fields():
            if not field.concrete or field.is_relation:
                continue

            if isinstance(field, (models.BigIntegerField, models.IntegerField)):
                serializer_field = serializers.IntegerField(allow_null=field.null, required=False)
            elif isinstance(field, models.DateTimeField):
                serializer_field = serializers.DateTimeField(allow_null=field.null, required=False)
            elif isinstance(field, models.FloatField):
                serializer_field = serializers.FloatField(allow_null=field.null, required=False)
            else:
                serializer_field = serializers.CharField(allow_null=field.null, required=False)

            self.fields[field.attname] = serializer_field


class ErrorDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ErrorDescription
        fields = [
            "id",
            "component",
            "code",
            "acronym",
            "diagnostics",
            "description",
            "category",
        ]
        read_only_fields = ["id"]

        validators = [
            serializers.UniqueTogetherValidator(
                queryset=ErrorDescription.objects.all(),
                fields=["component", "code"],
                message="The combination of component and code must be unique.",
            )
        ]

    def create(self, validated_data):
        _logger.info("Creating ErrorDescription with data:", validated_data)
        return super().create(validated_data)
