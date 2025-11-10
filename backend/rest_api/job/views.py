from http.client import HTTPResponse

from django.db import IntegrityError, transaction
from django.http import HttpRequest, HttpResponse
from rest_framework import viewsets, status
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_api.job.models import ErrorDescription
from rest_api.job.serializers import ErrorDescriptionSerializer
from rest_api.oauth.permissions import IsExperimentMember


class ErrorDescriptionViewSet(viewsets.ModelViewSet):
    queryset = ErrorDescription.objects.all()
    serializer_class = ErrorDescriptionSerializer
    renderer_classes = [JSONRenderer]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated, IsExperimentMember]

    @action(detail=False, methods=['post'], url_path='bulk')
    def bulk_create(self, request: HttpRequest) -> HttpResponse:
        """
        Bulk-create or upsert ``ErrorDescription`` entries.

        The endpoint expects a JSON array in the request body and supports an
        optional ``overwrite`` query string parameter:

        * **overwrite=false** (default) – If any entry with the same
          ``component`` + ``code`` already exists, the whole request is rejected.
        * **overwrite=true** – Existing rows matched on
          (``component``, ``code``) are updated; new rows are inserted.

        Example:
            >>> POST /api/error_description/bulk/?overwrite=true
            >>> [
            ...   {"component": "pilot", "code": 1000, "acronym": "SOMEACRONYM", "description": "This error ..."},
            ...   {"component": "jobdispatcher",  "code": 99, "acronym": "SOMEACRONYM", "message": "This error ..."}
            ... ]

        Args:
            request (HttpRequest):
                * ``data`` – list[dict] with at minimum ``component``, ``code`` and ``description``.
                * ``query_params['overwrite']`` – optional ``"true"`` / ``"false"``.

        Returns:
            Response:
                * **201 Created** – All items inserted (``overwrite=false``).
                * **200 OK** – Items created and/or updated (``overwrite=true``).
                * **400 Bad Request** – Validation error, duplicate conflict, or
                  database integrity error. The response body includes
                  ``"error"`` and, when relevant, a ``"conflicts"`` list.

        Raises:
            rest_framework.exceptions.ValidationError: If payload is not a list or
                any item fails serializer validation.
        """
        data = request.data
        if not isinstance(data, list):
            return Response({'error': 'Expected a list of items.'}, status=status.HTTP_400_BAD_REQUEST)

        is_overwrite = request.query_params.get("overwrite", "false").lower() == "true"

        # the component+code should be unique
        input_constraints = {f"{item['component']}:{item['code']}": item for item in data}
        existing_error_descriptions = ErrorDescription.objects.all()
        existing_constraints = {f"{obj.component}:{obj.code}": obj for obj in existing_error_descriptions}

        to_update = []
        to_create = []
        for key, item in input_constraints.items():
            if key in existing_constraints:
                if is_overwrite:
                    obj = existing_constraints[key]
                    for field, value in item.items():
                        setattr(obj, field, value)
                    to_update.append(obj)
                else:
                    # conflict and overwrite not allowed
                    return Response({
                        'error': 'Some items already exist in DB.',
                        'conflicts': [item for k, item in input_constraints.items() if k in existing_constraints]
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                to_create.append(item)

        try:
            with transaction.atomic():
                updated = []
                created = []

                if to_update:
                    ErrorDescription.objects.bulk_update(
                        to_update,
                        fields=[f for f in data[0].keys() if f not in ('component', 'code')]
                    )
                    updated = to_update

                if to_create:
                    serializer = self.get_serializer(data=to_create, many=True)
                    serializer.is_valid(raise_exception=True)
                    self.perform_bulk_create(serializer)
                    created = serializer.instance

                all_objs = updated + created
                response_data = self.get_serializer(all_objs, many=True).data
                return Response(response_data, status=status.HTTP_200_OK if is_overwrite else status.HTTP_201_CREATED)

        except IntegrityError as e:
            return Response({'error': 'Database integrity error.', 'details': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': 'Failed to add new records to DB.', 'details': str(e)}, status=status.HTTP_400_BAD_REQUEST)


    def perform_bulk_create(self, serializer):
        serializer.save()