/**
 * LENSCAPE & EVENT LABS — HIGH PRECISION CUSTOM CURSOR
 * Replaces the browser's native cursor with an on-brand magnetic cursor.
 */

import { gsap } from 'gsap'

export function initCustomCursor() {
  const cursor = document.querySelector('.custom-cursor')
  if (!cursor) return

  // Disable on mobile/touch-only devices
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
    cursor.style.display = 'none'
    return
  }

  let mouseX = -100, mouseY = -100
  let cursorX = -100, cursorY = -100
  let isHovering = false
  let hasMoved = false

  // Track physical pointer position
  window.addEventListener('mousemove', e => {
    mouseX = e.clientX
    mouseY = e.clientY
    if (!hasMoved) {
      hasMoved = true
      cursorX = mouseX
      cursorY = mouseY
      gsap.set(cursor, { x: cursorX, y: cursorY, xPercent: -50, yPercent: -50, opacity: 1 })
    }
  }, { passive: true })

  // Gracefully fade out when leaving viewport
  document.addEventListener('mouseleave', () => {
    gsap.to(cursor, { opacity: 0, duration: 0.2, ease: 'power2.out' })
  })

  // Gracefully fade in when re-entering viewport
  document.addEventListener('mouseenter', () => {
    if (hasMoved) {
      gsap.to(cursor, { opacity: 1, duration: 0.2, ease: 'power2.out' })
    }
  })

  // Ticker for fluid, responsive follow (0.35 lerp for snappy accuracy)
  gsap.ticker.add(() => {
    if (!hasMoved) return
    cursorX += (mouseX - cursorX) * 0.35
    cursorY += (mouseY - cursorY) * 0.35
    gsap.set(cursor, { x: cursorX, y: cursorY, xPercent: -50, yPercent: -50 })
  })

  // Event delegation for all interactive elements (handles static and dynamically rendered elements)
  const interactiveSelector = [
    'a',
    'button',
    '.hover-target',
    '[role="button"]',
    'input',
    'textarea',
    'select',
    'summary',
    'label',
    '.color-swatch-btn',
    '.carousel-dot',
    '.carousel-nav-btn',
    '.faq-question',
    '.currency-toggle-btn',
    '.portfolio-item',
    '.bento-card',
    '.cal-day:not(.disabled)'
  ].join(', ')

  document.addEventListener('mouseover', e => {
    if (e.target && e.target.closest && e.target.closest(interactiveSelector)) {
      isHovering = true
      cursor.classList.add('active')
      gsap.to(cursor, { scale: 2.8, opacity: 0.65, duration: 0.25, ease: 'power2.out' })
    }
  })

  document.addEventListener('mouseout', e => {
    if (e.target && e.target.closest && e.target.closest(interactiveSelector)) {
      const stillHovering = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(interactiveSelector)
      if (!stillHovering) {
        isHovering = false
        cursor.classList.remove('active')
        gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.25, ease: 'power2.out' })
      }
    }
  })

  // Tactile click feedback
  window.addEventListener('mousedown', () => {
    gsap.to(cursor, { scale: isHovering ? 2.0 : 0.75, duration: 0.12, ease: 'power2.out' })
  })

  window.addEventListener('mouseup', () => {
    gsap.to(cursor, { scale: isHovering ? 2.8 : 1, duration: 0.15, ease: 'power2.out' })
  })
}
