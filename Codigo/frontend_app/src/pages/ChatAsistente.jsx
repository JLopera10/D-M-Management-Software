import { useEffect, useRef, useState } from "react";
import { endpoints } from "../api/config";
import "../styles/chat-pagina.css";

function idMensaje() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * US-04: vista de chat a pantalla completa (estilo asistente tipo Gemini/Claude).
 */
export default function ChatAsistente() {
  const [mensajes, setMensajes] = useState([]);
  const [entrada, setEntrada] = useState("");
  const [enviando, setEnviando] = useState(false);
  const listaRef = useRef(null);

  useEffect(() => {
    if (!listaRef.current) return;
    listaRef.current.scrollTop = listaRef.current.scrollHeight;
  }, [mensajes, enviando]);

  function nuevaConversacion() {
    setMensajes([]);
    setEntrada("");
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
            "No hay conexión con el API del asistente. Inicie Django (service_public) en el puerto 8003 y recargue.",
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
        <p className="chat-pagina-rail-hint">
          D&amp;M · asistente de proyectos metálicos
        </p>
      </aside>

      <div className="chat-pagina-principal">
        <header className="chat-pagina-cabecera">
          <h1 className="chat-pagina-titulo">Asistente</h1>
          <p className="chat-pagina-modelo">
            Orientación sobre obras y estructuras · sin cotización automática
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
                Describa su necesidad (cubierta, cerramiento, estructura, etc.).
                El asistente hará preguntas de aclaración; para una cotización
                formal derivaremos a su equipo comercial.
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
    </div>
  );
}
