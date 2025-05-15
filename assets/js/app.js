/**
 * Punto de entrada de la aplicación
 */
document.addEventListener('DOMContentLoaded', () => {
    // Determinar la página actual
    const currentPage = window.location.pathname.split('/').pop();
    
    // Inicializar la vista correspondiente
    if (currentPage === 'index.html' || currentPage === '' || currentPage === '/') {
        new HomeView();
    } else if (currentPage === 'movie-detail.html') {
        new MovieDetailView();
    } else if (currentPage === 'log-in.html') {
        new AuthView();
    }
});