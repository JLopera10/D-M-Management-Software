"""
US-06: registro de solicitud de contacto tras confirmación en el chatbot.
"""

from __future__ import annotations

import json
import re
from typing import Any

from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .models import SolicitudContactoChat

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _normalizar_historial(valor: Any) -> list[dict[str, str]]:
    if not isinstance(valor, list):
        return []
    salida: list[dict[str, str]] = []
    for item in valor[:80]:
        if not isinstance(item, dict):
            continue
        rol = str(item.get("rol") or "").strip()[:32]
        contenido = str(item.get("contenido") or "").strip()[:8000]
        if not contenido:
            continue
        if rol not in ("usuario", "asistente"):
            continue
        salida.append({"rol": rol, "contenido": contenido})
    return salida


@csrf_exempt
@require_POST
def registrar_solicitud_chatbot(request: HttpRequest) -> JsonResponse:
    try:
        cuerpo = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse(
            {
                "exito": False,
                "mensaje": "Cuerpo JSON inválido.",
            },
            status=400,
            json_dumps_params={"ensure_ascii": False},
        )

    nombre = (cuerpo.get("nombre") or "").strip()
    email = (cuerpo.get("email") or "").strip()
    telefono = (cuerpo.get("telefono") or "").strip()[:40]
    resumen = (cuerpo.get("resumen_confirmado") or "").strip()
    historial = _normalizar_historial(cuerpo.get("historial_chat"))

    if len(nombre) < 2:
        return JsonResponse(
            {
                "exito": False,
                "mensaje": "Indique su nombre (mínimo 2 caracteres).",
            },
            status=400,
            json_dumps_params={"ensure_ascii": False},
        )
    if not email or not _EMAIL_RE.match(email):
        return JsonResponse(
            {
                "exito": False,
                "mensaje": "Indique un correo electrónico válido.",
            },
            status=400,
            json_dumps_params={"ensure_ascii": False},
        )
    if len(resumen) < 20:
        return JsonResponse(
            {
                "exito": False,
                "mensaje": "El resumen confirmado debe tener al menos 20 caracteres.",
            },
            status=400,
            json_dumps_params={"ensure_ascii": False},
        )
    if len(resumen) > 12000:
        return JsonResponse(
            {
                "exito": False,
                "mensaje": "El resumen es demasiado largo.",
            },
            status=400,
            json_dumps_params={"ensure_ascii": False},
        )

    solicitud = SolicitudContactoChat.objects.create(
        nombre=nombre,
        email=email,
        telefono=telefono,
        resumen_confirmado=resumen,
        historial_chat=historial,
    )

    return JsonResponse(
        {
            "exito": True,
            "mensaje": (
                "Hemos registrado su solicitud. El equipo de D&M Industrias Metálicas "
                "se pondrá en contacto con usted usando los datos indicados."
            ),
            "id": solicitud.id,
        },
        status=201,
        json_dumps_params={"ensure_ascii": False},
    )
