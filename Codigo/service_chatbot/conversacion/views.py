"""
US-04: endpoint de mensajería con Google Gemini.
El historial lo envía el cliente (sesión en navegador); aquí solo se orquesta la llamada al modelo.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any

from django.conf import settings
from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

logger = logging.getLogger(__name__)

_MAX_HISTORIAL = 40

_DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"
_MODELOS_GEMINI_RESPALDO: tuple[str, ...] = (
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-1.5-flash-8b",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash-002",
    "gemini-1.5-flash",
)


def _candidatos_modelo(nombre_config: str) -> list[str]:
    preferido = (nombre_config or "").strip()
    vistos: set[str] = set()
    orden: list[str] = []
    if preferido:
        orden.append(preferido)
        vistos.add(preferido)
    for m in _MODELOS_GEMINI_RESPALDO:
        if m not in vistos:
            orden.append(m)
            vistos.add(m)
    return orden

_INSTRUCCION_SISTEMA = """Eres el asistente virtual exclusivo de D&M Industrias Metálicas S.A.S. (Colombia), \
dedicada a la fabricación de productos metálicos para uso estructural: cubiertas, cerramientos, estructuras y \
proyectos afines.

ÁMBITO PERMITIDO — Solo respondes sobre: (1) D&M Industrias Metálicas (qué hace, tipo de productos y servicios \
metálicos estructurales que ofrece la empresa en términos generales); (2) orientación sobre obras, construcciones \
o instalaciones donde intervengan estructuras o elementos metálicos industriales alineados con el portafolio de \
D&M; (3) acompañamiento para acercar una cotización formal: preguntas sobre tipo de obra, alcance, medidas \
aproximadas, ubicación general, plazos deseados. No des precios cerrados ni compromisos contractuales: la \
cotización definitiva la define el equipo comercial de D&M.

FUERA DE ÁMBITO — Si la consulta no tiene relación clara con D&M o con construcciones/cotizaciones en el sector \
de estructuras y cerramientos metálicos (por ejemplo: programación, tareas escolares, salud, política, \
chismes, otros negocios, temas personales sin vínculo con una obra), responde con cortesía en español en pocas \
frases, indica que solo puedes ayudar en temas de D&M y de construcciones/cotizaciones en esa línea, e invita a \
reformular la pregunta dentro de ese marco. No inventes datos internos de la empresa ni de proyectos reales.

ESTILO — Español, tono profesional, claro y breve. Puedes saludar si el usuario saluda, y en seguida orientar \
hacia cómo D&M puede ayudar en su obra o consulta metalúrgica/estructural."""


def _historial_a_gemini(entradas: list[dict[str, Any]]) -> list[dict[str, Any]]:
    salida: list[dict[str, Any]] = []
    for item in entradas[-_MAX_HISTORIAL:]:
        rol = (item.get("rol") or "").strip().lower()
        texto = (item.get("contenido") or "").strip()
        if not texto:
            continue
        if rol in ("usuario", "user"):
            salida.append({"role": "user", "parts": [texto]})
        elif rol in ("asistente", "assistant", "model"):
            salida.append({"role": "model", "parts": [texto]})
    return salida


def _normalizar_historial_gemini(
    historial: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    Gemini exige que el historial alterne user/model y no empiece por model.
    Une mensajes consecutivos del mismo rol en uno solo.
    """
    hist = [dict(x) for x in historial]
    if not hist:
        return []
    while hist and hist[0].get("role") != "user":
        hist = hist[1:]
    if not hist:
        return []
    compacto: list[dict[str, Any]] = []
    for turno in hist:
        rol = turno.get("role")
        partes = turno.get("parts") or []
        texto = (partes[0] if partes else "").strip()
        if not texto:
            continue
        if not compacto:
            compacto.append({"role": rol, "parts": [texto]})
            continue
        anterior = compacto[-1]
        if anterior.get("role") == rol:
            anterior["parts"][0] = f"{anterior['parts'][0]}\n\n{texto}"
        else:
            compacto.append({"role": rol, "parts": [texto]})
    # Tras compactar, el último no puede ser user sin respuesta pendiente: el nuevo mensaje lo envía send_message
    if compacto and compacto[-1].get("role") == "user":
        compacto = compacto[:-1]
    return compacto


