""" """

import logging

from django.db.models import Count, Q, Sum
from rest_api.common.mixins.filter_result_header import FilterMetadataHeaderMixin
from rest_api.common.utils.filter_engine import FilterResult, filter_single_queryset
from rest_api.common.utils.pagination import StandardResultsSetPagination
from rest_api.oauth.permissions import GlobalPermission
from rest_api.task.models import JediDataset
from rest_api.workflow.constants import ACTIVE_STATUSES, FAILED_STATUSES, PENDING_STATUSES
from rest_api.workflow.models import Workflow
from rest_api.workflow.serializers import WorkflowDetailSerializer, WorkflowListSerializer
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.filters import OrderingFilter
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

_logger = logging.getLogger("workflow")


class WorkflowListView(FilterMetadataHeaderMixin, ListAPIView):
    """
    Returns a paginated list of workflows with summarized step and data counts per workflow.
    """

    object_type = "workflow_list"
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated, GlobalPermission]
    serializer_class = WorkflowListSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [OrderingFilter]
    filter_result: FilterResult | None = None
    ordering_fields = [
        "workflow_id",
        "name",
        "status",
        "start_time",
        "creation_time",
        "total_steps",
        "completed_steps",
        "failed_steps",
    ]
    ordering = ["-workflow_id"]  # default

    def get_queryset(self):
        """
        Construct the queryset for workflow list with summarized step and data counts per workflow.
        """
        # base queryset with database-level aggregations
        base_queryset = Workflow.objects.only("workflow_id", "name", "username", "status", "creation_time", "start_time", "end_time").annotate(
            total_steps=Count("steps__step_id", distinct=True),
            pending_steps=Count("steps__step_id", filter=Q(steps__status__in=PENDING_STATUSES), distinct=True),
            active_steps=Count("steps__step_id", filter=Q(steps__status__in=ACTIVE_STATUSES), distinct=True),
            completed_steps=Count("steps__step_id", filter=Q(steps__status="done"), distinct=True),
            failed_steps=Count("steps__step_id", filter=Q(steps__status__in=FAILED_STATUSES), distinct=True),
            total_data_items=Count("data_items__data_id", distinct=True),
        )

        # filter using
        queryset, self.filter_result = filter_single_queryset(
            queryset=base_queryset,
            request_params=self.request.query_params.dict(),
            model=Workflow,
            time_field="modification_time",
            default_hours=12,
        )
        return queryset


class WorkflowDetailView(RetrieveAPIView):
    """
    Returns detailed information for a single workflow by ID,
    including nested steps and data items.
    """

    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated, GlobalPermission]
    serializer_class = WorkflowDetailSerializer
    lookup_field = "workflow_id"
    queryset = Workflow.objects.prefetch_related("steps", "data_items").all()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        # make step summary
        step_summary = instance.steps.aggregate(
            total_steps=Count("step_id", distinct=True),
            pending_steps=Count("step_id", filter=Q(status__in=PENDING_STATUSES), distinct=True),
            active_steps=Count("step_id", filter=Q(status__in=ACTIVE_STATUSES), distinct=True),
            completed_steps=Count("step_id", filter=Q(status="done"), distinct=True),
            failed_steps=Count("step_id", filter=Q(status__in=FAILED_STATUSES), distinct=True),
        )

        # extract all tasks and get files summary from datasets
        target_ids = instance.steps.values_list("target_id", flat=True)
        _logger.debug("Got task ids from workflow" + str(target_ids))
        task_ids = []
        for tid_str in target_ids:
            try:
                task_id = int(tid_str)
                task_ids.append(task_id)
            except ValueError:
                _logger.exception("Got invalid task id from workflow" + str(tid_str))
        if task_ids and len(task_ids) > 1:
            file_stats = JediDataset.objects.filter(jeditaskid__in=task_ids, type__in=("input", "pseudo_input"), masterid__isnull=True).aggregate(
                datasets_count=Count("datasetid", distinct=True),
                files_total=Sum("nfiles"),
                files_finished=Sum("nfilesfinished"),
                files_failed=Sum("nfilesfailed"),
                files_waiting=Sum("nfileswaiting"),
                files_missing=Sum("nfilesmissing"),
            )
        else:
            file_stats = {}

        serializer = self.get_serializer(instance)
        data = serializer.data
        data["step_summary"] = step_summary
        data["file_summary"] = file_stats
        return Response(data)
