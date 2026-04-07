from django.shortcuts import render
from django.views import View
from django.http import HttpResponse
from django.views.generic import ListView,CreateView,UpdateView
from django.urls import reverse_lazy
from .models import Post
# Create your views here. 
class HomeView(ListView):
     model=Post
     template_name="blog/home.html"
     context_object_name="posts"

class PostListView(ListView):
    model= Post
    template_name="blog/Post_list.html"
    context_object_name="posts"

class PostCreateView(CreateView):
        model= Post
        fields=['title','content']
        template_name="blog/PostCreate.html"
        success_url=reverse_lazy("home")
        
class PostUpdateView(UpdateView):
    model=Post
    fields=['title','content']
    templates="blog/PostCreate.html"
    success_url=reverse_lazy("Post_list")
    
        
        
    
    
        