const API_URL = "https://script.google.com/macros/s/AKfycbxd7p3KjLUhJAzEg02tyfWQx5bOpf6MUYbtX1hMeKPwEqKJHdOIMz-XXBc2fPMZhXFpLA/exec";
document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("session");

  if (saved) {
    session = JSON.parse(saved);

    document.getElementById("badge-username").innerText = session.user;
    document.getElementById("badge-role").innerText = session.role;

    // Mostrar el badge
    badge.classList.remove("hidden");
    setTimeout(() => badge.classList.add("expand"), 10);

    // Mostrar el drawer si lo usas
    drawer.classList.remove("hidden");
  }
});

/* REFERENCIAS */
const icon = document.getElementById("login-icon");
const panel = document.getElementById("login-panel");
const badge = document.getElementById("user-badge");
const menu = document.getElementById("badge-menu");
const drawer = document.getElementById("main-drawer");
const logoutBtn = document.getElementById("logout-btn");
const loginBtn = document.getElementById("login-btn");
const status = document.getElementById("login-status");

let session = null;

/* ---------------- PANEL LOGIN ---------------- */
function toggleLoginPanel() {
  if (panel.classList.contains("hidden")) {
    panel.classList.remove("hidden");
    panel.classList.remove("fade-out");
    void panel.offsetWidth;
    panel.classList.add("fade-in");
  } else {
    panel.classList.remove("fade-in");
    panel.classList.add("fade-out");
    panel.addEventListener("animationend", function handler() {
      panel.classList.add("hidden");
      panel.classList.remove("fade-out");
      panel.removeEventListener("animationend", handler);
    });
  }
}

/* ICON CLICK */
icon.onclick = () => {
  if (!session) toggleLoginPanel();
  else toggleBadgeMenu();
};

/* ---------------- LOGIN REQUEST ---------------- */
async function doLogin() {
  const user = document.getElementById("user").value.trim();
  const pass = document.getElementById("pass").value.trim();

  if (!user || !pass) {
    status.innerText = "Rellena ambos campos";
    status.style.color = "#ff4d4d";
    return;
  }

  loginBtn.classList.add("loading");
  status.innerText = "";

  try {
    const res = await fetch(`${API_URL}?user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`);
    const data = await res.json();

    if (data.success) {
      /* LOGIN OK */
      loginBtn.classList.remove("loading");
      loginBtn.classList.add("success");
      loginBtn.innerText = "✔";

      session = { user, role: data.role };
      localStorage.setItem("session", JSON.stringify(session));

      document.getElementById("badge-username").innerText = user;
      document.getElementById("badge-role").innerText = data.role;

      panel.classList.remove("fade-in");
      panel.classList.add("fade-out");
      panel.addEventListener("animationend", function h() {
        panel.classList.add("hidden");
        panel.classList.remove("fade-out");
        panel.removeEventListener("animationend", h);
        loginBtn.classList.remove("success");
        loginBtn.innerText = "Entrar";
      });

      badge.classList.remove("hidden");
      setTimeout(() => badge.classList.add("expand"), 10);

      drawer.classList.remove("hidden");

    } else {
  loginBtn.classList.remove("loading");
  loginBtn.innerText = "Entrar";
  status.innerText = "Credenciales incorrectas";
  status.style.color = "#ff4d4d";
  loginBtn.classList.add("error");
setTimeout(() => loginBtn.classList.remove("error"), 800);


  // Solo animación de vibración SIN ocultar/mostrar el panel
  panel.classList.remove("vibrate-error");
  void panel.offsetWidth;
  panel.classList.add("vibrate-error");

  panel.addEventListener("animationend", function x() {
    panel.classList.remove("vibrate-error");
    panel.removeEventListener("animationend", x);
  });

  document.getElementById("pass").value = "";
  document.getElementById("pass").focus();
}


  } catch (err) {
    loginBtn.classList.remove("loading");
    loginBtn.innerText = "Entrar";
    status.innerText = "Error de conexión";
    status.style.color = "#ff4d4d";
  }
}

loginBtn.onclick = doLogin;

/* TECLA ENTER */
document.addEventListener("keydown", e => {
  if (e.key === "Enter" && !panel.classList.contains("hidden")) doLogin();
});

/* ---------------- BADGE MENU ---------------- */
/* ---------------- BADGE MENU ---------------- */
function toggleBadgeMenu() {
  if (!menu) return;

  // posicionar el menú respecto al badge (aunque esté fuera del DOM visualmente)
  const rect = badge.getBoundingClientRect();
  const top = rect.bottom + 6 + window.scrollY; // debajo del badge
  const left = rect.left + window.scrollX;       // alineado a la izquierda del badge

  menu.style.position = 'fixed';
  menu.style.top = `${top}px`;
  menu.style.left = `${left}px`;

  if (menu.classList.contains('show')) {
    // ocultar: quitar .show y al terminar la transición volver a poner .hidden
    menu.classList.remove('show');
    // asegurar que al terminar la transición también quede "hidden" (para mantener visibilidad/opacity consistentes)
    const onHide = function () {
      menu.classList.add('hidden');
      menu.removeEventListener('transitionend', onHide);
    };
    menu.addEventListener('transitionend', onHide);
  } else {
    // mostrar: quitar .hidden (si la tuviera) y forzar reflow antes de añadir .show
    menu.classList.remove('hidden');
    void menu.offsetWidth;
    menu.classList.add('show');
  }
}

badge.addEventListener("click", e => {
  if (!session) return;
  e.stopPropagation();
  toggleBadgeMenu();
});

menu.addEventListener("click", e => e.stopPropagation());

// cerrar cuando se hace click fuera del badge y fuera del menu
document.addEventListener("click", e => {
  const clickedInsideBadge = !!e.target.closest("#user-badge");
  const clickedInsideMenu = !!e.target.closest("#badge-menu");

  if (!clickedInsideBadge && !clickedInsideMenu && menu.classList.contains("show")) {
    // quitar .show y esperar a transitionend para poner .hidden (igual que en toggle)
    menu.classList.remove("show");
    const onHide = function () {
      menu.classList.add('hidden');
      menu.removeEventListener('transitionend', onHide);
    };
    menu.addEventListener('transitionend', onHide);
  }
});


/* ---------------- LOGOUT ---------------- */
logoutBtn.onclick = () => {
     localStorage.removeItem("session");
  menu.classList.remove("show");
  badge.classList.remove("expand");

  setTimeout(() => badge.classList.add("hidden"), 250);
  drawer.classList.add("hidden");

  session = null;
};