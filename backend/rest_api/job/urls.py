from django.urls import include, path
from rest_api.job.views import ErrorDescriptionViewSet, JobDetailView, JobErrorCategoryListView, JobListView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"error-description", ErrorDescriptionViewSet, basename="error-description")

urlpatterns = [
    path("list/", JobListView.as_view(), name="job-list"),
    path("<int:pandaid>/", JobDetailView.as_view(), name="jpb-detail"),
    path("", include(router.urls)),
    path("error-categories/", JobErrorCategoryListView.as_view()),
]
