// Mobiel menu
const menuButton = document.querySelector(".menu");
const navigationLinks = document.querySelector(".nav-links");

function setMenu(open) {
  navigationLinks.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
}

menuButton.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

navigationLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigationLinks.classList.contains("open")) {
    setMenu(false);
    menuButton.focus();
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".nav")) setMenu(false);
});

// Een subtiele lichtvlek volgt alleen een muis, zonder een permanente animatielus.
const glowPreference = window.matchMedia(
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
);
const cursorGlow = document.createElement("div");
cursorGlow.className = "cursor-glow";
cursorGlow.setAttribute("aria-hidden", "true");
document.body.appendChild(cursorGlow);

let glowFrame = null;
let glowX = 0;
let glowY = 0;

function hideGlow() {
  if (glowFrame !== null) cancelAnimationFrame(glowFrame);
  glowFrame = null;
  cursorGlow.classList.remove("is-visible");
}

function moveGlow(event) {
  if (event.pointerType !== "mouse" || !glowPreference.matches) {
    hideGlow();
    return;
  }
  glowX = event.clientX;
  glowY = event.clientY;
  if (glowFrame !== null) return;
  glowFrame = requestAnimationFrame(() => {
    cursorGlow.style.setProperty("--glow-x", `${glowX}px`);
    cursorGlow.style.setProperty("--glow-y", `${glowY}px`);
    cursorGlow.classList.add("is-visible");
    glowFrame = null;
  });
}

function updateGlowPreference() {
  hideGlow();
  document.removeEventListener("pointermove", moveGlow);
  if (glowPreference.matches) {
    document.addEventListener("pointermove", moveGlow, { passive: true });
  }
}

document.documentElement.addEventListener("pointerleave", hideGlow);
window.addEventListener("blur", hideGlow);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) hideGlow();
});
glowPreference.addEventListener("change", updateGlowPreference);
updateGlowPreference();
