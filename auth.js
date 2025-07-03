// Simple auth functionality
document.addEventListener("DOMContentLoaded", () => {
  setupAuthPage()
})

function setupAuthPage() {
  // Check if already logged in
  if (localStorage.getItem("token")) {
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

  try {
    const submitBtn = e.target.querySelector('button[type="submit"]')
    const originalText = submitBtn.textContent
    submitBtn.textContent = "Iniciando sesión..."
    submitBtn.disabled = true

    const res = await fetch("http://localhost:3000/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || "Error al iniciar sesión")
    }

    const data = await res.json()
    localStorage.setItem("token", data.token)
    alert("¡Inicio de sesión exitoso!")
    window.location.href = "index.html"
  } catch (error) {
    alert(error.message || "Error al iniciar sesión. Inténtalo de nuevo.")
  } finally {
    const submitBtn = e.target.querySelector('button[type="submit"]')
    submitBtn.textContent = "Iniciar sesión"
    submitBtn.disabled = false
  }
}

async function handleRegister(e) {
  e.preventDefault()

  const inputs = e.target.querySelectorAll("input")
  const name = inputs[0].value
  const email = inputs[1].value
  const password = inputs[2].value

  if (!name || !email || !password) {
    alert("Por favor completa todos los campos")
    return
  }

  if (password.length < 6) {
    alert("La contraseña debe tener al menos 6 caracteres")
    return
  }

  try {
    const submitBtn = e.target.querySelector('button[type="submit"]')
    const originalText = submitBtn.textContent
    submitBtn.textContent = "Creando cuenta..."
    submitBtn.disabled = true

    const res = await fetch("http://localhost:3000/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: name, email, password }),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || "Error al crear la cuenta")
    }

    alert("¡Cuenta creada exitosamente!")
    window.location.href = "index.html"
  } catch (error) {
    alert(error.message || "Error al crear la cuenta. Inténtalo de nuevo.")
  } finally {
    const submitBtn = e.target.querySelector('button[type="submit"]')
    submitBtn.textContent = "Crear cuenta"
    submitBtn.disabled = false
  }
}
