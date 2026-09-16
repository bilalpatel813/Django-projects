from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Profile, Follow


def _allowed_domains():
    return [d.strip().lower() for d in settings.ALLOWED_SIGNUP_EMAIL_DOMAINS if d.strip()]


class RegisterSerializer(serializers.ModelSerializer):
    """
    Sign-up serializer for V1.

    Email verification (OTP) has been removed entirely - the account is
    created active and the user is logged in immediately. As a
    replacement safeguard, only email addresses on an allow-listed
    domain (@gmail.com by default, see ALLOWED_SIGNUP_EMAIL_DOMAINS in
    settings) are accepted at sign-up time.
    """
    password = serializers.CharField(write_only=True, min_length=8, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "password2"]

    def validate_email(self, value):
        value = value.strip().lower()
        domain = value.split("@")[-1] if "@" in value else ""
        allowed = _allowed_domains()
        if domain not in allowed:
            allowed_str = ", ".join(f"@{d}" for d in allowed)
            raise serializers.ValidationError(
                f"Sign-up is currently only open to {allowed_str} email addresses."
            )
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")
        user = User(
            username=validated_data["username"],
            email=validated_data["email"],
            is_active=True,  # active immediately - no email/OTP verification step
        )
        user.set_password(password)
        user.save()
        return user


class UserMiniSerializer(serializers.ModelSerializer):
    profilepic = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "profilepic"]

    def get_profilepic(self, obj):
        request = self.context.get("request")
        pic = getattr(getattr(obj, "profile", None), "profilepic", None)
        if pic:
            return request.build_absolute_uri(pic.url) if request else pic.url
        return None


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    follower_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    post_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    is_own_profile = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            "username", "email", "bio", "profilepic",
            "follower_count", "following_count", "post_count",
            "is_following", "is_own_profile",
        ]

    def get_follower_count(self, obj):
        return Follow.objects.filter(followings=obj.user).count()

    def get_following_count(self, obj):
        return Follow.objects.filter(followers=obj.user).count()

    def get_post_count(self, obj):
        return obj.user.post_set.count()

    def get_is_following(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return Follow.objects.filter(followers=request.user, followings=obj.user).exists()

    def get_is_own_profile(self, obj):
        request = self.context.get("request")
        return bool(request and request.user.is_authenticated and request.user == obj.user)


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["bio", "profilepic"]


class FollowUserSerializer(serializers.ModelSerializer):
    profilepic = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "profilepic"]

    def get_profilepic(self, obj):
        request = self.context.get("request")
        pic = getattr(getattr(obj, "profile", None), "profilepic", None)
        if pic:
            return request.build_absolute_uri(pic.url) if request else pic.url
        return None
