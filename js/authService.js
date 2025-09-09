// js/authService.js - Servicio completo de autenticación
console.log('🔧 Cargando AuthService...');

class AuthService {
    constructor() {
        this.API_BASE_URL = 'http://localhost:3100';
        console.log('✅ AuthService inicializado con API:', this.API_BASE_URL);
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
            return { success: false, error: 'Error de conexión con el servidor' };
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
            return { success: false, error: 'Error de conexión con el servidor' };
        }
    }

    async refreshToken() {
        console.log('🔄 Renovando token...');
        
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                throw new Error('No hay refresh token');
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
                this.setAccessToken(data.data.access_token);
                console.log('✅ Token renovado exitosamente');
                return data.data.access_token;
            } else {
                console.log('❌ Error renovando token:', data.message);
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('❌ Error renovando token:', error);
            this.logout();
            throw error;
        }
    }

    async logout() {
        console.log('🚪 Cerrando sesión...');
        
        try {
            const accessToken = this.getAccessToken();
            const refreshToken = this.getRefreshToken();

            if (accessToken) {
                await fetch(`${this.API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ refresh_token: refreshToken })
                });
            }
        } catch (error) {
            console.error('❌ Error en logout:', error);
        } finally {
            // Limpiar datos locales siempre
            this.clearAuthData();
            console.log('✅ Sesión cerrada, datos locales limpiados');
        }
    }

    async getProfile() {
        console.log('👤 Obteniendo perfil del usuario...');
        
        try {
            const response = await this.authenticatedRequest(`${this.API_BASE_URL}/auth/me`);
            return response;
        } catch (error) {
            console.error('❌ Error obteniendo perfil:', error);
            throw error;
        }
    }

    // ========================
    // GESTIÓN DE TOKENS
    // ========================

    setTokens(accessToken, refreshToken) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        console.log('💾 Tokens guardados en localStorage');
    }

    setAccessToken(token) {
        localStorage.setItem('access_token', token);
        console.log('💾 Access token actualizado');
    }

    getAccessToken() {
        return localStorage.getItem('access_token');
    }

    getRefreshToken() {
        return localStorage.getItem('refresh_token');
    }

    setUserData(userData) {
        localStorage.setItem('user_data', JSON.stringify(userData));
        console.log('💾 Datos de usuario guardados:', userData.email, userData.rol);
    }

    getUserData() {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    }

    clearAuthData() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        console.log('🗑️ Datos de autenticación eliminados');
    }

    // ========================
    // VERIFICACIONES
    // ========================

    isAuthenticated() {
        const token = this.getAccessToken();
        if (!token) {
            console.log('❌ No hay token de acceso');
            return false;
        }

        // Verificar si el token no está expirado
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Date.now() / 1000;
            const isValid = payload.exp > now;
            console.log('🔍 Token válido:', isValid, 'Expira en:', new Date(payload.exp * 1000));
            return isValid;
        } catch (error) {
            console.log('❌ Error verificando token:', error);
            return false;
        }
    }

    getCurrentUser() {
        if (!this.isAuthenticated()) {
            console.log('❌ Usuario no autenticado');
            return null;
        }
        const user = this.getUserData();
        console.log('👤 Usuario actual:', user?.email, user?.rol);
        return user;
    }

    hasRole(role) {
        const user = this.getCurrentUser();
        const hasRole = user && user.rol === role;
        console.log(`🎭 Usuario tiene rol '${role}':`, hasRole);
        return hasRole;
    }

    hasAnyRole(roles) {
        const user = this.getCurrentUser();
        const hasAnyRole = user && roles.includes(user.rol);
        console.log(`🎭 Usuario tiene alguno de los roles [${roles.join(', ')}]:`, hasAnyRole);
        return hasAnyRole;
    }

    // ========================
    // REQUESTS AUTENTICADAS
    // ========================

    async authenticatedRequest(url, options = {}) {
        let token = this.getAccessToken();

        if (!token) {
            throw new Error('No hay token de acceso');
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...options.headers
                }
            });

            // Si el token expiró, intentar renovarlo
            if (response.status === 401) {
                const data = await response.json();
                if (data.code === 'TOKEN_EXPIRED') {
                    console.log('🔄 Token expirado, renovando...');
                    token = await this.refreshToken();
                    
                    // Reintentar la request con el nuevo token
                    const retryResponse = await fetch(url, {
                        ...options,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                            ...options.headers
                        }
                    });

                    if (retryResponse.ok) {
                        return await retryResponse.json();
                    } else {
                        throw new Error('Error en request autenticada después de renovar token');
                    }
                } else {
                    this.logout();
                    throw new Error('No autorizado');
                }
            }

            if (response.ok) {
                return await response.json();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error en request');
            }

        } catch (error) {
            console.error('❌ Error en request autenticada:', error);
            throw error;
        }
    }

    // ========================
    // UTILIDADES DE NAVEGACIÓN
    // ========================

    redirectToLogin() {
        console.log('🔄 Redirigiendo al login...');
        window.location.href = '/login.html';
    }

    redirectToDashboard() {
        const user = this.getCurrentUser();
        if (user) {
            console.log('🔄 Redirigiendo al dashboard para rol:', user.rol);
            // Redirigir según el rol del usuario
            switch (user.rol) {
                case 'admin_global':
                    window.location.href = '/dashboard.html?admin=global';
                    break;
                case 'admin_institucion':
                    window.location.href = '/dashboard.html?admin=institucion';
                    break;
                case 'vendedor':
                    window.location.href = '/dashboard.html?role=vendedor';
                    break;
                case 'comprador':
                default:
                    window.location.href = '/dashboard.html';
                    break;
            }
        } else {
            console.log('❌ No hay usuario para redirigir');
            this.redirectToLogin();
        }
    }

    // Verificar autenticación en páginas protegidas
    requireAuth() {
        if (!this.isAuthenticated()) {
            console.log('🚫 Acceso denegado: usuario no autenticado');
            this.redirectToLogin();
            return false;
        }
        console.log('✅ Usuario autenticado, acceso permitido');
        return true;
    }

    // Verificar rol específico
    requireRole(requiredRole) {
        if (!this.requireAuth()) return false;
        
        if (!this.hasRole(requiredRole)) {
            console.log(`🚫 Acceso denegado: se requiere rol '${requiredRole}'`);
            alert('No tienes permisos para acceder a esta página');
            this.redirectToDashboard();
            return false;
        }
        console.log(`✅ Rol '${requiredRole}' verificado, acceso permitido`);
        return true;
    }

    // Verificar cualquiera de los roles
    requireAnyRole(requiredRoles) {
        if (!this.requireAuth()) return false;
        
        if (!this.hasAnyRole(requiredRoles)) {
            console.log(`🚫 Acceso denegado: se requiere uno de los roles [${requiredRoles.join(', ')}]`);
            alert('No tienes permisos para acceder a esta página');
            this.redirectToDashboard();
            return false;
        }
        console.log(`✅ Rol verificado en [${requiredRoles.join(', ')}], acceso permitido`);
        return true;
    }
}

// Crear instancia global del servicio
console.log('🏗️ Creando instancia global de AuthService...');
const authService = new AuthService();

// Función global para verificar autenticación al cargar páginas
function checkAuthOnLoad() {
    // Solo verificar en páginas que no sean login o registro
    const publicPages = ['/login.html', '/register.html', '/index.html', '/'];
    const currentPage = window.location.pathname;
    
    console.log('🔍 Verificando autenticación para página:', currentPage);
    
    if (!publicPages.some(page => currentPage.endsWith(page))) {
        console.log('🔒 Página protegida, verificando autenticación...');
        authService.requireAuth();
    } else {
        console.log('🌐 Página pública, no se requiere autenticación');
    }
}

// Auto-verificar al cargar cualquier página
document.addEventListener('DOMContentLoaded', checkAuthOnLoad);

// Marcar que AuthService está cargado
window.authServiceLoaded = true;
console.log('✅ AuthService cargado completamente y disponible globalmente');

// Exportar para uso en módulos (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
}