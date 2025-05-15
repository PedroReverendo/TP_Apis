/**
 * Servicio para interactuar con la API de TMDB
 */
const API = {
    // Configuración de la API
    BASE_URL: 'https://api.themoviedb.org/3',
    API_KEY: 'adc1e99f5822a737bfe546b599c1ed2', // Nota: En producción, esto debería estar en un .env
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
    
    // Tamaños de imágenes
    POSTER_SIZES: {
        SMALL: 'w185',
        MEDIUM: 'w342',
        LARGE: 'w500',
        ORIGINAL: 'original'
    },
    
    // Opciones para las peticiones fetch
    getOptions() {
        return {
            method: 'GET',
            headers: {
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhZGMxZTk5ZjU4MjJhNzM3YmZlNTQ2YjU2OTljMWVkMiIsIm5iZiI6MS42NDU2NTczMDY3NjQ5OTk5ZSs5LCJzdWIiOiI2MjE2YmNkYWRmZTMxZDAwNmU0MTkxYmYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.qRN5QSJU0St8UBCMYe6MjpfoIgS7H1MLdWe0QSx19i4`,
                'accept': 'application/json'
            }
        };
    },
    
    /**
     * Obtiene la URL completa para una imagen
     * @param {string} path - Ruta de la imagen
     * @param {string} size - Tamaño de la imagen
     * @returns {string} URL completa de la imagen
     */
    getImageUrl(path, size = 'w342') {
        if (!path) return '/assets/img/no-image.jpg';
        return `${this.IMAGE_BASE_URL}/${size}${path}`;
    },
    
    /**
     * Realiza una petición a la API
     * @param {string} endpoint - Endpoint de la API
     * @returns {Promise} Promesa con la respuesta
     */
    async fetchFromAPI(endpoint) {
        try {
            const response = await fetch(`${this.BASE_URL}${endpoint}`, this.getOptions());
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching from API:', error);
            throw error;
        }
    },
    
    /**
     * Obtiene películas populares
     * @param {number} page - Número de página
     * @returns {Promise} Promesa con las películas populares
     */
    async getPopularMovies(page = 1) {
        return this.fetchFromAPI(`/movie/popular?language=es-ES&page=${page}`);
    },
    
    /**
     * Obtiene series populares
     * @param {number} page - Número de página
     * @returns {Promise} Promesa con las series populares
     */
    async getPopularTVShows(page = 1) {
        return this.fetchFromAPI(`/tv/popular?language=es-ES&page=${page}`);
    },
    
    /**
     * Busca películas por término
     * @param {string} query - Término de búsqueda
     * @param {number} page - Número de página
     * @returns {Promise} Promesa con los resultados de la búsqueda
     */
    async searchMovies(query, page = 1) {
        return this.fetchFromAPI(`/search/movie?query=${encodeURIComponent(query)}&language=es-ES&page=${page}`);
    },
    
    /**
     * Obtiene los detalles de una película
     * @param {number} movieId - ID de la película
     * @returns {Promise} Promesa con los detalles de la película
     */
    async getMovieDetails(movieId) {
        return this.fetchFromAPI(`/movie/${movieId}?language=es-ES&append_to_response=credits`);
    },
    
    /**
     * Obtiene los géneros de películas
     * @returns {Promise} Promesa con los géneros
     */
    async getMovieGenres() {
        return this.fetchFromAPI('/genre/movie/list?language=es-ES');
    },
    
    /**
     * Obtiene películas por género
     * @param {number} genreId - ID del género
     * @param {number} page - Número de página
     * @returns {Promise} Promesa con las películas del género
     */
    async getMoviesByGenre(genreId, page = 1) {
        return this.fetchFromAPI(`/discover/movie?with_genres=${genreId}&language=es-ES&page=${page}`);
    },
    
    /**
     * Obtiene películas por año
     * @param {number} year - Año
     * @param {number} page - Número de página
     * @returns {Promise} Promesa con las películas del año
     */
    async getMoviesByYear(year, page = 1) {
        return this.fetchFromAPI(`/discover/movie?primary_release_year=${year}&language=es-ES&page=${page}`);
    }
};