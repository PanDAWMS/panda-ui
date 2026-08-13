from django.urls import re_path
from rest_api.aide.consumers import ChatSimulatorConsumer

websocket_urlpatterns = [
    re_path(r"^ws/aide/chat/$", ChatSimulatorConsumer.as_asgi()),
]
