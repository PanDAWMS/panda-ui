"""WebSocket Consumers"""

import asyncio
import logging

from rest_api.oauth.consumers import BaseAuthConsumer

_logger = logging.getLogger("aide")


class ChatSimulatorConsumer(BaseAuthConsumer):
    """
    WebSocket consumer for handling chat messages and streaming responses.
    """

    async def receive_json(self, content, **kwargs):
        """Handle chat messages and streaming simulated responses"""
        _ = kwargs
        action = content.get("action")
        if action == "send_message":
            # send initial status
            await self.send_json({"type": "status", "content": "Processing your message..."})
            await asyncio.sleep(1)

            # stream tokens back to frontend
            tokens = ["Hello! ", "I ", "am ", "streaming ", "via ", "WebSockets!"]
            for token in tokens:
                await self.send_json({"type": "token", "content": token})
                await asyncio.sleep(0.5)

            await self.send_json({"type": "done"})
