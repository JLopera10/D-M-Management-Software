"""
URL configuration for chatbot_project project.
"""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("conversacion.urls")),
]
