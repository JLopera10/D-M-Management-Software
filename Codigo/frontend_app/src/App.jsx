import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ChatAsistente from "./pages/ChatAsistente";
import Home from "./pages/Home";
import SobreNosotros from "./pages/SobreNosotros";
import CreacionProyectos from "./pages/CreacionProyectos";
import DirectorioEmpleados from "./pages/DirectorioEmpleados";
import GestionTareas from "./pages/GestionTareas";
import DetalleProyecto from "./pages/DetalleProyecto";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/nosotros" element={<SobreNosotros />} />
          <Route path="/asistente" element={<ChatAsistente />} />
          <Route path="/admin/crear-proyecto" element={<CreacionProyectos />} />
          <Route path="/admin/empleados" element={<DirectorioEmpleados />} />
          <Route path="/admin/tareas" element={<GestionTareas />} />
          <Route path="admin/proyectos/:id" element={<DetalleProyecto />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
