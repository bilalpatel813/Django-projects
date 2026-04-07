
from apps.accounts.utils import get_user_role
import random

def create_username(name):
    return f"{name}@COOKEDcollege"
    
def create_password(name,role):
    if role == "students":
           user_role="students"
    elif role == "teachers":
            user_role="teachers"
    else:
         user_role= "NONE"
    return f"{name}{random.randint(1,100)}@{user_role}"