from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("blogs", views.BlogViewSet, basename="blog")
router.register("posts", views.PostViewSet, basename="post")

urlpatterns = [
    path("", include(router.urls)),
    path("feed/", views.FeedAPI.as_view(), name="feed"),
    path("search/users/", views.UserSearchView.as_view(), name="user-search"),
]
