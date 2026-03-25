"""
Integración con Google Gemini: historial, llamadas al modelo y extracción de texto.
Sin dependencias de Django.
"""

from __future__ import annotations

import logging
from typing import Any

from dm_asistente_core.constants import (
    INSTRUCCION_SISTEMA,
    MAX_HISTORIAL_MENSAJES,
    candidatos_modelo,
)

logger = logging.getLogger(__name__)


def historial_a_gemini(entradas: list[dict[str, Any]]) -> list[dict[str, Any]]:
    salida: list[dict[str, Any]] = []
    for item in entradas[-MAX_HISTORIAL_MENSAJES:]:
        rol = (item.get("rol") or "").strip().lower()
        texto = (item.get("contenido") or "").strip()
        if not texto:
            continue
        if rol in ("usuario", "user"):
            salida.append({"role": "user", "parts": [texto]})
        elif rol in ("asistente", "assistant", "model"):
            salida.append({"role": "model", "parts": [texto]})
    return salida


def normalizar_historial_gemini(
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
    if compacto and compacto[-1].get("role") == "user":
        compacto = compacto[:-1]
    return compacto


def extraer_texto_gemini(respuesta: Any) -> str:
    """Evita fallos cuando .text lanza (bloqueos, candidatos vacíos)."""
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


def prompt_respaldo_plano(
    historial_previo: list[dict[str, Any]], mensaje_usuario: str
) -> str:
    """Si falla start_chat, un solo generate_content con la conversación en texto."""
    bloques = [INSTRUCCION_SISTEMA, "", "Conversación:", ""]
    for turno in historial_previo:
        rol = turno.get("role")
        partes = turno.get("parts") or [""]
        etiqueta = "Usuario" if rol == "user" else "Asistente"
        bloques.append(f"{etiqueta}: {partes[0]}")
    bloques.extend(["", f"Usuario: {mensaje_usuario}", "", "Responde como Asistente:"])
    return "\n".join(bloques)


def llamar_modelo(
    genai: Any,
    api_key: str,
    nombre_modelo: str,
    historial_previo: list[dict[str, Any]],
    mensaje_usuario: str,
) -> tuple[str, str]:
    """
    Devuelve (texto_respuesta, modelo_usado).
    Prueba chat multi-turno; si falla o viene vacío, generate_content plano; repite por lista de modelos.
    """
    genai.configure(api_key=api_key)
    copia_hist = [dict(h) for h in historial_previo]
    historial_ok = normalizar_historial_gemini(copia_hist)

    nombres = candidatos_modelo(nombre_modelo)

    ultimo_error: Exception | None = None
    for nm in nombres:
        try:
            modelo = genai.GenerativeModel(
                model_name=nm,
                system_instruction=INSTRUCCION_SISTEMA,
            )
            chat = modelo.start_chat(history=historial_ok)
            respuesta = chat.send_message(mensaje_usuario)
            texto = extraer_texto_gemini(respuesta)
            if texto:
                return texto, nm
        except Exception as exc:  # noqa: BLE001
            ultimo_error = exc
            logger.warning("Gemini chat falló (%s): %s", nm, exc)

        try:
            plano = prompt_respaldo_plano(historial_previo, mensaje_usuario)
            modelo_plano = genai.GenerativeModel(model_name=nm)
            respuesta2 = modelo_plano.generate_content(plano)
            texto2 = extraer_texto_gemini(respuesta2)
            if texto2:
                return texto2, nm
        except Exception as exc:  # noqa: BLE001
            ultimo_error = exc
            logger.warning("Gemini generate_content falló (%s): %s", nm, exc)

    raise ultimo_error or RuntimeError("No se pudo obtener respuesta de Gemini.")
