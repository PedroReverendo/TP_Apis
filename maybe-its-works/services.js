// services.js

const API_BASE = "http://localhost:3000/api/users"

// --- AUTH / USER SESSION ---

export async function registerUser({ username, email, password }) {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Error registrando usuario")
  }
  return await res.json()
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || "Error iniciando sesión")
  }
  const data = await res.json()
  // Guardar token en localStorage o donde prefieras
  localStorage.setItem("token", data.token)
  return data
}

export async function fetchUserProfile() {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("No autenticado")

  const res = await fetch(`${API_BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Error obteniendo perfil")
  }

  return await res.json()
}

export function logoutUser() {
  localStorage.removeItem("token")
}

// --- FAVORITES ---

export async function getFavorites() {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("No autenticado")

  const res = await fetch(`${API_BASE}/favorites`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Error obteniendo favoritos")
  }
  const data = await res.json()
  return data.favorites
}

export async function addFavorite(movie) {
  // movie debe tener { movieId, title, posterPath }
  const token = localStorage.getItem("token")
  if (!token) throw new Error("No autenticado")

  const res = await fetch(`${API_BASE}/favorites`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(movie)
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Error agregando favorito")
  }
  return await res.json()
}

export async function removeFavorite(movieId) {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("No autenticado")

  const res = await fetch(`${API_BASE}/favorites/${movieId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Error eliminando favorito")
  }
  return await res.json()
}
