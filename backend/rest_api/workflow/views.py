""" """

import logging

from django.db.models import Count, Q, Sum
from rest_api.common.mixins.filter_result_header import FilterMetadataHeaderMixin
from rest_api.common.utils.filter_engine import FilterResult, filter_single_queryset
from rest_api.oauth.permissions import GlobalPermission
from rest_api.task.models import JediDataset
from rest_api.workflow.constants import ACTIVE_STATUSES, FAILED_STATUSES, PENDING_STATUSES
from rest_api.workflow.models import Workflow
from rest_api.workflow.serializers import WorkflowDetailSerializer, WorkflowListSerializer
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
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
    filter_result: FilterResult | None = None

    def get_queryset(self):
        """
        Construct the queryset for workflow list with summarized step and data counts per workflow.
        """
        # base queryset with database-level aggregations
        base_queryset = Workflow.objects.only("workflow_id", "name", "status", "creation_time", "start_time", "end_time").annotate(
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

        # extract all tasks and get files summary from datasets
        task_ids = instance.steps.values_list("target_id", flat=True)
        task_ids = [tid for tid in task_ids if tid != ""]
        file_stats = JediDataset.objects.filter(jeditaskid__in=task_ids, type__in=("input", "pseudo_input"), masterid__isnull=True).aggregate(
            datasets_count=Count("datasetid", distinct=True),
            files_total=Sum("nfiles"),
            files_finished=Sum("nfilesfinished"),
            files_failed=Sum("nfilesfailed"),
            files_waiting=Sum("nfileswaiting"),
            files_missing=Sum("nfilesmissing"),
        )

        serializer = self.get_serializer(instance)
        data = serializer.data
        data["file_summary"] = file_stats
        return Response(data)
