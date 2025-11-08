// src/api/api.js

// Usa a URL do ambiente ou um fallback.
// Preferi o fallback do segundo código que inclui '/api', o que é mais comum.
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";


/**
 * Cliente API centralizado para todas as requisições.
 * Inclui lógica de autenticação (token) e tratamento de erros (401).
 */
class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /**
     * Método base para todas as requisições HTTP.
     * Adiciona automaticamente o token de autenticação e trata o body.
     * @param {string} endpoint - O caminho da API (ex: '/usuarios').
     * @param {Object} options - Opções do `fetch` (method, headers, body, etc.).
     * @returns {Promise<any>} O corpo da resposta (JSON ou texto).
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

        // 1. Configuração dos Headers
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers, // Permite sobrescrever o Content-Type
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // 2. Configuração da Requisição
        const config = {
            headers,
            ...options,
        };

        // 3. Serializa o corpo (body) se for um objeto, mantendo-o sem serializar se já for string/FormData
        if (config.body && typeof config.body === 'object' && !((config.body) instanceof FormData)) {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);

            // 4. Tratamento de Erro HTTP
            if (!response.ok) {
                // Se for erro 401 (Unauthorized), redireciona para login e limpa sessão
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userRole'); // Mantido do primeiro código
                    // Nota: 'window.location.href' pode ser um problema se a biblioteca 
                    // de rotas (ex: React Router) for usada. 
                    // Considere usar um callback ou um evento global.
                    window.location.href = '/login'; 
                    throw new Error('Sessão expirada. Redirecionando para login.');
                }

                // Tenta ler a mensagem de erro do corpo da resposta JSON
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
                throw new Error(errorMessage);
            }

            // 5. Retorna o Corpo da Resposta
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }

            // Para outros tipos (ex: texto puro)
            return await response.text();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Métodos utilitários para cada tipo de requisição HTTP
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: data
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Instância única do cliente API (Singleton)
export const apiClient = new ApiClient();

// -------------------------------------------------------------------
// Definição dos Endpoints Específicos
// -------------------------------------------------------------------

// Endpoints de autenticação
export const authApi = {
    /**
     * Envia credenciais para o endpoint de login.
     * @param {Object} credentials - {email, password}
     * @returns {Promise<Object>} Token e dados do usuário.
     */
    login: (credentials) => apiClient.post('/auth/login', credentials),
};

// Endpoints de usuários (do primeiro código)
export const usuarioApi = {
    list: () => apiClient.get('/usuarios'),
    getById: (id) => apiClient.get(`/usuarios/${id}`),
    create: (userData) => apiClient.post('/usuarios', userData),
    update: (id, updateData) => apiClient.put(`/usuarios/${id}`, updateData),
    delete: (id) => apiClient.delete(`/usuarios/${id}`),
};

// Endpoints de alunos (do segundo código)
export const alunoApi = {
    /**
     * Lista todos os alunos.
     */
    list: () => apiClient.get('/alunos'),

    /**
     * Busca um aluno pelo ID.
     */
    getById: (id) => apiClient.get(`/alunos/${id}`),

    /**
     * Cria um novo aluno.
     */
    create: (alunoData) => apiClient.post('/alunos', alunoData),

    /**
     * Atualiza um aluno.
     */
    update: (id, updateData) => apiClient.put(`/alunos/${id}`, updateData),

    /**
     * Deleta um aluno.
     */
    delete: (id) => apiClient.delete(`/alunos/${id}`),
};

// Endpoints para histórico escolar (do segundo código)
export const historicoApi = {
    /**
     * Cria um registro de histórico escolar.
     */
    create: (historicoData) => apiClient.post('/historicos', historicoData),

    /**
     * Busca histórico por aluno.
     */
    getByAluno: (alunoId) => apiClient.get(`/historicos/aluno/${alunoId}`),
};

// Exporta a instância única como default também
export default apiClient;