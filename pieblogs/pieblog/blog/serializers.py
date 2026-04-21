from rest_framework import serializers
from .models import Post,Feed

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model=Post
        fields='__all__'
class FeedSerializer(serializers.ModelSerializer):
    class Meta:
        model=Feed
        fields=['id','user','image','caption','created_at']
    