import uuid
from django.db import models


class Student(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]

    
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    age = models.PositiveIntegerField()

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES
    )

    course = models.CharField(max_length=100)
    address = models.TextField()
    date_of_birth = models.DateField()

    enrollment_date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student_id} - {self.first_name} {self.last_name}"
