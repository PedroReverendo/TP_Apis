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

// Simple class to handle API calls
class MovieAPI {
  constructor() {
    this.currentPage = 1
  }

  // Fetch popular movies from API
  async getPopularMovies(page = 1) {
    try {
      const url = `${BASE_URL}/movie/popular?language=es-ES&page=${page}`
      const response = await fetch(url, API_OPTIONS)
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }
      
      const data = await response.json()
      this.currentPage = page
      return data
      
    } catch (error) {
      console.error("Error fetching movies:", error)
      throw error
    }
  }

  // Fetch popular TV shows from API
  async getPopularTVShows(page = 1) {
    try {
      const url = `${BASE_URL}/tv/popular?language=es-ES&page=${page}`
      const response = await fetch(url, API_OPTIONS)
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }
      
      const data = await response.json()
      this.currentPage = page
      return data
      
    } catch (error) {
      console.error("Error fetching TV shows:", error)
      throw error
    }
  }

  // Fetch single movie details
  async getMovieDetails(movieId) {
    try {
      const url = `${BASE_URL}/movie/${movieId}?language=es-ES&append_to_response=credits`
      const response = await fetch(url, API_OPTIONS)
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }
      
      return await response.json()
      
    } catch (error) {
      console.error("Error fetching movie details:", error)
      throw error
    }
  }
}

// Global variables
let movieAPI
let currentPage = 1
let currentContent = "movies" // Track if showing movies or TV shows

// Initialize when DOM loads
// DOMContentLoaded ensures HTML is fully loaded before running script
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("movie-detail.html")) {
    initMovieDetailPage()
  } else {
    initHomePage()
  }
})

// Initialize home page
// Function declaration - hoisted so available before this line
function initHomePage() {
  movieAPI = new MovieAPI()
  setupEventListeners()
  loadContent()
}

// Set up button click events
function setupEventListeners() {
  const loadMoreBtn = document.getElementById("load-more-btn")
  loadMoreBtn.addEventListener("click", loadMoreContent)
  
  // Navigation buttons
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

// Load content based on current selection (movies or TV shows)
async function loadContent() {
  const grid = document.getElementById("movies-grid")
  
  try {
    // Show loading message
    grid.innerHTML = '<div class="loading">Loading...</div>'
    
    // Get content from API based on current selection
    let data
    if (currentContent === "movies") {
      data = await movieAPI.getPopularMovies(currentPage)
    } else {
      data = await movieAPI.getPopularTVShows(currentPage)
    }
    
    // Clear grid
    grid.innerHTML = ""
    
    // Create cards for each item using template
    data.results.forEach(item => {
      const card = createMovieCard(item)
      grid.appendChild(card)
    })
    
    // Show load more button if there are more pages
    if (data.page < data.total_pages) {
      document.getElementById("load-more-btn").style.display = "block"
    }
    
  } catch (error) {
    grid.innerHTML = '<div class="error">Error loading content</div>'
  }
}

// Load more content (next page)
async function loadMoreContent() {
  const grid = document.getElementById("movies-grid")
  
  try {
    currentPage++
    let data
    if (currentContent === "movies") {
      data = await movieAPI.getPopularMovies(currentPage)
    } else {
      data = await movieAPI.getPopularTVShows(currentPage)
    }
    
    // Add new items to existing grid
    data.results.forEach(item => {
      const card = createMovieCard(item)
      grid.appendChild(card)
    })
    
    // Hide button if no more pages
    if (data.page >= data.total_pages) {
      document.getElementById("load-more-btn").style.display = "none"
    }
    
  } catch (error) {
    console.error("Error loading more content:", error)
  }
}

// Switch to movies
function switchToMovies() {
  currentContent = "movies"
  currentPage = 1
  document.getElementById("page-title").textContent = "Popular Movies"
  loadContent()
}

// Switch to TV series
function switchToSeries() {
  currentContent = "series"
  currentPage = 1
  document.getElementById("page-title").textContent = "Popular Series"
  loadContent()
}

// Create movie/TV show card using HTML template
// This clones the template and fills it with data
function createMovieCard(item) {
  // Get the template from HTML
  const template = document.getElementById("movie-card-template")
  
  // Clone the template content (creates a copy)
  const card = template.content.cloneNode(true)
  
  // Fill in data using querySelector to find elements
  const img = card.querySelector(".movie-poster")
  const title = card.querySelector(".movie-title")
  const date = card.querySelector(".movie-date")
  const rating = card.querySelector(".movie-rating")
  
  // Set the data for each element
  // Handle both movies and TV shows
  const itemTitle = item.title || item.name
  const itemDate = item.release_date || item.first_air_date
  
  img.src = item.poster_path ? IMG_URL + item.poster_path : "https://via.placeholder.com/300x450?text=No+Image"
  img.alt = itemTitle
  title.textContent = itemTitle
  date.textContent = itemDate ? new Date(itemDate).getFullYear() : "N/A"
  rating.textContent = item.vote_average ? item.vote_average.toFixed(1) : "N/A"
  
  // Add click event to open detail page
  const movieCard = card.querySelector(".movie-card")
  movieCard.addEventListener("click", () => {
    // For now, only movies have detail pages
    if (item.title) {
      window.location.href = `movie-detail.html?id=${item.id}`
    }
  })
  
  return card
}

// Initialize movie detail page
function initMovieDetailPage() {
  movieAPI = new MovieAPI()
  loadMovieDetail()
}

// Load movie detail page
async function loadMovieDetail() {
  const urlParams = new URLSearchParams(window.location.search)
  const movieId = urlParams.get("id")
  const movieContent = document.getElementById("movie-content")

  if (!movieId) {
    movieContent.innerHTML = '<div class="error">No movie ID found</div>'
    return
  }

  try {
    movieContent.innerHTML = '' // Limpiar
    const movie = await movieAPI.getMovieDetails(movieId)

    const template = document.getElementById("movie-detail-template")
    const detailClone = template.content.cloneNode(true)

    const poster = detailClone.querySelector(".detail-poster")
    const title = detailClone.querySelector(".detail-title")
    const rating = detailClone.querySelector(".detail-rating")
    const year = detailClone.querySelector(".detail-year")
    const runtime = detailClone.querySelector(".detail-runtime")
    const genres = detailClone.querySelector(".detail-genres")
    const description = detailClone.querySelector(".detail-description")

    // Rellenar datos
    poster.src = movie.poster_path ? IMG_URL + movie.poster_path : ''
    poster.alt = movie.title
    title.textContent = movie.title
    rating.textContent = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"
    year.textContent = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"
    runtime.textContent = movie.runtime ? `${movie.runtime} min` : "N/A"
    genres.textContent = movie.genres?.map(g => g.name).join(", ") || "N/A"
    description.textContent = movie.overview || "No description available."

    movieContent.appendChild(detailClone)
    document.title = `${movie.title} - PelisPRO`

  } catch (error) {
    movieContent.innerHTML = '<div class="error">Error loading movie details</div>'
  }
}
