(() => {
  const STORAGE_KEY = "site-lang";
  const root = document.documentElement;
  const btnZh = document.getElementById("lang-zh");
  const btnEn = document.getElementById("lang-en");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");
  // #site-nav 是外层容器，真正的菜单列表是里面的 .nav —— 折叠状态要加在列表上
  const navList = nav ? nav.querySelector(".nav") : null;
  const progressBar = document.getElementById("progress-bar");

  /* 页面标题按语言切换；各页在 <body data-title-zh/en> 里声明自己的标题 */
  const titleZh = document.body.dataset.titleZh;
  const titleEn = document.body.dataset.titleEn;

  /* ——— 语言切换（默认英文） ——— */

  function applyLang(lang) {
    const next = lang === "en" ? "en" : "zh-CN";
    root.lang = next;

    if (btnZh) btnZh.setAttribute("aria-pressed", next === "zh-CN" ? "true" : "false");
    if (btnEn) btnEn.setAttribute("aria-pressed", next === "en" ? "true" : "false");

    if (titleZh && titleEn) {
      document.title = next === "en" ? titleEn : titleZh;
    }

    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (_) {
      /* ignore private-mode errors */
    }
  }

  let initial = "en";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "zh-CN") initial = saved;
  } catch (_) {
    /* ignore */
  }
  applyLang(initial);

  if (btnZh) btnZh.addEventListener("click", () => applyLang("zh-CN"));
  if (btnEn) btnEn.addEventListener("click", () => applyLang("en"));

  /* ——— 移动端目录 ——— */

  function closeNav() {
    if (!navList || !toggle) return;
    navList.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  if (toggle && nav && navList) {
    toggle.addEventListener("click", () => {
      const open = navList.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) closeNav();
    });
  }

  /* ——— 页脚年份 ——— */

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ——— 阅读进度 ——— */

  let ticking = false;

  function updateProgress() {
    if (!progressBar) return;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progressBar.style.transform = `scaleX(${ratio})`;
    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateProgress);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateProgress();

  /* ——— 目录高亮 ——— */

  if (!nav || !("IntersectionObserver" in window)) return;

  const links = [...nav.querySelectorAll("a[href^='#']")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (sections.length === 0) return;

  const setActive = (id) => {
    links.forEach((link) => {
      if (link.getAttribute("href") === `#${id}`) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible.length > 0) setActive(visible[0].target.id);
    },
    { rootMargin: "-25% 0px -60% 0px", threshold: [0, 0.2, 0.5] }
  );

  sections.forEach((section) => observer.observe(section));
})();
