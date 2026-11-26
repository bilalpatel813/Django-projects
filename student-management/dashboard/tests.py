from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from student.models import Student

User = get_user_model()
URL = '/dashboard/stats'


class DashboardStatsAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='admin', email='admin@example.com', password='Passw0rd!')
        for i in range(7):
            Student.objects.create(
                first_name='S', last_name=str(i), email=f's{i}@example.com', phone='1234567890',
                age=20, gender='Male' if i % 2 else 'Female', course='Math' if i < 4 else 'Physics',
                address='x', date_of_birth='2005-01-01',
            )
        self.client = APIClient()

    def test_requires_auth(self):
        self.assertEqual(self.client.get(URL).status_code, 401)

    def test_returns_aggregates(self):
        self.client.force_authenticate(self.user)
        res = self.client.get(URL)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data['stats']['total_students'], 7)
        self.assertEqual(data['stats']['total_courses'], 2)
        self.assertEqual(data['stats']['total_classes'], 2)
        self.assertEqual(data['stats']['total_teachers'], 0)
        self.assertEqual(len(data['recent_students']), 5)
        self.assertEqual(len(data['growth']), 6)
        self.assertEqual(len(data['attendance']), 7)
        self.assertEqual(len(data['activities']), 5)
