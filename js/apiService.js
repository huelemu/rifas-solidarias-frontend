class ApiService {
    constructor() {
        this.API_BASE_URL = 'http://localhost:3100'; // Tu backend
    }

    // Método genérico para requests autenticados
    async request(endpoint, options = {}) {
        const url = `${this.API_BASE_URL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeaders()
            }
        };

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, finalOptions);
            
            if (response.status === 401) {
                // Token expirado, intentar refresh
                const refreshed = await authService.refreshToken();
                if (refreshed) {
                    // Reintentar request con nuevo token
                    finalOptions.headers = {
                        ...finalOptions.headers,
                        ...this.getAuthHeaders()
                    };
                    return await fetch(url, finalOptions);
                } else {
                    authService.logout();
                    return;
                }
            }

            return response;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    getAuthHeaders() {
        const token = authService.getAccessToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    // Métodos específicos que necesitarás
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Instancia global
const apiService = new ApiService();