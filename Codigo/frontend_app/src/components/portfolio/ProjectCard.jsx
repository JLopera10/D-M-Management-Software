// components/ProjectCard.jsx
export default function ProjectCard({ project }) {
  return (
    <div className="card">
      <div className="card-image">
        <img src={project.image} alt={project.title} />
        <span className="tag">{project.tag}</span>
      </div>

      <div className="card-content">
        <h3>{project.title}</h3>
        <p className="location">📍 {project.location}</p>
        <p className="description">{project.description}</p>

        <button className="btn">Ver detalle →</button>
      </div>
    </div>
  );
}