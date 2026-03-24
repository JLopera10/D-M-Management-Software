import { useEffect, useState } from "react";
import ProjectCard from "./ProjectCard";
import FiltroCategoriasPortafolio from "./FiltroCategoriasPortafolio";
import { construirUrlProyectos } from "../../api/config";
import "../../styles/portfolio.css";

export default function Portfolio() {
  const [proyectos, setProyectos] = useState([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;

    async function cargarPortafolio() {
      setCargando(true);
      setError(null);
      try {
        const url = construirUrlProyectos(categoriasSeleccionadas);
        const respuesta = await fetch(url);
        if (!respuesta.ok) {
          throw new Error(`Error HTTP ${respuesta.status}`);
        }
        const datos = await respuesta.json();
        if (!datos.exito) {
          throw new Error(datos.mensaje || "Respuesta no exitosa del servidor");
        }
        if (!cancelado) {
          setProyectos(Array.isArray(datos.proyectos) ? datos.proyectos : []);
        }
      } catch (e) {
        if (!cancelado) {
          setError(
            e instanceof Error
              ? e.message
              : "No se pudo cargar el portafolio. Intenta más tarde."
          );
          setProyectos([]);
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    cargarPortafolio();
    return () => {
      cancelado = true;
    };
  }, [categoriasSeleccionadas]);

  const total = proyectos.length;
  const hayFiltro = categoriasSeleccionadas.length > 0;

  return (
    <section className="portfolio" aria-labelledby="titulo-portafolio">
      <h2 id="titulo-portafolio">Nuestro portafolio</h2>
      <p className="subtitle">
        {cargando
          ? "Cargando proyectos…"
          : error
            ? "No fue posible mostrar el catálogo."
            : `${total} proyecto${total === 1 ? "" : "s"} disponible${total === 1 ? "" : "s"}${hayFiltro ? " con el filtro actual" : ""}`}
      </p>

      <FiltroCategoriasPortafolio
        seleccionadas={categoriasSeleccionadas}
        alCambiarSeleccion={setCategoriasSeleccionadas}
      />

      {error && (
        <p className="portfolio-error" role="alert">
          {error}
        </p>
      )}

      {!cargando && !error && total === 0 && (
        <p className="portfolio-vacio">
          {hayFiltro
            ? "No hay proyectos que coincidan con las categorías seleccionadas. Prueba otras categorías o usa «Ver todo»."
            : "Aún no hay proyectos publicados."}
        </p>
      )}

      {!cargando && !error && total > 0 && (
        <div className="grid">
          {proyectos.map((proyecto) => (
            <ProjectCard key={proyecto.id} proyecto={proyecto} />
          ))}
        </div>
      )}
    </section>
  );
}
