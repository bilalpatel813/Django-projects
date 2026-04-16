from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import PostSerializer
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.shortcuts import render,get_object_or_404,redirect
from django.views import View
from django.contrib.auth.models import User
from django.http import HttpResponse,JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin,UserPassesTestMixin
from django.views.generic import ListView,CreateView,UpdateView,DeleteView,DetailView
from django.urls import reverse_lazy
from .models import Post
# Create your views here. 
@method_decorator(cache_page(30),name='dispatch')
class HomeView(LoginRequiredMixin,ListView):
     model=Post 
     template_name="blog/home.html"
     context_object_name="posts"
     def get(self, request, *args, **kwargs):
         query = request.GET.get('q')
         if query:
             try:
                 user = User.objects.get(username=query)
                 return redirect('profile', username=user.username)
             except User.DoesNotExist:
                   pass

         return super().get(request, *args, **kwargs)
     def get_context_data(self,**kwargs):
          context = super().get_context_data(**kwargs)
          query=self.request.GET.get("q")
          users= User.objects.exclude(id=self.request.user.id)
          print("query run for users")
          if query:
              users=users.filter(username__icontains=query)
              context['query']=query
              context['users']=users
          return context
        
        
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
        
        return Post.objects.filter(author__username=username).order_by("-created_at")
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
    
class SearchView(ListView):
    def search_user(self,request):
        query=request.GET.get('q','')
        
        if query:
            users=User.objects.filter(username__icontains=query)[:5]
         
        data=[]   
        for user in users:
            data.append({
                'username':user.username
            })
        return JsonResponse({'users':data})
    
class PostListApi(APIView):
    def get(self,request):
        posts=Post.objects.all()
        serializer=PostSerializer(posts,many=True)
        print("Get api used ")
        return Response(serializer.data)
    def post(self,request):
        serializer=PostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            print("Post api is used")
            return Response(serializer.data)
        return Response(serializer.errors)
     

class PostDetailApi(APIView):
    def get_object(self,pk):
        return Post.objects.get(pk=pk)
        
    def get(self,request,pk):
        posts=self.get_object(pk)
        serializer=PostSerializer(posts)
        print("Get api used for single post  ")
        return Response(serializer.data)
    def post(self,request,pk):
        posts=self.get_object(pk)
        serializer=PostSerializer(posts,data=request.data)
        if serializer.is_valid():
            serializer.save()
            print("Post api is used for single post ")
            return Response(serializer.data)
        return Response(serializer.errors)
     
    def put(self,request,pk):
        posts=self.get_object(pk)
        serializer=PostSerializer(posts,data=request.data)
        if serializer.is_valid():
            serializer.save()
            print("put api is usedfor single post")
            return Response(serializer.data)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self,request,pk):
        posts=self.get_object(pk)
        posts.delete()
        print("delete api used for post :",posts)
        return Response(status=204)
            

        
                
        
    
    
        