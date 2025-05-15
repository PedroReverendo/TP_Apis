/**
 * Vista de la página de detalle de película
 */
class MovieDetailView {
    constructor() {
        this.movieId = Helpers.getUrlParam('id');
        this.init();
    }
    
    /**
     * Inicializa la vista
     */
    async init() {
        // Inicializar componentes
        new Navbar();
        
        // Cargar detalles de la película
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
    
    /**
     * Carga los detalles de la película
     */
    async loadMovieDetails() {
        try {
            const movie = await API.getMovieDetails(this.movieId);
            MovieDetail.render(movie, 'movie-detail');
            
            // Actualizar título de la página
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