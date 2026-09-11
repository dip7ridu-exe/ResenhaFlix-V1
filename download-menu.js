(() => {
  "use strict";

  const menu = document.getElementById("appDownloadMenu");
  const panel = menu?.querySelector(".appDownloadPanel");
  const trigger = document.getElementById("logoHome");
  const closeButton = document.getElementById("appDownloadClose");
  const backdrop = document.getElementById("appDownloadBackdrop");

  if (!menu || !panel || !trigger || !closeButton || !backdrop) return;

  let lastFocusedElement = null;

  function isOpen() {
    return !menu.hidden;
  }

  function openMenu() {
    if (isOpen()) return;
    lastFocusedElement = document.activeElement;
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    document.body.classList.add("appDownloadOpen");
    requestAnimationFrame(() => panel.focus({ preventScroll: true }));
  }

  function closeMenu({ restoreFocus = true } = {}) {
    if (!isOpen()) return;
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("appDownloadOpen");
    if (restoreFocus && lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus({ preventScroll: true });
    }
  }

  function toggleMenu() {
    if (isOpen()) closeMenu();
    else openMenu();
  }

  trigger.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleMenu();
  };

  closeButton.addEventListener("click", () => closeMenu());
  backdrop.addEventListener("click", () => closeMenu());

  menu.querySelectorAll("[data-download-platform]").forEach((link) => {
    link.addEventListener("click", () => closeMenu({ restoreFocus: false }));
  });

  document.addEventListener("keydown", (event) => {
    if (!isOpen()) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = [...panel.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])")];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();
