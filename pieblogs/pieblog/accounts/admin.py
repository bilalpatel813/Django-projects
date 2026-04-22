from django.contrib import admin
from .models import profile,EmailOTP,follow
# Register your models here.
admin.site.register(profile)
admin.site.register(EmailOTP)
admin.site.register(follow)