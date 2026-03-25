from django.urls import path
from . import views

urlpatterns = [
    path('projects/', views.gestionar_proyectos, name='gestionar_proyectos'),
    path('employees/', views.gestionar_empleados, name='gestionar_empleados'),
    path('tasks/', views.gestionar_tareas, name='gestionar_tareas'),
    path('tasks/<int:tarea_id>/toggle/', views.toggle_tarea, name='toggle_tarea'),
    path('projects/<int:proyecto_id>/', views.detalle_proyecto, name='detalle_proyecto'),
]