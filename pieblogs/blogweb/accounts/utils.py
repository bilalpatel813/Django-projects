import random
from django.core.mail import send_mail
from django.conf import settings


def generate_otp():
    return str(random.randint(1000,9999))
    
def send_email(user,otp):
    send_mail(
     'your OTP form verification',
     f"""dear {user.username},
     Welcome to PieBlogs!,
     Your OTP {otp}
     Use this otp to verify and create your account on pieblogs
     This OTP will expiry in 5min 
     Try to verify before otp get expired
     
     If you face any issues, feel free to contact on : piedeveloper8@gmail.com

Best regards,
PieBlogs.
     """,
     settings.EMAIL_HOST_USER,
     [user.email],
     fail_silently=False
    )