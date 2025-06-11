import Helpers from '../utils/helpers.js';
import API from '../services/api.js'; 
import MovieDetail from '../components/movie-detail.js';
import Navbar from '../components/navbar.js';
import { syncFavorites, isAuthenticated } from '../services/favorites-service.js';

class MovieDetailView {
    constructor() {
        this.movieId = Helpers.getUrlParam('id');
        this.init();
    }
    
    async init() {
        // Inicializar navbar
        new Navbar();

        // Sincronizar favoritos si el usuario está autenticado
        if (isAuthenticated()) {
            try {
                await syncFavorites();
            } catch (error) {
                console.warn('No se pudieron sincronizar favoritos:', error);
            }
        }

        if (this.movieId) {
            await this.loadMovieDetails();
        } else {
            document.getElementById('movie-detail').innerHTML = `
                <div class="error-message">
                    <p>No se ha especificado una película.</p>
                    <p><a href="index.html">Volver a la página principal</a></p>
                </div>
            `;
        }
    }
    
    async loadMovieDetails() {
        try {
            // Mostrar loading mientras se cargan los datos
            document.getElementById('movie-detail').innerHTML = `
                <div class="loading">
                    <div class="loading-spinner"></div>
                    <p>Cargando detalles de la película...</p>
                </div>
            `;

            const movie = await API.getMovieDetails(this.movieId);
            
            // Renderizar los detalles (ahora es async)
            await MovieDetail.render(movie, 'movie-detail');
            
            // Actualizar el título de la página
            document.title = `${movie.title} - PelisPRO`;
            
        } catch (error) {
            console.error('Error loading movie details:', error);
            document.getElementById('movie-detail').innerHTML = `
                <div class="error-message">
                    <p>Ha ocurrido un error al cargar los detalles de la película.</p>
                    <p>Por favor, intenta de nuevo más tarde.</p>
                    <p><a href="index.html">Volver a la página principal</a></p>
                </div>
            `;
        }
    }
}

export default MovieDetailView;