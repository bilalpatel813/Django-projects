from datetime import timedelta
from django.utils.timezone import now
from django.shortcuts import render,redirect
from django.views import View
from django.views.generic import CreateView
from django.urls import reverse_lazy
from django.contrib.auth.models import User
from accounts.forms import CustomSignUp
from django.contrib.auth import login
from .utils import generate_otp,send_email
from .models import EmailOTP
# Create your views here.

class CreateCredential(CreateView):
    form_class=CustomSignUp
    template_name='accounts/create_credential.html'
    success_url=reverse_lazy('verify-otp')
        
    def form_valid(self, form):
        print("credential form valid")
        user=form.save(commit=False)
        user.is_acitve=False
        user.set_password(form.cleaned_data['password1'])
        user.save()
        otp=generate_otp()
        EmailOTP.objects.create(user=user,otp=otp)
        send_email(user,otp)
        print('email send successfully')
        self.request.session['otp_user']=user.id
        response =super().form_valid(form)
        return response
        
        
class Send_OTP(View):
    def get(self,request):
        return render(request, "accounts/otp_varify.html")
    def post(self,request):
        entered_otp=request.POST.get('otp')
        user_id=request.session.get('otp_user')
        otp_obj= EmailOTP.objects.filter(user_id=user_id).last()
        attempts=request.session.get('otp_attempts',0)
        if attempts > 3:
            return render(request,'accounts/otp_varify.html',{'error':'Too many attempts try again later!'})
        request.session['otp_attempts']=attempts+1
        if now() > otp_obj.created_at+timedelta(minutes=5):
            return render(request,'accounts/otp_varify.html',{'error':'OTP Expired! '})
            
        if otp_obj and otp_obj.otp == entered_otp:
            request.session['otp_attempts']=0
            user=User.objects.get(id=user_id)
            user.is_active=True
            user.save()
            otp_obj.delete()
            print("error in otp validation")
            login(request,user)
            print('user signed in by otp verify')
            return redirect('home')
            
        return render(request,'accounts/otp_varify.html',{'error':'invalid OTP'})


class ResendOTP(View):
    def get(self, request):
        return self.post(request)
    def handle_resend(self, request):
        # resend logic
        return redirect('verify-otp')
    def post(self,request):
        user_id= request.session.get('otp_user')
        user=User.objects.get(id=user_id)
        if not user_id:
            return redirect('create-account')
        EmailOTP.objects.filter(user=user).delete()
        otp=generate_otp()
        print('new otp generated')
        EmailOTP.objects.create(user=user,otp=otp)
        send_email(user,otp)
        print("new email sent")
        return redirect('verify-otp')       

    
    
    