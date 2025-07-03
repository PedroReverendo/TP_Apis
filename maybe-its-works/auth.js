// Simple auth functionality
document.addEventListener("DOMContentLoaded", () => {
  setupAuthPage()
})

function setupAuthPage() {
  // Check if already logged in
  if (localStorage.getItem("user")) {
    window.location.href = "index.html"
    return
  }

  // Setup form handlers
  document.getElementById("login-form").addEventListener("submit", handleLogin)
  document.getElementById("register-form").addEventListener("submit", handleRegister)

  // Setup tab switching
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      switchTab(this.dataset.tab)
    })
  })
}

function switchTab(tabName) {
  // Update tabs
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName)
  })

  // Update forms
  document.querySelectorAll(".auth-form").forEach((form) => {
    form.classList.toggle("active", form.id === `${tabName}-form`)
  })
}

async function handleLogin(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const email = formData.get("email") || e.target.querySelector('input[type="email"]').value
  const password = formData.get("password") || e.target.querySelector('input[type="password"]').value

  if (!email || !password) {
    alert("Por favor completa todos los campos")
    return
  }

  // Simulate login (replace with real API call)
  try {
    // Show loading
    const submitBtn = e.target.querySelector('button[type="submit"]')
    const originalText = submitBtn.textContent
    submitBtn.textContent = "Iniciando sesión..."
    submitBtn.disabled = true

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // For demo purposes, accept any email/password
    const user = {
      id: Date.now(),
      email: email,
      name: email.split("@")[0],
      loginAt: new Date().toISOString(),
    }

    localStorage.setItem("user", JSON.stringify(user))
    alert("¡Inicio de sesión exitoso!")
    window.location.href = "index.html"
  } catch (error) {
    alert("Error al iniciar sesión. Inténtalo de nuevo.")

    // Reset button
    const submitBtn = e.target.querySelector('button[type="submit"]')
    const originalText = submitBtn.textContent // Declare originalText variable
    submitBtn.textContent = originalText
    submitBtn.disabled = false
  }
}

async function handleRegister(e) {
  e.preventDefault()

  const inputs = e.target.querySelectorAll("input")
  const name = inputs[0].value
  const email = inputs[1].value
  const password = inputs[2].value

  // Simple validation
  if (!name || !email || !password) {
    alert("Por favor completa todos los campos")
    return
  }

  if (password.length < 6) {
    alert("La contraseña debe tener al menos 6 caracteres")
    return
  }

  // Simulate registration
  try {
    // Show loading
    const submitBtn = e.target.querySelector('button[type="submit"]')
    const originalText = submitBtn.textContent
    submitBtn.textContent = "Creando cuenta..."
    submitBtn.disabled = true

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = {
      id: Date.now(),
      name: name,
      email: email,
      registeredAt: new Date().toISOString(),
    }

    localStorage.setItem("user", JSON.stringify(user))
    alert("¡Cuenta creada exitosamente!")
    window.location.href = "index.html"
  } catch (error) {
    alert("Error al crear la cuenta. Inténtalo de nuevo.")

    // Reset button
    const submitBtn = e.target.querySelector('button[type="submit"]')
    const originalText = submitBtn.textContent // Declare originalText variable
    submitBtn.textContent = originalText
    submitBtn.disabled = false
  }
}
