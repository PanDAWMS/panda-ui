from django.urls import path
from rest_api.task.views import TaskDatasetListView, TaskDetailView, TaskListView

urlpatterns = [
    path("list/", TaskListView.as_view(), name="task-list"),
    path("<int:jeditaskid>/", TaskDetailView.as_view(), name="task-detail"),
    path("datasets/", TaskDatasetListView.as_view(), name="task-dataset-list"),
]
