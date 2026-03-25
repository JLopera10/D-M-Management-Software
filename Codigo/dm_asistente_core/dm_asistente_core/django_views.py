"""
Vista HTTP única del asistente; se parametriza con PerfilServicioAsistente por servicio.
"""

from __future__ import annotations

import json
import logging
import os

from django.conf import settings
from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from dm_asistente_core.constants import DEFAULT_GEMINI_MODEL
from dm_asistente_core.gemini_service import historial_a_gemini, llamar_modelo
from dm_asistente_core.profiles import (
    PERFIL_CHATBOT,
    PERFIL_PUBLIC,
    PerfilServicioAsistente,
)

logger = logging.getLogger(__name__)


def _procesar_mensaje(request: HttpRequest, perfil: PerfilServicioAsistente) -> JsonResponse:
    api_key = (os.environ.get("GEMINI_API_KEY") or "").strip()
    if not api_key:
        return JsonResponse(
            {
                "exito": False,
                "respuesta": None,
                "mensaje": perfil.mensaje_sin_api_key,
            },
            status=503,
            json_dumps_params={"ensure_ascii": False},
        )

    try:
        cuerpo = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse(
            {
                "exito": False,
                "respuesta": None,
                "mensaje": "Cuerpo JSON inválido.",
            },
            status=400,
            json_dumps_params={"ensure_ascii": False},
        )

    mensaje_usuario = (cuerpo.get("mensaje") or "").strip()
    if not mensaje_usuario:
        return JsonResponse(
            {
                "exito": False,
                "respuesta": None,
                "mensaje": "El campo «mensaje» es obligatorio.",
            },
            status=400,
            json_dumps_params={"ensure_ascii": False},
        )

    historial_crudo = cuerpo.get("historial")
    if historial_crudo is not None and not isinstance(historial_crudo, list):
        return JsonResponse(
            {
                "exito": False,
                "respuesta": None,
                "mensaje": "«historial» debe ser una lista.",
            },
            status=400,
            json_dumps_params={"ensure_ascii": False},
        )

    historial_previo = historial_a_gemini(historial_crudo or [])
    nombre_modelo = (os.environ.get("GEMINI_MODEL") or DEFAULT_GEMINI_MODEL).strip()

    try:
        import google.generativeai as genai

        texto, modelo_usado = llamar_modelo(
            genai,
            api_key,
            nombre_modelo,
            historial_previo,
            mensaje_usuario,
        )
        if not texto:
            texto = (
                "No se generó texto en la respuesta. Pruebe otra redacción o "
                "verifique el modelo en GEMINI_MODEL (p. ej. gemini-2.5-flash o gemini-flash-latest)."
            )

        return JsonResponse(
            {
                "exito": True,
                "respuesta": texto,
                "mensaje": "OK",
                "modelo": modelo_usado,
            },
            json_dumps_params={"ensure_ascii": False},
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception("Error al llamar a Gemini: %s", exc)
        detalle = str(exc)[:280] if settings.DEBUG else ""
        msg = perfil.mensaje_error_gemini
        if detalle:
            msg = f"{msg} (detalle: {detalle})"
        return JsonResponse(
            {
                "exito": False,
                "respuesta": None,
                "mensaje": msg,
            },
            status=502,
            json_dumps_params={"ensure_ascii": False},
        )


@csrf_exempt
@require_POST
def procesar_mensaje_public(request: HttpRequest) -> JsonResponse:
    """Endpoint montado en service_public (p. ej. puerto 8003, prefijo /chatbot/)."""
    return _procesar_mensaje(request, PERFIL_PUBLIC)


@csrf_exempt
@require_POST
def procesar_mensaje_chatbot(request: HttpRequest) -> JsonResponse:
    """Endpoint montado en service_chatbot (p. ej. puerto 8005, ruta /request/)."""
    return _procesar_mensaje(request, PERFIL_CHATBOT)
