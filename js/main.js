document.documentElement.classList.add("js");

/* ============ MENU MOBILE ============ */
const menuToggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("menu");

function setMenu(open) {
  document.documentElement.classList.toggle("menu-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
}

menuToggle.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

menu.addEventListener("click", (e) => {
  if (e.target.closest("a")) setMenu(false);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});

/* ============ GALERIAS (carrosséis com scroll-snap) ============ */
const pad = (n) => String(n).padStart(2, "0");

document.querySelectorAll(".gallery").forEach((gallery) => {
  const track = gallery.querySelector(".gallery__track");
  const shots = [...track.children];
  const count = gallery.querySelector(".gallery__count");
  const [prev, next] = gallery.querySelectorAll(".arrow-btn");
  const dotsWrap = gallery.querySelector(".gallery__dots");

  const dots = shots.map(() => dotsWrap.appendChild(document.createElement("span")));

  // ordem de entrada das fotos (uma por vez); limite para as que ficam fora da tela não demorarem
  shots.forEach((shot, i) => shot.style.setProperty("--i", Math.min(i, 5)));

  // índices das fotos visíveis (pelo menos 60% dentro do trilho)
  function visibleRange() {
    const box = track.getBoundingClientRect();
    const style = getComputedStyle(track);
    const left = box.left + parseFloat(style.paddingLeft);
    const right = box.right - parseFloat(style.paddingRight);
    const visible = [];
    shots.forEach((shot, i) => {
      const r = shot.getBoundingClientRect();
      const inside = Math.min(r.right, right) - Math.max(r.left, left);
      if (inside / r.width > 0.6) visible.push(i);
    });
    if (!visible.length) visible.push(0);
    return [visible[0], visible[visible.length - 1]];
  }

  function update() {
    const [first, last] = visibleRange();
    count.textContent = first === last
      ? `${pad(first + 1)} / ${pad(shots.length)}`
      : `${pad(first + 1)}–${pad(last + 1)} / ${pad(shots.length)}`;
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === first));

    // "próximo" desativa quando a última foto já está inteira na tela
    // (com o snap, o scroll nem sempre chega ao máximo exato)
    const trackRight = track.getBoundingClientRect().right - parseFloat(getComputedStyle(track).paddingRight);
    const lastRight = shots[shots.length - 1].getBoundingClientRect().right;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = lastRight <= trackRight + 2;
  }

  function goTo(index) {
    const target = shots[Math.max(0, Math.min(index, shots.length - 1))];
    const offset = target.offsetLeft - shots[0].offsetLeft;
    track.scrollTo({ left: offset });
  }

  prev.addEventListener("click", () => goTo(visibleRange()[0] - 1));
  next.addEventListener("click", () => goTo(visibleRange()[0] + 1));

  let ticking = false;
  track.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }, { passive: true });

  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); next.click(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); prev.click(); }
  });

  window.addEventListener("resize", update);
  // recalcula o contador depois que as fotos terminam de entrar
  track.addEventListener("transitionend", (e) => {
    if (e.target.classList.contains("shot") && e.propertyName === "transform") update();
  });
  update();
});

/* ============ WHATSAPP FLUTUANTE ============ */
// some enquanto a seção Orçamento está na tela, onde o botão grande já cumpre o papel
const waFloat = document.querySelector(".wa-float");
const quoteSection = document.getElementById("orcamento");

if (waFloat && quoteSection && "IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => {
    waFloat.classList.toggle("is-hidden", entry.isIntersecting);
  }, { threshold: 0.25 }).observe(quoteSection);
}

/* ============ REVELAÇÃO SUAVE NO SCROLL ============ */
const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  revealItems.forEach((el) => observer.observe(el));
} else {
  revealItems.forEach((el) => el.classList.add("is-visible"));
}

/* ============ ANO NO RODAPÉ ============ */
const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear();
