export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">D&M Industrias</div>

      <div className="nav-links">
        <a href="#">Inicio</a>
        <a href="#">Chatbot</a>
      </div>

      <div className="nav-right">
        <input placeholder="Busca tu tipo de estructura" />
        <button className="user-btn">Cliente</button>
      </div>
    </nav>
  );
}