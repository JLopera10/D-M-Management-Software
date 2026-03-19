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
      </div>

      <div className="hero-right">
        <img
          src="https://images.unsplash.com/photo-1581091215367-59ab6b8c9f7d"
          alt="industrial"
        />
        <span className="image-label">
          Proyectos de calidad superior
        </span>
      </div>
    </section>
  );
}