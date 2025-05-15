/**
 * Componente de tarjeta de película
 */
class MovieCard {
  /**
   * Crea una tarjeta de película
   * @param {Object} movie - Datos de la película
   * @param {boolean} isTVShow - Indica si es una serie
   * @returns {HTMLElement} Elemento de la tarjeta
   */
  static create(movie, isTVShow = false) {
    const card = document.createElement("div")
    card.className = "movie-card"
    card.dataset.id = movie.id

    // Determinar la fecha según el tipo
    const releaseDate = isTVShow ? movie.first_air_date : movie.release_date
    const formattedDate = Helpers.formatDate(releaseDate)

    // Determinar el título según el tipo
    const title = isTVShow ? movie.name : movie.title

    // Calcular el rating
    const rating = Helpers.formatRating(movie.vote_average)
    const ratingColor = Helpers.getRatingColor(movie.vote_average)

    card.innerHTML = `
            <img 
                src="${API.getImageUrl(movie.poster_path, API.POSTER_SIZES.MEDIUM)}" 
                alt="${title}" 
                class="movie-poster"
                loading="lazy"
            >
            <div class="movie-info">

              <div class="position-info">
                  <div class="text-width">
                      <h3 class="movie-title">${title}</h3>
                      <p class="movie-date">${formattedDate}</p>
                  </div>
                  <div class="movie-rating" style="border-color: ${ratingColor}">
                  ${rating}
                  </div>
              </div>

            </div>
        `

    // Agregar evento de clic para navegar al detalle
    card.addEventListener("click", () => {
      // Siempre usar movie-detail.html para ambos tipos
      window.location.href = `movie-detail.html?id=${movie.id}`
    })

    return card
  }

  /**
   * Renderiza múltiples tarjetas en un contenedor
   * @param {Array} movies - Lista de películas
   * @param {string} containerId - ID del contenedor
   * @param {boolean} isTVShow - Indica si son series
   */
  static renderMultiple(movies, containerId, isTVShow = false) {
    const container = document.getElementById(containerId)
    if (!container) return

    container.innerHTML = ""

    if (!movies || movies.length === 0) {
      container.innerHTML = '<p class="no-results">No se encontraron resultados</p>'
      return
    }

    movies.forEach((movie) => {
      const card = this.create(movie, isTVShow)
      container.appendChild(card)
    })
  }
}

// Import necessary modules or declare variables
// Assuming Helpers and API are defined in separate files, import them.
// If they are part of the same file or global scope, this is not needed.
// Example using ES modules:
// import { Helpers } from './helpers.js';
// import { API } from './api.js';

// Example if they are global variables (ensure they are defined elsewhere):
// const Helpers = window.Helpers; // Or however Helpers is exposed
// const API = window.API; // Or however API is exposed
