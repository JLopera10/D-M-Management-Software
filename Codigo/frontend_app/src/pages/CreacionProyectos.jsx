import { useState, useRef } from "react";
import { endpoints } from "../api/config";
import "../styles/paneles.css";

export default function CrearProyecto() {
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [datosExtraidos, setDatosExtraidos] = useState(null);
  const [error, setError] = useState("");
  const dropRef = useRef(null);

  const validarArchivo = (file) => {
    if (!file.name.endsWith(".xlsx")) {
      setError("Por favor, suba un archivo Excel válido (.xlsx)");
      return false;
    }
    setError("");
    return true;
  };

  const limpiarVista = () => {
    setArchivo(null);
    setDatosExtraidos(null);
    setError("");
  };

  const manejarCambioArchivo = (e) => {
    const file = e.target.files[0];
    if (file && validarArchivo(file)) {
      setArchivo(file);
      setDatosExtraidos(null);
    }
  };

  const manejarDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && validarArchivo(file)) {
      setArchivo(file);
      setDatosExtraidos(null);
    }
    dropRef.current?.classList.remove("drag-over");
  };

  const manejarDragOver = (e) => {
    e.preventDefault();
    dropRef.current?.classList.add("drag-over");
  };

  const manejarDragLeave = (e) => {
    e.preventDefault();
    dropRef.current?.classList.remove("drag-over");
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
        limpiarVista();
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
    <div className="virtualizacion-container">
      <section className="virtualizacion-hero">
        <div className="virtualizacion-hero-contenido">
          <h1>Virtualizar Cotización</h1>
          <p className="virtualizacion-subtitulo">
            Sube un archivo Excel, extrae los datos y crea el proyecto sin tocar el backend.
          </p>
        </div>
      </section>

      <section className="virtualizacion-seccion">
        {!datosExtraidos ? (
          <div className="virtualizacion-contenido">
            <div
              ref={dropRef}
              className="virtualizacion-drop-zone"
              onDragOver={manejarDragOver}
              onDragLeave={manejarDragLeave}
              onDrop={manejarDrop}
            >
              <div className="virtualizacion-drop-icon">⬆</div>
              <h2>Arrastra el archivo aquí</h2>
              <p>o selecciónalo desde tu equipo</p>

              <input
                id="archivo-input"
                type="file"
                accept=".xlsx"
                onChange={manejarCambioArchivo}
                disabled={cargando}
                className="virtualizacion-input-archivo"
              />
              <label htmlFor="archivo-input" className="virtualizacion-label-archivo">
                Seleccionar archivo
              </label>

              {archivo && (
                <div className="virtualizacion-archivo-seleccionado" style={{ marginTop: "20px" }}>
                  <div className="virtualizacion-archivo-info">
                    <div>
                      <p className="virtualizacion-archivo-nombre">{archivo.name}</p>
                      <p className="virtualizacion-archivo-tamaño">
                        {(archivo.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="virtualizacion-acciones" style={{ marginTop: "18px" }}>
                <button
                  onClick={virtualizarCotizacion}
                  disabled={!archivo || cargando}
                  className="virtualizacion-btn btn-primario"
                >
                  {cargando ? "Procesando..." : "Extraer Datos"}
                </button>
              </div>
            </div>

            {error && (
              <div className="virtualizacion-alerta alerta-error" role="alert">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="virtualizacion-contenido">
            <div className="virtualizacion-exito-header">
              <div className="virtualizacion-icono-exito">✓</div>
              <h2>Datos extraídos correctamente</h2>
              <p>Revisa la información antes de crear el proyecto</p>
            </div>

            <div className="virtualizacion-tarjeta-principal">
              <div className="virtualizacion-header-tarjeta">
                <h3>{datosExtraidos.nombre_proyecto}</h3>
              </div>

              <div className="virtualizacion-grid-info">
                <div className="virtualizacion-info-item">
                  <label>Categoría</label>
                  <p>{datosExtraidos.categoria}</p>
                </div>
                <div className="virtualizacion-info-item">
                  <label>Medidas</label>
                  <p>{datosExtraidos.medidas || "No especificado"}</p>
                </div>
                <div className="virtualizacion-info-item">
                  <label>Fecha</label>
                  <p>{datosExtraidos.fecha || "No especificado"}</p>
                </div>
                <div className="virtualizacion-info-item destacado">
                  <label>Total</label>
                  <p className="precio-total">
                    ${datosExtraidos.finanzas.total.toLocaleString("es-CO", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="virtualizacion-estadisticas">
              <div className="stat-card">
                <div className="stat-number">{datosExtraidos.desglose.materiales.length}</div>
                <div className="stat-label">Materiales</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{datosExtraidos.desglose.mano_de_obra.length}</div>
                <div className="stat-label">Mano de obra</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">${datosExtraidos.finanzas.subtotal.toLocaleString("es-CO")}</div>
                <div className="stat-label">Subtotal</div>
              </div>
            </div>

            <div className="virtualizacion-detalles">
              <div className="virtualizacion-seccion-detalles">
                <h4>Materiales</h4>
                <div className="virtualizacion-lista">
                  {datosExtraidos.desglose.materiales.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="virtualizacion-item-lista">
                      <div className="item-desc">{item.descripcion}</div>
                      <div className="item-valor">${item.valor_total.toLocaleString("es-CO")}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="virtualizacion-seccion-detalles">
                <h4>Mano de Obra</h4>
                <div className="virtualizacion-lista">
                  {datosExtraidos.desglose.mano_de_obra.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="virtualizacion-item-lista">
                      <div className="item-desc">{item.descripcion}</div>
                      <div className="item-valor">${item.valor_total.toLocaleString("es-CO")}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="virtualizacion-acciones-finales">
              <button onClick={limpiarVista} className="virtualizacion-btn btn-secundario">
                Cargar otro archivo
              </button>
              <button
                onClick={confirmarYCrearProyecto}
                disabled={cargando}
                className="virtualizacion-btn btn-primario"
              >
                {cargando ? "Guardando..." : "Confirmar y crear proyecto"}
              </button>
            </div>

            {error && (
              <div className="virtualizacion-alerta alerta-error" role="alert">
                {error}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}