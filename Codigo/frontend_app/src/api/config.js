// En desarrollo, Vite enruta /api/public → Django (véase vite.config.js).
// En producción o con Docker, define VITE_GATEWAY_URL (ej. http://localhost:8000/api).
const prefijoApi =
  import.meta.env.VITE_GATEWAY_URL ||
  (import.meta.env.DEV ? "/api" : "http://localhost:8000/api");

/** Lista de proyectos; US-02: añadir ?categoria=... varias veces para filtrar. */
export const endpoints = {
    login: `${prefijoApi}/auth/login/`,
    projects: `${prefijoApi}/public/projects/`,
    /** US-02: categorías distintas para el selector */
    projectCategories: `${prefijoApi}/public/categories/`,
    tasks: `${prefijoApi}/core/tasks/`,
    businessInfo: `${prefijoApi}/public/info/`,
    chat: `${prefijoApi}/chatbot/request/`,
    documents: `${prefijoApi}/documents/virtualize/`,
    analytics: `${prefijoApi}/analytics/view/`,
};

/**
 * @param {string[]} categoriasSeleccionadas
 * @returns {string}
 */
export function construirUrlProyectos(categoriasSeleccionadas) {
    const base = endpoints.projects.endsWith("/")
        ? endpoints.projects
        : `${endpoints.projects}/`;
    if (!categoriasSeleccionadas?.length) {
        return base;
    }
    const params = new URLSearchParams();
    categoriasSeleccionadas.forEach((c) => {
        const valor = String(c).trim();
        if (valor) params.append("categoria", valor);
    });
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
}