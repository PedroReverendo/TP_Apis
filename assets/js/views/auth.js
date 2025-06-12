/**
 * Vista de la página de autenticación
 */

import AuthService from '../services/auth-service.js';
import Helpers from '../utils/helpers.js';
import Navbar from '../components/navbar.js';

class AuthView {
    constructor() {
        this.signinForm = document.getElementById("signin-form")
        this.loginForm = document.getElementById("login-form")
        this.signinPanel = document.getElementById("signin-panel")
        this.loginPanel = document.getElementById("login-panel")
        this.tabs = document.querySelectorAll(".auth-tab")
        this.signinBackBtn = document.getElementById("signin-back")
        this.loginRegisterBtn = document.getElementById("login-register")
        this.authService = new AuthService()

        this.init()
    }

    /**
     * Inicializa la vista
     */
    async init() {
        // ✅ Verificar autenticación de manera más robusta
        try {
            // Verificar si hay token y si es válido
            if (this.authService.isAuthenticated()) {
                console.log('Token encontrado, verificando validez...');
                
                // Verificar token con el servidor
                const isValid = await this.authService.verifyAuth();
                
                if (isValid) {
                    console.log('Token válido, redirigiendo...');
                    window.location.href = "index.html";
                    return;
                } else {
                    console.log('Token inválido, limpiando datos...');
                    // Token inválido, limpiar datos
                    this.authService.clearAuthData();
                }
            }
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            // En caso de error, limpiar datos por seguridad
            this.authService.clearAuthData();
        }

        // Configurar eventos de formularios
        this.setupForms()

        // Configurar eventos de navegación
        this.setupNavigation()

        // Configurar animación de fondo
        this.setupBackground()
    }

    /**
     * Configura los formularios
     */
    setupForms() {
        // Formulario de registro
        if (this.signinForm) {
            this.signinForm.addEventListener("submit", async (e) => {
                e.preventDefault()

                // Validar formulario
                if (!this.validateForm(this.signinForm)) return

                // Obtener datos del formulario
                const formData = new FormData(this.signinForm)
                const userData = {
                    name: formData.get("name"),
                    email: formData.get("email"),
                    password: formData.get("password"),
                }

                // Mostrar estado de carga
                this.signinForm.classList.add("auth-form-loading")

                try {
                    // Enviar petición de registro
                    const response = await this.authService.register(userData)

                    // ✅ Verificar que la respuesta contenga los datos esperados
                    if (response && response.user && response.token) {
                        // Mostrar mensaje de éxito
                        window.toast.success("Registro exitoso", `Bienvenido, ${response.user.name}! Redirigiendo...`)

                        // ✅ Debug para verificar qué se está guardando
                        console.log('Registro exitoso:', response);
                        this.authService.debugLocalStorage();

                        // Redireccionar después de un breve retraso
                        setTimeout(() => {
                            window.location.href = "index.html"
                        }, 1500)
                    } else {
                        throw new Error('Respuesta del servidor incompleta');
                    }
                } catch (error) {
                    console.error('Error en registro:', error);
                    // Mostrar mensaje de error
                    window.toast.error("Error en el registro", error.message || "Ha ocurrido un error. Inténtalo de nuevo.")

                    // Quitar estado de carga
                    this.signinForm.classList.remove("auth-form-loading")
                }
            })
        }

        // Formulario de inicio de sesión
        if (this.loginForm) {
            this.loginForm.addEventListener("submit", async (e) => {
                e.preventDefault()

                // Validar formulario
                if (!this.validateForm(this.loginForm)) return

                // Obtener datos del formulario
                const formData = new FormData(this.loginForm)
                const credentials = {
                    email: formData.get("email"),
                    password: formData.get("password"),
                }

                // Mostrar estado de carga
                this.loginForm.classList.add("auth-form-loading")

                try {
                    // Enviar petición de inicio de sesión
                    const response = await this.authService.login(credentials)

                    // ✅ Verificar que la respuesta contenga los datos esperados
                    if (response && response.user && response.token) {
                        // Mostrar mensaje de éxito
                        window.toast.success(
                            "Inicio de sesión exitoso",
                            `Bienvenido de nuevo, ${response.user.name}! Redirigiendo...`,
                        )

                        // ✅ Debug para verificar qué se está guardando
                        console.log('Login exitoso:', response);
                        this.authService.debugLocalStorage();

                        // Redireccionar después de un breve retraso
                        setTimeout(() => {
                            window.location.href = "index.html"
                        }, 1500)
                    } else {
                        throw new Error('Respuesta del servidor incompleta');
                    }
                } catch (error) {
                    console.error('Error en login:', error);
                    // Mostrar mensaje de error
                    window.toast.error(
                        "Error de inicio de sesión",
                        error.message || "Credenciales incorrectas. Inténtalo de nuevo.",
                    )

                    // Quitar estado de carga
                    this.loginForm.classList.remove("auth-form-loading")
                }
            })
        }
    }

