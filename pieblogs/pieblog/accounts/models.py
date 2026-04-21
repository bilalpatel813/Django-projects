from django.db import models
from django.contrib.auth.models import User
# Create your models here.
class profile(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE)
    email= models.EmailField(null=True)
    profilepic=models.ImageField(upload_to="profile/pfp/",blank=True)
    bio=models.TextField(blank=True)
    
    def __str__(self):
        return f'{self.user.username}'
    
    
class EmailOTP(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE)
    otp=models.CharField(max_length=4)
    created_at=models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'{self.user.username} - {self.otp}'
        
 
class follow(models.Model):
    followers=models.ForeignKey('auth.User',related_name='followings',on_delete=models.CASCADE)
    followings=models.ForeignKey('auth.User',related_name='followers',on_delete=models.CASCADE)
    class Meta:
        constraints=[
        models.UniqueConstraint(fields=['followers','followings'],name = 'unique_follower_following')]
        
        
    