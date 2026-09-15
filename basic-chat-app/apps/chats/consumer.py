from channels.generic.websocket import AsyncWebsocketConsumer
import json


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        print("CONNECT:", self.room_name)
        print("GROUP:", self.room_group_name)

        try:
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name,
            )

            print("GROUP ADDED")

            await self.accept()

            print("WEBSOCKET ACCEPTED")

        except Exception as e:
            print("GROUP ADD ERROR:", repr(e))
            await self.close()

    async def disconnect(self, close_code):
        print("DISCONNECT:", close_code)

        try:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name,
            )
        except Exception as e:
            print("GROUP DISCARD ERROR:", repr(e))

    async def receive(self, text_data):
        data = json.loads(text_data)

        message = data.get("message")

        print("MESSAGE:", message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
            },
        )

    async def chat_message(self, event):
        await self.send(
            text_data=json.dumps({
                "message": event["message"],
            })
        )