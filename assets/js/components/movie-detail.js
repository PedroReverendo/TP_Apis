/**
 * Componente de detalle de película con soporte para favoritos autenticados
 */
import Helpers from '../utils/helpers.js';
import API from '../services/api.js';
import { getFavorites, addFavorite, deleteFavorite, isFavorite, isAuthenticated } from '../services/favorites-service.js';

class MovieDetail {
    /**
     * Renderiza los detalles de una película
     * @param {Object} movie - Datos de la película
     * @param {string} containerId - ID del contenedor
     */
    static async render(movie, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Verificar si la película está en favoritos (del servidor si está autenticado, local si no)
        let isFavoriteMovie = false;
        if (isAuthenticated()) {
            try {
                isFavoriteMovie = await isFavorite(movie.id);
            } catch (error) {
                console.warn('Error verificando favoritos del servidor, usando almacenamiento local:', error);
                // Fallback a almacenamiento local
                const favorites = Helpers.getFromStorage("favorites") || [];
                isFavoriteMovie = favorites.some((fav) => fav.id === movie.id);
            }
        } else {
            // Usuario no autenticado, usar almacenamiento local
            const favorites = Helpers.getFromStorage("favorites") || [];
            isFavoriteMovie = favorites.some((fav) => fav.id === movie.id);
        }

        // Formatear datos
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
        const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";
        const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}min` : "N/A";
        const genres = movie.genres ? movie.genres.map((g) => g.name).join(", ") : "N/A";

        // Determinar el color del rating
        const ratingColor = Helpers.getRatingColor(movie.vote_average);

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
                        
                        <button class="favorite-button ${isFavoriteMovie ? "active" : ""}" id="favorite-button">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${isFavoriteMovie ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            <span class="button-text">${isFavoriteMovie ? "Quitar de favoritos" : "Agregar a favoritos"}</span>
                            <span class="button-loading" style="display: none;">
                                <svg class="loading-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                                </svg>
                                Procesando...
                            </span>
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
        `;

        // Configurar el botón de favoritos
        const favoriteButton = document.getElementById("favorite-button");
        if (favoriteButton) {
            favoriteButton.addEventListener("click", async (e) => {
                e.preventDefault();
                await this.handleFavoriteToggle(movie, favoriteButton);
            });
        }

        // Añadir efecto de parallax al hacer scroll
        window.addEventListener("scroll", () => {
            const scrollPosition = window.scrollY;
            const posterContainer = document.querySelector(".movie-poster-container");
            if (posterContainer) {
                posterContainer.style.transform = `translateY(${scrollPosition * 0.05}px)`;
            }
        });
    }

    /**
     * Maneja el toggle de favoritos (servidor o local)
     * @param {Object} movie - Datos de la película
     * @param {HTMLElement} button - Botón de favoritos
     */
    static async handleFavoriteToggle(movie, button) {
        const buttonText = button.querySelector('.button-text');
        const buttonLoading = button.querySelector('.button-loading');
        const starSvg = button.querySelector('svg:first-child');

        // Mostrar estado de carga
        button.disabled = true;
        buttonText.style.display = 'none';
        buttonLoading.style.display = 'inline-flex';

        try {
            let wasAdded = false;

            if (isAuthenticated()) {
                // Usuario autenticado: usar servidor
                wasAdded = await this.toggleFavoriteServer(movie);
            } else {
                // Usuario no autenticado: usar almacenamiento local
                wasAdded = this.toggleFavoriteLocal(movie);
            }

            // Actualizar UI
            button.classList.toggle("active");
            const isActive = button.classList.contains("active");
            
            starSvg.setAttribute('fill', isActive ? 'currentColor' : 'none');
            buttonText.textContent = isActive ? "Quitar de favoritos" : "Agregar a favoritos";

            // Mostrar toast
            if (window.toast) {
                if (wasAdded) {
                    window.toast.success("¡Película añadida!", `"${movie.title}" ha sido añadida a tus favoritos.`);
                } else {
                    window.toast.info("Película eliminada", `"${movie.title}" ha sido eliminada de tus favoritos.`);
                }
            }

        } catch (error) {
            console.error('Error al manejar favoritos:', error);
            
            // Mostrar error al usuario
            if (window.toast) {
                if (error.message.includes('autenticado') || error.message.includes('Sesión expirada')) {
                    window.toast.error("Sesión expirada", "Por favor, inicia sesión para gestionar favoritos.");
                    // Redirigir al login después de un momento
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    window.toast.error("Error", "No se pudo actualizar favoritos. Intenta de nuevo.");
                }
            }
        } finally {
            // Ocultar estado de carga
            button.disabled = false;
            buttonText.style.display = 'inline';
            buttonLoading.style.display = 'none';
        }
    }

    /**
     * Alterna favoritos en el servidor
     * @param {Object} movie - Película
     * @returns {Promise<boolean>} True si se añadió, false si se eliminó
     */
    static async toggleFavoriteServer(movie) {
        const isCurrentlyFavorite = await isFavorite(movie.id);

        if (isCurrentlyFavorite) {
            await deleteFavorite(movie.id);
            return false;
        } else {
            await addFavorite(movie);
            return true;
        }
    }

    /**
     * Alterna favoritos en almacenamiento local (fallback)
     * @param {Object} movie - Película
     * @returns {boolean} True si se añadió, false si se eliminó
     */
    static toggleFavoriteLocal(movie) {
        const favorites = Helpers.getFromStorage("favorites") || [];
        const index = favorites.findIndex((fav) => fav.id === movie.id);

        if (index !== -1) {
            // Eliminar de favoritos
            favorites.splice(index, 1);
            Helpers.saveToStorage("favorites", favorites);
            return false;
        } else {
            // Agregar a favoritos
            favorites.push({
                id: movie.id,
                title: movie.title,
                poster_path: movie.poster_path,
                vote_average: movie.vote_average,
                release_date: movie.release_date,
                overview: movie.overview || '',
                genres: movie.genres || []
            });
            Helpers.saveToStorage("favorites", favorites);
            return true;
        }
    }

    /**
     * Renderiza el cast de la película
     * @param {Array} cast - Lista de actores
     * @returns {string} HTML del cast
     */
    static renderCast(cast) {
        if (!cast || cast.length === 0) {
            return "<p>No hay información del cast disponible.</p>";
        }

        // Limitar a 8 actores
        const limitedCast = cast.slice(0, 8);

        return limitedCast
            .map((actor) => {
                // Obtener la imagen del actor o usar un placeholder
                const profilePath = actor.profile_path
                    ? API.getImageUrl(actor.profile_path, "w185")
                    : "/placeholder.svg?height=180&width=150";

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
                `;
            })
            .join("");
    }
}

export default MovieDetail;