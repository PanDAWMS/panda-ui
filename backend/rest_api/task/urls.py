from django.urls import path
from rest_api.task.views import TaskInfoView

urlpatterns = [
    path("<int:jeditaskid>/", TaskInfoView.as_view(), name="task-info"),
]
