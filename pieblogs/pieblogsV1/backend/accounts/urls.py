from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("me/", views.MeView.as_view(), name="me"),
    path("profile/<str:username>/", views.ProfileDetailView.as_view(), name="profile-detail"),
    path("profile/<str:username>/followers/", views.FollowersListView.as_view(), name="followers-list"),
    path("profile/<str:username>/following/", views.FollowingListView.as_view(), name="following-list"),
    path("follow/<str:username>/", views.FollowToggleView.as_view(), name="follow-toggle"),
]
