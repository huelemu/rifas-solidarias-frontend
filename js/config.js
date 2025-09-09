// config-produccion.js - Configuración centralizada para entornos
// Copiar este archivo a js/config.js en tu frontend

const CONFIG = {
    // ==========================================
    // CONFIGURACIÓN DE ENTORNOS
    // ==========================================
    
    // Detectar entorno automáticamente
    ENVIRONMENT: (function() {
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        } else {
            return 'production';
        }
    })(),
    
    // URLs por entorno
    API_URLS: {
        development: 'http://localhost:3100',
        production: 'https://apirifas.huelemu.com.ar'
    },
    
    // Configuración adicional por entorno
    SETTINGS: {
        development: {
            DEBUG: true,
            LOG_LEVEL: 'debug',
            TIMEOUT: 10000
        },
        production: {
            DEBUG: false,
            LOG_LEVEL: 'error',
            TIMEOUT: 30000
        }
    },

    // ==========================================
    // MÉTODOS HELPER
    // ==========================================
    
    getApiUrl() {
        return this.API_URLS[this.ENVIRONMENT];
    },
    
    getSetting(key) {
        return this.SETTINGS[this.ENVIRONMENT][key];
    },
    
    isDevelopment() {
        return this.ENVIRONMENT === 'development';
    },
    
    isProduction() {
        return this.ENVIRONMENT === 'production';
    },
    
    log(...args) {
        if (this.getSetting('DEBUG')) {
            console.log('[CONFIG]', ...args);
        }
    }
};

// Exponer configuración globalmente
window.APP_CONFIG = CONFIG;

// Log de inicialización
CONFIG.log('Entorno detectado:', CONFIG.ENVIRONMENT);
CONFIG.log('API URL:', CONFIG.getApiUrl());

// Exportar para Node.js si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}