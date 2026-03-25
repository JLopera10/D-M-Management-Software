"""Lógica compartida del asistente Gemini (US-04) para servicios Django D&M."""

from dm_asistente_core.constants import (
    DEFAULT_GEMINI_MODEL,
    GEMINI_MODELOS_RESPALDO,
    INSTRUCCION_SISTEMA,
    MAX_HISTORIAL_MENSAJES,
    candidatos_modelo,
)
from dm_asistente_core.gemini_service import (
    extraer_texto_gemini,
    historial_a_gemini,
    llamar_modelo,
    normalizar_historial_gemini,
    prompt_respaldo_plano,
)

__all__ = [
    "DEFAULT_GEMINI_MODEL",
    "GEMINI_MODELOS_RESPALDO",
    "INSTRUCCION_SISTEMA",
    "MAX_HISTORIAL_MENSAJES",
    "candidatos_modelo",
    "extraer_texto_gemini",
    "historial_a_gemini",
    "llamar_modelo",
    "normalizar_historial_gemini",
    "prompt_respaldo_plano",
]
