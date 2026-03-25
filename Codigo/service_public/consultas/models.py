from django.db import models


class SolicitudContactoChat(models.Model):
    """
    US-06: solicitud del cliente tras confirmar datos recopilados en el chatbot.
    """

    nombre = models.CharField("nombre", max_length=200)
    email = models.EmailField("correo electrónico", max_length=254)
    telefono = models.CharField("teléfono", max_length=40, blank=True, default="")
    resumen_confirmado = models.TextField(
        "resumen confirmado por el cliente",
        help_text="Texto que el cliente revisó antes de enviar.",
    )
    historial_chat = models.JSONField(
        "historial del chat (opcional)",
        default=list,
        blank=True,
        help_text="Lista de turnos {rol, contenido} para contexto interno.",
    )
    creado_en = models.DateTimeField("fecha de registro", auto_now_add=True)

    class Meta:
        verbose_name = "solicitud de contacto (chatbot)"
        verbose_name_plural = "solicitudes de contacto (chatbot)"
        ordering = ["-creado_en"]

    def __str__(self) -> str:
        return f"{self.nombre} <{self.email}> — {self.creado_en:%Y-%m-%d %H:%M}"
