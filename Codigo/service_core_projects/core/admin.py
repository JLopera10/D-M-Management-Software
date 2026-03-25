from django.contrib import admin
from django.utils.html import format_html
from .models import Cotizacion

@admin.register(Cotizacion)
class CotizacionAdmin(admin.ModelAdmin):
    # Columnas visibles en la bandeja (US-07 y US-09)
    list_display = (
        'cliente', 
        'tipo_obra', 
        'ubicacion', 
        'presupuesto_estimado', 
        'archivo_excel_link', 
        'estado', 
        'estado_badge'
    )
    
    # Permitir cambio de estado rápido
    list_editable = ('estado',) 
    
    # Filtros y buscador
    list_filter = ('estado', 'ubicacion', 'fecha_recibido')
    search_fields = ('cliente', 'email', 'tipo_obra')
    
    # Ordenar por fecha (el campo correcto es fecha_recibido)
    ordering = ('-fecha_recibido',)

    # Link para descargar el Excel subido
    def archivo_excel_link(self, obj):
        if obj.archivo_excel:
            return format_html(
                '<a href="{}" target="_blank" style="color: #3498db; font-weight: bold;">📄 Descargar Excel</a>',
                obj.archivo_excel.url
            )
        return "No cargado"
    
    archivo_excel_link.short_description = "Excel Ingeniería"

    # Badge de colores para el estado
    def estado_badge(self, obj):
        colores = {
            'PENDIENTE': '#f1c40f', # Amarillo
            'PROCESO': '#3498db',   # Azul
            'FINALIZADO': '#2ecc71' # Verde
        }
        color = colores.get(obj.estado, '#7f8c8d')
        labels = dict(obj._meta.get_field('estado').choices)
        texto = labels.get(obj.estado, obj.estado)
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 5px 12px; border-radius: 15px; font-weight: bold; font-size: 10px; text-transform: uppercase;">{}</span>',
            color, texto
        )
    
    estado_badge.short_description = "Vista Rápida"