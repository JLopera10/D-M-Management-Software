import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { endpoints } from "../api/config";

export default function DetalleProyecto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proyecto, setProyecto] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        const res = await fetch(endpoints.projectDetail(id));
        const data = await res.json();
        if (data.exito) {
          setProyecto(data.proyecto);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setCargando(false);
      }
    };
    fetchDetalle();
  }, [id]);

  if (cargando) return <div style={{ padding: "40px" }}>Cargando información del proyecto...</div>;
  if (!proyecto) return <div style={{ padding: "40px", color: "red" }}>Proyecto no encontrado.</div>;

  return (
    <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "20px", padding: "8px 16px", cursor: "pointer" }}>
        ← Volver
      </button>

      {/* HEADER */}
      <div style={{ background: "#2c3e50", color: "white", padding: "20px", borderRadius: "8px", marginBottom: "30px" }}>
        <h1 style={{ margin: "0 0 10px 0" }}>{proyecto.nombre}</h1>
        <p style={{ margin: 0, opacity: 0.8 }}><strong>Categoría:</strong> {proyecto.categoria} | <strong>Fecha:</strong> {proyecto.fecha}</p>
        <p style={{ margin: "5px 0 0 0", opacity: 0.8 }}><strong>Medidas:</strong> {proyecto.medidas}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px" }}>
        {/* TABLAS DE ITEMS */}
        <div>
          <h2>Materiales Requeridos</h2>
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", marginBottom: "30px" }}>
            <thead style={{ borderBottom: "2px solid #ccc" }}>
              <tr><th>Descripción</th><th>Cant.</th><th>Unidad</th></tr>
            </thead>
            <tbody>
              {proyecto.materiales.map((m, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px 0" }}>{m.descripcion}</td>
                  <td>{m.cantidad}</td>
                  <td>{m.unidad}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Mano de Obra</h2>
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
            <thead style={{ borderBottom: "2px solid #ccc" }}>
              <tr><th>Descripción</th><th>Cant.</th><th>Unidad</th></tr>
            </thead>
            <tbody>
              {proyecto.mano_obra.map((mo, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px 0" }}>{mo.descripcion}</td>
                  <td>{mo.cantidad}</td>
                  <td>{mo.unidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FINANZAS Y TAREAS (SIDEBAR) */}
        <div>
          <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", border: "1px solid #dee2e6", marginBottom: "20px" }}>
            <h2 style={{ marginTop: 0 }}>Resumen Financiero</h2>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ddd", paddingBottom: "10px", marginBottom: "10px" }}>
              <span>Subtotal:</span>
              <strong>${proyecto.finanzas.subtotal.toLocaleString("es-CO")}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ddd", paddingBottom: "10px", marginBottom: "10px" }}>
              <span>{proyecto.finanzas.utilidad_factor}:</span>
              <strong>${proyecto.finanzas.utilidad_valor.toLocaleString("es-CO")}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2em", color: "#28a745" }}>
              <span><strong>Total:</strong></span>
              <strong>${proyecto.finanzas.total.toLocaleString("es-CO")}</strong>
            </div>
          </div>

          <div style={{ background: "#e9ecef", padding: "20px", borderRadius: "8px" }}>
            <h2 style={{ marginTop: 0 }}>Tareas Asociadas</h2>
            {proyecto.tareas.length === 0 ? <p>No hay tareas asignadas aún.</p> : (
              <ul style={{ paddingLeft: "20px" }}>
                {proyecto.tareas.map(t => (
                  <li key={t.id} style={{ textDecoration: t.estado === 'Completada' ? 'line-through' : 'none', color: t.estado === 'Completada' ? '#6c757d' : '#000', marginBottom: "8px" }}>
                    {t.nombre_tarea}
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => navigate('/admin/tareas')} style={{ marginTop: "10px", width: "100%", padding: "10px", background: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
              Asignar más tareas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}