def _extraer_texto_gemini(respuesta: Any) -> str:
    """Evita 502 cuando .text lanza (bloqueos, candidatos vacíos)."""
    try:
        t = getattr(respuesta, "text", None)
        if t is not None and str(t).strip():
            return str(t).strip()
    except (ValueError, AttributeError):
        pass
    fragmentos: list[str] = []
    candidatos = getattr(respuesta, "candidates", None) or []
    for cand in candidatos:
        contenido = getattr(cand, "content", None)
        if contenido is None:
            continue
        for parte in getattr(contenido, "parts", []) or []:
            tx = getattr(parte, "text", None)
            if tx:
                fragmentos.append(tx)
    return "\n".join(fragmentos).strip()


def _prompt_respaldo_plano(
    historial_previo: list[dict[str, Any]], mensaje_usuario: str
) -> str:
    """Si falla start_chat, un solo generate_content con la conversación en texto."""
    bloques = [_INSTRUCCION_SISTEMA, "", "Conversación:", ""]
    for turno in historial_previo:
        rol = turno.get("role")
        partes = turno.get("parts") or [""]
        etiqueta = "Usuario" if rol == "user" else "Asistente"
        bloques.append(f"{etiqueta}: {partes[0]}")
    bloques.extend(["", f"Usuario: {mensaje_usuario}", "", "Responde como Asistente:"])
    return "\n".join(bloques)


def _llamar_modelo(
    genai: Any,
    api_key: str,
    nombre_modelo: str,
    historial_previo: list[dict[str, Any]],
    mensaje_usuario: str,
) -> tuple[str, str]:
    """
    Devuelve (texto_respuesta, modelo_usado).
    Prueba chat multi-turno; si falla o viene vacío, un solo generate_content; repite con otros IDs de modelo.
    """
    genai.configure(api_key=api_key)
    copia_hist = [dict(h) for h in historial_previo]
    historial_ok = _normalizar_historial_gemini(copia_hist)

    candidatos_modelo = _candidatos_modelo(nombre_modelo)

    ultimo_error: Exception | None = None
    for nm in candidatos_modelo:
        try:
            modelo = genai.GenerativeModel(
                model_name=nm,
                system_instruction=_INSTRUCCION_SISTEMA,
            )
            chat = modelo.start_chat(history=historial_ok)
            respuesta = chat.send_message(mensaje_usuario)
            texto = _extraer_texto_gemini(respuesta)
            if texto:
                return texto, nm
        except Exception as exc:  # noqa: BLE001
            ultimo_error = exc
            logger.warning("Gemini chat falló (%s): %s", nm, exc)

        try:
            plano = _prompt_respaldo_plano(historial_previo, mensaje_usuario)
            modelo_plano = genai.GenerativeModel(model_name=nm)
            respuesta2 = modelo_plano.generate_content(plano)
            texto2 = _extraer_texto_gemini(respuesta2)
            if texto2:
                return texto2, nm
        except Exception as exc:  # noqa: BLE001
            ultimo_error = exc
            logger.warning("Gemini generate_content falló (%s): %s", nm, exc)

    raise ultimo_error or RuntimeError("No se pudo obtener respuesta de Gemini.")


@csrf_exempt
@require_POST
def procesar_mensaje(request: HttpRequest) -> JsonResponse:
    api_key = (os.environ.get("GEMINI_API_KEY") or "").strip()
    if not api_key:
        return JsonResponse(
            {
                "exito": False,
                "respuesta": None,
                "mensaje": (
                    "Falta configurar la API de Gemini: abra el archivo .env en la carpeta "
                    "service_chatbot, asigne GEMINI_API_KEY= (clave desde Google AI Studio) "
                    "y reinicie el servidor en el puerto 8005. Plantilla: .env.example."
                ),
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

    historial_previo = _historial_a_gemini(historial_crudo or [])
    nombre_modelo = (os.environ.get("GEMINI_MODEL") or _DEFAULT_GEMINI_MODEL).strip()

    try:
        import google.generativeai as genai

        texto, modelo_usado = _llamar_modelo(
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
        msg = (
            "No fue posible obtener respuesta del asistente. Compruebe la clave API, "
            "GEMINI_MODEL (p. ej. gemini-2.5-flash), cuota de la API y que el servicio chatbot "
            "tenga acceso a internet."
        )
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
