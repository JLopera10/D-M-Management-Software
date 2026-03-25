import { useEffect, useRef, useState } from "react";
import { endpoints } from "../api/config";
import "../styles/chat-pagina.css";

function idMensaje() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Texto inicial del cuadro de confirmación (US-06) a partir del hilo. */
function borradorResumenDesdeChat(mensajes) {
  const lineas = mensajes
    .filter((m) => !m.esError)
    .map((m) => {
      const etiqueta = m.rol === "usuario" ? "Cliente" : "Asistente";
      return `${etiqueta}: ${m.contenido}`;
    });
  if (lineas.length === 0) {
    return "";
  }
  return `Resumen de la conversación (revise y edite si lo desea):\n\n${lineas.join("\n\n")}`;
}

function historialParaRegistro(mensajes) {
  return mensajes
    .filter(
      (m) =>
        !m.esError && (m.rol === "usuario" || m.rol === "asistente")
    )
    .map(({ rol, contenido }) => ({ rol, contenido }));
}

/**
 * US-04: vista de chat a pantalla completa.
 * US-05: orientación de recopilación vía prompt en backend.
 * US-06: confirmar y enviar solicitud de contacto.
 */
export default function ChatAsistente() {
  const [mensajes, setMensajes] = useState([]);
  const [entrada, setEntrada] = useState("");
  const [enviando, setEnviando] = useState(false);
  const listaRef = useRef(null);

  const [modalUs06Abierto, setModalUs06Abierto] = useState(false);
  const [nombreCliente, setNombreCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [resumenConfirmado, setResumenConfirmado] = useState("");
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
  const [feedbackUs06, setFeedbackUs06] = useState(null);

  useEffect(() => {
    if (!listaRef.current) return;
    listaRef.current.scrollTop = listaRef.current.scrollHeight;
  }, [mensajes, enviando]);

  function nuevaConversacion() {
    setMensajes([]);
    setEntrada("");
    setModalUs06Abierto(false);
    setFeedbackUs06(null);
  }

  function abrirModalUs06() {
    setResumenConfirmado(borradorResumenDesdeChat(mensajes));
    setFeedbackUs06(null);
    setModalUs06Abierto(true);
  }

  function cerrarModalUs06() {
    setModalUs06Abierto(false);
    setEnviandoSolicitud(false);
  }

  async function enviarSolicitudUs06(e) {
    e.preventDefault();
    setFeedbackUs06(null);
    setEnviandoSolicitud(true);
    try {
      const respuesta = await fetch(endpoints.consultaChatbotRegistro, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombreCliente.trim(),
          email: emailCliente.trim(),
          telefono: telefonoCliente.trim(),
          resumen_confirmado: resumenConfirmado.trim(),
          historial_chat: historialParaRegistro(mensajes),
        }),
      });
      const datos = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok || !datos.exito) {
        setFeedbackUs06({
          tipo: "error",
          texto:
            datos.mensaje ||
            `No se pudo registrar la solicitud (${respuesta.status}).`,
        });
        return;
      }
      setFeedbackUs06({ tipo: "ok", texto: datos.mensaje || "Registro exitoso." });
      setNombreCliente("");
      setEmailCliente("");
      setTelefonoCliente("");
      setResumenConfirmado("");
    } catch {
      setFeedbackUs06({
        tipo: "error",
        texto:
          "Sin conexión con el servidor. Inicie Django (service_public) en el puerto 8003 e intente de nuevo.",
      });
    } finally {
      setEnviandoSolicitud(false);
    }
  }

  async function enviar(e) {
    e.preventDefault();
    const texto = entrada.trim();
    if (!texto || enviando) return;

    const historialParaApi = mensajes.map(({ rol, contenido }) => ({
      rol,
      contenido,
    }));

    setEntrada("");
    setMensajes((prev) => [
      ...prev,
      { id: idMensaje(), rol: "usuario", contenido: texto },
    ]);
    setEnviando(true);

    try {
      const respuesta = await fetch(endpoints.chat, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje: texto,
          historial: historialParaApi,
        }),
      });

      const datos = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok || !datos.exito) {
        const detalle =
          datos.mensaje ||
          `Error al contactar al asistente (${respuesta.status}).`;
        setMensajes((prev) => [
          ...prev,
          {
            id: idMensaje(),
            rol: "asistente",
            contenido: detalle,
            esError: true,
          },
        ]);
        return;
      }

      setMensajes((prev) => [
        ...prev,
        {
          id: idMensaje(),
          rol: "asistente",
          contenido: datos.respuesta || "Sin contenido en la respuesta.",
        },
      ]);
    } catch {
      setMensajes((prev) => [
        ...prev,
        {
          id: idMensaje(),
          rol: "asistente",
          contenido:
            "Error de red. No se pudo conectar con el servicio de Chatbot.",
          esError: true,
        },
      ]);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="chat-pagina">
      <aside className="chat-pagina-rail" aria-label="Acciones del asistente">
        <button
          type="button"
          className="chat-pagina-nuevo"
          onClick={nuevaConversacion}
        >
          <span className="chat-pagina-nuevo-icono" aria-hidden="true">
            +
          </span>
          Nuevo chat
        </button>
        <button
          type="button"
          className="chat-pagina-rail-enviar"
          onClick={abrirModalUs06}
        >
          Confirmar y enviar
        </button>
        <div className="chat-pagina-rail-us05">
          <h2 className="chat-pagina-rail-us05-titulo">Datos que recopilamos</h2>
          <p className="chat-pagina-rail-us05-desc">
            US-05: el asistente le irá preguntando con calma para perfilar su proyecto.
          </p>
          <ul className="chat-pagina-rail-us05-lista">
            <li>Metros cuadrados (aprox.)</li>
            <li>Ubicación (ciudad o zona)</li>
            <li>Presupuesto referencial (opcional)</li>
            <li>Indicaciones generales (plazos, uso, restricciones)</li>
          </ul>
        </div>
        <p className="chat-pagina-rail-hint">
          US-06: use «Confirmar y enviar» para que D&amp;M lo contacte.
        </p>
      </aside>

      <div className="chat-pagina-principal">
        <header className="chat-pagina-cabecera">
          <h1 className="chat-pagina-titulo">Asistente</h1>
          <p className="chat-pagina-modelo">
            Solo temas de D&amp;M Industrias Metálicas, obras y cotizaciones de construcción
            estructural/metálica · sin precios cerrados en línea
          </p>
        </header>

        <div
          className="chat-pagina-hilo"
          ref={listaRef}
          role="log"
          aria-live="polite"
        >
          {mensajes.length === 0 && (
            <div className="chat-pagina-bienvenida">
              <h2 className="chat-pagina-bienvenida-titulo">
                ¿En qué podemos ayudarle?
              </h2>
              <p className="chat-pagina-bienvenida-texto">
                Describa su necesidad (cubierta, cerramiento, estructura, etc.). El
                asistente le hará preguntas orientadas para conocer superficie en m²,
                ubicación, presupuesto aproximado si lo desea compartir, y otras
                indicaciones del proyecto. Cuando esté listo, pulse{" "}
                <strong>Confirmar y enviar</strong> en el panel izquierdo, revise el
                resumen y deje sus datos para que el equipo comercial de D&amp;M lo
                contacte.
              </p>
            </div>
          )}

          {mensajes.map((m) => (
            <div
              key={m.id}
              className={
                m.rol === "usuario"
                  ? "chat-turno chat-turno--usuario"
                  : "chat-turno chat-turno--asistente"
              }
            >
              <div className="chat-turno-meta">
                {m.rol === "usuario" ? "Usted" : "Asistente"}
              </div>
              <div
                className={
                  m.esError
                    ? "chat-turno-cuerpo chat-turno-cuerpo--error"
                    : "chat-turno-cuerpo"
                }
              >
                {m.contenido}
              </div>
            </div>
          ))}

          {enviando && (
            <div className="chat-turno chat-turno--asistente chat-turno--cargando">
              <div className="chat-turno-meta">Asistente</div>
              <div className="chat-turno-cuerpo chat-turno-cuerpo--pensando">
                <span className="chat-puntos" aria-hidden="true" />
                Generando respuesta…
              </div>
            </div>
          )}
        </div>

        <footer className="chat-pagina-pie">
          <form className="chat-pagina-form" onSubmit={enviar}>
            <div className="chat-pagina-caja-entrada">
              <label className="chat-pagina-sr" htmlFor="chat-input-principal">
                Mensaje para el asistente
              </label>
              <textarea
                id="chat-input-principal"
                className="chat-pagina-textarea"
                rows={1}
                placeholder="Escriba su mensaje…"
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    enviar(e);
                  }
                }}
                disabled={enviando}
              />
              <button
                type="submit"
                className="chat-pagina-enviar"
                disabled={enviando || !entrada.trim()}
                aria-label="Enviar mensaje"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
            <p className="chat-pagina-aviso">
              El asistente puede cometer errores. Verifique la información crítica con D&amp;M
              Industrias Metálicas.
            </p>
          </form>
        </footer>
      </div>

      {modalUs06Abierto ? (
        <div
          className="chat-us06-capas"
          role="presentation"
          onClick={(ev) => {
            if (ev.target === ev.currentTarget) cerrarModalUs06();
          }}
        >
          <div
            className="chat-us06-dialogo"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-us06-titulo"
          >
            <div className="chat-us06-cabecera">
              <h2 id="chat-us06-titulo" className="chat-us06-titulo">
                Confirmar y enviar
              </h2>
              <button
                type="button"
                className="chat-us06-cerrar"
                onClick={cerrarModalUs06}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <p className="chat-us06-intro">
              Revise el resumen de su consulta y sus datos de contacto. La empresa usará
              esta información para comunicarse con usted.
            </p>
            <form className="chat-us06-form" onSubmit={enviarSolicitudUs06}>
              <label className="chat-us06-etiqueta" htmlFor="us06-nombre">
                Nombre completo <span className="chat-us06-req">*</span>
              </label>
              <input
                id="us06-nombre"
                className="chat-us06-input"
                type="text"
                autoComplete="name"
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
                disabled={enviandoSolicitud}
                required
                minLength={2}
                maxLength={200}
              />
              <label className="chat-us06-etiqueta" htmlFor="us06-email">
                Correo electrónico <span className="chat-us06-req">*</span>
              </label>
              <input
                id="us06-email"
                className="chat-us06-input"
                type="email"
                autoComplete="email"
                value={emailCliente}
                onChange={(e) => setEmailCliente(e.target.value)}
                disabled={enviandoSolicitud}
                required
              />
              <label className="chat-us06-etiqueta" htmlFor="us06-tel">
                Teléfono (opcional)
              </label>
              <input
                id="us06-tel"
                className="chat-us06-input"
                type="tel"
                autoComplete="tel"
                value={telefonoCliente}
                onChange={(e) => setTelefonoCliente(e.target.value)}
                disabled={enviandoSolicitud}
                maxLength={40}
              />
              <label className="chat-us06-etiqueta" htmlFor="us06-resumen">
                Resumen confirmado <span className="chat-us06-req">*</span>
              </label>
              <textarea
                id="us06-resumen"
                className="chat-us06-textarea"
                rows={8}
                value={resumenConfirmado}
                onChange={(e) => setResumenConfirmado(e.target.value)}
                disabled={enviandoSolicitud}
                required
                minLength={20}
                maxLength={12000}
                placeholder="Edite el texto generado a partir del chat o escriba su propio resumen."
              />
              {feedbackUs06 ? (
                <p
                  className={
                    feedbackUs06.tipo === "ok"
                      ? "chat-us06-feedback chat-us06-feedback--ok"
                      : "chat-us06-feedback chat-us06-feedback--error"
                  }
                  role="status"
                >
                  {feedbackUs06.texto}
                </p>
              ) : null}
              <div className="chat-us06-acciones">
                <button
                  type="button"
                  className="chat-us06-btn-secundario"
                  onClick={cerrarModalUs06}
                  disabled={enviandoSolicitud}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="chat-us06-btn-primario"
                  disabled={enviandoSolicitud}
                >
                  {enviandoSolicitud ? "Enviando…" : "Enviar solicitud"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
