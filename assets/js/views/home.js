
/**
 * Vista de la página principal
 */
import Helpers from '../utils/helpers.js';
import Navbar  from '../components/navbar.js';
import API  from '../services/api.js';
import Search  from '../components/search.js';
import MovieCard from '../components/card.js';

class HomeView {
  constructor() {
    this.moviesContainer = document.getElementById("movies-container")
    this.sectionTitle = document.querySelector(".section-title")
    this.currentPage = 1
    this.totalPages = 1
    this.currentType = Helpers.getUrlParam("type") || "movie"
    this.currentSearch = Helpers.getUrlParam("search") || ""
    this.showingFavorites = Helpers.getUrlParam("favorites") === "true"
    this.currentGenre = Helpers.getUrlParam("genre") ? Number.parseInt(Helpers.getUrlParam("genre")) : null
    this.currentYear = Helpers.getUrlParam("year") ? Number.parseInt(Helpers.getUrlParam("year")) : null

    // Elemento para mostrar filtros activos
    this.activeFiltersContainer = document.createElement("div")
    this.activeFiltersContainer.className = "active-filters"

    this.init()
  }

  /**
   * Inicializa la vista
   */
  async init() {
    // Inicializar componentes
    this.navbar = new Navbar()
    new Search()

    // Insertar contenedor de filtros activos después del título
    if (this.sectionTitle && this.sectionTitle.parentNode) {
      this.sectionTitle.parentNode.insertBefore(this.activeFiltersContainer, this.sectionTitle.nextSibling)
    }

    // Configurar filtros
    await this.setupFilters()

    // Cargar películas
    await this.loadMovies()

    // Configurar eventos
    this.setupEvents()
  }

  /**
   * Configura los filtros
   */
  async setupFilters() {
    // Configurar filtro de géneros
    try {
      const genresResponse = await API.getMovieGenres()
      const genres = genresResponse.genres

      // Añadir "Todos" al principio
      genres.unshift({ id: null, name: "Todos los géneros" })

      this.navbar.fillDropdown(
        "genre-dropdown",
        genres,
        (genre) => {
          // Actualizar URL con el nuevo filtro
          const url = new URL(window.location.href)

          if (genre.id === null) {
            url.searchParams.delete("genre")
          } else {
            url.searchParams.set("genre", genre.id)
          }

          // Resetear página
          url.searchParams.delete("page")

          // Navegar a la nueva URL
          window.history.pushState({}, "", url.toString())

          this.currentGenre = genre.id
          this.currentPage = 1
          this.loadMovies()
          this.updateActiveFilters()
        },
        this.currentGenre,
      )
    } catch (error) {
      console.error("Error loading genres:", error)
    }

    // Configurar filtro de años
    const currentYear = new Date().getFullYear()
    const years = [{ id: null, name: "Todos los años" }]

    // Añadir años desde el actual hasta 20 años atrás
    for (let i = 0; i < 20; i++) {
      years.push({
        id: currentYear - i,
        name: (currentYear - i).toString(),
      })
    }

    this.navbar.fillDropdown(
      "year-dropdown",
      years,
      (year) => {
        // Actualizar URL con el nuevo filtro
        const url = new URL(window.location.href)

        if (year.id === null) {
          url.searchParams.delete("year")
        } else {
          url.searchParams.set("year", year.id)
        }

        // Resetear página
        url.searchParams.delete("page")

        // Navegar a la nueva URL
        window.history.pushState({}, "", url.toString())

        this.currentYear = year.id
        this.currentPage = 1
        this.loadMovies()
        this.updateActiveFilters()
      },
      this.currentYear,
    )

    // Configurar filtro de tipo
    const types = [
      { id: "movie", name: "Películas" },
      { id: "tv", name: "Series" },
    ]

    this.navbar.fillDropdown(
      "type-dropdown",
      types,
      (type) => {
        // Actualizar URL con el nuevo filtro
        const url = new URL(window.location.href)

        if (type.id === "movie") {
          url.searchParams.delete("type")
        } else {
          url.searchParams.set("type", type.id)
        }

        // Resetear página
        url.searchParams.delete("page")

        // Navegar a la nueva URL
        window.history.pushState({}, "", url.toString())

        this.currentType = type.id
        this.currentPage = 1
        this.loadMovies()
        this.updateActiveFilters()
      },
      this.currentType,
    )

    // Actualizar filtros activos
    this.updateActiveFilters()
  }

