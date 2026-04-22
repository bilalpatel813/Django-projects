from rest_framework import serializers
from .models import Post,Blog

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model=Blog
        fields='__all__'
class FeedSerializer(serializers.ModelSerializer):
    class Meta:
        model=Post
        fields=['id','user','image','caption','created_at']
    