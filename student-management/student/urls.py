from rest_framework.routers import DefaultRouter
from .views import StudentAPI

router = DefaultRouter()
router.register('students', StudentAPI)

urlpatterns = router.urls
