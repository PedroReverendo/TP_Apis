/**
 * Componente de notificaciones toast
 */
class Toast {
    constructor() {
        this.createContainer();
    }
    
    /**
     * Crea el contenedor de toasts si no existe
     */
    createContainer() {
        if (!document.querySelector('.toast-container')) {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }
    
    /**
     * Muestra un toast
     * @param {Object} options - Opciones del toast
     * @param {string} options.title - Título del toast
     * @param {string} options.message - Mensaje del toast
     * @param {string} options.type - Tipo de toast (success, error, info)
     * @param {number} options.duration - Duración en ms
     */
    show({ title, message, type = 'success', duration = 3000 }) {
        // Crear el elemento toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Determinar el icono según el tipo
        let icon = '✓';
        if (type === 'error') icon = '✕';
        if (type === 'info') icon = 'ℹ';
        if (type === 'warning') icon = '⚠';
        
        // Contenido del toast
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">×</button>
        `;
        
        // Añadir al contenedor
        const container = document.querySelector('.toast-container');
        container.appendChild(toast);
        
        // Mostrar con animación
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Configurar cierre
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.close(toast);
        });
        
        // Auto-cierre después de la duración
        if (duration) {
            setTimeout(() => {
                this.close(toast);
            }, duration);
        }
        
        return toast;
    }
    
    /**
     * Cierra un toast
     * @param {HTMLElement} toast - Elemento toast a cerrar
     */
    close(toast) {
        toast.classList.remove('show');
        
        // Eliminar después de la animación
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 500);
    }
    
    /**
     * Muestra un toast de éxito
     * @param {string} title - Título del toast
     * @param {string} message - Mensaje del toast
     * @param {number} duration - Duración en ms
     */
    success(title, message, duration) {
        return this.show({ title, message, type: 'success', duration });
    }
    
    /**
     * Muestra un toast de error
     * @param {string} title - Título del toast
     * @param {string} message - Mensaje del toast
     * @param {number} duration - Duración en ms
     */
    error(title, message, duration) {
        return this.show({ title, message, type: 'error', duration });
    }
    
    /**
     * Muestra un toast de información
     * @param {string} title - Título del toast
     * @param {string} message - Mensaje del toast
     * @param {number} duration - Duración en ms
     */
    info(title, message, duration) {
        return this.show({ title, message, type: 'info', duration });
    }
    
    /**
     * Muestra un toast de advertencia
     * @param {string} title - Título del toast
     * @param {string} message - Mensaje del toast
     * @param {number} duration - Duración en ms
     */
    warning(title, message, duration) {
        return this.show({ title, message, type: 'warning', duration });
    }
}

// Crear instancia global
window.toast = new Toast();
