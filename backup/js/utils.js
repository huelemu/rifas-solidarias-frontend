// Utilidades generales para toda la app
class Utils {
    
    // Mostrar notificaciones
    static showNotification(message, type = 'info') {
        // Crear o actualizar un div de notificación
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            document.body.appendChild(notification);
        }

        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.display = 'block';

        // Auto-hide después de 3 segundos
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // Formatear fechas
    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Formatear moneda
    static formatCurrency(amount) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(amount);
    }

    // Validar email
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Loading states
    static showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '<div class="loading-spinner">Cargando...</div>';
        }
    }

    static hideLoading(elementId, content = '') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = content;
        }
    }

    // Debounce para búsquedas
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}