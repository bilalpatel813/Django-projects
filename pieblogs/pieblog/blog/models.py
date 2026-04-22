from django.db import models
from django.contrib.auth.models import User 
# Create your models here.
class Blog(models.Model):
    title=models.CharField(max_length=200)
    content=models.TextField()
    image=models.ImageField(upload_to="blogs/",blank=True,null=True)
    author=models.ForeignKey(User,on_delete=models.CASCADE)
    created_at=models.DateTimeField(auto_now_add=True)
    
    
    def __str__(self):
        return self.title

class Post(models.Model):
    user=models.ForeignKey('auth.User',on_delete=models.CASCADE)
    image=models.ImageField(upload_to='feed/post/')
    caption=models.TextField()
    created_at=models.DateTimeField(auto_now_add=True,db_index=True)
    
    
        
     