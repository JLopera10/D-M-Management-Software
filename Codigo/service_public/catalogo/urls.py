from django.urls import path

from . import views

urlpatterns = [
    path("projects/", views.listar_proyectos, name="listar_proyectos"),
    path("projects/<int:proyecto_id>/", views.detalle_proyecto, name="detalle_proyecto"),
    path("categories/", views.listar_categorias, name="listar_categorias"),
]
