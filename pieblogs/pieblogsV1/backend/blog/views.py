from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, filters, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Follow
from accounts.serializers import UserMiniSerializer
from .models import Blog, Post, PostLike
from .serializers import BlogSerializer, PostSerializer
from .permissions import IsAuthorOrReadOnly, IsOwnerOrReadOnly
from .paginations import FeedPagination


class BlogViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for long-form blogs.
    GET /api/blog/blogs/            - list all blogs (home page), paginated
    GET /api/blog/blogs/?search=... - search by title
    GET /api/blog/blogs/<id>/       - detail
    POST/PUT/PATCH/DELETE           - author only
    """
    queryset = Blog.objects.select_related("author", "author__profile").all()
    serializer_class = BlogSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "content", "author__username"]
    ordering_fields = ["created_at"]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=False, methods=["get"], url_path="by-author/(?P<username>[^/.]+)")
    def by_author(self, request, username=None):
        user = get_object_or_404(User, username=username)
        qs = self.get_queryset().filter(author=user)
        page = self.paginate_queryset(qs)
        serializer = self.get_serializer(page or qs, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)


class PostViewSet(viewsets.ModelViewSet):
    """
    CRUD for short feed posts.
    GET /api/blog/posts/            - all posts (public grid)
    POST /api/blog/posts/           - create (owner = request.user)
    """
    queryset = Post.objects.select_related("user", "user__profile").all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    pagination_class = FeedPagination

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        like_obj, created = PostLike.objects.get_or_create(post=post, user=request.user)
        if not created:
            like_obj.delete()
            liked = False
        else:
            liked = True
        return Response({"liked": liked, "like_count": post.likes.count()})


class FeedAPI(APIView):
    """
    GET /api/blog/feed/
    Posts from accounts the current user follows, newest first, paginated.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        following_ids = Follow.objects.filter(
            followers=request.user
        ).values_list("followings", flat=True)

        feed = (
            Post.objects.filter(user__in=following_ids)
            .select_related("user", "user__profile")
            .order_by("-created_at")
        )
        paginator = FeedPagination()
        page = paginator.paginate_queryset(feed, request)
        serializer = PostSerializer(page, many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)


class UserSearchView(generics.ListAPIView):
    """GET /api/blog/search/users/?q=... - used by the navbar search box."""
    serializer_class = UserMiniSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        query = self.request.GET.get("q", "").strip()
        qs = User.objects.all()
        current = self.request.user
        if current.is_authenticated:
            qs = qs.exclude(id=current.id)
        if query:
            qs = qs.filter(username__icontains=query)
        return qs[:10]
