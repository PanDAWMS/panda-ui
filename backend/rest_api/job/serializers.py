from rest_api.job.models import ErrorDescription
from rest_framework import serializers


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
        print("Creating ErrorDescription with data:", validated_data)
        return super().create(validated_data)
