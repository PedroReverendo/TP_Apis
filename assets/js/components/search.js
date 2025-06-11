/**
 * Componente de búsqueda
 */
class Search {
    constructor() {
      this.searchInput = document.getElementById("search-input")
      this.searchButton = document.getElementById("search-button")
      this.searchContainer = document.querySelector(".search-container")
      this.init()
    }
  
    /**
     * Inicializa el componente
     */
    init() {
      if (!this.searchInput || !this.searchButton) return
  
      // Configurar evento de búsqueda
      this.searchButton.addEventListener("click", (e) => {
        e.preventDefault()
        this.performSearch()
      })
  
      // Configurar evento de Enter
      this.searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          this.performSearch()
        }
      })
  
      // Añadir efecto de enfoque al contenedor
      this.searchInput.addEventListener("focus", () => {
        this.searchContainer.classList.add("focused")
      })
  
      this.searchInput.addEventListener("blur", () => {
        this.searchContainer.classList.remove("focused")
      })
  
      // Configurar búsqueda en tiempo real con debounce
      this.searchInput.addEventListener(
        "input",
        this.debounce(() => {
          if (this.searchInput.value.length >= 3) {
            this.performSearch(false)
          } else if (this.searchInput.value.length === 0) {
            // Si se borra la búsqueda, limpiar el filtro
            const url = new URL(window.location.href)
            if (url.searchParams.has("search")) {
              url.searchParams.delete("search")
              window.history.pushState({}, "", url.toString())
  
              // Emitir evento de búsqueda vacía
              const searchEvent = new CustomEvent("app:search", {
                detail: { query: "" },
              })
              document.dispatchEvent(searchEvent)
            }
          }
        }, 500),
      )
  
      // Establecer el valor inicial desde la URL
      const searchParam = this.getUrlParam("search")
      if (searchParam) {
        this.searchInput.value = searchParam
      }
    }
  
    /**
     * Realiza la búsqueda
     * @param {boolean} navigate - Indica si debe navegar a la página de resultados
     */
    performSearch(navigate = true) {
      const query = this.searchInput.value.trim()
  
      if (!query) return
  
      if (navigate) {
        // Actualizar URL con la búsqueda
        const url = new URL(window.location.href)
        url.searchParams.set("search", query)
        window.history.pushState({}, "", url.toString())
      }
  
      // Emitir evento de búsqueda para que lo capture la página
      const searchEvent = new CustomEvent("app:search", {
        detail: { query },
      })
      document.dispatchEvent(searchEvent)
    }
  
    /**
     * Obtiene un parámetro de la URL
     * @param {string} param - Nombre del parámetro
     * @returns {string|null} - Valor del parámetro o null si no existe
     */
    getUrlParam(param) {
      const urlParams = new URLSearchParams(window.location.search)
      return urlParams.get(param)
    }
  
    /**
     * Función debounce para limitar la frecuencia de ejecución de una función
     * @param {Function} func - Función a ejecutar
     * @param {number} delay - Tiempo de espera en milisegundos
     * @returns {Function} - Función envuelta en debounce
     */
    debounce(func, delay) {
      let timeout
      return function (...args) {
        clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(this, args), delay)
      }
    }
  }
  
  export default Search;