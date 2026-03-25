"""
Mensajes propios de cada servicio Django que expone el endpoint del asistente.
La lógica HTTP compartida usa estos textos para no duplicar vistas.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class PerfilServicioAsistente:
    mensaje_sin_api_key: str
    mensaje_error_gemini: str


PERFIL_PUBLIC = PerfilServicioAsistente(
    mensaje_sin_api_key=(
        "Falta GEMINI_API_KEY: créelo en service_public/.env o en "
        "service_chatbot/.env (Google AI Studio) y reinicie Django en el puerto 8003."
    ),
    mensaje_error_gemini=(
        "No fue posible obtener respuesta del asistente. Compruebe la clave API, "
        "GEMINI_MODEL (p. ej. gemini-2.5-flash), cuota de la API y la conexión a internet "
        "del servidor (puerto 8003)."
    ),
)

PERFIL_CHATBOT = PerfilServicioAsistente(
    mensaje_sin_api_key=(
        "Falta configurar la API de Gemini: abra el archivo .env en la carpeta "
        "service_chatbot, asigne GEMINI_API_KEY= (clave desde Google AI Studio) "
        "y reinicie el servidor en el puerto 8005. Plantilla: .env.example."
    ),
    mensaje_error_gemini=(
        "No fue posible obtener respuesta del asistente. Compruebe la clave API, "
        "GEMINI_MODEL (p. ej. gemini-2.5-flash), cuota de la API y que el servicio chatbot "
        "tenga acceso a internet."
    ),
)
