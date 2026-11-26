from django.db import models
import uuid
from django.contrib.auth.models import AbstractUser
from  .managers import UserManager
# Create your models here.
class  User(AbstractUser):
    username = None
    first_name = None
    last_name = None

    id = models.UUIDField(primary_key=True, default=uuid.uuid4,editable=False)
    username = models.CharField(max_length=50)
    email= models.EmailField(unique=True)

    USERNAME_FIELD='username'
    REQUIRED_FIELDS=[]
    objects=UserManager()