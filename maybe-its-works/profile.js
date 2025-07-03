const API_BASE = "http://localhost:3000/api/users";
import { getMyComments } from './services.js';

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión");
    window.location.href = "auth.html";
    return;
  }

  cargarUsuario(token);
  cargarFavoritos(token);
  cargarMisComentarios(); // ← Agregamos esta línea

  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "auth.html";
  });
});

async function cargarUsuario(token) {
  try {
    const res = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error cargando usuario");
    const user = await res.json();

    const userInfo = document.getElementById("user-info");
    userInfo.innerHTML = `
      <p><strong>Usuario:</strong> ${user.username}</p>
      <p><strong>Email:</strong> ${user.email}</p>
    `;
  } catch (error) {
    alert("Error cargando perfil");
    console.error(error);
  }
}

async function cargarFavoritos(token) {
  try {
    const res = await fetch(`${API_BASE}/favorites`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error cargando favoritos");
    const data = await res.json();

    const favList = document.getElementById("favorites-list");
    favList.innerHTML = "";

    if (data.favorites.length === 0) {
      favList.innerHTML = "<p>No tenés películas favoritas aún.</p>";
      return;
    }

    data.favorites.forEach(fav => {
      const div = document.createElement("div");
      div.className = "favorite-item";
      div.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w200${fav.posterPath}" alt="${fav.title}" />
        <p>${fav.title}</p>
      `;
      favList.appendChild(div);
    });
  } catch (error) {
    alert("Error cargando favoritos");
    console.error(error);
  }
}

async function cargarMisComentarios() {
  const container = document.getElementById("my-comments");
  try {
    const comments = await getMyComments();
    if (comments.length === 0) {
      container.innerHTML = "<p>No hiciste ningún comentario todavía.</p>";
    } else {
      container.innerHTML = comments.map(c => `
        <div class="comment">
          <p><strong>Película:</strong> ${c.movieTitle} <span style="color: #888;">(ID: ${c.movie})</span></p>
          <p><strong>Comentario:</strong> ${c.content}</p>
          <p><strong>Fecha:</strong> ${new Date(c.createdAt).toLocaleDateString()}</p>
        </div>
      `).join("");
    }
  } catch (err) {
    container.innerHTML = "<p>Error al obtener tus comentarios.</p>";
    console.error(err);
  }
}
