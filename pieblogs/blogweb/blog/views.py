from django.shortcuts import render,get_object_or_404
from django.views import View
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.contrib.auth.mixins import LoginRequiredMixin,UserPassesTestMixin
from django.views.generic import ListView,CreateView,UpdateView,DeleteView,DetailView
from django.urls import reverse_lazy
from .models import Post
# Create your views here. 
class HomeView(LoginRequiredMixin,ListView):
     model=Post 
     template_name="blog/home.html"
     context_object_name="posts"
     
     
class ProfileView(LoginRequiredMixin,UserPassesTestMixin,ListView):
    login_url='login'
    model= Post
    template_name="blog/profile.html"
    slug_field = 'username'
    slug_url_kwarg = 'username'
    context_object_name="posts"
    def test_func(self):
            return self.request.user.is_authenticated
       
    def get_queryset(self):
        username = self.kwargs.get('username')
        
        return Post.objects.filter(author__username=username)
    def get_context_data(self, **kwargs):
         context = super().get_context_data(**kwargs)
         context['profile_user']= get_object_or_404(
        User, username=self.kwargs['username']
    )
         print(self.kwargs)
         return context
        
class PostListView(ListView):
    model= Post
    template_name="blog/Post_list.html"
    context_object_name="posts"

class PostCreateView(LoginRequiredMixin,CreateView):
        model= Post
        fields=['title','content','image']
        template_name="blog/post_form.html"
        success_url=reverse_lazy("home")
        def form_valid(self,form):
            form.instance.author=self.request.user
            return super().form_valid(form)
        
class PostUpdateView(LoginRequiredMixin,UserPassesTestMixin,UpdateView):
    model=Post
    fields=['title','content']
    templates="blog/post_form.html"
    success_url=reverse_lazy("profile")
    def test_func(self):
        post=self.get_object()
        return self.request.user==post.author
        

class PostDeleteView(LoginRequiredMixin,UserPassesTestMixin,DeleteView):
    model= Post
    template_name="blog/profile.html"
    success_url=reverse_lazy("profile")
    def test_func(self):
        post=self.get_object()
        return self.request.user == post.author
        
    
        
        
    
    
        