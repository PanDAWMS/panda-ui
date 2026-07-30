from django.urls import path

from .views import QuickSearchAPIView

urlpatterns = [
    path("global/", QuickSearchAPIView.as_view(), name="global-search"),
]
