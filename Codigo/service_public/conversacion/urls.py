from django.urls import path

from . import views

urlpatterns = [
    path("request/", views.procesar_mensaje, name="procesar_mensaje"),
]
