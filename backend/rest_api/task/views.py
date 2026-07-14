from rest_api.common.mixins.task_filter import TaskFilterMixin
from rest_api.common.mixins.time_range_filter import TimeRangeFilterMixin
from rest_api.oauth.permissions import GlobalPermission
from rest_api.task.models import JediTask
from rest_api.task.serializers import TaskFullSerializer
from rest_framework import authentication
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated


class TaskListView(ListAPIView, TimeRangeFilterMixin, TaskFilterMixin):
    """
    View to handle task-related requests.
    """

    object_type = "task"
    authentication_classes = [
        authentication.TokenAuthentication,
        authentication.SessionAuthentication,
    ]
    permission_classes = [IsAuthenticated, GlobalPermission]

    def get_queryset(self):
        """
        Process GET params into filter queryset.
        """
        qs = JediTask.objects.values()
        qs = self.filter_by_time(qs)
        return qs


class TaskInfoView(RetrieveAPIView):
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