  /**
   * Actualiza la visualización de filtros activos
   */
  updateActiveFilters() {
    this.activeFiltersContainer.innerHTML = ""

    // Mostrar filtro de tipo
    if (this.currentType === "tv") {
      this.addFilterTag("Tipo: Series", () => {
        const url = new URL(window.location.href)
        url.searchParams.delete("type")
        window.history.pushState({}, "", url.toString())
        this.currentType = "movie"
        this.currentPage = 1
        this.loadMovies()
        this.updateActiveFilters()
      })
    }

    // Mostrar filtro de género
    if (this.currentGenre) {
      // Obtener el nombre del género
      const genreDropdown = document.getElementById("genre-dropdown")
      let genreName = "Género"

      if (genreDropdown) {
        const activeItem = genreDropdown.querySelector(`.dropdown-item[data-id="${this.currentGenre}"]`)
        if (activeItem) {
          genreName = activeItem.textContent
        }
      }

      this.addFilterTag(`Género: ${genreName}`, () => {
        const url = new URL(window.location.href)
        url.searchParams.delete("genre")
        window.history.pushState({}, "", url.toString())
        this.currentGenre = null
        this.currentPage = 1
        this.loadMovies()
        this.updateActiveFilters()
      })
    }

    // Mostrar filtro de año
    if (this.currentYear) {
      this.addFilterTag(`Año: ${this.currentYear}`, () => {
        const url = new URL(window.location.href)
        url.searchParams.delete("year")
        window.history.pushState({}, "", url.toString())
        this.currentYear = null
        this.currentPage = 1
        this.loadMovies()
        this.updateActiveFilters()
      })
    }

    // Mostrar filtro de búsqueda
    if (this.currentSearch) {
      this.addFilterTag(`Búsqueda: ${this.currentSearch}`, () => {
        const url = new URL(window.location.href)
        url.searchParams.delete("search")
        window.history.pushState({}, "", url.toString())
        this.currentSearch = ""
        this.currentPage = 1
        this.loadMovies()
        this.updateActiveFilters()
      })
    }

    // Mostrar filtro de favoritos
    if (this.showingFavorites) {
      this.addFilterTag("Favoritos", () => {
        const url = new URL(window.location.href)
        url.searchParams.delete("favorites")
        window.history.pushState({}, "", url.toString())
        this.showingFavorites = false
        this.currentPage = 1
        this.loadMovies()
        this.updateActiveFilters()
      })
    }
  }

  /**
   * Añade una etiqueta de filtro activo
   * @param {string} text - Texto de la etiqueta
   * @param {Function} onRemove - Función a ejecutar al eliminar
   */
  addFilterTag(text, onRemove) {
    const tag = document.createElement("div")
    tag.className = "filter-tag"
    tag.innerHTML = `
      ${text} <span class="filter-tag-close">×</span>
    `

    const closeBtn = tag.querySelector(".filter-tag-close")
    if (closeBtn) {
      closeBtn.addEventListener("click", onRemove)
    }

    this.activeFiltersContainer.appendChild(tag)
  }

