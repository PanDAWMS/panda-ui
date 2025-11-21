from django.urls import include, path
from rest_api.job.views import ErrorDescriptionViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"error-description", ErrorDescriptionViewSet, basename="error-description")

urlpatterns = [
    path("", include(router.urls)),
]
