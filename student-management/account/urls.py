from django.urls import path, include
from  .views import RegisterAPI, LoginAPI, LogoutAPI, ProfileAPI,Me 
urlpatterns = [
    path('/login', LoginAPI.as_view(),name='login'),
    path('/register',RegisterAPI.as_view(),name='register'), 
    path('/logout', LogoutAPI.as_view(),name='logout'), 
    path("/Me", Me.as_view(),name="me")
] 
