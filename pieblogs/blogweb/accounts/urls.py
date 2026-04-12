from django.contrib.auth.views import LoginView,LogoutView
from django.urls import path
from accounts import views
urlpatterns=[
path("login/",LoginView.as_view(template_name='accounts/login.html'),name='login'),
path("logout/",LogoutView.as_view(next_page='login')),
path("create-account/",views.CreateCredential.as_view(),name='create-account'),
path("verify-otp/",views.Send_OTP.as_view(),name='verify-otp'),
path("resendotp/",views.ResendOTP.as_view(),name='resendotp')
]