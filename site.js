(() => {
  "use strict";

  /* ---------- view routing (hash based, no reload => audio persists) ---------- */
  const views = Array.from(document.querySelectorAll(".view"));
  const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
  const navEl = document.querySelector(".nav");
  const navToggle = document.querySelector(".nav-toggle");

  function routeFromHash() {
    const id = (location.hash || "#home").replace("#", "");
    return views.some(v => v.id === id) ? id : "home";
  }

  function showView(id, opts = {}) {
    views.forEach(v => v.classList.toggle("is-active", v.id === id));
    navLinks.forEach(a => a.classList.toggle("is-active", a.dataset.navLink === id));
    if (!opts.skipScroll) window.scrollTo({ top: 0, behavior: "auto" });
    document.title = (id === "home")
      ? "北の余白 — Hokkaido Journey"
      : `${document.querySelector(`[data-nav-link="${id}"]`)?.textContent.trim() || ""} — 北の余白`;
    if (navEl) navEl.classList.remove("is-open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  }

  window.addEventListener("hashchange", () => showView(routeFromHash()));
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-goto]");
    if (!trigger) return;
    e.preventDefault();
    const target = trigger.dataset.goto;
    if (location.hash === `#${target}`) {
      showView(target);
    } else {
      location.hash = target;
    }
  });

  if (navToggle && navEl) {
    navToggle.addEventListener("click", () => {
      const open = navEl.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
  }

  showView(routeFromHash(), { skipScroll: true });

  /* ---------- theme (respects system, manual override optional) ---------- */
  try {
    const saved = window.localStorage.getItem("kita-theme");
    if (saved) document.documentElement.dataset.theme = saved;
  } catch (_) {}

  /* ---------- audio: theme song, persists across view changes ---------- */
  const audio = document.getElementById("theme-audio");
  const playButtons = Array.from(document.querySelectorAll("[data-audio-toggle]"));
  const miniPlayer = document.getElementById("mini-player");
  const miniToggle = document.getElementById("mini-player-toggle");

  if (audio) audio.volume = 0.45;

  function setPlayingUI(isPlaying) {
    playButtons.forEach(btn => {
      btn.classList.toggle("is-playing", isPlaying);
      const label = btn.querySelector("[data-audio-label]");
      if (label) label.textContent = isPlaying ? "一時停止" : "旅のテーマソング";
      const icon = btn.querySelector("[data-audio-icon]");
      if (icon) icon.innerHTML = isPlaying ? PAUSE_ICON : PLAY_ICON;
    });
    if (miniToggle) miniToggle.innerHTML = isPlaying ? PAUSE_ICON : PLAY_ICON;
    if (miniPlayer) miniPlayer.classList.toggle("is-paused", !isPlaying);
  }

  const PLAY_ICON = '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5v11l10-5.5z"/></svg>';
  const PAUSE_ICON = '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="3.5" y="2.5" width="3" height="11"/><rect x="9.5" y="2.5" width="3" height="11"/></svg>';

  function togglePlay() {
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }

  playButtons.forEach(btn => btn.addEventListener("click", togglePlay));
  if (miniToggle) miniToggle.addEventListener("click", togglePlay);

  if (audio) {
    audio.addEventListener("play", () => {
      setPlayingUI(true);
      if (miniPlayer) miniPlayer.classList.add("is-visible");
    });
    audio.addEventListener("pause", () => setPlayingUI(false));
    audio.addEventListener("ended", () => setPlayingUI(false));
  }
})();
