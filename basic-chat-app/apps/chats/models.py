from django.db import models
from django.contrib.auth.models import User
# Create your models here.
class Conversation(models.Model):
    class Type(models.TextChoices):
        DIRECT = "direct", "Direct"
        GROUP = "group", "Group"

    id = models.BigAutoField(primary_key=True)
    type = models.CharField(max_length=10, choices=Type.choices)
    name = models.CharField(max_length=100, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name or f"Conversation {self.id}"


class ConversationParticipant(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="participants"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="conversations"
    )

    joined_at = models.DateTimeField(auto_now_add=True)
    is_admin = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["conversation", "user"],
                name="unique_conversation_participant"
            )
        ]


class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages"
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_messages"
    )

    text = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["created_at"]