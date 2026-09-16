import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Post

logger = logging.getLogger("blog.signals")


@receiver(post_save, sender=Post)
def on_post_created(sender, instance, created, **kwargs):
    if created:
        logger.info("New post created by %s (id=%s)", instance.user, instance.id)
