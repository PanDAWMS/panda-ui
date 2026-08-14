import logging

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from rest_api.oauth.constants import TOKEN_NAME
from rest_framework.authtoken.models import Token

_logger = logging.getLogger("oauth")


class BaseAuthConsumer(AsyncJsonWebsocketConsumer):
    """
    Base consumer handling cookie/session authentication and origin verification
    for all WebSocket endpoints.
    """

    @database_sync_to_async
    def get_user_from_cookie_token(self, token_key):
        try:
            return Token.objects.select_related("user").get(key=token_key).user
        except (Token.DoesNotExist, Exception):
            return AnonymousUser()

    async def connect(self):
        # get user from scope or cookie token
        user = self.scope.get("user")
        if not user or user.is_anonymous:
            cookies = self.scope.get("cookies", {})
            token_key = cookies.get(TOKEN_NAME)
            if token_key:
                user = await self.get_user_from_cookie_token(token_key)
                self.scope["user"] = user

        # reject unauthenticated connections
        if not user or user.is_anonymous:
            _logger.warning(f"Rejecting unauthorized WS connection to {self.scope['path']}")
            await self.close(code=4001)
            return

        _logger.info(f"WS connected for user '{user.username}' at {self.scope['path']}")

        # accept handshake
        await self.accept()

    async def disconnect(self, code):
        user = self.scope.get("user", "Anonymous")
        _logger.info(f"WS disconnected for user '{user}' (Code: {code}) at {self.scope['path']}")
