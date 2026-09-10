/**
 * LENSCAPE & EVENT LABS — MOBILE NAVIGATION CONTROLLER
 * Handles responsive hamburger toggle, full-screen cyber menu drawer,
 * scroll prevention, accessibility, and link navigation.
 */

export function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const overlay = document.querySelector('.mobile-nav-overlay');
  const closeBtn = document.querySelector('.mobile-nav-close');
  const navLinks = document.querySelectorAll('.mobile-nav-links a');

  if (!toggleBtn || !drawer) return;

  let isOpen = false;

  function openMenu() {
    isOpen = true;
    toggleBtn.setAttribute('aria-expanded', 'true');
    drawer.classList.add('is-open');
    if (overlay) overlay.classList.add('is-open');
    document.body.classList.add('mobile-nav-active');

    // Pause Lenis smooth scroll if present
    if (window.lenis && typeof window.lenis.stop === 'function') {
      window.lenis.stop();
    }
  }

  function closeMenu() {
    isOpen = false;
    toggleBtn.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-open');
    document.body.classList.remove('mobile-nav-active');

    // Resume Lenis smooth scroll
    if (window.lenis && typeof window.lenis.start === 'function') {
      window.lenis.start();
    }
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenu();
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      if (isOpen) closeMenu();
    });
  }

  // Close when tapping any navigation link
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      closeMenu();
    }
  });

  // Close when window resized to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && isOpen) {
      closeMenu();
    }
  });
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMobileNav);
} else {
  initMobileNav();
}
