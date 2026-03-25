import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../api/config";

export default function GestionTareas() {
  const [proyectos, setProyectos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const navigate = useNavigate();
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(false);

  const [formulario, setFormulario] = useState({
    proyecto_id: "",
    nombre_tarea: "",
    empleado_principal_id: "",
    ayudante_id: "",
    fecha_inicio: "",
    fecha_fin: ""
  });

  useEffect(() => {
    cargarDatosBase();
    cargarTareas();
  }, []);

  const cargarDatosBase = async () => {
    try {
      const [resProyectos, resEmpleados] = await Promise.all([
        fetch(endpoints.projects),
        fetch(endpoints.employees)
      ]);
      const dataProyectos = await resProyectos.json();
      const dataEmpleados = await resEmpleados.json();
      
      if (dataProyectos.exito) setProyectos(dataProyectos.proyectos);
      if (dataEmpleados.exito) setEmpleados(dataEmpleados.empleados);
    } catch (err) {
      console.error("Error cargando datos:", err);
    }
  };

  const cargarTareas = async () => {
    try {
      const res = await fetch(endpoints.tasks);
      const data = await res.json();
      if (data.exito) setTareas(data.tareas);
    } catch (err) {
      console.error("Error cargando tareas:", err);
    }
  };

  const manejarCambio = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const asignarTarea = async (e) => {
    e.preventDefault();
    setCargando(true);
    
    try {
      const res = await fetch(endpoints.tasks, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formulario)
      });
      const data = await res.json();

      if (res.ok && data.exito) {
        alert("Tarea asignada correctamente");
        setFormulario({ ...formulario, nombre_tarea: "", fecha_inicio: "", fecha_fin: "" });
        cargarTareas();
      } else {
        alert("Error: " + data.mensaje);
      }
    } catch (err) {
      alert("Error de red.");
    } finally {
      setCargando(false);
    }
  };

  const alternarEstadoTarea = async (tarea_id, estado_actual) => {
    const nuevo_estado = estado_actual === 'Completada' ? 'Pendiente' : 'Completada';
    
    setTareas(tareas.map(t => t.id === tarea_id ? { ...t, estado: nuevo_estado } : t));

    try {
      await fetch(endpoints.taskToggle(tarea_id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevo_estado })
      });
    } catch (err) {
      console.error("Error al actualizar tarea:", err);
      cargarTareas();
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1>Gestión de Tareas y Cuadrillas</h1>
      
      <div style={{ background: "#eef2f5", padding: "20px", borderRadius: "8px", marginBottom: "30px" }}>
        <h2>Asignar Nueva Tarea</h2>
        <form onSubmit={asignarTarea} style={{ display: "grid", gap: "15px", gridTemplateColumns: "1fr 1fr" }}>
          
          <select required name="proyecto_id" value={formulario.proyecto_id} onChange={manejarCambio} style={{ padding: "8px" }}>
            <option value="">-- Seleccionar Proyecto --</option>
            {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>

          <input required name="nombre_tarea" placeholder="Ej: Soldadura de marcos" value={formulario.nombre_tarea} onChange={manejarCambio} style={{ padding: "8px" }} />

          <select required name="empleado_principal_id" value={formulario.empleado_principal_id} onChange={manejarCambio} style={{ padding: "8px" }}>
            <option value="">-- Trabajador Principal --</option>
            {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre_completo} ({e.cargo})</option>)}
          </select>

          <select name="ayudante_id" value={formulario.ayudante_id} onChange={manejarCambio} style={{ padding: "8px" }}>
            <option value="">-- Ayudante (Opcional) --</option>
            {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre_completo} ({e.cargo})</option>)}
          </select>

          <div>
            <label style={{ display: "block", fontSize: "0.8em" }}>Fecha Inicio</label>
            <input required type="date" name="fecha_inicio" value={formulario.fecha_inicio} onChange={manejarCambio} style={{ width: "100%", padding: "8px", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8em" }}>Fecha Fin Estimada</label>
            <input required type="date" name="fecha_fin" value={formulario.fecha_fin} onChange={manejarCambio} style={{ width: "100%", padding: "8px", boxSizing: "border-box" }} />
          </div>

          <button type="submit" disabled={cargando} style={{ gridColumn: "span 2", padding: "12px", background: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
            {cargando ? "Asignando..." : "Asignar Tarea"}
          </button>
        </form>
      </div>

      <h2>Tareas Activas</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <thead style={{ background: "#343a40", color: "white" }}>
          <tr>
            <th style={{ padding: "12px" }}>Proyecto</th>
            <th>Tarea</th>
            <th>Principal</th>
            <th>Ayudante</th>
            <th>Plazo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tareas.map(t => (
            <tr key={t.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "12px", fontWeight: "bold" }}>{t.proyecto_nombre}</td>
              <td>{t.nombre_tarea}</td>
              <td>{t.empleado_principal}</td>
              <td>{t.ayudante}</td>
              <td style={{ fontSize: "0.9em" }}>{t.fecha_inicio} al {t.fecha_fin}</td>
              <td>
                <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                  <input 
                    type="checkbox" 
                    checked={t.estado === 'Completada'} 
                    onChange={() => alternarEstadoTarea(t.id, t.estado)}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span style={{ 
                    padding: "4px 8px", borderRadius: "12px", fontSize: "0.8em", 
                    background: t.estado === 'Completada' ? '#d4edda' : '#fff3cd',
                    color: t.estado === 'Completada' ? '#155724' : '#856404',
                    textDecoration: t.estado === 'Completada' ? 'line-through' : 'none'
                  }}>
                    {t.estado}
                  </span>
                </label>
              </td>
              <td>
                <button 
                  onClick={() => navigate(`/admin/proyectos/${t.proyecto_id}`)} 
                  style={{ padding: "6px 12px", background: "#17a2b8", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8em" }}
                >
                  Ver Proyecto
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}