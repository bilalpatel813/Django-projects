from django.core.mail import send_mail
from django.conf import settings
from apps.accounts.credential import create_username,create_password
    
     
def auto_email(user,name,password):
    send_mail(
    "your username and password from college",
    f"""Dear {name},

Your account has been successfully created.

Here are your login credentials:
    
Username: {create_username(name)}
Password: {password}

Please log in to your account by the given credentials.

If you face any issues, feel free to contact the administration.
or contact : bilalpatel78600@gmail.com

Best regards,
COOKED college.
    """,
    settings.EMAIL_HOST_USER,
    [user.email],
    fail_silently=False
    )
    