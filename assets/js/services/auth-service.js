// auth-service.js
class AuthService {
    constructor() {
        this.baseURL = 'http://localhost:3000/api/users'; // Ajusta según tu configuración
        this.tokenKey = 'pelispro_token';
        // this.userKey = 'pelispro_user';
    }

    // Registro de usuario
    async register(userData) {
        try {
            const response = await fetch(`${this.baseURL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en el registro');
            }

            // Guardar token y datos del usuario
            if (data.token) {
                this.saveToken(data.token);
                this.saveUser(data.user);
            }

            return data;
        } catch (error) {
            console.error('Error en register:', error);
            throw error;
        }
    }

    // Inicio de sesión
    async login(credentials) {
        try {
            const response = await fetch(`${this.baseURL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en el login');
            }

            // Guardar token y datos del usuario
            if (data.token) {
                this.saveToken(data.token);
                this.saveUser(data.user);
            }

            return data;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    // Cerrar sesión
    async logout() {
        try {
            const token = this.getToken();
            if (token) {
                await fetch(`${this.baseURL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });
            }
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            // Limpiar datos locales independientemente del resultado
            this.clearAuthData();
        }
    }

    // Verificar autenticación
    async verifyAuth() {
        try {
            const token = this.getToken();
            if (!token) {
                return false;
            }

            const response = await fetch(`${this.baseURL}/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                this.clearAuthData();
                return false;
            }

            const data = await response.json();
            return data.valid || false;
        } catch (error) {
            console.error('Error en verifyAuth:', error);
            this.clearAuthData();
            return false;
        }
    }

    // Obtener perfil del usuario
    async getUserProfile() {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const response = await fetch(`${this.baseURL}/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener perfil');
            }

            // Actualizar datos del usuario
            this.saveUser(data.user);
            return data;
        } catch (error) {
            console.error('Error en getUserProfile:', error);
            throw error;
        }
    }

    // Actualizar perfil
    async updateProfile(profileData) {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const response = await fetch(`${this.baseURL}/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al actualizar perfil');
            }

            // Actualizar datos del usuario
            this.saveUser(data.user);
            return data;
        } catch (error) {
            console.error('Error en updateProfile:', error);
            throw error;
        }
    }

    // Cambiar contraseña
    async changePassword(passwordData) {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const response = await fetch(`${this.baseURL}/change-password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(passwordData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al cambiar contraseña');
            }

            return data;
        } catch (error) {
            console.error('Error en changePassword:', error);
            throw error;
        }
    }

    // Recuperar contraseña
    async forgotPassword(email) {
        try {
            const response = await fetch(`${this.baseURL}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al enviar email de recuperación');
            }

            return data;
        } catch (error) {
            console.error('Error en forgotPassword:', error);
            throw error;
        }
    }

    // Resetear contraseña
    async resetPassword(resetData) {
        try {
            const response = await fetch(`${this.baseURL}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resetData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al resetear contraseña');
            }

            return data;
        } catch (error) {
            console.error('Error en resetPassword:', error);
            throw error;
        }
    }

    // Métodos para manejo de token y usuario
    saveToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    saveUser(user) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    getUser() {
        const userData = localStorage.getItem(this.userKey);
        return userData ? JSON.parse(userData) : null;
    }

    clearAuthData() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    }

    // Verificar si el usuario está autenticado (método rápido)
    isAuthenticated() {
        return !!this.getToken();
    }

    // Obtener headers con autorización
    getAuthHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }
}

export default AuthService;