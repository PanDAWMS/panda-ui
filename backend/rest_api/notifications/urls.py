from django.urls import include, path
from rest_api.notifications.views import SubscriptionViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"subscriptions", SubscriptionViewSet, basename="notification-subscription")

urlpatterns = [
    path("", include(router.urls)),
]
