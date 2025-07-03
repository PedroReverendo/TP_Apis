// API configuration
const API_KEY = "adc1e99f5822a737bfe546b5699c1ed2"
const BASE_URL = "https://api.themoviedb.org/3"
const IMG_URL = "https://image.tmdb.org/t/p/w500"

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhZGMxZTk5ZjU4MjJhNzM3YmZlNTQ2YjU2OTljMWVkMiIsIm5iZiI6MTY0NTY1NzMwNi43NjQ5OTk5LCJzdWIiOiI2MjE2YmNkYWRmZTMxZDAwNmU0MTkxYmYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.ssv454GaGXwZTho7q7_oKtJS0QhGnYdjvMYJOHQDqwQ"
  }
}

class MovieAPI {
  constructor() {
    this.currentPage = 1
  }

  async getPopularMovies(page = 1) {
    const url = `${BASE_URL}/movie/popular?language=en-US&page=${page}`
    const response = await fetch(url, API_OPTIONS)
    const data = await response.json()
    this.currentPage = page
    return data
  }

  async getPopularTVShows(page = 1) {
    const url = `${BASE_URL}/tv/popular?language=en-US&page=${page}`
    const response = await fetch(url, API_OPTIONS)
    const data = await response.json()
    this.currentPage = page
    return data
  }

  async getMovieDetails(movieId) {
    const url = `${BASE_URL}/movie/${movieId}?language=en-US&append_to_response=credits`
    const response = await fetch(url, API_OPTIONS)
    return await response.json()
  }

  async searchMovies(query, page = 1) {
    const url = `${BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=${page}`
    const response = await fetch(url, API_OPTIONS)
    return await response.json()
  }
}

let movieAPI
let currentPage = 1
let currentContent = "movies"
let isLoading = false
let currentSearch = ""

// DOM ready
window.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("movie-detail.html")) {
    initMovieDetailPage()
  } else {
    initHomePage()
  }
})

function initHomePage() {
  movieAPI = new MovieAPI()
  setupEventListeners()
  loadContent()
  window.addEventListener("scroll", handleScroll)
}

function setupEventListeners() {
  const searchInput = document.getElementById("search-input")
  searchInput.addEventListener("input", () => {
    currentPage = 1
    currentSearch = searchInput.value.trim()
    document.getElementById("movies-grid").innerHTML = ""
    loadContent()
  })

  const navItems = document.querySelectorAll(".nav-item")
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      if (item.textContent === "Movies") {
        switchToMovies()
      } else if (item.textContent === "Series") {
        switchToSeries()
      }
    })
  })
}

async function loadContent() {
  if (isLoading) return
  isLoading = true
  const grid = document.getElementById("movies-grid")

  try {
    let data
    if (currentSearch) {
      data = await movieAPI.searchMovies(currentSearch, currentPage)
    } else {
      if (currentContent === "movies") {
        data = await movieAPI.getPopularMovies(currentPage)
      } else {
        data = await movieAPI.getPopularTVShows(currentPage)
      }
    }

    data.results.forEach(item => {
      const card = createMovieCard(item)
      grid.appendChild(card)
    })
  } catch (error) {
    console.error("Error loading content", error)
  } finally {
    isLoading = false
  }
}

function handleScroll() {
  const scrollTop = window.scrollY
  const windowHeight = window.innerHeight
  const bodyHeight = document.body.offsetHeight

  if (scrollTop + windowHeight >= bodyHeight - 300 && !isLoading) {
    currentPage++
    loadContent()
  }
}

function switchToMovies() {
  currentContent = "movies"
  currentPage = 1
  currentSearch = ""
  document.getElementById("movies-grid").innerHTML = ""
  document.getElementById("page-title").textContent = "Popular Movies"
  loadContent()
}

function switchToSeries() {
  currentContent = "series"
  currentPage = 1
  currentSearch = ""
  document.getElementById("movies-grid").innerHTML = ""
  document.getElementById("page-title").textContent = "Popular Series"
  loadContent()
}

function createMovieCard(item) {
  const template = document.getElementById("movie-card-template")
  const card = template.content.cloneNode(true)
  const img = card.querySelector(".movie-poster")
  const title = card.querySelector(".movie-title")
  const date = card.querySelector(".movie-date")
  const rating = card.querySelector(".movie-rating")

  const itemTitle = item.title || item.name
  const itemDate = item.release_date || item.first_air_date

  img.src = item.poster_path ? IMG_URL + item.poster_path : "https://via.placeholder.com/300x450?text=No+Image"
  img.alt = itemTitle
  title.textContent = itemTitle
  date.textContent = itemDate ? new Date(itemDate).getFullYear() : "N/A"
  rating.textContent = item.vote_average ? item.vote_average.toFixed(1) : "N/A"

  const movieCard = card.querySelector(".movie-card")
  movieCard.addEventListener("click", () => {
    if (item.title) {
      window.location.href = `movie-detail.html?id=${item.id}`
    }
  })

  return card
}

