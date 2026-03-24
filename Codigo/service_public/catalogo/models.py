from django.db import models


class Project(models.Model):
    """
    Proyecto del portafolio (obras pasadas) expuesto al público.
    US-01: Visualización de Portafolio — documento maestro / wiki.
    """

    titulo = models.CharField("título", max_length=200)
    descripcion = models.TextField("descripción")
    ubicacion = models.CharField("ubicación", max_length=200)
    url_imagen = models.URLField(
        "URL de la imagen",
        max_length=500,
        help_text="Dirección pública de la foto representativa del proyecto.",
    )
    categoria = models.CharField(
        "categoría",
        max_length=120,
        db_index=True,
        blank=True,
        default="",
        help_text="Tipo de obra para filtrar el catálogo (US-02).",
    )
    fecha_creacion = models.DateTimeField("fecha de registro", auto_now_add=True)
    fecha_actualizacion = models.DateTimeField("última actualización", auto_now=True)

    class Meta:
        verbose_name = "proyecto"
        verbose_name_plural = "proyectos"
        ordering = ["-fecha_creacion", "titulo"]

    def __str__(self) -> str:
        return self.titulo
