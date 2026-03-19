// components/Portfolio.jsx
import ProjectCard from "./ProjectCard";
import "../../styles/portfolio.css";

export default function Portfolio() {
  const projects = [
    {
      title: "Cubierta Industrial Zona Norte",
      location: "Bogotá, Colombia",
      description:
        "Cubierta industrial de gran formato con estructura metálica reforzada...",
      image:
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e",
      tag: "Cubierta metálica",
    },
    {
      title: "Cerramiento Comercial Plaza Centro",
      location: "Medellín, Colombia",
      description:
        "Cerramiento perimetral combinando estructura metálica con paneles...",
      image:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
      tag: "Cerramiento mixto",
    },
    {
      title: "Estructura Metálica Edificio Corporativo",
      location: "Cali, Colombia",
      description:
        "Estructura metálica para edificio de oficinas de 4 pisos...",
      image:
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e",
      tag: "Estructura para edificación",
    },
  ];

  return (
    <section className="portfolio">
      <h2>Nuestro Portafolio</h2>
      <p className="subtitle">8 proyectos disponibles</p>

      <div className="grid">
        {projects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </div>
    </section>
  );
}