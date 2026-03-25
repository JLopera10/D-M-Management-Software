from django.core.management.base import BaseCommand

from catalogo.models import Project


class Command(BaseCommand):
    help = "Crea o actualiza proyectos de demostración en el portafolio (US-01 / US-02)."

    def handle(self, *args, **options):
        ejemplos = [
            {
                "titulo": "Cubierta industrial zona norte",
                "descripcion": (
                    "Cubierta industrial de gran formato con estructura metálica reforzada "
                    "y acabados anticorrosivos para nave logística."
                ),
                "ubicacion": "Bogotá, Colombia",
                "url_imagen": "https://images.unsplash.com/photo-1503387762-592deb58ef4e",
                "categoria": "Cubierta metálica",
            },
            {
                "titulo": "Cerramiento comercial plaza centro",
                "descripcion": (
                    "Cerramiento perimetral combinando estructura metálica con paneles "
                    "y accesos controlados para centro comercial."
                ),
                "ubicacion": "Medellín, Colombia",
                "url_imagen": "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
                "categoria": "Cerramiento",
            },
            {
                "titulo": "Estructura metálica edificio corporativo",
                "descripcion": (
                    "Estructura metálica para edificio de oficinas de varios pisos, "
                    "incluyendo escaleras y cubiertas técnicas."
                ),
                "ubicacion": "Cali, Colombia",
                "url_imagen": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
                "categoria": "Estructura para edificación",
            },
        ]

        nuevos = 0
        for entrada in ejemplos:
            _, creado = Project.objects.update_or_create(
                titulo=entrada["titulo"],
                defaults={
                    "descripcion": entrada["descripcion"],
                    "ubicacion": entrada["ubicacion"],
                    "url_imagen": entrada["url_imagen"],
                    "categoria": entrada["categoria"],
                },
            )
            if creado:
                nuevos += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Listo: {nuevos} proyecto(s) nuevos; "
                f"total en catálogo: {Project.objects.count()} (categorías actualizadas)."
            )
        )
