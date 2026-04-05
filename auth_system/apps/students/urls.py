from django.urls import path
from apps.students import views

urlpatterns=[
path("studentdb/",views.student_dashboard,name="home")
]