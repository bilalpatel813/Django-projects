from django.shortcuts import render,redirect
from django.contrib.auth import authenticate,login,logout
from django.contrib.auth.models import User,Group
from django.contrib.auth.decorators import login_required
from apps.accounts.utils import  get_user_role
from apps.accounts.email import auto_email
from apps.accounts.credential import create_username,create_password
# Create your views here.

def login_view(request):
    if request.method=="POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user=authenticate(username=username,password=password)
        if user:
            login(request,user)
            role= get_user_role(user)
            if role == "students":
                return redirect('home')
            elif role == "teachers":
                return redirect('teacherdb')
            else:
                return redirect('login',{'error': 'invalid credentials'})
            return redirect('home')
        else:
            return redirect('accounts/login.html')
    return render(request,"accounts/login.html") 
    
def logout_view(request):
    logout(request)
    return redirect('login')   
    
def signup_view(request):
    if request.method == "POST":
        name=request.POST.get("name")
        email=request.POST.get("email")
        role=request.POST.get("role")
        #phone=request.POST.get("phone") 
        email_password=request.POST.get("email_password")
        

        username=create_username(name)
        password=create_password(name,role)
        
        
        user = User.objects.create_user(
        username=username,
        email=email,
        password=password
        )
        #user.user_details.phone=phone
        user.save()
        print(username,password)
        # assign groups
        group=Group.objects.get(name=role)
        user.groups.add(group)
        #sending email to user
        auto_email(user,name,password)
        
        return redirect('login')
        
    return render(request,"accounts/signup.html")