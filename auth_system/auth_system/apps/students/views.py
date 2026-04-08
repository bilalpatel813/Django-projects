from django.shortcuts import render
from django.contrib.auth.decorators import login_required,user_passes_test
from apps.accounts.utils import is_student
# Create your views here.
@user_passes_test(is_student)
def student_dashboard(request):
    return render(request,'students/home.html',{'is_student': is_student(request.user)})
    
    