function initMovieDetailPage() {
  movieAPI = new MovieAPI()
  loadMovieDetail()
}

async function loadComments(movieId) {
  const container = document.getElementById("comments-list")
  try {
    const res = await fetch(`http://localhost:3000/api/comments/${movieId}`)
    const comments = await res.json()

    if (comments.length === 0) {
      container.innerHTML = "<p>No comments yet.</p>"
    } else {
      container.innerHTML = comments
        .map(
          (c) =>
            `<div class="comment"><strong>${c.user.username}</strong>: ${c.content}</div>`
        )
        .join("")
    }
  } catch (err) {
    console.error(err)
    container.innerHTML = "<p>Error loading comments.</p>"
  }
}

function setupCommentForm(movieId) {
  const form = document.getElementById("comment-form")
  form.addEventListener("submit", async (e) => {
    e.preventDefault()
    const input = document.getElementById("comment-input")
    const content = input.value.trim()
    const token = localStorage.getItem("token")

    if (!token) {
      alert("Tenés que iniciar sesión para comentar.")
      return
    }

    if (!content) return

    // 👉 Obtener el título desde el DOM
    const movieTitle = document.querySelector(".detail-title")?.textContent?.trim()
    if (!movieTitle) {
      alert("No se encontró el título de la película.")
      return
    }

    try {
      const res = await fetch(`http://localhost:3000/api/comments/${movieId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, movieTitle }), // ⬅️ Enviar también el título
      })

      if (!res.ok) throw new Error("Error al comentar")

      input.value = ""
      loadComments(movieId)
    } catch (err) {
      alert("No se pudo publicar el comentario.")
      console.error(err)
    }
  })
}


async function loadMovieDetail() {
  const urlParams = new URLSearchParams(window.location.search)
  const movieId = urlParams.get("id")
  const movieContent = document.getElementById("movie-content")

  if (!movieId) {
    movieContent.innerHTML = '<div class="error">No movie ID found</div>'
    return
  }

  try {
    const movie = await movieAPI.getMovieDetails(movieId)
    const template = document.getElementById("movie-detail-template")
    const detailClone = template.content.cloneNode(true)

    // Template element references
    const poster = detailClone.querySelector(".detail-poster")
    const title = detailClone.querySelector(".detail-title")
    const rating = detailClone.querySelector(".detail-rating")
    const year = detailClone.querySelector(".detail-year")
    const runtime = detailClone.querySelector(".detail-runtime")
    const genres = detailClone.querySelector(".detail-genres")
    const description = detailClone.querySelector(".detail-description")

    // Assign content
    poster.src = movie.poster_path ? IMG_URL + movie.poster_path : ""
    poster.alt = movie.title
    title.textContent = movie.title
    rating.textContent = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"
    year.textContent = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"
    runtime.textContent = movie.runtime ? `${movie.runtime} min` : "N/A"
    genres.textContent = movie.genres?.map((g) => g.name).join(", ") || "N/A"
    description.textContent = movie.overview || "No description available."

    // Add favorite button
    const addFavBtn = document.createElement("button")
    addFavBtn.id = "add-favorite-btn"
    addFavBtn.textContent = "Add to favorites"
    addFavBtn.classList.add("favorite-btn")
    detailClone.querySelector(".detail-overview").appendChild(addFavBtn)

    addFavBtn.addEventListener("click", async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("You must log in to add favorites.")
        window.location.href = "auth.html"
        return
      }

      try {
        const res = await fetch("http://localhost:3000/api/users/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            movieId: movie.id,
            title: movie.title,
            posterPath: movie.poster_path,
          }),
        })

        const data = await res.json()

        if (res.ok) {
          alert("Movie added to favorites!")
        } else {
          alert("Error: " + (data.error || "Could not add to favorites"))
        }
      } catch (error) {
        alert("Connection error adding to favorites.")
        console.error(error)
      }
    })

    // Insert into DOM
    movieContent.appendChild(detailClone)
    document.title = `${movie.title} - PelisPRO`

    // Comments (load and setup form)
    loadComments(movie.id)
    setupCommentForm(movie.id)
  } catch (error) {
    console.error(error)
    movieContent.innerHTML = '<div class="error">Error loading movie details</div>'
  }
}