from django.shortcuts import render
from django.contrib.auth.decorators import login_required,user_passes_test
from apps.accounts.utils import is_teacher
# Create your views here.
@user_passes_test(is_teacher)
def teacher_dashboard(request):
    return render(request,'teachers/teacherDashboard.html',{'is_teacher':is_teacher(request.user)})