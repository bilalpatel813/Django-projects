from django.urls import path ,include
from blog import views
from django.contrib.auth.views import LoginView,LogoutView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('posts',views.PostSetView)


urlpatterns=[
path('',include(router.urls)),
path("",views.HomeView.as_view(),name='home'),
path("home/",views.HomeView.as_view(),name='home'),
path("postslist/",views.PostListView.as_view(),name='Post_list'),
path("create/",views.PostCreateView.as_view(),name='post_create'),
path("edit/<int:pk>/",views.PostUpdateView.as_view(),name="post_edit"),
path("<str:username>/",views.ProfileView.as_view(),name="profile"),
path("delete/<int:pk>/",views.PostDeleteView.as_view(),name="delete"),
#path("api/posts/",views.PostListApi.as_view()),
#path("api/posts/<int:pk>/",views.PostDetailApi.as_view())
]