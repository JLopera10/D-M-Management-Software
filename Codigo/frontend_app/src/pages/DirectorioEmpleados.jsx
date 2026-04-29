import { useState, useEffect } from "react";
import { endpoints } from "../api/config";
import "../styles/paneles.css";

export default function DirectorioEmpleados() {
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  
  // Estado del formulario
  const [formulario, setFormulario] = useState({
    nombre_completo: "",
    cedula: "",
    telefono: "",
    cargo: "Operario"
  });

  // Cargar lista de empleados al montar el componente
  useEffect(() => {
    cargarEmpleados();
  }, []);

  const cargarEmpleados = async () => {
    try {
      const res = await fetch(endpoints.employees);
      const data = await res.json();
      if (data.exito) {
        setEmpleados(data.empleados);
      }
    } catch (err) {
      console.error("Error cargando empleados:", err);
      setError("No se pudo cargar la nómina.");
    }
  };

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  const registrarEmpleado = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    try {
      const res = await fetch(endpoints.employees, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formulario)
      });
      const data = await res.json();

      if (res.ok && data.exito) {
        setFormulario({ nombre_completo: "", cedula: "", telefono: "", cargo: "Operario" });
        cargarEmpleados(); // Recargar la lista
      } else {
        setError(data.mensaje || "Error al registrar empleado");
      }
    } catch (err) {
      setError("Error de red.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="empleados-page">
      <header className="empleados-hero">
        <div className="empleados-hero-inner">
          <h1>Directorio de Empleados</h1>
          <p className="empleados-sub">Gestiona el personal disponible para tus proyectos.</p>
        </div>
      </header>

      <main className="empleados-main">
        <section className="empleados-card registro-card">
          <h2>Registrar Nuevo Empleado</h2>
          {error && <div className="empleados-alert">{error}</div>}

          <form onSubmit={registrarEmpleado} className="empleados-form">
            <input required name="nombre_completo" placeholder="Nombre completo" value={formulario.nombre_completo} onChange={manejarCambio} />
            <input required name="cedula" placeholder="Cédula (CC)" value={formulario.cedula} onChange={manejarCambio} />
            <input name="telefono" placeholder="Teléfono" value={formulario.telefono} onChange={manejarCambio} />
            <select name="cargo" value={formulario.cargo} onChange={manejarCambio}>
              <option value="Operario">Operario</option>
              <option value="Soldador">Soldador</option>
              <option value="Pintor">Pintor</option>
              <option value="Instalador">Instalador</option>
              <option value="Supervisor">Supervisor</option>
            </select>

            <div className="empleados-actions">
              <button type="submit" className="btn btn-primary" disabled={cargando}>{cargando ? "Guardando..." : "Registrar Empleado"}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setFormulario({ nombre_completo: "", cedula: "", telefono: "", cargo: "Operario" })}>Limpiar</button>
            </div>
          </form>
        </section>

        <section className="empleados-card lista-card">
          <div className="lista-header">
            <h2>Nómina Actual</h2>
            <span className="badge">{empleados.length}</span>
          </div>

          <div className="tabla-wrapper">
            <table className="empleados-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cédula</th>
                  <th>Cargo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {empleados.map(emp => (
                  <tr key={emp.id}>
                    <td className="td-nombre">{emp.nombre_completo}</td>
                    <td>{emp.cedula}</td>
                    <td>{emp.cargo}</td>
                    <td>
                      <span className={emp.disponible ? "chip chip-available" : "chip chip-busy"}>
                        {emp.disponible ? "Disponible" : "Ocupado"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}