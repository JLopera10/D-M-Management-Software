// frontend_app/src/api/config.js
const GATEWAY_URL = 'http://localhost:8000/api';

export const endpoints = {
    login: `${GATEWAY_URL}/auth/login/`,
    projects: `${GATEWAY_URL}/core/projects/`,
    tasks: `${GATEWAY_URL}/core/tasks/`,
    businessInfo: `${GATEWAY_URL}/public/info/`,
    chat: `${GATEWAY_URL}/chatbot/request/`,
    documents: `${GATEWAY_URL}/documents/virtualize/`,
    analytics: `${GATEWAY_URL}/analytics/view/`,
};