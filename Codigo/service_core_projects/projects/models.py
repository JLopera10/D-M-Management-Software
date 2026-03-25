from django.db import models

class Proyecto(models.Model):
    nombre = models.CharField(max_length=255)
    categoria = models.CharField(max_length=255)
    medidas = models.CharField(max_length=255, blank=True, null=True)
    fecha_cotizacion = models.CharField(max_length=100, blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    estado = models.CharField(max_length=50, default='Pendiente') 

    def __str__(self):
        return self.nombre

class ItemCotizacion(models.Model):
    TIPO_CHOICES = [
        ('MATERIAL', 'Material'),
        ('MANO_OBRA', 'Mano de Obra')
    ]
    proyecto = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='items')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    descripcion = models.CharField(max_length=255)
    cantidad = models.FloatField()
    unidad = models.CharField(max_length=50)
    valor_unitario = models.FloatField()
    valor_total = models.FloatField()

class FinanzasProyecto(models.Model):
    proyecto = models.OneToOneField(Proyecto, on_delete=models.CASCADE, related_name='finanzas')
    subtotal = models.FloatField()
    utilidad_factor = models.CharField(max_length=100, blank=True, null=True)
    utilidad_valor = models.FloatField()
    total = models.FloatField()
    
class Empleado(models.Model):
    nombre_completo = models.CharField(max_length=255)
    cedula = models.CharField(max_length=50, unique=True)
    telefono = models.CharField(max_length=50, blank=True, null=True)
    cargo = models.CharField(max_length=100, default='Operario')
    disponible = models.BooleanField(default=True)
    fecha_ingreso = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre_completo} - {self.cargo}"
    
class Tarea(models.Model):
    ESTADOS = [
        ('Pendiente', 'Pendiente'),
        ('En Progreso', 'En Progreso'),
        ('Completada', 'Completada')
    ]
    
    proyecto = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='tareas')
    empleado_principal = models.ForeignKey(Empleado, on_delete=models.SET_NULL, null=True, related_name='tareas_principales')
    ayudante = models.ForeignKey(Empleado, on_delete=models.SET_NULL, null=True, blank=True, related_name='tareas_ayudante')
    
    nombre_tarea = models.CharField(max_length=255)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    estado = models.CharField(max_length=50, choices=ESTADOS, default='Pendiente')
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre_tarea} - {self.proyecto.nombre}"