from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    """1-1 extension of django.contrib.auth.User with bio/avatar."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    profilepic = models.ImageField(upload_to="profile/pfp/", blank=True, null=True)
    bio = models.TextField(blank=True, default="")

    def __str__(self):
        return f"{self.user.username}"


class Follow(models.Model):
    """followers -> followings edge of the social graph."""
    followers = models.ForeignKey(
        User, related_name="followings", on_delete=models.CASCADE
    )
    followings = models.ForeignKey(
        User, related_name="followers", on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["followers", "followings"], name="unique_follower_following"
            )
        ]

    def __str__(self):
        return f"{self.followers} follows {self.followings}"


# Backwards-compatible lowercase aliases (other apps import `follow`).
follow = Follow
profile = Profile
