import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./home/Navbar";

export default function Layout() {
  const ubicacion = useLocation();
  const esVistaChat = ubicacion.pathname === "/asistente";

  return (
    <>
      <Navbar />
      <main className={esVistaChat ? "main main--chat" : "main"}>
        <Outlet />
      </main>
    </>
  );
}
