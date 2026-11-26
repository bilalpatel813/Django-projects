from django.contrib.auth import aauthenticate
from rest_framework import serializers
from .models import User

class RegisterSerializer(serializers.Serializer):

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    def validate(self, data):
        username=data["username"]
        password= data["password"]

        user =authenticate(
            username=username, 
            password=password
        )
        if user is none:
            raise serializer.ValidationError("invalid credentials")
        data["user"]=user
        return data

class UserSerializer(serializers.Serializer):
    fullName = serializers.CharField(source="full_name")
    class Meta:
        model = User
        fields = ["id, username, email"]
