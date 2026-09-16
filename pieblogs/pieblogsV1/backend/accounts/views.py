from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Profile, Follow
from .serializers import (
    RegisterSerializer,
    ProfileSerializer,
    ProfileUpdateSerializer,
    FollowUserSerializer,
)


class RegisterView(generics.CreateAPIView):
    """
    POST /api/accounts/register/
    Creates the user (active=True, no OTP step) and returns JWT tokens
    so the frontend can log the user straight in.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": {"id": user.id, "username": user.username, "email": user.email},
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    """GET current user's own profile, PATCH bio/profilepic."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        return Response(ProfileSerializer(profile, context={"request": request}).data)

    def patch(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileUpdateSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ProfileSerializer(profile, context={"request": request}).data)


class ProfileDetailView(APIView):
    """GET /api/accounts/profile/<username>/"""
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        profile, _ = Profile.objects.get_or_create(user=user)
        return Response(ProfileSerializer(profile, context={"request": request}).data)


class FollowToggleView(APIView):
    """POST /api/accounts/follow/<username>/ - follow if not following, else unfollow."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, username):
        target_user = get_object_or_404(User, username=username)
        if request.user == target_user:
            return Response(
                {"detail": "You cannot follow yourself."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        follow_obj, created = Follow.objects.get_or_create(
            followers=request.user, followings=target_user
        )
        if not created:
            follow_obj.delete()
            following = False
        else:
            following = True

        return Response({
            "following": following,
            "follower_count": Follow.objects.filter(followings=target_user).count(),
        })


class FollowersListView(generics.ListAPIView):
    """GET /api/accounts/profile/<username>/followers/"""
    serializer_class = FollowUserSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = get_object_or_404(User, username=self.kwargs["username"])
        follower_ids = Follow.objects.filter(followings=user).values_list("followers", flat=True)
        return User.objects.filter(id__in=follower_ids)


class FollowingListView(generics.ListAPIView):
    """GET /api/accounts/profile/<username>/following/"""
    serializer_class = FollowUserSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = get_object_or_404(User, username=self.kwargs["username"])
        following_ids = Follow.objects.filter(followers=user).values_list("followings", flat=True)
        return User.objects.filter(id__in=following_ids)
