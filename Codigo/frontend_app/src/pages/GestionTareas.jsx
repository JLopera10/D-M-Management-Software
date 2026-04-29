import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../api/config";
import "../styles/tareas.css";

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

  const tareasCompletadas = tareas.filter((t) => t.estado === "Completada").length;
  const tareasPendientes = tareas.length - tareasCompletadas;

  return (
    <div className="tareas-page">
      <header className="tareas-hero">
        <div className="tareas-hero-inner">
          <h1>Gestión de Tareas y Cuadrillas</h1>
          <p className="tareas-subtitulo">
            Asigna tareas, controla estados y revisa el avance de tus proyectos sin cambiar la lógica existente.
          </p>

          <div className="tareas-resumen">
            <div className="resumen-card">
              <span className="resumen-numero">{tareas.length}</span>
              <span className="resumen-texto">Tareas totales</span>
            </div>
            <div className="resumen-card">
              <span className="resumen-numero">{tareasPendientes}</span>
              <span className="resumen-texto">Pendientes</span>
            </div>
            <div className="resumen-card">
              <span className="resumen-numero">{tareasCompletadas}</span>
              <span className="resumen-texto">Completadas</span>
            </div>
          </div>
        </div>
      </header>

      <main className="tareas-main">
        <section className="tareas-card tareas-form-card">
          <div className="section-head">
            <h2>Asignar Nueva Tarea</h2>
            <p>Completa la información para vincular la tarea a un proyecto y a una cuadrilla.</p>
          </div>

          <form onSubmit={asignarTarea} className="tareas-form">
            <div className="campo">
              <label>Proyecto</label>
              <select required name="proyecto_id" value={formulario.proyecto_id} onChange={manejarCambio}>
                <option value="">-- Seleccionar Proyecto --</option>
                {proyectos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>

            <div className="campo">
              <label>Tarea</label>
              <input required name="nombre_tarea" placeholder="Ej: Soldadura de marcos" value={formulario.nombre_tarea} onChange={manejarCambio} />
            </div>

            <div className="campo">
              <label>Trabajador principal</label>
              <select required name="empleado_principal_id" value={formulario.empleado_principal_id} onChange={manejarCambio}>
                <option value="">-- Trabajador Principal --</option>
                {empleados.map((e) => <option key={e.id} value={e.id}>{e.nombre_completo} ({e.cargo})</option>)}
              </select>
            </div>

            <div className="campo">
              <label>Ayudante</label>
              <select name="ayudante_id" value={formulario.ayudante_id} onChange={manejarCambio}>
                <option value="">-- Ayudante (Opcional) --</option>
                {empleados.map((e) => <option key={e.id} value={e.id}>{e.nombre_completo} ({e.cargo})</option>)}
              </select>
            </div>

            <div className="campo">
              <label>Fecha inicio</label>
              <input required type="date" name="fecha_inicio" value={formulario.fecha_inicio} onChange={manejarCambio} />
            </div>

            <div className="campo">
              <label>Fecha fin estimada</label>
              <input required type="date" name="fecha_fin" value={formulario.fecha_fin} onChange={manejarCambio} />
            </div>

            <button type="submit" disabled={cargando} className="btn btn-primary btn-full">
              {cargando ? "Asignando..." : "Asignar Tarea"}
            </button>
          </form>
        </section>

        <section className="tareas-card tareas-lista-card">
          <div className="section-head section-head-row">
            <div>
              <h2>Tareas Activas</h2>
              <p>Estado y avance actual de las tareas registradas.</p>
            </div>
          </div>

          <div className="tabla-wrapper">
            <table className="tareas-table">
              <thead>
                <tr>
                  <th>Proyecto</th>
                  <th>Tarea</th>
                  <th>Principal</th>
                  <th>Ayudante</th>
                  <th>Plazo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tareas.map((t) => (
                  <tr key={t.id}>
                    <td className="cell-strong">{t.proyecto_nombre}</td>
                    <td>{t.nombre_tarea}</td>
                    <td>{t.empleado_principal}</td>
                    <td>{t.ayudante || "-"}</td>
                    <td className="cell-muted">{t.fecha_inicio} al {t.fecha_fin}</td>
                    <td>
                      <label className="estado-switch">
                        <input
                          type="checkbox"
                          checked={t.estado === 'Completada'}
                          onChange={() => alternarEstadoTarea(t.id, t.estado)}
                        />
                        <span className={t.estado === 'Completada' ? 'estado-badge estado-completada' : 'estado-badge estado-pendiente'}>
                          {t.estado}
                        </span>
                      </label>
                    </td>
                    <td>
                      <button
                        onClick={() => navigate(`/admin/proyectos/${t.proyecto_id}`)}
                        className="btn btn-secondary btn-sm"
                      >
                        Ver proyecto
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}