    /**
     * Configura la navegación entre paneles
     */
    setupNavigation() {
        // Configurar tabs (para móviles)
        this.tabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                // Desactivar todos los tabs
                this.tabs.forEach((t) => t.classList.remove("active"))

                // Activar el tab actual
                tab.classList.add("active")

                // Mostrar el panel correspondiente
                const tabId = tab.dataset.tab

                if (tabId === "signin") {
                    this.signinPanel.classList.add("active")
                    this.loginPanel.classList.remove("active")
                } else {
                    this.loginPanel.classList.add("active")
                    this.signinPanel.classList.remove("active")
                }
            })
        })

        // Botón "Volver" en el panel de registro
        if (this.signinBackBtn) {
            this.signinBackBtn.addEventListener("click", () => {
                window.location.href = "index.html"
            })
        }

        // Botón "Crear Cuenta" en el panel de inicio de sesión
        if (this.loginRegisterBtn) {
            this.loginRegisterBtn.addEventListener("click", () => {
                // En móviles, cambiar al tab de registro
                if (window.innerWidth < 768) {
                    this.tabs.forEach((t) => t.classList.remove("active"))
                    this.tabs[0].classList.add("active")
                    this.signinPanel.classList.add("active")
                    this.loginPanel.classList.remove("active")
                } else {
                    // En escritorio, enfocar el primer campo del formulario de registro
                    const nameInput = document.getElementById("signin-name")
                    if (nameInput) nameInput.focus()
                }
            })
        }
    }

    /**
     * Configura la animación del fondo
     */
    setupBackground() {
        const gradient = document.querySelector(".background-gradient")
        if (!gradient) return

        gradient.style.backgroundSize = "cover"
        gradient.style.backgroundPosition = "center"
        gradient.style.backgroundBlendMode = "overlay"

        // Añadir animación de gradiente
        gradient.style.animation = "gradientAnimation 15s ease infinite"

        // Añadir keyframes si no existen
        if (!document.querySelector("#gradient-animation")) {
            const style = document.createElement("style")
            style.id = "gradient-animation"
            style.textContent = `
          @keyframes gradientAnimation {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
        `
            document.head.appendChild(style)
        }
    }

    /**
     * Valida un formulario
     * @param {HTMLFormElement} form - Formulario a validar
     * @returns {boolean} Resultado de la validación
     */
    validateForm(form) {
        let isValid = true

        // Eliminar mensajes de error anteriores
        form.querySelectorAll(".form-error").forEach((error) => error.remove())
        form.querySelectorAll(".input-error").forEach((input) => input.classList.remove("input-error"))

        // Validar cada campo
        form.querySelectorAll("input").forEach((input) => {
            if (input.hasAttribute("required") && !input.value.trim()) {
                isValid = false
                input.classList.add("input-error")

                // Añadir mensaje de error
                const errorMsg = document.createElement("div")
                errorMsg.className = "form-error"
                errorMsg.textContent = "Este campo es obligatorio"
                input.parentNode.appendChild(errorMsg)
            } else if (input.type === "email" && input.value.trim()) {
                // Validar formato de email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(input.value.trim())) {
                    isValid = false
                    input.classList.add("input-error")

                    // Añadir mensaje de error
                    const errorMsg = document.createElement("div")
                    errorMsg.className = "form-error"
                    errorMsg.textContent = "Ingresa un email válido"
                    input.parentNode.appendChild(errorMsg)
                }
            } else if (input.type === "password" && input.value.trim()) {
                // Validar longitud de contraseña
                if (input.value.length < 6) {
                    isValid = false
                    input.classList.add("input-error")

                    // Añadir mensaje de error
                    const errorMsg = document.createElement("div")
                    errorMsg.className = "form-error"
                    errorMsg.textContent = "La contraseña debe tener al menos 6 caracteres"
                    input.parentNode.appendChild(errorMsg)
                }
            }
        })

        return isValid
    }
}

// Inicializar la vista cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    new AuthView()
})

export default AuthView;