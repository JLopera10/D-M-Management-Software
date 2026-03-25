from django.contrib import admin

from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("titulo", "categoria", "ubicacion", "fecha_creacion")
    list_filter = ("categoria", "fecha_creacion")
    search_fields = ("titulo", "descripcion", "ubicacion", "categoria")
    ordering = ("-fecha_creacion",)
