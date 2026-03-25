from django.db import models

class Cotizacion(models.Model):
    ESTADOS = (
        ('PENDIENTE', 'Pendiente'),
        ('PROCESO', 'En Proceso'),
        ('FINALIZADO', 'Finalizado'),
    )
    
    cliente = models.CharField(max_length=200)
    email = models.EmailField()
    telefono = models.CharField(max_length=20)
    tipo_obra = models.CharField(max_length=150, verbose_name="Tipo de Obra")
    medidas = models.CharField(max_length=100)
    ubicacion = models.CharField(max_length=100)
    presupuesto_estimado = models.CharField(max_length=100)
    resumen_chatbot = models.TextField(blank=True, null=True)
    fecha_recibido = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='PENDIENTE')
    
    # Campo para el Excel de ingeniería (US-08)
    archivo_excel = models.FileField(
        upload_to='cotizaciones/excels/', 
        null=True, 
        blank=True,
        verbose_name="Formato de Cotización (Excel)"
    )

    class Meta:
        verbose_name_plural = "Cotizaciones"

    def __str__(self):
        return f"{self.cliente} - {self.tipo_obra}"