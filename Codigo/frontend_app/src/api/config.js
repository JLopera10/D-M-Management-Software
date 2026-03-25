// En desarrollo, Vite enruta /api/public → Django (véase vite.config.js).
// En producción o con Docker, define VITE_GATEWAY_URL (ej. http://localhost:8000/api).
const prefijoApi = import.meta.env.VITE_GATEWAY_URL || "http://localhost:8000/api";

export const endpoints = {
    login: `${prefijoApi}/auth/login/`,
    projects: `${prefijoApi}/core/projects/`,
    employees: `${prefijoApi}/core/employees/`,
    tasks: `${prefijoApi}/core/tasks/`,
    taskToggle: (id) => `${prefijoApi}/core/tasks/${id}/toggle/`,
    projectDetail: (id) => `${prefijoApi}/core/projects/${id}/`,
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