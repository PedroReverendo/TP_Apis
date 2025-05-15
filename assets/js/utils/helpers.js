/**
 * Utilidades y funciones helper
 */
const Helpers = {
  /**
   * Formatea una fecha en formato 'DD MMM YYYY'
   * @param {string} dateString - Fecha en formato ISO
   * @returns {string} Fecha formateada
   */
  formatDate(dateString) {
    if (!dateString) return "Fecha desconocida"

    const options = { day: "numeric", month: "short", year: "numeric" }
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", options)
  },

  /**
   * Trunca un texto a una longitud máxima
   * @param {string} text - Texto a truncar
   * @param {number} maxLength - Longitud máxima
   * @returns {string} Texto truncado
   */
  truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  },

  /**
   * Formatea un número a un porcentaje
   * @param {number} value - Valor a formatear
   * @returns {string} Porcentaje formateado
   */
  formatRating(value) {
    if (!value && value !== 0) return "N/A"

    // Convertir de escala 0-10 a 0-100
    const percentage = Math.round(value * 10)
    return `${percentage}`
  },

  /**
   * Obtiene el color de un rating según su valor
   * @param {number} rating - Rating en escala 0-10
   * @returns {string} Color en formato hexadecimal
   */
  getRatingColor(rating) {
    if (!rating && rating !== 0) return "#777"

    if (rating >= 7) return "#2ecc71" // Verde
    if (rating >= 5) return "#f1c40f" // Amarillo
    return "#e74c3c" // Rojo
  },

  /**
   * Obtiene parámetros de la URL
   * @param {string} param - Nombre del parámetro
   * @returns {string|null} Valor del parámetro
   */
  getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get(param)
  },

  /**
   * Guarda datos en localStorage
   * @param {string} key - Clave
   * @param {any} value - Valor
   */
  saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  },

  /**
   * Obtiene datos de localStorage
   * @param {string} key - Clave
   * @returns {any} Valor
   */
  getFromStorage(key) {
    const value = localStorage.getItem(key)
    if (!value) return null

    try {
      return JSON.parse(value)
    } catch (error) {
      console.error("Error parsing localStorage value:", error)
      return null
    }
  },

  /**
   * Genera un ID único
   * @returns {string} ID único
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  },

  /**
   * Debounce para funciones
   * @param {Function} func - Función a ejecutar
   * @param {number} wait - Tiempo de espera en ms
   * @returns {Function} Función con debounce
   */
  debounce(func, wait = 300) {
    let timeout

    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }

      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },
}
