export default function ProjectCard({ proyecto }) {
  return (
    <article className="card">
      <div className="card-image">
        <img
          src={proyecto.url_imagen}
          alt={proyecto.titulo}
          loading="lazy"
        />
        {proyecto.categoria ? (
          <span className="tag">{proyecto.categoria}</span>
        ) : null}
      </div>

      <div className="card-content">
        <h3>{proyecto.titulo}</h3>
        <p className="location">📍 {proyecto.ubicacion}</p>
        <p className="description">{proyecto.descripcion}</p>

        <button type="button" className="btn">
          Ver detalle →
        </button>
      </div>
    </article>
  );
}
