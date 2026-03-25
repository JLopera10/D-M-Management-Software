"""
US-04: Expone el asistente en este servicio (puerto 8005).
La implementación vive en el paquete dm_asistente_core.
"""

from dm_asistente_core.django_views import procesar_mensaje_chatbot as procesar_mensaje

__all__ = ["procesar_mensaje"]