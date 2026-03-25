from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_GET

from .models import Project


def _serializar_proyecto(proyecto: Project) -> dict:
    return {
        "id": proyecto.id,
        "titulo": proyecto.titulo,
        "descripcion": proyecto.descripcion,
        "ubicacion": proyecto.ubicacion,
        "url_imagen": proyecto.url_imagen,
        "categoria": proyecto.categoria,
    }


@require_GET
def listar_proyectos(solicitud: HttpRequest) -> JsonResponse:
    """
    Lista proyectos del portafolio. US-02: filtro opcional por una o varias categorías
    (query repetida ?categoria=X&categoria=Y → proyectos en cualquiera de ellas).
    """
    categorias_solicitadas = [
        c.strip()
        for c in solicitud.GET.getlist("categoria")
        if c and c.strip()
    ]
    consulta = Project.objects.all()
    if categorias_solicitadas:
        consulta = consulta.filter(categoria__in=categorias_solicitadas)

    proyectos = list(consulta)
    carga = {
        "exito": True,
        "mensaje": "Portafolio obtenido correctamente.",
        "proyectos": [_serializar_proyecto(p) for p in proyectos],
        "total": len(proyectos),
        "filtro_categorias": categorias_solicitadas,
    }
    return JsonResponse(carga, json_dumps_params={"ensure_ascii": False})


@require_GET
def listar_categorias(_solicitud: HttpRequest) -> JsonResponse:
    """Devuelve categorías distintas existentes en proyectos (para el selector US-02)."""
    valores = (
        Project.objects.exclude(categoria__exact="")
        .values_list("categoria", flat=True)
        .distinct()
    )
    ordenadas = sorted(set(valores), key=lambda x: x.casefold())
    return JsonResponse(
        {
            "exito": True,
            "mensaje": "Categorías obtenidas correctamente.",
            "categorias": ordenadas,
            "total": len(ordenadas),
        },
        json_dumps_params={"ensure_ascii": False},
    )


@require_GET
def detalle_proyecto(_solicitud: HttpRequest, proyecto_id: int) -> JsonResponse:
    """Detalle de un proyecto por identificador (extensión útil para US-01 / detalle)."""
    try:
        proyecto = Project.objects.get(pk=proyecto_id)
    except Project.DoesNotExist:
        return JsonResponse(
            {
                "exito": False,
                "mensaje": "No se encontró el proyecto solicitado.",
            },
            status=404,
            json_dumps_params={"ensure_ascii": False},
        )
    return JsonResponse(
        {
            "exito": True,
            "mensaje": "Proyecto encontrado.",
            "proyecto": _serializar_proyecto(proyecto),
        },
        json_dumps_params={"ensure_ascii": False},
    )
