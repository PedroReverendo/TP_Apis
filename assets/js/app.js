/**
 * Punto de entrada de la aplicación
 */
import HomeView from './views/home.js';
import MovieDetailView from './views/movie-detail.js';
import AuthView from './views/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'index.html' || currentPage === '' || currentPage === '/') {
        new HomeView();
    } else if (currentPage === 'movie-detail.html') {
        new MovieDetailView();
    } else if (currentPage === 'log-in.html') {
        new AuthView();
    }
});
