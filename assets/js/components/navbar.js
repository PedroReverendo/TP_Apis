/**
 * Componente de navegación
 */
class Navbar {
  constructor() {
    this.init()
  }

  /**
   * Inicializa el componente
   */
  init() {
    this.setupNavigation()
    this.setupDropdowns()
  }

  /**
   * Configura la navegación
   */
  setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item")

    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        const text = item.textContent.trim().toLowerCase()

        if (text === "películas") {
          window.location.href = "index.html"
        } else if (text === "series") {
          window.location.href = "index.html?type=tv"
        }
      })
    })

    // Configurar el botón de favoritos
    const starIcon = document.querySelector(".star-icon")
    if (starIcon) {
      starIcon.addEventListener("click", () => {
        window.location.href = "index.html?favorites=true"
      })
    }
  }

  /**
   * Configura los dropdowns de filtros
   */
  setupDropdowns() {
    const filterButtons = document.querySelectorAll(".filter-button")

    filterButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation()

        const dropdown = button.nextElementSibling

        // Cerrar todos los dropdowns
        document.querySelectorAll(".dropdown-content").forEach((d) => {
          if (d !== dropdown) {
            d.classList.remove("active")
          }
        })

        // Alternar el dropdown actual
        dropdown.classList.toggle("active")
      })
    })

    // Cerrar dropdowns al hacer clic fuera
    document.addEventListener("click", () => {
      document.querySelectorAll(".dropdown-content").forEach((dropdown) => {
        dropdown.classList.remove("active")
      })
    })

    // Evitar que los clics en los dropdowns los cierren
    document.querySelectorAll(".dropdown-content").forEach((dropdown) => {
      dropdown.addEventListener("click", (e) => {
        e.stopPropagation()
      })
    })
  }

  /**
   * Llena un dropdown con opciones
   * @param {string} dropdownId - ID del dropdown
   * @param {Array} options - Opciones a mostrar
   * @param {Function} onSelect - Función a ejecutar al seleccionar
   * @param {string|number|null} activeValue - Valor actualmente seleccionado
   */
  fillDropdown(dropdownId, options, onSelect, activeValue = null) {
    const dropdown = document.getElementById(dropdownId)
    if (!dropdown) return

    // Obtener el botón asociado al dropdown
    const button = dropdown.previousElementSibling
    
    dropdown.innerHTML = ""

    options.forEach((option) => {
      const item = document.createElement("div")
      item.className = "dropdown-item"
      
      // Marcar como activo si corresponde
      if (option.id === activeValue) {
        item.classList.add("active")
        
        // Actualizar el texto del botón con la opción activa
        if (button) {
          button.innerHTML = `${option.name} <span>▼</span>`
        }
      }
      
      item.textContent = option.name
      item.dataset.id = option.id

      item.addEventListener("click", () => {
        // Actualizar el texto del botón
        if (button) {
          button.innerHTML = `${option.name} <span>▼</span>`
        }

        // Marcar este item como activo y desmarcar los demás
        dropdown.querySelectorAll('.dropdown-item').forEach(el => {
          el.classList.remove('active')
        })
        item.classList.add('active')

        onSelect(option)
        dropdown.classList.remove("active")
      })

      dropdown.appendChild(item)
    })
  }
}
export default Navbar;