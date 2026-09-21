from rest_api.common.mixins.filter_result_header import FilterMetadataHeaderMixin
from rest_api.common.utils.filter_engine import filter_single_queryset
from rest_api.oauth.permissions import GlobalPermission
from rest_api.task.models import JediTask
from rest_api.task.serializers import TaskFullSerializer
from rest_framework import authentication
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated


class TaskListView(FilterMetadataHeaderMixin, ListAPIView):
    """
    View to handle task-related requests.
    """

    object_type = "task"
    authentication_classes = [
        authentication.TokenAuthentication,
        authentication.SessionAuthentication,
    ]
    permission_classes = [IsAuthenticated, GlobalPermission]
    serializer_class = TaskFullSerializer

    def get_queryset(self):
        """
        Process GET params into filter queryset.
        """
        queryset, self.filter_result = filter_single_queryset(
            queryset=JediTask.objects.all(), request_params=self.request.query_params.dict(), model=JediTask, time_field="creationdate", default_hours=24
        )
        return queryset


class TaskDetailView(RetrieveAPIView):
    """
    View to handle detailed info of a single task requests.
    """

    object_type = "task"
    authentication_classes = [
        authentication.TokenAuthentication,
        authentication.SessionAuthentication,
    ]
    permission_classes = [IsAuthenticated, GlobalPermission]
    queryset = JediTask.objects.all()
    serializer_class = TaskFullSerializer
    lookup_field = "jeditaskid"
