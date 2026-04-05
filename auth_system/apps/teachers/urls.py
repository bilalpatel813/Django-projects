from django.urls import path
from apps.teachers import views

urlpatterns=[
path("teacherdb/",views.teacher_dashboard,name="teacherdb")
]