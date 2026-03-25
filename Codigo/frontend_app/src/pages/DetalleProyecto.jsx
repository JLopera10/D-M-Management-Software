import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { endpoints } from "../api/config";

export default function DetalleProyecto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proyecto, setProyecto] = useState(null);
  const [cargando, setCargando] = useState(true);
  
  // --- ESTADOS PARA EDICIÓN ---
  const [editando, setEditando] = useState(false);
  const [formEditar, setFormEditar] = useState({ ubicacion: "", descripcion: "", nueva_imagen: "" });

  const fetchDetalle = async () => {
    try {
      const res = await fetch(endpoints.projectDetail(id));
      const data = await res.json();
      if (data.exito) {
        setProyecto(data.proyecto);
        setFormEditar({ 
          ubicacion: data.proyecto.ubicacion, 
          descripcion: data.proyecto.descripcion, 
          nueva_imagen: "" 
        });
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchDetalle();
  }, [id]);

  // --- FUNCIÓN PARA GUARDAR EDICIÓN ---
  const guardarEdicion = async () => {
    try {
      const res = await fetch(endpoints.projectDetail(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formEditar)
      });
      const data = await res.json();
      if (data.exito) {
        setEditando(false);
        fetchDetalle();
      } else {
        alert("Error al guardar: " + data.mensaje);
      }
    } catch (err) {
      alert("Error de conexión");
    }
  };

  // --- FUNCIÓN PARA ENVIAR AL MICROSERVICIO PÚBLICO ---
  const publicarEnPortafolio = async () => {
    if (!proyecto.descripcion || !proyecto.ubicacion || proyecto.imagenes.length === 0) {
      alert("Debes agregar una descripción, ubicación y al menos una imagen antes de poder publicarlo en la web.");
      return;
    }

    try {
      const payload = {
        titulo: proyecto.nombre,
        descripcion: proyecto.descripcion,
        ubicacion: proyecto.ubicacion,
        categoria: proyecto.categoria,
        url_imagen: proyecto.imagenes[0].url
      };

      const res = await fetch(endpoints.publishProject, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.exito) {
        alert("¡Éxito! " + data.mensaje);
      } else {
        alert("Error al publicar: " + data.mensaje);
      }
    } catch (err) {
      alert("Error de red intentando contactar al servicio público.");
    }
  };

  if (cargando) return <div style={{ padding: "40px" }}>Cargando información del proyecto...</div>;
  if (!proyecto) return <div style={{ padding: "40px", color: "red" }}>Proyecto no encontrado.</div>;

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "20px", padding: "8px 16px", cursor: "pointer" }}>
        ← Volver
      </button>

      {/* HEADER Y EDICIÓN DE MARKETING */}
      <div style={{ background: "#2c3e50", color: "white", padding: "20px", borderRadius: "8px", marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: "0 0 10px 0" }}>{proyecto.nombre}</h1>
          <p style={{ margin: 0, opacity: 0.8 }}><strong>Categoría:</strong> {proyecto.categoria} | <strong>Fecha:</strong> {proyecto.fecha}</p>
          <p style={{ margin: "5px 0 0 0", opacity: 0.8 }}><strong>Medidas:</strong> {proyecto.medidas}</p>
          
          <div style={{ marginTop: "20px", padding: "15px", background: "rgba(255,255,255,0.1)", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Datos Públicos (Portafolio)</h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setEditando(!editando)} style={{ padding: "5px 10px", cursor: "pointer" }}>
                  {editando ? "Cancelar" : "Editar Datos"}
                </button>
                {!editando && (
                  <button 
                    onClick={publicarEnPortafolio} 
                    style={{ padding: "5px 15px", background: "#ffc107", color: "#000", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                  >
                    Publicar en Portafolio Web
                  </button>
                )}
              </div>
            </div>
            
            {editando ? (
              <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <input 
                  placeholder="Ubicación (Ej: Envigado, Antioquia)" 
                  value={formEditar.ubicacion} 
                  onChange={e => setFormEditar({...formEditar, ubicacion: e.target.value})}
                  style={{ padding: "8px" }}
                />
                <textarea 
                  placeholder="Descripción pública del proyecto..." 
                  value={formEditar.descripcion} 
                  onChange={e => setFormEditar({...formEditar, descripcion: e.target.value})}
                  style={{ padding: "8px", minHeight: "60px" }}
                />
                <input 
                  placeholder="URL de nueva imagen (https://...)" 
                  value={formEditar.nueva_imagen} 
                  onChange={e => setFormEditar({...formEditar, nueva_imagen: e.target.value})}
                  style={{ padding: "8px" }}
                />
                <button onClick={guardarEdicion} style={{ padding: "10px", background: "#28a745", color: "white", border: "none", cursor: "pointer", fontWeight: "bold" }}>
                  Guardar Cambios
                </button>
              </div>
            ) : (
              <div style={{ marginTop: "15px" }}>
                <p><strong>Ubicación:</strong> {proyecto.ubicacion || "No especificada"}</p>
                <p><strong>Descripción:</strong> {proyecto.descripcion || "No especificada"}</p>
                <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
                  {proyecto.imagenes.map((img) => (
                     <img key={img.id} src={img.url} alt="Proyecto" style={{ width: "150px", height: "100px", objectFit: "cover", borderRadius: "4px", border: "2px solid white" }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
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