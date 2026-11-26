from django.urls import path, include
from .views import StudentAPI
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register('students',StudentAPI)
urlsptterns=router.urls
