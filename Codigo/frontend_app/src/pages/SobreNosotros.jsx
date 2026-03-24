import "../styles/sobre-nosotros.css";

/** Referencia en Itagüí (Cra. 51 #56-37) — respaldo si no hay embed de Google. */
const MAPA_LAT = 6.1697;
const MAPA_LON = -75.6079;

const ENLACE_MAPS_APP = "https://maps.app.goo.gl/Dm9zMghe5pFT6jnn9";
const ENLACE_INFORMA_COLOMBIA =
  "https://www.informacolombia.com/directorio-empresas/informacion-empresa/dym-industrias-metalicas-sas";

/**
 * US-03: información corporativa alineada a datos de directorio público
 * (Informa Colombia) y ubicación en Google Maps.
 *
 * Mantenimiento (mapa): variable VITE_GOOGLE_MAPS_EMBED_URL en .env — ver .env.example.
 */
export default function SobreNosotros() {
  const urlMapaGoogle = import.meta.env.VITE_GOOGLE_MAPS_EMBED_URL?.trim();
  const bbox = `${MAPA_LON - 0.02},${MAPA_LAT - 0.015},${MAPA_LON + 0.02},${MAPA_LAT + 0.015}`;
  const urlMapaOsm = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${MAPA_LAT},${MAPA_LON}`;

  return (
    <div className="sobre-nosotros">
      <header className="sobre-hero">
        <h1>Sobre nosotros</h1>
        <p className="sobre-hero-subtitulo">
          <strong>D&amp;M Industrias Metálicas S.A.S.</strong> — fabricación de
          productos metálicos para uso estructural, con operación en el Área
          Metropolitana de Medellín.
        </p>
      </header>

      <section className="sobre-seccion" aria-labelledby="titulo-empresa">
        <h2 id="titulo-empresa">La empresa</h2>
        <p>
          Somos una sociedad por acciones simplificada (S.A.S.) dedicada al
          diseño, la fabricación y el suministro de soluciones en acero y
          metal para proyectos de construcción e infraestructura. Nuestro
          enfoque combina rigor técnico, trazabilidad en obra y cumplimiento de
          especificaciones, orientados a clientes industriales, comerciales e
          inmobiliarios en Antioquia y a nivel nacional.
        </p>
        <p>
          Trabajamos bajo estándares de calidad coherentes con la fabricación
          metalmecánica estructural: control de materiales, soldadura y
          montaje, coordinación logística y acompañamiento en puesta en
          servicio, con comunicación clara en cada fase del proyecto.
        </p>
      </section>

      <section className="sobre-seccion" aria-labelledby="titulo-trayectoria">
        <h2 id="titulo-trayectoria">Trayectoria y posicionamiento</h2>
        <p>
          La compañía se ha consolidado en el ecosistema metalmecánico
          antioqueño, participando en obras que demandan desempeño estructural,
          plazos definidos y continuidad operativa. Nuestra experiencia abarca
          desde componentes y conjuntos metálicos hasta integraciones en
          cubiertas, cerramientos y soportería para edificaciones y naves.
        </p>
        <p>
          Priorizamos relaciones de largo plazo con clientes y aliados,
          apoyados en capacidad instalada, procesos documentados y equipos
          comprometidos con la seguridad industrial y el respeto por el entorno
          urbano donde intervenimos.
        </p>
      </section>

      <section className="sobre-seccion" aria-labelledby="titulo-servicios">
        <h2 id="titulo-servicios">Líneas de actuación</h2>
        <p>
          Nuestra actividad económica principal, en términos del sector, es la{" "}
          <strong>fabricación de productos metálicos para uso estructural</strong>
          . A partir de ello ofrecemos, entre otros, los siguientes alcances:
        </p>
        <ul className="sobre-lista">
          <li>Estructuras y elementos metálicos para edificación e industrial</li>
          <li>Cubiertas y soluciones de cerramiento perimetral o técnico</li>
          <li>Fabricación a medida según planos y especificaciones del cliente</li>
          <li>Asesoría previa en viabilidad constructiva y materiales</li>
        </ul>
      </section>

      <section className="sobre-seccion" aria-labelledby="titulo-datos">
        <h2 id="titulo-datos">Datos registrales</h2>
        <dl className="sobre-contacto-grid sobre-datos-legales">
          <div>
            <dt>Razón social</dt>
            <dd>D&amp;M Industrias Metálicas S.A.S.</dd>
          </div>
          <div>
            <dt>NIT</dt>
            <dd>900.734.236-6</dd>
          </div>
          <div>
            <dt>Forma jurídica</dt>
            <dd>Sociedad por acciones simplificada (S.A.S.)</dd>
          </div>
          <div>
            <dt>Actividad principal</dt>
            <dd>Fabricación de productos metálicos para uso estructural</dd>
          </div>
        </dl>
        <p className="sobre-fuente">
          Datos de identificación y ubicación contrastados con información de
          directorio empresarial público (
          <a href={ENLACE_INFORMA_COLOMBIA} target="_blank" rel="noopener noreferrer">
            Informa Colombia
          </a>
          ). Cifras financieras o evolución histórica detallada deben
          confirmarse directamente con la empresa.
        </p>
      </section>

      <section className="sobre-seccion" aria-labelledby="titulo-contacto">
        <h2 id="titulo-contacto">Contacto y visitas</h2>
        <dl className="sobre-contacto-grid">
          <div>
            <dt>Dirección de correspondencia</dt>
            <dd>
              Carrera 51 #56-37
              <br />
              Itagüí, Antioquia — Colombia
            </dd>
          </div>
          <div>
            <dt>Teléfono</dt>
            <dd>
              <a href="tel:+573223081625">+57 322 308 1625</a>
            </dd>
          </div>
          <div>
            <dt>Cómo llegar</dt>
            <dd>
              <a href={ENLACE_MAPS_APP} target="_blank" rel="noopener noreferrer">
                Abrir ubicación en Google Maps
              </a>
            </dd>
          </div>
          <div>
            <dt>Horario de atención</dt>
            <dd>Lunes a viernes, 8:00 a. m. — 5:00 p. m. (hora Colombia)</dd>
          </div>
        </dl>
        <p className="sobre-nota-inferior">
          Para cotizaciones, especificaciones técnicas o visitas programadas,
          le recomendamos contactarnos con antelación por el canal telefónico.
        </p>
      </section>

      <section className="sobre-seccion" aria-labelledby="titulo-ubicacion">
        <h2 id="titulo-ubicacion">Ubicación</h2>
        <p className="sobre-mapa-ayuda">
          Referencia de la sede en Itagüí (Antioquia). También puede abrir la
          ubicación exacta en{" "}
          <a href={ENLACE_MAPS_APP} target="_blank" rel="noopener noreferrer">
            Google Maps
          </a>
          .
        </p>
        <div className="sobre-mapa-contenedor">
          <iframe
            title="Ubicación D&M Industrias Metálicas S.A.S. — Itagüí"
            className="sobre-mapa-iframe"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={urlMapaGoogle || urlMapaOsm}
            allowFullScreen
          />
        </div>
        <p className="sobre-mapa-pie">
          {urlMapaGoogle
            ? "Mapa interactivo de referencia."
            : "Mapa de referencia (OpenStreetMap)."}
        </p>
      </section>
    </div>
  );
}
