from rest_framework import serializers
from accounts.serializers import UserMiniSerializer
from .models import Blog, Post, PostLike


class BlogSerializer(serializers.ModelSerializer):
    author = UserMiniSerializer(read_only=True)

    class Meta:
        model = Blog
        fields = ["id", "title", "content", "image", "author", "created_at", "updated_at"]
        read_only_fields = ["author", "created_at", "updated_at"]


class PostSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    like_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ["id", "user", "image", "caption", "created_at", "like_count", "is_liked"]
        read_only_fields = ["user", "created_at"]

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return PostLike.objects.filter(post=obj, user=request.user).exists()


# Kept as an alias: the original codebase had a `FeedSerializer` name used
# specifically for the following-feed endpoint.
FeedSerializer = PostSerializer
