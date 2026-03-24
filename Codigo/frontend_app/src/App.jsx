import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ChatAsistente from "./pages/ChatAsistente";
import Home from "./pages/Home";
import SobreNosotros from "./pages/SobreNosotros";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/nosotros" element={<SobreNosotros />} />
          <Route path="/asistente" element={<ChatAsistente />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
