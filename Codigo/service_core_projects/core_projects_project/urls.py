from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import CotizacionViewSet
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'cotizaciones', CotizacionViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)), # URL: /api/cotizaciones/
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)