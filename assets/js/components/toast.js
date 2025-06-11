// toast.js - Sistema de notificaciones
class ToastManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Crear contenedor de toasts si no existe
        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
            
            // Añadir estilos CSS
            this.addStyles();
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .toast {
                min-width: 300px;
                max-width: 400px;
                padding: 16px 20px;
                border-radius: 8px;
                color: white;
                font-family: 'Poppins', sans-serif;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                transform: translateX(400px);
                opacity: 0;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .toast.show {
                transform: translateX(0);
                opacity: 1;
            }

            .toast.success {
                background: linear-gradient(135deg, #4caf50, #45a049);
            }

            .toast.error {
                background: linear-gradient(135deg, #f44336, #d32f2f);
            }

            .toast.warning {
                background: linear-gradient(135deg, #ff9800, #f57c00);
            }

            .toast.info {
                background: linear-gradient(135deg, #2196f3, #1976d2);
            }

            .toast::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 4px;
                height: 100%;
                background: rgba(255, 255, 255, 0.3);
            }

            .toast-close {
                position: absolute;
                top: 8px;
                right: 10px;
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.2s;
            }

            .toast-close:hover {
                opacity: 1;
            }

            @media (max-width: 480px) {
                .toast-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                }
                
                .toast {
                    min-width: auto;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    show(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        toast.innerHTML = `
            <span class="toast-message">${message}</span>
            <button class="toast-close">&times;</button>
        `;

        // Añadir al contenedor
        this.container.appendChild(toast);

        // Mostrar toast con animación
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Auto-ocultar después del tiempo especificado
        const autoHide = setTimeout(() => {
            this.hide(toast);
        }, duration);

        // Funcionalidad del botón cerrar
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoHide);
            this.hide(toast);
        });

        return toast;
    }

    hide(toast) {
        toast.classList.remove('show');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Crear instancia global
const toastManager = new ToastManager();

// Función global para mostrar toasts (compatible con tu código)
function showToast(message, type = 'info', duration = 4000) {
    return toastManager.show(message, type, duration);
}

// Funciones de conveniencia
window.showSuccess = (message, duration) => toastManager.success(message, duration);
window.showError = (message, duration) => toastManager.error(message, duration);
window.showWarning = (message, duration) => toastManager.warning(message, duration);
window.showInfo = (message, duration) => toastManager.info(message, duration);

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ToastManager, showToast };
}

export default ToastManager;