  /**
   * Configura los eventos
   */
  setupEvents() {
    // Evento de búsqueda
    document.addEventListener("app:search", (e) => {
      // Actualizar URL con la búsqueda
      const url = new URL(window.location.href)
      url.searchParams.set("search", e.detail.query)
      window.history.pushState({}, "", url.toString())

      this.currentSearch = e.detail.query
      this.currentPage = 1
      this.loadMovies()
      this.updateActiveFilters()
    })

    // Evento de scroll para cargar más películas
    window.addEventListener(
      "scroll",
      Helpers.debounce(() => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
          if (this.currentPage < this.totalPages) {
            this.currentPage++
            this.loadMovies(true)
          }
        }
      }, 200),
    )
  }

  /**
   * Carga las películas según los filtros
   * @param {boolean} append - Indica si se deben agregar a las existentes
   */
  async loadMovies(append = false) {
    if (!this.moviesContainer) return

    // Mostrar indicador de carga si no es append
    if (!append) {
      this.moviesContainer.innerHTML =
        '<div class="loading"><div class="loading-spinner"></div><p>Cargando películas...</p></div>'
    }

    try {
      let movies = []
      const isTVShow = this.currentType === "tv"

      // Actualizar título de la sección
      if (this.sectionTitle) {
        if (this.showingFavorites) {
          this.sectionTitle.textContent = "Mis Favoritos"
        } else if (this.currentSearch) {
          this.sectionTitle.textContent = `Resultados para: ${this.currentSearch}`
        } else if (this.currentGenre) {
          // Obtener el nombre del género
          const genreDropdown = document.getElementById("genre-dropdown")
          let genreName = "Género"

          if (genreDropdown) {
            const activeItem = genreDropdown.querySelector(`.dropdown-item[data-id="${this.currentGenre}"]`)
            if (activeItem) {
              genreName = activeItem.textContent
            }
          }

          this.sectionTitle.textContent = genreName
        } else if (this.currentYear) {
          this.sectionTitle.textContent = `Películas de ${this.currentYear}`
        } else {
          this.sectionTitle.textContent = isTVShow ? "Series" : "Películas"
        }
      }

      // Mostrar favoritos
      if (this.showingFavorites) {
        const favorites = Helpers.getFromStorage("favorites") || []
        movies = favorites
        this.totalPages = 1 // Solo una página para favoritos
      }
      // Buscar películas
      else if (this.currentSearch) {
        const response = await API.searchMovies(this.currentSearch, this.currentPage)
        movies = response.results
        this.totalPages = response.total_pages
      }
      // Filtrar por género
      else if (this.currentGenre) {
        const response = await API.getMoviesByGenre(this.currentGenre, this.currentPage)
        movies = response.results
        this.totalPages = response.total_pages
      }
      // Filtrar por año
      else if (this.currentYear) {
        const response = await API.getMoviesByYear(this.currentYear, this.currentPage)
        movies = response.results
        this.totalPages = response.total_pages
      }
      // Mostrar películas o series populares
      else {
        const response = isTVShow
          ? await API.getPopularTVShows(this.currentPage)
          : await API.getPopularMovies(this.currentPage)
        movies = response.results
        this.totalPages = response.total_pages
      }

      // Renderizar películas
      if (append) {
        // Agregar más películas al contenedor existente
        movies.forEach((movie) => {
          const card = MovieCard.create(movie, isTVShow)
          this.moviesContainer.appendChild(card)
        })
      } else {
        // Reemplazar todas las películas
        if (movies.length === 0) {
          this.moviesContainer.innerHTML = `
            <div class="no-results">
              <p>No se encontraron resultados.</p>
              <p>Intenta con otros filtros o términos de búsqueda.</p>
            </div>
          `
        } else {
          this.moviesContainer.innerHTML = ""
          movies.forEach((movie) => {
            const card = MovieCard.create(movie, isTVShow)
            this.moviesContainer.appendChild(card)
          })
        }
      }
    } catch (error) {
      console.error("Error loading movies:", error)
      if (!append) {
        this.moviesContainer.innerHTML = `
          <div class="error-message">
            <p>Ha ocurrido un error al cargar las películas.</p>
            <p>Por favor, intenta de nuevo más tarde.</p>
          </div>
        `
      }
    }
  }
}

export default HomeView;
