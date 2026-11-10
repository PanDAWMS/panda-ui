from django.db.models import Q, Sum, Value
from django.db.models.functions import Coalesce
from rest_api.common.mixins.filter_result_header import FilterMetadataHeaderMixin
from rest_api.common.utils.filter_engine import FilterResult, filter_single_queryset
from rest_api.common.utils.pagination import StandardResultsSetPagination
from rest_api.oauth.permissions import GlobalPermission
from rest_api.task.models import JediDataset, JediTask
from rest_api.task.serializers import TaskBasicSerializer, TaskDatasetSerializer, TaskFullSerializer
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.exceptions import ValidationError
from rest_framework.filters import OrderingFilter
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated


class TaskListView(FilterMetadataHeaderMixin, ListAPIView):
    """
    View to handle task-related requests.
    """

    object_type = "task_list"
    authentication_classes = [
        TokenAuthentication,
        SessionAuthentication,
    ]
    permission_classes = [IsAuthenticated, GlobalPermission]
    serializer_class = TaskBasicSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [OrderingFilter]
    filter_result: FilterResult | None = None
    ordering_fields = ["jeditaskid", "taskname", "status", "starttime", "creationdate", "files_total", "files_finished", "files_failed", "files_missing"]
    ordering = ["-jeditaskid"]

    def get_queryset(self):
        """
        Process GET params into filter queryset.
        """
        input_dataset_filter = Q(jedi_datasets__masterid__isnull=True, jedi_datasets__type__in=("input", "pseudo_input"))
        base_queryset = JediTask.objects.only("jeditaskid", "taskname", "username", "status", "creationdate", "starttime", "endtime").annotate(
            files_total=Coalesce(Sum("jedi_datasets__nfiles", filter=input_dataset_filter), Value(0)),
            files_finished=Coalesce(Sum("jedi_datasets__nfilesfinished", filter=input_dataset_filter), Value(0)),
            files_failed=Coalesce(Sum("jedi_datasets__nfilesfailed", filter=input_dataset_filter), Value(0)),
            files_missing=Coalesce(Sum("jedi_datasets__nfilesmissing", filter=input_dataset_filter), Value(0)),
        )

        queryset, self.filter_result = filter_single_queryset(
            queryset=base_queryset, request_params=self.request.query_params.dict(), model=JediTask, time_field="creationdate", default_hours=24
        )
        return queryset


class TaskDetailView(RetrieveAPIView):
    """
    View to handle detailed info of a single task requests.
    """

    object_type = "task"
    authentication_classes = [
        TokenAuthentication,
        SessionAuthentication,
    ]
    permission_classes = [IsAuthenticated, GlobalPermission]
    serializer_class = TaskFullSerializer
    lookup_field = "jeditaskid"

    def get_queryset(self):
        return JediTask.objects.all().select_related("params")


class TaskDatasetListView(FilterMetadataHeaderMixin, ListAPIView):
    """
    View to provide list of datasets associated with a task.
    """

    object_type = "dataset_list"
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated, GlobalPermission]
    serializer_class = TaskDatasetSerializer
    filter_result: FilterResult | None = None

    def get_queryset(self):
        """
        Process GET params into filter queryset.
        """
        if "jeditaskid" not in self.request.query_params.keys():
            return ValidationError({"jeditaskid": "This field is required."})
        base_queryset = JediDataset.objects.only(
            "jeditaskid",
            "datasetid",
            "datasetname",
            "containername",
            "type",
            "status",
            "state",
            "masterid",
            "creationtime",
            "modificationtime",
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
        )

        queryset, self.filter_result = filter_single_queryset(
            queryset=base_queryset, request_params=self.request.query_params.dict(), model=JediDataset, time_field="creationtime", default_hours=24
        )
        return queryset
