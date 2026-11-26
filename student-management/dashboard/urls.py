from django.urls import path
from .views import DashboardStatsAPI

urlpatterns = [
    path('dashboard/stats', DashboardStatsAPI.as_view(), name='dashboard-stats'),
]
