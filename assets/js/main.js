(() => {
  "use strict";

  /* ==================== i18n ==================== */

  const LANG_KEY = "lang";

  function detectLang() {
    let stored = null;
    try {
      stored = localStorage.getItem(LANG_KEY);
    } catch (e) {
      /* Safari private mode throws on storage access */
    }
    if (stored === "ru" || stored === "en") return stored;
    return navigator.language && navigator.language.toLowerCase().startsWith("ru") ? "ru" : "en";
  }

  function applyLang(lang) {
    const dict = I18N[lang];
    if (!dict) return;

    document.documentElement.setAttribute("lang", lang);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) el.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const pairs = el.getAttribute("data-i18n-attr").split(",");
      pairs.forEach((pair) => {
        const [attr, key] = pair.split(":").map((s) => s.trim());
        if (attr && dict[key] !== undefined) el.setAttribute(attr, dict[key]);
      });
    });

    document.querySelectorAll(".lang-switch__btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.getAttribute("data-lang") === lang);
    });

    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {
      /* Safari private mode throws on storage access */
    }
  }

  function initLangSwitch() {
    document.querySelectorAll(".lang-switch__btn").forEach((btn) => {
      btn.addEventListener("click", () => applyLang(btn.getAttribute("data-lang")));
    });
  }

  /* ==================== Header scroll state ==================== */

  function initHeaderScroll() {
    const header = document.getElementById("header");
    if (!header) return;

    const update = () => header.classList.toggle("is-scrolled", window.scrollY > 80);
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ==================== Mobile menu ==================== */

  function initMobileMenu() {
    const burger = document.getElementById("burgerBtn");
    const menu = document.getElementById("mobileMenu");
    const closeBtn = document.getElementById("mobileMenuClose");
    if (!burger || !menu || !closeBtn) return;

    const getFocusable = () =>
      Array.from(menu.querySelectorAll("a[href], button:not([disabled])"));

    const open = () => {
      menu.classList.add("is-open");
      menu.removeAttribute("aria-hidden");
      burger.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    };

    const close = (returnFocus = true) => {
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      if (returnFocus) burger.focus();
    };

    burger.addEventListener("click", open);
    closeBtn.addEventListener("click", () => close());

    menu.addEventListener("click", (e) => {
      if (e.target === menu) close();
    });

    menu.querySelectorAll(".mobile-menu__link").forEach((link) => {
      link.addEventListener("click", () => close(false));
    });

    menu.addEventListener("keydown", (e) => {
      if (!menu.classList.contains("is-open")) return;

      if (e.key === "Escape") {
        close();
        return;
      }

      if (e.key === "Tab") {
        const focusable = getFocusable();
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    const desktopQuery = window.matchMedia("(min-width: 900px)");
    const handleDesktopChange = (e) => {
      if (e.matches && menu.classList.contains("is-open")) close(false);
    };
    if (typeof desktopQuery.addEventListener === "function") {
      desktopQuery.addEventListener("change", handleDesktopChange);
    } else if (typeof desktopQuery.addListener === "function") {
      /* Safari < 14 fallback */
      desktopQuery.addListener(handleDesktopChange);
    }
  }

  /* ==================== Active nav link on scroll ==================== */

  function initActiveNav() {
    const links = document.querySelectorAll(".nav__link");
    if (!links.length) return;

    const sections = Array.from(links)
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    if (!sections.length) return;

    const setActive = (id) => {
      links.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* ==================== Reveal on scroll ==================== */

  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const groups = new Map();
    items.forEach((el) => {
      const parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });

    groups.forEach((siblings) => {
      siblings.forEach((el, index) => {
        el.style.transitionDelay = `${index * 70}ms`;
      });
    });

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    items.forEach((el) => observer.observe(el));
  }

  /* ==================== Footer year ==================== */

  function initFooterYear() {
    const el = document.getElementById("footerYear");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ==================== Init ==================== */

  document.addEventListener("DOMContentLoaded", () => {
    applyLang(detectLang());
    initLangSwitch();
    initHeaderScroll();
    initMobileMenu();
    initActiveNav();
    initReveal();
    initFooterYear();
  });
})();
