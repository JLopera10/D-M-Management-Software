"""
URL configuration for public_project project.
"""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("consultas-chatbot/", include("consultas.urls")), 
    path("", include("catalogo.urls")),
]