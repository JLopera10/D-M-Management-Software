import { useState, useEffect } from "react";
import { endpoints } from "../api/config";

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
        alert("Empleado registrado con éxito");
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
    <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1>Directorio de Empleados</h1>
      <p>Gestione el personal disponible para la asignación de tareas.</p>

      {/* FORMULARIO DE REGISTRO */}
      <div style={{ background: "#f4f4f4", padding: "20px", borderRadius: "8px", marginBottom: "30px" }}>
        <h2>Registrar Nuevo Empleado</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        
        <form onSubmit={registrarEmpleado} style={{ display: "grid", gap: "10px", gridTemplateColumns: "1fr 1fr" }}>
          <input required name="nombre_completo" placeholder="Nombre Completo" value={formulario.nombre_completo} onChange={manejarCambio} style={{ padding: "8px" }} />
          <input required name="cedula" placeholder="Cédula (CC)" value={formulario.cedula} onChange={manejarCambio} style={{ padding: "8px" }} />
          <input name="telefono" placeholder="Teléfono" value={formulario.telefono} onChange={manejarCambio} style={{ padding: "8px" }} />
          <select name="cargo" value={formulario.cargo} onChange={manejarCambio} style={{ padding: "8px" }}>
            <option value="Operario">Operario</option>
            <option value="Soldador">Soldador</option>
            <option value="Pintor">Pintor</option>
            <option value="Instalador">Instalador</option>
            <option value="Supervisor">Supervisor</option>
          </select>
          <button type="submit" disabled={cargando} style={{ gridColumn: "span 2", padding: "10px", background: "#0056b3", color: "white", border: "none", cursor: "pointer" }}>
            {cargando ? "Guardando..." : "Registrar Empleado"}
          </button>
        </form>
      </div>

      {/* LISTA DE EMPLEADOS */}
      <h2>Nómina Actual ({empleados.length})</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #ccc" }}>
            <th style={{ padding: "10px" }}>Nombre</th>
            <th>Cédula</th>
            <th>Cargo</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map(emp => (
            <tr key={emp.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "10px" }}>{emp.nombre_completo}</td>
              <td>{emp.cedula}</td>
              <td>{emp.cargo}</td>
              <td>
                <span style={{ padding: "4px 8px", borderRadius: "12px", fontSize: "0.85em", background: emp.disponible ? "#d4edda" : "#f8d7da", color: emp.disponible ? "#155724" : "#721c24" }}>
                  {emp.disponible ? "Disponible" : "Ocupado"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}