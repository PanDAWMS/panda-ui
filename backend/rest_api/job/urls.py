from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_api.job.views import ErrorDescriptionViewSet

router = DefaultRouter()
router.register(r'error_description', ErrorDescriptionViewSet, basename='error_description')

urlpatterns = [
    path('', include(router.urls)),
]