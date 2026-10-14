// app.js - Handles authentication, user session, and progress CRUD

// ---- Utility Functions ----
function $(selector) {
  return document.querySelector(selector);
}
function $all(selector) {
  return document.querySelectorAll(selector);
}

// ---- LocalStorage Keys ----
const USERS_KEY = "boxing_users";
const SESSION_KEY = "boxing_session"; // stores logged-in email
const PROGRESS_KEY_PREFIX = "boxing_progress_"; // + email

// ---- Data Management ----
function getUsers() {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function getCurrentUserEmail() {
  return localStorage.getItem(SESSION_KEY);
}
function setCurrentUserEmail(email) {
  if (email) localStorage.setItem(SESSION_KEY, email);
  else localStorage.removeItem(SESSION_KEY);
}
function getProgress(email) {
  const raw = localStorage.getItem(PROGRESS_KEY_PREFIX + email);
  return raw ? JSON.parse(raw) : [];
}
function saveProgress(email, data) {
  localStorage.setItem(PROGRESS_KEY_PREFIX + email, JSON.stringify(data));
}

// ---- Authentication ----
function registerUser({ name, email, password }) {
  const users = getUsers();
  if (users.find((u) => u.email === email)) {
    alert("El email ya está registrado.");
    return false;
  }
  users.push({ name, email, password });
  saveUsers(users);
  setCurrentUserEmail(email);
  return true;
}
function loginUser({ email, password }) {
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    alert("Credenciales incorrectas.");
    return false;
  }
  setCurrentUserEmail(email);
  return true;
}
function logout() {
  setCurrentUserEmail(null);
  // redirect to landing page
  window.location.href = "index.html";
}

// ---- UI Helpers ----
function renderWelcome() {
  const email = getCurrentUserEmail();
  if (!email) return;
  const users = getUsers();
  const user = users.find((u) => u.email === email);
  const welcomeMsg = $("#welcome-msg");
  if (welcomeMsg && user) welcomeMsg.textContent = `Bienvenido, ${user.name}`;
}

function renderProgressTable() {
  const email = getCurrentUserEmail();
  if (!email) return;
  const data = getProgress(email);
  const tbody = $("#progress-table tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  data.forEach((entry, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.weight} kg</td>
      <td>${entry.height} cm</td>
      <td>${entry.fat ?? "-"}%</td>
      <td>${entry.areas.join(", ")}</td>
      <td><button class=\"btn-primary\" data-index=\"${idx}\" onclick=\"deleteEntry(${idx})\">Eliminar</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteEntry(index) {
  const email = getCurrentUserEmail();
  const data = getProgress(email);
  data.splice(index, 1);
  saveProgress(email, data);
  renderProgressTable();
  updateChart();
}

// ---- Chart ----
let weightChart = null;
function initChart() {
  const ctx = $("#weightChart").getContext("2d");
  weightChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Peso (kg)",
        data: [],
        borderColor: "#e50914",
        backgroundColor: "rgba(229,9,20,0.2)",
        tension: 0.3,
        fill: true,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: false } },
    },
  });
}
function updateChart() {
  const email = getCurrentUserEmail();
  const data = getProgress(email).sort((a, b) => new Date(a.date) - new Date(b.date));
  const labels = data.map((e) => e.date);
  const weights = data.map((e) => e.weight);
  if (weightChart) {
    weightChart.data.labels = labels;
    weightChart.data.datasets[0].data = weights;
    weightChart.update();
  }
}

// ---- Form Handlers ----
function handleAuthForm(e) {
  e.preventDefault();
  const isRegister = $("#form-title").textContent.toLowerCase().includes("registro");
  const name = $("#name").value.trim();
  const email = $("#email").value.trim();
  const password = $("#password").value;

  if (isRegister) {
    // simple validation
    if (!name || name.length < 2) { alert("Nombre inválido"); return; }
    if (!email) { alert("Email requerido"); return; }
    if (!password || password.length < 6) { alert("Contraseña mínima 6 caracteres"); return; }
    const success = registerUser({ name, email, password });
    if (success) window.location.href = "dashboard.html";
  } else {
    // login path (ignore name)
    const success = loginUser({ email, password });
    if (success) window.location.href = "dashboard.html";
  }
}

function handleProgressForm(e) {
  e.preventDefault();
  const email = getCurrentUserEmail();
  if (!email) return;
  const date = $("#date").value;
  const weight = parseFloat($("#weight").value);
  const height = parseInt($("#height").value);
  const fat = $("#fat").value ? parseFloat($("#fat").value) : null;
  const areas = Array.from($all("input[name='areas']:checked")).map((c) => c.value);

  const entry = { date, weight, height, fat, areas };
  const data = getProgress(email);
  data.push(entry);
  saveProgress(email, data);
  renderProgressTable();
  updateChart();
  e.target.reset();
}

function initAuthPage() {
  const form = $("#auth-form");
  if (!form) return;
  form.addEventListener("submit", handleAuthForm);
  const toggleLink = $("#toggle-link");
  const toggleText = $("#toggle-text");
  const title = $("#form-title");
  toggleLink.addEventListener("click", (e) => {
    e.preventDefault();
    const registering = title.textContent.toLowerCase().includes("login");
    if (registering) {
      title.textContent = "Registro";
      toggleText.innerHTML = "¿Ya tienes cuenta? <a href='#' id='toggle-link'>Login</a>";
    } else {
      title.textContent = "Login";
      toggleText.innerHTML = "¿No tienes cuenta? <a href='#' id='toggle-link'>Regístrate</a>";
    }
    // Re‑attach listener for the new link
    initAuthPage();
  });
}

function initDashboard() {
  const email = getCurrentUserEmail();
  if (!email) {
    // Not logged in → redirect to landing
    window.location.href = "index.html";
    return;
  }
  renderWelcome();
  renderProgressTable();
  initChart();
  updateChart();
  $("#progress-form").addEventListener("submit", handleProgressForm);
  $("#logout-btn").addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
}

// ---- Initialization ----
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.split("/" ).pop();
  if (path === "login.html") {
    initAuthPage();
  } else if (path === "dashboard.html") {
    initDashboard();
  }
});
