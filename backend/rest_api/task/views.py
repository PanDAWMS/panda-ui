from rest_api.common.mixins.task_filter import TaskFilterMixin
from rest_api.common.mixins.time_range_filter import TimeRangeFilterMixin
from rest_api.task.models import JediTask
from rest_api.task.serializers import TaskFullSerializer
from rest_framework import authentication, permissions
from rest_framework.generics import ListAPIView, RetrieveAPIView


class TaskListView(ListAPIView, TimeRangeFilterMixin, TaskFilterMixin):
    """
    View to handle task-related requests.
    """

    authentication_classes = [
        authentication.TokenAuthentication,
        authentication.SessionAuthentication,
    ]
    permission_classes = [permissions.IsAuthenticated]

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

    authentication_classes = [
        authentication.TokenAuthentication,
        authentication.SessionAuthentication,
    ]
    permission_classes = [permissions.IsAuthenticated]
    queryset = JediTask.objects.all()
    serializer_class = TaskFullSerializer
    lookup_field = "jeditaskid"
