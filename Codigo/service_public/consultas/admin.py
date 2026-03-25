from django.contrib import admin

from .models import SolicitudContactoChat


@admin.register(SolicitudContactoChat)
class SolicitudContactoChatAdmin(admin.ModelAdmin):
    list_display = ("nombre", "email", "telefono", "creado_en")
    list_filter = ("creado_en",)
    search_fields = ("nombre", "email", "telefono", "resumen_confirmado")
    readonly_fields = ("creado_en",)
    ordering = ("-creado_en",)
