/* ==========================================================================
   product-page.js — interacciones de la ficha de producto (ES6+)
   Se carga con `defer`, por lo que el DOM ya está listo al ejecutarse.
   JS discreto (unobtrusive): sin `onclick` inline; todo por event listeners
   y delegación de eventos.
   ========================================================================== */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // --- Utilidades de foco para modales accesibles (focus-trap) ---
  let restoreFocusEl = null; // elemento al que devolver el foco al cerrar
  const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
  const trapTab = (e, container) => {
    if (e.key !== "Tab") return;
    const items = $$(FOCUSABLE, container).filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  /* ---------- Menú móvil (hamburguesa) ---------- */
  const menuBtn = $("#menu-btn");
  const mobileMenu = $("#mobile-menu");

  menuBtn?.addEventListener("click", () => {
    const isOpen = !mobileMenu.classList.toggle("hidden");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    const icon = menuBtn.querySelector("i");
    if (icon) icon.className = `fa-solid ${isOpen ? "fa-xmark" : "fa-bars"} text-lg`;
  });

  /* ---------- Dropdown de listas de precios (escritorio) ---------- */
  const ddBtn = $("#precios-btn");
  const ddPanel = $("#precios-panel");
  const ddChev = $("#precios-chev");

  const setDropdown = (open) => {
    ddPanel.dataset.open = String(open);
    ddBtn.setAttribute("aria-expanded", String(open));
    ddChev.style.transform = open ? "rotate(180deg)" : "";
  };

  if (ddBtn && ddPanel) {
    ddBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      setDropdown(ddPanel.dataset.open !== "true");
    });
    document.addEventListener("click", (e) => {
      if (ddPanel.dataset.open === "true" && !ddPanel.contains(e.target) && !ddBtn.contains(e.target)) {
        setDropdown(false);
      }
    });
  }

  /* ---------- Galería: miniaturas e imagen principal ---------- */
  const imgMain = $("#img-main");

  const setMain = (btn) => {
    const { src } = btn.dataset;
    if (!src || !imgMain) return;
    imgMain.src = src;
    $$(".thumb").forEach((t) => t.classList.replace("border-cisco", "border-gray-200"));
    btn.classList.replace("border-gray-200", "border-cisco");
  };

  // Delegación: cualquier .thumb (incluye la imagen interna vía closest)
  document.addEventListener("click", (e) => {
    const thumb = e.target.closest?.(".thumb");
    if (thumb) setMain(thumb);
  });

  /* ---------- Modal de imagen ampliada ---------- */
  const modal = $("#image-modal");
  const modalImg = $("#modal-img");

  const openModal = (src) => {
    if (!modal || !src) return;
    modalImg.src = src;
    restoreFocusEl = document.activeElement;
    modal.classList.replace("hidden", "flex");
    document.body.style.overflow = "hidden";
    modal.querySelector("[data-close-modal]")?.focus();
  };
  const closeModal = () => {
    if (!modal || modal.classList.contains("hidden")) return;
    modal.classList.replace("flex", "hidden");
    document.body.style.overflow = "";
    restoreFocusEl?.focus?.();
  };

  // Abrir: cualquier elemento con [data-zoom] usa su propia imagen
  document.addEventListener("click", (e) => {
    const zoomable = e.target.closest?.("[data-zoom]");
    if (zoomable) openModal(zoomable.currentSrc || zoomable.src);
  });
  // Cerrar: clic en el backdrop o en el botón de cierre
  modal?.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest("[data-close-modal]")) closeModal();
  });

  /* ---------- Modal de búsqueda ---------- */
  const searchBtn = $("#search-btn");
  const searchModal = $("#search-modal");
  const searchInput = $("#search-input");

  const openSearch = () => {
    if (!searchModal) return;
    restoreFocusEl = document.activeElement;
    searchModal.classList.replace("hidden", "flex");
    document.body.style.overflow = "hidden";
    searchInput?.focus();
  };
  const closeSearch = () => {
    if (!searchModal || searchModal.classList.contains("hidden")) return;
    searchModal.classList.replace("flex", "hidden");
    document.body.style.overflow = "";
    restoreFocusEl?.focus?.();
  };

  searchBtn?.addEventListener("click", openSearch);
  searchModal?.addEventListener("click", (e) => {
    if (e.target === searchModal || e.target.closest("[data-close-search]")) {
      closeSearch();
      return;
    }
    // Chip de búsqueda frecuente: rellena el input y envía el formulario
    const chip = e.target.closest("[data-query]");
    if (chip && searchInput) {
      searchInput.value = chip.dataset.query;
      chip.closest("form")?.submit();
    }
  });

  /* ---------- Teclado: Escape cierra, Tab queda atrapado en el modal ---------- */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeSearch();
      if (ddPanel?.dataset.open === "true") {
        setDropdown(false);
        ddBtn.focus();
      }
      return;
    }
    // Focus-trap: mientras un modal esté visible, el Tab cicla dentro de él
    if (e.key === "Tab") {
      if (modal && !modal.classList.contains("hidden")) trapTab(e, modal);
      else if (searchModal && !searchModal.classList.contains("hidden")) trapTab(e, searchModal);
    }
  });

  /* ---------- Pestañas Especificaciones / Imágenes ---------- */
  const tabSpecs = $("#tab-specs");
  const tabImages = $("#tab-images");
  const panelSpecs = $("#panel-specs");
  const panelImages = $("#panel-images");

  const selectTab = (showSpecs) => {
    panelSpecs.classList.toggle("hidden", !showSpecs);
    panelImages.classList.toggle("hidden", showSpecs);
    tabSpecs.setAttribute("aria-selected", String(showSpecs));
    tabImages.setAttribute("aria-selected", String(!showSpecs));
    tabSpecs.classList.toggle("bg-cisco", showSpecs);
    tabSpecs.classList.toggle("text-white", showSpecs);
    tabImages.classList.toggle("bg-cisco", !showSpecs);
    tabImages.classList.toggle("text-white", !showSpecs);
  };

  tabSpecs?.addEventListener("click", () => selectTab(true));
  tabImages?.addEventListener("click", () => selectTab(false));
})();
