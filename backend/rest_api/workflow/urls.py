from django.urls import path
from rest_api.workflow.views import WorkflowDetailView, WorkflowListView

urlpatterns = [
    path("list/", WorkflowListView.as_view(), name="workflow-list"),
    path(
        "<int:workflow_id>/",
        WorkflowDetailView.as_view(),
        name="workflow-detail",
    ),
]
