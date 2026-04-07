from django.urls import path 
from blog import views

urlpatterns=[
path("",views.HomeView.as_view(),name='home'),
path("home/",views.HomeView.as_view(),name='home'),
path("posts/",views.PostListView.as_view(),name='Post_list'),
path("create/",views.PostCreateView.as_view(),name='post_create'),
path("edit/<int:pk>/",views.PostUpdateView.as_view(),name="post_edit")
]