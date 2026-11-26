from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterAPI, LoginAPI, LogoutAPI, Me

urlpatterns = [
    path('login', LoginAPI.as_view(), name='login'),
    path('register', RegisterAPI.as_view(), name='register'),
    path('logout', LogoutAPI.as_view(), name='logout'),
    path('Me', Me.as_view(), name='me'),
    path('token/refresh', TokenRefreshView.as_view(), name='token-refresh'),
]
