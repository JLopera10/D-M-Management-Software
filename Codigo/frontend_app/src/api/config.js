// En desarrollo, Vite enruta /api/public → Django.
// En producción o con Docker, define VITE_GATEWAY_URL (ej. http://localhost:8000/api).
const prefijoApi = import.meta.env.VITE_GATEWAY_URL || "http://localhost:8000/api";

export const endpoints = {
    login: `${prefijoApi}/auth/login/`,
    
    projects: `${prefijoApi}/core/projects/`,
    projectDetail: (id) => `${prefijoApi}/core/projects/${id}/`,
    tasks: `${prefijoApi}/core/tasks/`,
    taskToggle: (id) => `${prefijoApi}/core/tasks/${id}/toggle/`,
    employees: `${prefijoApi}/core/empleados/`,
    documents: `${prefijoApi}/documents/virtualize/`,
    chat: `${prefijoApi}/chatbot/request/`,
    
    publicProjects: `${prefijoApi}/public/projects/`,
    projectCategories: `${prefijoApi}/public/categories/`,
    publishProject: `${prefijoApi}/public/projects/publish/`,
    businessInfo: `${prefijoApi}/public/info/`,
    consultaChatbotRegistro: `${prefijoApi}/public/consultas-chatbot/registro/`,
    
    analytics: `${prefijoApi}/analytics/view/`,
};

/**
 * @param {string[]} categoriasSeleccionadas
 * @returns {string}
 */
export function construirUrlProyectos(categoriasSeleccionadas) {
    const base = endpoints.publicProjects.endsWith("/")
        ? endpoints.publicProjects
        : `${endpoints.publicProjects}/`;
        
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