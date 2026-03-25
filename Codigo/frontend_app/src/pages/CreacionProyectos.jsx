import { useState } from "react";
import { endpoints } from "../api/config";
import "../styles/portfolio.css";

export default function CrearProyecto() {
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [datosExtraidos, setDatosExtraidos] = useState(null);
  const [error, setError] = useState("");

  // Manejar la selección del archivo
  const manejarCambioArchivo = (e) => {
    const file = e.target.files[0];
    if (file && !file.name.endsWith(".xlsx")) {
      setError("Por favor, suba un archivo Excel válido (.xlsx)");
      setArchivo(null);
      return;
    }
    setError("");
    setArchivo(file);
    setDatosExtraidos(null); // Resetear datos si se elige un archivo nuevo
  };

  // Enviar el archivo al backend (service_documents)
  const virtualizarCotizacion = async () => {
    if (!archivo) return;
    
    setCargando(true);
    setError("");

    const formData = new FormData();
    formData.append("quote_file", archivo);

    try {
      const respuesta = await fetch(endpoints.documents, {
        method: "POST",
        // Importante: No establecer el Content-Type manualmente con FormData. 
        // El navegador lo configura automáticamente con el "boundary" correcto.
        body: formData, 
      });

      const data = await respuesta.json();

      if (respuesta.ok && data.exito) {
        setDatosExtraidos(data.datos);
      } else {
        setError(data.mensaje || "Error al procesar el archivo.");
      }
    } catch (err) {
      setError("Error de red al conectar con el servicio de documentos.");
    } finally {
      setCargando(false);
    }
  };

  const confirmarYCrearProyecto = async () => {
    setCargando(true);
    setError("");

    try {
      // endpoints.projects points to http://localhost:8000/api/core/projects/
      const respuesta = await fetch(endpoints.projects, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosExtraidos),
      });

      const data = await respuesta.json();

      if (respuesta.ok && data.exito) {
        alert("¡Proyecto guardado con éxito! ID: " + data.proyecto_id);
        setDatosExtraidos(null); // Limpiar la pantalla
        setArchivo(null);
      } else {
        setError(data.mensaje || "Error al guardar el proyecto en la base de datos.");
      }
    } catch (err) {
      setError("Error de red al conectar con Core Projects.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="portfolio-container" style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Virtualizar Cotización y Crear Proyecto</h1>
      <p>Suba el archivo de cotización (.xlsx) para extraer automáticamente los datos del proyecto.</p>

      {/* ZONA DE SUBIDA */}
      <div style={{ margin: "20px 0", padding: "20px", border: "2px dashed #ccc", borderRadius: "8px" }}>
        <input 
          type="file" 
          accept=".xlsx" 
          onChange={manejarCambioArchivo} 
          disabled={cargando}
        />
        <button 
          onClick={virtualizarCotizacion} 
          disabled={!archivo || cargando}
          style={{ marginLeft: "15px", padding: "8px 16px" }}
        >
          {cargando ? "Procesando..." : "Extraer Datos"}
        </button>
      </div>

      {error && <div style={{ color: "red", marginBottom: "20px" }}>{error}</div>}

      {/* ZONA DE REVISIÓN DE DATOS */}
      {datosExtraidos && (
        <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "8px", color: "#333" }}>
          <h2>Revisión del Proyecto</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
            <p><strong>Obra:</strong> {datosExtraidos.nombre_proyecto}</p>
            <p><strong>Categoría:</strong> {datosExtraidos.categoria}</p>
            <p><strong>Fecha:</strong> {datosExtraidos.fecha}</p>
            <p><strong>Total:</strong> ${datosExtraidos.finanzas.total.toLocaleString("es-CO")}</p>
          </div>

          <h3>Resumen de Ítems</h3>
          <p>Materiales encontrados: {datosExtraidos.desglose.materiales.length}</p>
          <p>Mano de obra encontrada: {datosExtraidos.desglose.mano_de_obra.length}</p>

          <button 
            onClick={confirmarYCrearProyecto}
            style={{ marginTop: "20px", padding: "10px 20px", background: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            Confirmar y Crear Proyecto
          </button>
        </div>
      )}
    </div>
  );
}