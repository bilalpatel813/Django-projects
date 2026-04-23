from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Post

@receiver(post_save,sender=Post)
def create_post(sender,instance,created,**kwargs):
    if created:
        print("New post Created!!" ,"by",instance.user)
        
