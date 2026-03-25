export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-left">
        <h1>
          Estructuras metálicas que transforman ideas en proyectos reales
        </h1>

        <p>
          Diseñamos, fabricamos y ejecutamos soluciones metálicas a la medida,
          integrando tecnología para mejorar la comunicación y la gestión de obras.
        </p>

        <input className="search" placeholder="Buscar proyectos..." />
        <div className="stats">
          <div>
            <h2>+50</h2>
            <p>Proyectos</p>
          </div>

          <div>
            <h2>+10</h2>
            <p>Años de experiencia</p>
          </div>
        </div>
      </div>

      <div className="hero-right">
        <img
          src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fconvel.co%2Fwp-content%2Fuploads%2F2020%2F11%2Fbolera-mayorca-02-3.jpg&f=1&nofb=1&ipt=083b0956b9e68c7780a9dba41c08159560e26986e2d2544a38a3a055a7d244d3"
          alt="industrial"
        />
        <span className="image-label">
          Proyectos de calidad superior
        </span>
      </div>
    </section>
  );
}