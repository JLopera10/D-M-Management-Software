import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Proyecto, ItemCotizacion, FinanzasProyecto, Empleado, Tarea, ImagenProyecto

@csrf_exempt
@require_http_methods(["GET", "POST"])
def gestionar_proyectos(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # 1. Crear el Proyecto Base
            proyecto = Proyecto.objects.create(
                nombre=data.get('nombre_proyecto', 'Sin Nombre'),
                categoria=data.get('categoria', 'General'),
                medidas=data.get('medidas', ''),
                fecha_cotizacion=data.get('fecha', '')
            )
            
            desglose = data.get('desglose', {})
            
            # 2. Guardar Materiales
            for mat in desglose.get('materiales', []):
                ItemCotizacion.objects.create(
                    proyecto=proyecto,
                    tipo='MATERIAL',
                    descripcion=mat['descripcion'],
                    cantidad=mat['cantidad'],
                    unidad=mat['unidad'],
                    valor_unitario=mat['valor_unitario'],
                    valor_total=mat['valor_total']
                )
            
            # 3. Guardar Mano de Obra
            for mo in desglose.get('mano_de_obra', []):
                ItemCotizacion.objects.create(
                    proyecto=proyecto,
                    tipo='MANO_OBRA',
                    descripcion=mo['descripcion'],
                    cantidad=mo['cantidad'],
                    unidad=mo['unidad'],
                    valor_unitario=mo['valor_unitario'],
                    valor_total=mo['valor_total']
                )
                
            # 4. Guardar Finanzas
            finanzas = data.get('finanzas', {})
            FinanzasProyecto.objects.create(
                proyecto=proyecto,
                subtotal=finanzas.get('subtotal', 0),
                utilidad_factor=finanzas.get('utilidad_factor', ''),
                utilidad_valor=finanzas.get('utilidad_valor', 0),
                total=finanzas.get('total', 0)
            )
            
            return JsonResponse({
                "exito": True, 
                "mensaje": "Proyecto creado exitosamente en la base de datos.", 
                "proyecto_id": proyecto.id
            })
            
        except Exception as e:
            return JsonResponse({"exito": False, "mensaje": str(e)}, status=400)
            
    elif request.method == 'GET':
        proyectos = list(Proyecto.objects.values('id', 'nombre', 'categoria', 'estado', 'fecha_creacion'))
        return JsonResponse({"exito": True, "proyectos": proyectos})
    
@csrf_exempt
@require_http_methods(["GET", "POST"])
def gestionar_empleados(request):
    if request.method == 'GET':
        # Lista todos los empleados
        empleados = list(Empleado.objects.values(
            'id', 'nombre_completo', 'cedula', 'telefono', 'cargo', 'disponible'
        ).order_by('nombre_completo'))
        return JsonResponse({"exito": True, "empleados": empleados})
        
    elif request.method == 'POST':
        # Crea un nuevo empleado
        try:
            data = json.loads(request.body)
            nuevo_empleado = Empleado.objects.create(
                nombre_completo=data.get('nombre_completo', '').strip(),
                cedula=data.get('cedula', '').strip(),
                telefono=data.get('telefono', '').strip(),
                cargo=data.get('cargo', 'Operario').strip()
            )
            return JsonResponse({
                "exito": True, 
                "mensaje": "Empleado registrado exitosamente.",
                "empleado_id": nuevo_empleado.id
            })
        except Exception as e:
            return JsonResponse({"exito": False, "mensaje": str(e)}, status=400)
        
@csrf_exempt
@require_http_methods(["GET", "POST"])
def gestionar_tareas(request):
    if request.method == 'GET':
        proyecto_id = request.GET.get('proyecto_id')
        tareas_qs = Tarea.objects.all().select_related('proyecto', 'empleado_principal', 'ayudante')
        
        if proyecto_id:
            tareas_qs = tareas_qs.filter(proyecto_id=proyecto_id)
            
        tareas = []
        for t in tareas_qs:
            tareas.append({
                'id': t.id,
                'nombre_tarea': t.nombre_tarea,
                'proyecto_id': t.proyecto.id,
                'proyecto_nombre': t.proyecto.nombre,
                'empleado_principal': t.empleado_principal.nombre_completo if t.empleado_principal else "Sin asignar",
                'ayudante': t.ayudante.nombre_completo if t.ayudante else "Ninguno",
                'fecha_inicio': t.fecha_inicio,
                'fecha_fin': t.fecha_fin,
                'estado': t.estado
            })
            
        return JsonResponse({"exito": True, "tareas": tareas})
        
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            nueva_tarea = Tarea.objects.create(
                proyecto_id=data['proyecto_id'],
                nombre_tarea=data['nombre_tarea'],
                empleado_principal_id=data['empleado_principal_id'],
                ayudante_id=data.get('ayudante_id') or None,
                fecha_inicio=data['fecha_inicio'],
                fecha_fin=data['fecha_fin']
            )
            return JsonResponse({
                "exito": True, 
                "mensaje": "Tarea asignada exitosamente.",
                "tarea_id": nueva_tarea.id
            })
        except Exception as e:
            return JsonResponse({"exito": False, "mensaje": str(e)}, status=400)
        
@csrf_exempt
@require_http_methods(["PATCH"])
def toggle_tarea(request, tarea_id):
    try:
        tarea = Tarea.objects.get(id=tarea_id)
        data = json.loads(request.body)
        nuevo_estado = data.get("estado")
        
        if nuevo_estado in ['Pendiente', 'En Progreso', 'Completada']:
            tarea.estado = nuevo_estado
            tarea.save()
            return JsonResponse({"exito": True, "estado": tarea.estado})
        return JsonResponse({"exito": False, "mensaje": "Estado inválido"}, status=400)
    except Tarea.DoesNotExist:
        return JsonResponse({"exito": False, "mensaje": "Tarea no encontrada"}, status=404)
    
@csrf_exempt
@require_http_methods(["GET", "PATCH"])
def detalle_proyecto(request, proyecto_id):
    try:
        proyecto = Proyecto.objects.get(id=proyecto_id)
    except Proyecto.DoesNotExist:
        return JsonResponse({"exito": False, "mensaje": "Proyecto no encontrado"}, status=404)

    if request.method == "GET":
        finanzas = proyecto.finanzas
        items = proyecto.items.all()
        tareas = proyecto.tareas.all()
        imagenes = proyecto.imagenes.all()

        data = {
            "id": proyecto.id,
            "nombre": proyecto.nombre,
            "categoria": proyecto.categoria,
            "medidas": proyecto.medidas,
            "fecha": proyecto.fecha_cotizacion,
            "ubicacion": proyecto.ubicacion or "",
            "descripcion": proyecto.descripcion or "",
            "imagenes": [{"id": img.id, "url": img.url} for img in imagenes],
            "finanzas": {
                "subtotal": finanzas.subtotal,
                "utilidad_factor": finanzas.utilidad_factor,
                "utilidad_valor": finanzas.utilidad_valor,
                "total": finanzas.total
            },
            "materiales": list(items.filter(tipo='MATERIAL').values('descripcion', 'cantidad', 'unidad', 'valor_unitario', 'valor_total')),
            "mano_obra": list(items.filter(tipo='MANO_OBRA').values('descripcion', 'cantidad', 'unidad', 'valor_unitario', 'valor_total')),
            "tareas": list(tareas.values('id', 'nombre_tarea', 'estado'))
        }
        return JsonResponse({"exito": True, "proyecto": data})

    elif request.method == "PATCH":
        try:
            data = json.loads(request.body)
            
            if 'ubicacion' in data:
                proyecto.ubicacion = data['ubicacion']
            if 'descripcion' in data:
                proyecto.descripcion = data['descripcion']
            proyecto.save()

            if 'nueva_imagen' in data and data['nueva_imagen'].strip():
                ImagenProyecto.objects.create(proyecto=proyecto, url=data['nueva_imagen'].strip())

            return JsonResponse({"exito": True, "mensaje": "Proyecto actualizado correctamente"})
        except Exception as e:
            return JsonResponse({"exito": False, "mensaje": str(e)}, status=400)