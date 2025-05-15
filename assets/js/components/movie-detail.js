/**
 * Componente de detalle de película
 */
class MovieDetail {
  /**
   * Renderiza los detalles de una película
   * @param {Object} movie - Datos de la película
   * @param {string} containerId - ID del contenedor
   */
  static render(movie, containerId) {
    const container = document.getElementById(containerId)
    if (!container) return

    // Verificar si la película está en favoritos
    const favorites = Helpers.getFromStorage("favorites") || []
    const isFavorite = favorites.some((fav) => fav.id === movie.id)

    // Formatear datos
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"
    const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}min` : "N/A"
    const genres = movie.genres ? movie.genres.map((g) => g.name).join(", ") : "N/A"

    // Determinar el color del rating
    const ratingColor = Helpers.getRatingColor(movie.vote_average)

    container.innerHTML = `
            <div class="movie-detail-content">
                <div class="movie-poster-container">
                    <div class="rating-badge" style="border-color: ${ratingColor}">${rating}</div>
                    <img 
                        src="${API.getImageUrl(movie.poster_path, API.POSTER_SIZES.LARGE)}" 
                        alt="${movie.title}" 
                        class="movie-poster-large"
                        loading="lazy"
                    >
                </div>
                
                <div class="movie-info-container">
                    <div class="movie-header">
                        <h1 class="movie-title-large">${movie.title}</h1>
                        
                        <button class="favorite-button ${isFavorite ? "active" : ""}" id="favorite-button">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${isFavorite ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            ${isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                        </button>
                    </div>
                    
                    <div class="movie-info-grid">
                        <div class="movie-info-item">
                            <span class="info-label">Rating</span>
                            <span class="info-value">${rating}</span>
                        </div>
                        
                        <div class="movie-info-item">
                            <span class="info-label">Año de lanzamiento</span>
                            <span class="info-value">${releaseYear}</span>
                        </div>
                        
                        <div class="movie-info-item">
                            <span class="info-label">Género</span>
                            <span class="info-value">${genres}</span>
                        </div>
                        
                        <div class="movie-info-item">
                            <span class="info-label">Duración</span>
                            <span class="info-value">${runtime}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="movie-description">
                <h2 class="description-title">Descripción</h2>
                <p class="description-text">${movie.overview || "No hay descripción disponible."}</p>
            </div>
            
            <div class="cast-section">
                <h2 class="cast-title">Actores Principales</h2>
                <div class="cast-list" id="cast-list">
                    ${this.renderCast(movie.credits?.cast)}
                </div>
            </div>
        `

    // Configurar el botón de favoritos
    const favoriteButton = document.getElementById("favorite-button")
    if (favoriteButton) {
      favoriteButton.addEventListener("click", () => {
        const wasAdded = this.toggleFavorite(movie)
        favoriteButton.classList.toggle("active")

        // Actualizar el texto del botón
        favoriteButton.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${favoriteButton.classList.contains("active") ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    ${favoriteButton.classList.contains("active") ? "Quitar de favoritos" : "Agregar a favoritos"}
                `

        // Mostrar toast
        if (window.toast) {
          if (wasAdded) {
            window.toast.success("¡Película añadida!", `"${movie.title}" ha sido añadida a tus favoritos.`)
          } else {
            window.toast.info("Película eliminada", `"${movie.title}" ha sido eliminada de tus favoritos.`)
          }
        }
      })
    }

    // Añadir efecto de parallax al hacer scroll
    window.addEventListener("scroll", () => {
      const scrollPosition = window.scrollY
      const posterContainer = document.querySelector(".movie-poster-container")
      if (posterContainer) {
        posterContainer.style.transform = `translateY(${scrollPosition * 0.05}px)`
      }
    })
  }

  /**
   * Renderiza el cast de la película
   * @param {Array} cast - Lista de actores
   * @returns {string} HTML del cast
   */
  static renderCast(cast) {
    if (!cast || cast.length === 0) {
      return "<p>No hay información del cast disponible.</p>"
    }

    // Limitar a 8 actores
    const limitedCast = cast.slice(0, 8)

    return limitedCast
      .map((actor) => {
        // Obtener la imagen del actor o usar un placeholder
        const profilePath = actor.profile_path
          ? API.getImageUrl(actor.profile_path, "w185")
          : "/placeholder.svg?height=180&width=150"

        return `
                <div class="cast-item">
                    <img 
                        src="${profilePath}" 
                        alt="${actor.name}" 
                        class="cast-avatar"
                        loading="lazy"
                        onerror="this.src='/placeholder.svg?height=180&width=150'; this.onerror=null;"
                    >
                    <div class="cast-info">
                        <div class="cast-name">${actor.name}</div>
                        <div class="cast-role">${actor.character || "Actor"}</div>
                    </div>
                </div>
            `
      })
      .join("")
  }

  /**
   * Alterna una película en favoritos
   * @param {Object} movie - Película a alternar
   * @returns {boolean} Indica si se añadió (true) o se eliminó (false)
   */
  static toggleFavorite(movie) {
    const favorites = Helpers.getFromStorage("favorites") || []

    const index = favorites.findIndex((fav) => fav.id === movie.id)

    if (index !== -1) {
      // Eliminar de favoritos
      favorites.splice(index, 1)
      Helpers.saveToStorage("favorites", favorites)
      return false
    } else {
      // Agregar a favoritos
      favorites.push({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
      })
      Helpers.saveToStorage("favorites", favorites)
      return true
    }
  }
}