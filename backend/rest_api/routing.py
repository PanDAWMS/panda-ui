from rest_api.aide.routing import websocket_urlpatterns as aide_ws

# Combine all app websocket routes into a single list
websocket_urlpatterns = [
    *aide_ws,
]
