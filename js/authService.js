// js/authService.js - Servicio de autenticación actualizado para producción
console.log('🔧 Cargando AuthService...');

class AuthService {
    constructor() {
        // ==========================================
        // CONFIGURACIÓN DINÁMICA DE API
        // ==========================================
        
        // Usar configuración central si está disponible
        if (window.APP_CONFIG) {
            this.API_BASE_URL = window.APP_CONFIG.getApiUrl();
            console.log('✅ Usando configuración central:', this.API_BASE_URL);
        } else {
            // Fallback: detección automática
            this.API_BASE_URL = this.detectApiUrl();
            console.log('⚠️  Usando detección automática:', this.API_BASE_URL);
        }
    }

    // Detectar URL de API automáticamente
    detectApiUrl() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // Desarrollo
            return 'http://localhost:3100';
        } else {
            // Producción - Configuración para Huelemu
            return 'https://apirifas.huelemu.com.ar';
        }
    }

    // ========================
    // MÉTODOS DE AUTENTICACIÓN
    // ========================

    async login(email, password) {
        console.log('🔑 Iniciando login para:', email);
        
        try {
            const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log('📡 Respuesta del servidor:', response.status, data);

            if (response.ok) {
                // Guardar tokens y datos del usuario
                this.setTokens(data.data.tokens.access_token, data.data.tokens.refresh_token);
                this.setUserData(data.data.user);
                console.log('✅ Login exitoso, tokens guardados');
                return { success: true, data: data.data };
            } else {
                console.log('❌ Login fallido:', data.message);
                return { success: false, error: data.message, status: response.status };
            }
        } catch (error) {
            console.error('❌ Error en login:', error);
            return { success: false, error: 'Error de conexión con el servidor. Verifica que el backend esté funcionando.' };
        }
    }

    async register(userData) {
        console.log('📝 Iniciando registro para:', userData.email);
        
        try {
            const response = await fetch(`${this.API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            console.log('📡 Respuesta del servidor:', response.status, data);

            if (response.ok) {
                // Auto-login después del registro
                this.setTokens(data.data.tokens.access_token, data.data.tokens.refresh_token);
                this.setUserData(data.data.user);
                console.log('✅ Registro exitoso, auto-login completado');
                return { success: true, data: data.data };
            } else {
                console.log('❌ Registro fallido:', data.message);
                return { success: false, error: data.message, status: response.status };
            }
        } catch (error) {
            console.error('❌ Error en registro:', error);
            return { success: false, error: 'Error de conexión con el servidor. Verifica que el backend esté funcionando.' };
        }
    }

    async refreshToken() {
        console.log('🔄 Renovando token...');
        
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                throw new Error('No hay refresh token disponible');
            }

            const response = await fetch(`${this.API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh_token: refreshToken })
            });

            const data = await response.json();

            if (response.ok) {
                this.setTokens(data.data.access_token, data.data.refresh_token);
                console.log('✅ Token renovado exitosamente');
                return { success: true, token: data.data.access_token };
            } else {
                console.log('❌ Error renovando token:', data.message);
                this.logout(); // Limpiar tokens inválidos
                return { success: false, error: data.message };
            }
        } catch (error) {
            console.error('❌ Error renovando token:', error);
            this.logout();
            return { success: false, error: 'Error renovando token' };
        }
    }

    async logout() {
        console.log('🚪 Cerrando sesión...');
        
        try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
                await fetch(`${this.API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.getAccessToken()}`
                    },
                    body: JSON.stringify({ refresh_token: refreshToken })
                });
            }
        } catch (error) {
            console.log('⚠️  Error en logout del servidor:', error);
        }
        
        // Limpiar datos locales siempre
        this.clearTokens();
        this.clearUserData();
        console.log('✅ Sesión cerrada localmente');
        
        // Redirigir al login
        window.location.href = 'login.html';
    }

    // =====================
    // REQUESTS AUTENTICADOS
    // =====================

    async authenticatedRequest(endpoint, options = {}) {
        let token = this.getAccessToken();
        
        if (!token) {
            throw new Error('No hay token de acceso disponible');
        }

        const requestOptions = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers
            }
        };

        try {
            let response = await fetch(`${this.API_BASE_URL}${endpoint}`, requestOptions);
            
            // Si token expiró, intentar renovar
            if (response.status === 401) {
                console.log('🔄 Token expirado, intentando renovar...');
                const refreshResult = await this.refreshToken();
                
                if (refreshResult.success) {
                    // Reintentar con nuevo token
                    requestOptions.headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
                    response = await fetch(`${this.API_BASE_URL}${endpoint}`, requestOptions);
                } else {
                    throw new Error('Token expirado y no se pudo renovar');
                }
            }

            const data = await response.json();
            
            if (response.ok) {
                return { success: true, data: data.data || data };
            } else {
                throw new Error(data.message || 'Error en la petición');
            }
        } catch (error) {
            console.error('❌ Error en request autenticado:', error);
            
            if (error.message.includes('Token expirado')) {
                this.logout();
            }
            
            throw error;
        }
    }

    // ==================
    // GESTIÓN DE TOKENS
    // ==================

    setTokens(accessToken, refreshToken) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
    }

    getAccessToken() {
        return localStorage.getItem('access_token');
    }

    getRefreshToken() {
        return localStorage.getItem('refresh_token');
    }

    clearTokens() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }

    // =====================
    // GESTIÓN DE USUARIO
    // =====================

    setUserData(userData) {
        localStorage.setItem('user_data', JSON.stringify(userData));
    }

    getUserData() {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    }

    clearUserData() {
        localStorage.removeItem('user_data');
    }

    // ===================
    // VERIFICACIONES
    // ===================

    isAuthenticated() {
        return !!this.getAccessToken();
    }

    hasRole(role) {
        const userData = this.getUserData();
        return userData && userData.rol === role;
    }

    canAccess(requiredRole) {
        if (!this.isAuthenticated()) return false;
        
        const userData = this.getUserData();
        if (!userData) return false;

        // Jerarquía de roles
        const roleHierarchy = {
            'admin_global': 4,
            'admin_institucion': 3,
            'vendedor': 2,
            'comprador': 1
        };

        const userLevel = roleHierarchy[userData.rol] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;

        return userLevel >= requiredLevel;
    }

    // ==================
    // PROTECCIÓN DE RUTAS
    // ==================

    async checkAuthAndRedirect() {
        if (!this.isAuthenticated()) {
            console.log('❌ Usuario no autenticado, redirigiendo al login');
            window.location.href = 'login.html';
            return false;
        }

        // Verificar si el token es válido
        try {
            const result = await this.authenticatedRequest('/auth/me');
            console.log('✅ Usuario autenticado:', result.data.email);
            return true;
        } catch (error) {
            console.log('❌ Token inválido, redirigiendo al login');
            return false;
        }
    }

    redirectToLogin() {
        window.location.href = 'login.html';
    }

    redirectToDashboard() {
        window.location.href = 'dashboard.html';
    }

    // ==================
    // CARGA DE DATOS
    // ==================

    async loadInstituciones() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/instituciones`);
            const data = await response.json();
            
            if (response.ok) {
                return { success: true, data: data.data || [] };
            } else {
                return { success: false, error: data.message };
            }
        } catch (error) {
            console.error('❌ Error cargando instituciones:', error);
            return { success: false, error: 'Error de conexión' };
        }
    }

    // ==================
    // UTILIDADES
    // ==================

    showMessage(message, type = 'info') {
        const messageDiv = document.getElementById('message');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `message ${type}`;
            messageDiv.style.display = 'block';
            
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        } else {
            // Fallback si no hay div de mensaje
            alert(message);
        }
    }

    // Test de conexión
    async testConnection() {
        try {
            console.log('🔍 Probando conexión con:', this.API_BASE_URL);
            const response = await fetch(`${this.API_BASE_URL}/`);
            const data = await response.json();
            console.log('✅ Conexión exitosa:', data);
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error de conexión:', error);
            return { success: false, error: error.message };
        }
    }
}

// Crear instancia global
window.authService = new AuthService();
console.log('✅ AuthService inicializado globalmente');