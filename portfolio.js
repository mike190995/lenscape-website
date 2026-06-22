/**
 * LENSCAPE — PORTFOLIO PAGE JS
 * Filter logic with URL parameter support, cursor, navbar, scroll reveals
 */

import './style.css'
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initBookingModal } from './booking.js'

gsap.registerPlugin(ScrollTrigger)

// ============================================================
// LOADER
// ============================================================
document.fonts.ready.then(() => {
  setTimeout(() => {
    const loader = document.getElementById('loader')
    gsap.to(loader, {
      yPercent:  -100,
      duration:  1.0,
      ease:      'power4.inOut',
      onComplete: initPage
    })
  }, 1600)
})

// ============================================================
// FILTER LOGIC
// ============================================================
const CATEGORIES = {
  all:          { label: 'ALL WORK',    count: null },
  branding:     { label: 'BRANDING',   count: null },
  digital:      { label: 'DIGITAL',    count: null },
  motionmagic:  { label: 'MOTIONMAGIC',count: null }
}

let activeFilter = 'all'

function getFilterFromURL() {
  const params = new URLSearchParams(window.location.search)
  const f = params.get('filter')
  return CATEGORIES[f] ? f : 'all'
}

function setFilter(filter, pushState = true) {
  activeFilter = filter
  const items   = document.querySelectorAll('.portfolio-item[data-category]')
  const tabs    = document.querySelectorAll('.filter-tab')
  const countEl = document.getElementById('filter-count')
  const empty   = document.getElementById('portfolio-empty')

  // Update tabs
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.filter === filter)
  })

  // Show/hide items with stagger
  let visible = 0
  items.forEach((item, i) => {
    const match = filter === 'all' || item.dataset.category === filter
    if (match) {
      item.classList.remove('hidden')
      gsap.fromTo(item,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, delay: visible * 0.06, ease: 'power2.out' }
      )
      visible++
    } else {
      gsap.to(item, {
        opacity: 0, y: -10, duration: 0.3, ease: 'power2.in',
        onComplete: () => item.classList.add('hidden')
      })
    }
  })

  // Count label
  if (countEl) countEl.textContent = `${visible} PROJECT${visible !== 1 ? 'S' : ''}`

  // Empty state
  if (empty) empty.classList.toggle('visible', visible === 0)

  // Update URL without reload
  if (pushState) {
    const url = filter === 'all'
      ? window.location.pathname
      : `${window.location.pathname}?filter=${filter}`
    window.history.pushState({ filter }, '', url)
  }
}

// ============================================================
// MAIN PAGE INIT
// ============================================================
function initPage() {

  // --- Lenis Smooth Scroll ---
  const lenis = new Lenis({
    duration:        1.4,
    easing:          t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth:          true,
    mouseMultiplier: 1,
    lerp:            0.1
  })
  window.lenis = lenis

  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(time => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  // --- Hero entrance ---
  gsap.fromTo('h1.drama-text, .portfolio-hero p, .section-label',
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: 'power3.out', delay: 0.2 }
  )

  // --- Scroll Reveal ---
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible')
        observer.unobserve(e.target)
      }
    })
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })

  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right')
    .forEach(el => observer.observe(el))

  // --- Filter Tab Clicks ---
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => setFilter(tab.dataset.filter))
  })

  // --- Apply URL filter on load ---
  const initialFilter = getFilterFromURL()
  setFilter(initialFilter, false)

  // --- Browser back/forward ---
  window.addEventListener('popstate', e => {
    const f = e.state?.filter || 'all'
    setFilter(f, false)
  })

  // --- Portfolio item hover — GSAP micro animation ---
  document.querySelectorAll('.portfolio-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      gsap.to(item.querySelector('.portfolio-item-bg'), {
        scale:    1.05,
        duration: 0.7,
        ease:     'power2.out'
      })
    })
    item.addEventListener('mouseleave', () => {
      gsap.to(item.querySelector('.portfolio-item-bg'), {
        scale:    1,
        duration: 0.6,
        ease:     'power2.inOut'
      })
    })
  })

  // --- Navbar Scroll Class ---
  const navbar = document.querySelector('.navbar')
  ScrollTrigger.create({
    start:       '80px top',
    onEnter:     () => navbar?.classList.add('scrolled'),
    onLeaveBack: () => navbar?.classList.remove('scrolled')
  })

  // --- Magnetic Cursor ---
  const cursor = document.querySelector('.custom-cursor')
  let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0

  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY })

  gsap.ticker.add(() => {
    cursorX += (mouseX - cursorX) * 0.15
    cursorY += (mouseY - cursorY) * 0.15
    gsap.set(cursor, { x: cursorX, y: cursorY })
  })

  document.querySelectorAll('.hover-target, a, button, .portfolio-item').forEach(el => {
    el.addEventListener('mouseenter', () =>
      gsap.to(cursor, { scale: 3, opacity: 0.5, duration: 0.3, ease: 'power2.out' }))
    el.addEventListener('mouseleave', () =>
      gsap.to(cursor, { scale: 1, opacity: 1,   duration: 0.3, ease: 'power2.out' }))
  })

  // --- Portfolio items stagger on scroll ---
  gsap.utils.toArray('.portfolio-item').forEach((item, i) => {
    gsap.fromTo(item,
      { opacity: 0, y: 60 },
      {
        scrollTrigger: {
          trigger: item,
          start:   'top 92%',
          once:    true
        },
        opacity:  1,
        y:        0,
        duration: 0.7,
        delay:    (i % 4) * 0.08,
        ease:     'power2.out'
      }
    )
  })

  // --- Booking Modal ---
  initBookingModal()
}
