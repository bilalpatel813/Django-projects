from django.urls import path
from apps.accounts import views

urlpatterns=[
path("",views.login_view,),
path("login/",views.login_view,name='login'),
path("logout/",views.logout_view,name='logout'),
path("signup/",views.signup_view,name='signup')
]