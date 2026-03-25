import { Link, NavLink } from "react-router-dom";

function claseEnlaceActivo({ isActive }) {
  return isActive ? "nav-link nav-link--activo" : "nav-link";
}

export default function Navbar() {
  return (
    <nav className="navbar" aria-label="Navegación principal">
      <Link to="/" className="logo">
        D&amp;M Industrias
      </Link>

      <div className="nav-links">
        <NavLink to="/" end className={claseEnlaceActivo}>
          Inicio
        </NavLink>
        <NavLink to="/nosotros" className={claseEnlaceActivo}>
          Sobre nosotros
        </NavLink>
        <NavLink to="/asistente" className={claseEnlaceActivo}>
          Asistente
        </NavLink>
      </div>

      <div className="nav-right">
        <Link className="nav-enlace-filtro" to="/#filtro-categorias-portafolio">
          Filtrar por categoría
        </Link>
        <button type="button" className="user-btn">
          Cliente
        </button>
      </div>
    </nav>
  );
}
