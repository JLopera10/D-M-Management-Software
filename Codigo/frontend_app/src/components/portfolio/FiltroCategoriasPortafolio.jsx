import { useEffect, useId, useMemo, useState } from "react";
import { endpoints } from "../../api/config";

function CeldaCategoria({ nombre, marcada, alAlternar }) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={
        marcada
          ? "filtro-categoria-celda filtro-categoria-celda--activa"
          : "filtro-categoria-celda"
      }
    >
      <input
        id={id}
        type="checkbox"
        className="filtro-categoria-checkbox"
        checked={marcada}
        onChange={alAlternar}
      />
      <span className="filtro-categoria-texto">{nombre}</span>
    </label>
  );
}

/**
 * Normaliza texto para búsqueda insensible a mayúsculas y acentos comunes.
 * @param {string} texto
 */
function normalizarBusqueda(texto) {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/**
 * US-02: selector de varias categorías en recuadro multicolumna + búsqueda que filtra opciones.
 * @param {{ seleccionadas: string[], alCambiarSeleccion: (nueva: string[]) => void }} props
 */
export default function FiltroCategoriasPortafolio({
  seleccionadas,
  alCambiarSeleccion,
}) {
  const [categoriasApi, setCategoriasApi] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;

    async function cargarCategorias() {
      setCargando(true);
      setError(null);
      try {
        const respuesta = await fetch(endpoints.projectCategories);
        if (!respuesta.ok) {
          throw new Error(`Error HTTP ${respuesta.status}`);
        }
        const datos = await respuesta.json();
        if (!datos.exito) {
          throw new Error(datos.mensaje || "No se pudieron cargar las categorías");
        }
        if (!cancelado) {
          setCategoriasApi(Array.isArray(datos.categorias) ? datos.categorias : []);
        }
      } catch (e) {
        if (!cancelado) {
          setError(
            e instanceof Error ? e.message : "Error al cargar categorías."
          );
          setCategoriasApi([]);
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargarCategorias();
    return () => {
      cancelado = true;
    };
  }, []);

  const termino = normalizarBusqueda(busqueda);

  const categoriasVisibles = useMemo(() => {
    if (!termino) return categoriasApi;
    return categoriasApi.filter((nombre) =>
      normalizarBusqueda(nombre).includes(termino)
    );
  }, [categoriasApi, termino]);

  function alternarCategoria(nombre) {
    const conjunto = new Set(seleccionadas);
    if (conjunto.has(nombre)) {
      conjunto.delete(nombre);
    } else {
      conjunto.add(nombre);
    }
    alCambiarSeleccion([...conjunto].sort((a, b) =>
      a.localeCompare(b, "es", { sensitivity: "base" })
    ));
  }

  function limpiarSeleccion() {
    alCambiarSeleccion([]);
    setBusqueda("");
  }

  return (
    <div
      id="filtro-categorias-portafolio"
      className="filtro-categorias-portafolio"
    >
      <fieldset className="filtro-categorias-fieldset">
        <legend className="filtro-categorias-leyenda">
          Filtrar por tipo de obra
        </legend>

        <p className="filtro-categorias-ayuda">
          Escribe para acotar la lista. Puedes marcar varias categorías; se muestran
          proyectos que coincidan con <strong>cualquiera</strong> de ellas.
        </p>

        <label className="filtro-categorias-busqueda-label" htmlFor="busqueda-categoria">
          Buscar categoría
        </label>
        <input
          id="busqueda-categoria"
          type="search"
          className="filtro-categorias-busqueda"
          placeholder="Ej.: cubierta, cerramiento…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          autoComplete="off"
          spellCheck="false"
        />

        {cargando && (
          <p className="filtro-categorias-estado">Cargando categorías…</p>
        )}
        {error && (
          <p className="filtro-categorias-error" role="alert">
            {error}
          </p>
        )}

        {!cargando && !error && categoriasApi.length === 0 && (
          <p className="filtro-categorias-vacio">
            No hay categorías registradas aún.
          </p>
        )}

        {!cargando && !error && categoriasApi.length > 0 && (
          <>
            <div
              className="filtro-categorias-recuadro"
              role="group"
              aria-label="Categorías disponibles"
            >
              {categoriasVisibles.length === 0 ? (
                <p className="filtro-categorias-sin-coincidencias">
                  Ninguna categoría coincide con «{busqueda.trim()}». Prueba otro
                  término o borra el filtro de búsqueda.
                </p>
              ) : (
                categoriasVisibles.map((nombre) => (
                  <CeldaCategoria
                    key={nombre}
                    nombre={nombre}
                    marcada={seleccionadas.includes(nombre)}
                    alAlternar={() => alternarCategoria(nombre)}
                  />
                ))
              )}
            </div>

            <div className="filtro-categorias-acciones">
              <button
                type="button"
                className="filtro-categorias-btn-secundario"
                onClick={limpiarSeleccion}
              >
                Ver todo (quitar filtros)
              </button>
              <span className="filtro-categorias-resumen" aria-live="polite">
                {seleccionadas.length === 0
                  ? "Sin filtro de categoría en el portafolio."
                  : `${seleccionadas.length} categoría${seleccionadas.length === 1 ? "" : "s"} seleccionada${seleccionadas.length === 1 ? "" : "s"}.`}
              </span>
            </div>
          </>
        )}
      </fieldset>
    </div>
  );
}
