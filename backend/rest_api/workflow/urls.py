from django.urls import path
from rest_api.workflow.views import WorkflowDetailView, WorkflowListView

urlpatterns = [
    path("workflows/list/", WorkflowListView.as_view(), name="workflow-list"),
    path(
        "workflows/<int:workflow_id>/",
        WorkflowDetailView.as_view(),
        name="workflow-detail",
    ),
]
