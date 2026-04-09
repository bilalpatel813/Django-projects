from django.urls import path 
from blog import views
from django.contrib.auth.views import LoginView,LogoutView
urlpatterns=[
path("",views.HomeView.as_view(),name='home'),
path("home/",views.HomeView.as_view(),name='home'),
path("posts/",views.PostListView.as_view(),name='Post_list'),
path("create/",views.PostCreateView.as_view(),name='post_create'),
path("edit/<int:pk>/",views.PostUpdateView.as_view(),name="post_edit"),
path("profile/",views.ProfileView.as_view(),name="profile"),
path("delete/<int:pk>/",views.PostDeleteView.as_view(),name="delete"),
path("login/",LoginView.as_view(template_name='blog/login.html'),name='login'),
path("logout/",LogoutView.as_view(next_page='login'),name='logout')
]