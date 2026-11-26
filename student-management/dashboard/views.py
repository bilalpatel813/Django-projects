from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from student.models import Student

User = get_user_model()

RECENT_LIMIT = 5
ATTENDANCE_DAYS = 7
PERFORMANCE_BUCKETS = [(90, 'Excellent'), (75, 'Good'), (60, 'Average'), (0, 'Needs Work')]


class DashboardStatsAPI(APIView):
    """Aggregated dashboard data. Reuses the existing Student/User models."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        students = Student.objects.all()
        now = timezone.now()
        today = date.today()

        total_students = students.count()
        total_teachers = User.objects.filter(is_staff=True).count()
        total_courses = students.values('course').exclude(course='').distinct().count()
        total_classes = (
            students.values('course')
            .exclude(course='')
            .annotate(total=Count('id'))
            .count()
        )

        recent = list(
            students.order_by('-created_at').values(
                'id', 'first_name', 'last_name', 'email', 'course', 'enrollment_date', 'created_at'
            )[:RECENT_LIMIT]
        )
        recent_students = [
            {
                'id': str(s['id']),
                'name': f"{s['first_name']} {s['last_name']}".strip(),
                'email': s['email'],
                'course': s['course'],
                'enrollment_date': s['enrollment_date'],
                'created_at': s['created_at'],
            }
            for s in recent
        ]

        growth = []
        month_start = now.date().replace(day=1)
        months = []
        for _ in range(6):
            months.append(month_start)
            month_start = (month_start - timedelta(days=1)).replace(day=1)
        for start in reversed(months):
            end = (start.replace(day=28) + timedelta(days=4)).replace(day=1)
            count = students.filter(created_at__date__gte=start, created_at__date__lt=end).count()
            growth.append({'month': start.strftime('%b'), 'students': count})

        today_new = students.filter(created_at__date=today).count()
        week_start = today - timedelta(days=6)
        this_week = students.filter(created_at__date__gte=week_start).count()
        prev_week = students.filter(
            created_at__date__gte=week_start - timedelta(days=7), created_at__date__lt=week_start
        ).count()

        course_distribution = list(
            students.values('course').exclude(course='').annotate(total=Count('id')).order_by('-total')[:5]
        )
        gender_breakdown = list(
            students.values('gender').annotate(total=Count('id')).order_by('-total')
        )

        activities = [
            {
                'id': f"student-{s['id']}",
                'type': 'enrollment',
                'title': f"{s['first_name']} {s['last_name']} enrolled",
                'description': s['course'],
                'timestamp': s['created_at'],
            }
            for s in recent
        ]

        return Response({
            'stats': {
                'total_students': total_students,
                'total_teachers': total_teachers,
                'total_courses': total_courses,
                'total_classes': total_classes,
                'students_added_today': today_new,
                'students_this_week': this_week,
                'students_previous_week': prev_week,
            },
            'growth': growth,
            'course_distribution': course_distribution,
            'gender_breakdown': gender_breakdown,
            'recent_students': recent_students,
            'activities': activities,
            'attendance': self._attendance_placeholder(),
            'performance': self._performance_placeholder(),
            'meta': {
                'attendance_source': 'unavailable',
                'performance_source': 'unavailable',
                'attendance_days': ATTENDANCE_DAYS,
                'generated_at': now.isoformat(),
            },
        })

    @staticmethod
    def _attendance_placeholder():
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        return [{'day': day, 'present': 0, 'absent': 0, 'total': 0} for day in labels]

    @staticmethod
    def _performance_placeholder():
        return [{'label': label, 'count': 0} for _, label in PERFORMANCE_BUCKETS]
