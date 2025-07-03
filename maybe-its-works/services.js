// services.js

const API_BASE = "http://localhost:3000/api/users"
const COMMENTS_API_BASE = "http://localhost:3000/api/comments"

// --- AUTH / USER SESSION ---

export async function registerUser({ username, email, password }) {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Error registering user")
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
    throw new Error(errorData.message || "Error logging in")
  }
  const data = await res.json()
  // Save token in localStorage or wherever you prefer
  localStorage.setItem("token", data.token)
  return data
}

export async function fetchUserProfile() {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Not authenticated")

  const res = await fetch(`${API_BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Error fetching profile")
  }

  return await res.json()
}

export function logoutUser() {
  localStorage.removeItem("token")
}

// --- FAVORITES ---

export async function getFavorites() {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Not authenticated")

  const res = await fetch(`${API_BASE}/favorites`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Error fetching favorites")
  }
  const data = await res.json()
  return data.favorites
}

export async function addFavorite(movie) {
  // movie should have { movieId, title, posterPath }
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Not authenticated")

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
    throw new Error(errorData.error || "Error adding favorite")
  }
  return await res.json()
}

export async function removeFavorite(movieId) {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Not authenticated")

  const res = await fetch(`${API_BASE}/favorites/${movieId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Error removing favorite")
  }
  return await res.json()
}

// --- COMMENTS ---

// Get my comments (requires authentication)
export async function getMyComments() {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Not authenticated")

  const res = await fetch(`${COMMENTS_API_BASE}/mine`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Error fetching your comments")
  }

  return await res.json()
}

// Get public comments for a specific movie
export async function getMovieComments(movieId) {
  const res = await fetch(`${COMMENTS_API_BASE}/${movieId}`)

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Error fetching comments")
  }

  return await res.json()
}

// Add comment to a movie (requires authentication)
export async function addComment(movieId, content, movieTitle) {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Not authenticated")

  const res = await fetch(`${COMMENTS_API_BASE}/${movieId}`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ content, movieTitle })
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Error adding comment")
  }

  return await res.json()
}
