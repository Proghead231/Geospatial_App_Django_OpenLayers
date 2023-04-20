from django.urls import path
from .views import IndexView, SaveShapefilesView
from django.conf import settings
from django.conf.urls.static import static
app_name = 'main'
urlpatterns = [
    path('', IndexView.as_view(), name='index'),
    path('save-shapefiles/', SaveShapefilesView.as_view(), name='save-shapefiles'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)