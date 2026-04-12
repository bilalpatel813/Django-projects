from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django import forms
from .models import profile

class CustomSignUp(UserCreationForm):
    
    class Meta:
        model = User
        fields=['username','email','password1','password2']
        
class CustomBioPfp(UserCreationForm):
    
    class Meta:
        model=profile
        fields=['bio','profilepic']
        
        