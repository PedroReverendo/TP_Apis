// // favorites-service.js

// const API_BASE_URL = 'http://localhost:3000/api/users';

// /**
//  * Función para obtener el token JWT del localStorage
//  * @returns {string|null} Token JWT o null si no existe
//  */
// function getAuthToken() {
//     return localStorage.getItem('pelispro_token');
// }

// /**
//  * Función para verificar si el usuario está autenticado
//  * @returns {boolean} True si hay token, false si no
//  */
// function isAuthenticated() {
//     return !!getAuthToken();
// }

// /**
//  * Función helper para armar los headers de autenticación
//  * @returns {Object} Headers con autorización
//  */
// function getAuthHeaders() {
//     const pelispro_token = getAuthToken();
//     return {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${pelispro_token}`
//     };
// }

// /**
//  * Obtener todas las películas favoritas del usuario autenticado
//  * @returns {Promise<Array>} Lista de películas favoritas
//  */
// async function getFavorites() {
//     if (!isAuthenticated()) {
//         throw new Error('Usuario no autenticado');
//     }

//     try {
//         const response = await fetch(`${API_BASE_URL}/favorites`, {
//             method: 'GET',
//             headers: getAuthHeaders()
//         });

//         if (!response.ok) {
//             if (response.status === 401) {
//                 // Token expirado o inválido
//                 localStorage.removeItem('pelispro_token');
//                 localStorage.removeItem('user');
//                 throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
//             }
//             throw new Error(`Error al obtener favoritos: ${response.status}`);
//         }

//         const data = await response.json();
//         return data.favorites || [];
//     } catch (error) {
//         console.error('Error en getFavorites:', error);
//         throw error;
//     }
// }

// /**
//  * Agregar una película a favoritos
//  * @param {Object} movie - Datos de la película
//  * @returns {Promise<Array>} Lista actualizada de favoritos
//  */
// async function addFavorite(movie) {
//     if (!isAuthenticated()) {
//         throw new Error('Usuario no autenticado');
//     }

//     try {
//         const movieData = {
//             id: movie.id,
//             title: movie.title,
//             poster_path: movie.poster_path,
//             vote_average: movie.vote_average,
//             release_date: movie.release_date,
//             overview: movie.overview || '',
//             genres: movie.genres || []
//         };

//         const response = await fetch(`${API_BASE_URL}/favorites`, {
//             method: 'POST',
//             headers: getAuthHeaders(),
//             body: JSON.stringify(movieData)
//         });

//         if (!response.ok) {
//             if (response.status === 401) {
//                 localStorage.removeItem('pelispro_token');
//                 localStorage.removeItem('user');
//                 throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
//             }
            
//             const errorData = await response.json();
//             throw new Error(errorData.error || 'Error al agregar la película a favoritos');
//         }

//         const data = await response.json();
//         return data.favorites || [];
//     } catch (error) {
//         console.error('Error en addFavorite:', error);
//         throw error;
//     }
// }

// /**
//  * Eliminar una película de favoritos
//  * @param {number} movieId - ID de la película
//  * @returns {Promise<Array>} Lista actualizada de favoritos
//  */
// async function deleteFavorite(movieId) {
//     if (!isAuthenticated()) {
//         throw new Error('Usuario no autenticado');
//     }

//     try {
//         const response = await fetch(`${API_BASE_URL}/favorites/${movieId}`, {
//             method: 'DELETE',
//             headers: getAuthHeaders()
//         });

//         if (!response.ok) {
//             if (response.status === 401) {
//                 localStorage.removeItem('pelispro_token');
//                 localStorage.removeItem('user');
//                 throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
//             }
            
//             const errorData = await response.json();
//             throw new Error(errorData.error || 'Error al eliminar la película de favoritos');sa
//         }

//         const data = await response.json();
//         return data.favorites || [];
//     } catch (error) {
//         console.error('Error en deleteFavorite:', error);
//         throw error;
//     }
// }

// /**
//  * Verificar si una película está en favoritos
//  * @param {number} movieId - ID de la película
//  * @returns {Promise<boolean>} True si está en favoritos
//  */
// async function isFavorite(movieId) {
//     if (!isAuthenticated()) {
//         return false;
//     }

//     try {
//         const favorites = await getFavorites();
//         return favorites.some(fav => fav.id === movieId);
//     } catch (error) {
//         console.error('Error verificando favorito:', error);
//         return false;
//     }
// }

// /**
//  * Sincronizar favoritos locales con el servidor (fallback)
//  * @returns {Promise<void>}
//  */
// async function syncFavorites() {
//     if (!isAuthenticated()) {
//         return;
//     }

//     try {
//         // Obtener favoritos locales
//         const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
//         if (localFavorites.length > 0) {
//             // Intentar sincronizar cada favorito local
//             for (const movie of localFavorites) {
//                 try {
//                     await addFavorite(movie);
//                 } catch (error) {
//                     console.warn(`No se pudo sincronizar película ${movie.title}:`, error);
//                 }
//             }
            
//             // Limpiar favoritos locales después de sincronizar
//             localStorage.removeItem('favorites');
//         }
//     } catch (error) {
//         console.error('Error sincronizando favoritos:', error);
//     }
// }

// // Exportar las funciones
// export {
//     getFavorites,
//     addFavorite,
//     deleteFavorite,
//     isFavorite,
//     syncFavorites,
//     isAuthenticated
// };