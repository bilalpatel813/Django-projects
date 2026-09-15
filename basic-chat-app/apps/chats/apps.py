from django.apps import AppConfig


class ChatsConfig(AppConfig):
    name = 'apps.chats'
    def ready(self):
      import apps.chats.signals
