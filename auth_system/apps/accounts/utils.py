from django.contrib.auth.models import Group

def is_student(user):
    return user.groups.filter(name='students').exists()
    
def is_teacher(user):
    return user.groups.filter(name='teachers').exists()
    
def get_user_role(user):
    if user.groups.filter(name='students').exists():
        return "students"
    elif user.groups.filter(name='teachers').exists():
       return "teachers"
    return none