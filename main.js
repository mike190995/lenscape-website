/**
 * LENSCAPE — HOMEPAGE JS
 * Sub-Agent B: Frontend Component Builder
 * Animated geometric hero, scroll reveals, cursor, marquee, booking modal.
 */

import './style.css'
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initBookingModal } from './booking.js'

gsap.registerPlugin(ScrollTrigger)

// ============================================================
// HERO CANVAS — Animated Geometric Background
// ============================================================
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas-bg')
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let W, H, particles = [], animFrame

  function resize() {
    W = canvas.width  = window.innerWidth
    H = canvas.height = window.innerHeight
    initParticles()
  }

  function initParticles() {
    particles = Array.from({ length: 70 }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      vx:    (Math.random() - 0.5) * 0.28,
      vy:    (Math.random() - 0.5) * 0.28,
      r:     Math.random() * 1.6 + 0.4,
      alpha: Math.random() * 0.22 + 0.08
    }))
  }

  function draw() {
    ctx.clearRect(0, 0, W, H)

    // Grid lines
    ctx.strokeStyle = 'rgba(242,196,26,0.04)'
    ctx.lineWidth   = 0.5
    for (let x = 0; x <= W; x += 42) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
    }
    for (let y = 0; y <= H; y += 42) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    }

    // Diagonal accent lines
    const diagonals = [
      { x1: W * 0.1, y1: 0,   x2: W * 0.6,  y2: H },
      { x1: W * 0.5, y1: 0,   x2: W * 0.95, y2: H },
      { x1: W * 0.75,y1: 0,   x2: W * 0.2,  y2: H },
    ]
    diagonals.forEach(d => {
      ctx.strokeStyle = 'rgba(242,196,26,0.03)'
      ctx.lineWidth   = 1
      ctx.beginPath(); ctx.moveTo(d.x1, d.y1); ctx.lineTo(d.x2, d.y2); ctx.stroke()
    })

    // Particles
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(242,196,26,${p.alpha})`
      ctx.fill()
    })

    animFrame = requestAnimationFrame(draw)
  }

  window.addEventListener('resize', resize)
  resize()
  draw()

  return () => cancelAnimationFrame(animFrame)
}

// ============================================================
// LOADER → INIT
// ============================================================
document.fonts.ready.then(() => {
  const loader = document.getElementById('loader')

  // Short delay so loader bar animation completes visually
  setTimeout(() => {
    initHeroCanvas()

    gsap.to(loader, {
      yPercent:  -100,
      duration:  1.2,
      ease:      'power4.inOut',
      onComplete: initInteractions
    })
  }, 1800)
})

// ============================================================
// MAIN INTERACTIONS
// ============================================================
function initInteractions() {

  // --- Lenis Smooth Scroll ---
  const lenis = new Lenis({
    duration:         1.5,
    easing:           t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction:        'vertical',
    gestureDirection: 'vertical',
    smooth:           true,
    mouseMultiplier:  1,
    smoothTouch:      false,
    touchMultiplier:  2,
    infinite:         false,
    lerp:             0.1
  })
  window.lenis = lenis

  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(time => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  // --- Hero Word Animation ---
  gsap.fromTo('.hero-word-inner',
    { y: '105%', opacity: 0 },
    {
      y:        '0%',
      opacity:  1,
      duration: 1.2,
      stagger:  0.14,
      ease:     'power4.out',
      delay:    0.3
    }
  )

  // Fade in hero meta elements
  gsap.fromTo('.home-hero-actions, .hero-telemetry, .section-label',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power3.out', delay: 0.8 }
  )

  // --- Scroll Reveal (IntersectionObserver) ---
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right')
  const observer  = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })

  revealEls.forEach(el => observer.observe(el))

  // --- Service Cards GSAP Scroll Animation ---
  gsap.utils.toArray('.service-card').forEach((card, i) => {
    gsap.fromTo(card,
      { y: 100, opacity: 0 },
      {
        scrollTrigger: {
          trigger: card,
          start:   'top 88%',
          end:     'top 60%',
          scrub:   1
        },
        y:       0,
        opacity: 1,
        ease:    'power2.out'
      }
    )
  })

  // --- Philosophy Parallax ---
  gsap.from('.phil-col.left', {
    scrollTrigger: {
      trigger: '.philosophy-section',
      start:   'top 70%',
      end:     'bottom top',
      scrub:   1
    },
    y:       80,
    opacity: 0.4
  })

  gsap.from('.phil-col.right', {
    scrollTrigger: {
      trigger: '.philosophy-section',
      start:   'top 80%',
      end:     'bottom top',
      scrub:   1.5
    },
    y:       140,
    opacity: 0
  })

  // --- Header Fade Scroll ---
  const headers = gsap.utils.toArray('h2, h3').filter(h => !h.closest('.home-hero'))
  headers.forEach(header => {
    gsap.timeline({
      scrollTrigger: {
        trigger: header,
        start:   'top 100%',
        end:     'top -25%',
        scrub:   true
      }
    })
      .fromTo(header, { opacity: 0 }, { opacity: 1, duration: 0.3 })
      .to(header,    { opacity: 1, duration: 0.4 })
      .to(header,    { opacity: 0.2, duration: 0.3 })
  })

  // --- Marquee ---
  gsap.to('.marquee-track', {
    xPercent: -50,
    ease:     'none',
    duration: 18,
    repeat:   -1
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

  document.querySelectorAll('.hover-target, a, button').forEach(el => {
    el.addEventListener('mouseenter', () =>
      gsap.to(cursor, { scale: 3, opacity: 0.5, duration: 0.3, ease: 'power2.out' }))
    el.addEventListener('mouseleave', () =>
      gsap.to(cursor, { scale: 1, opacity: 1,   duration: 0.3, ease: 'power2.out' }))
  })

  // --- Realtime Clock ---
  const updateClock = () => {
    const el = document.getElementById('hero-time')
    if (el) el.textContent = `| ${new Date().toLocaleTimeString('en-US', { hour12: false })} | SYS.OK`
  }
  updateClock()
  setInterval(updateClock, 1000)

  // --- Massive CTA click → booking ---
  document.querySelector('.massive-cta')?.addEventListener('click', () => {
    document.querySelector('.book-now-btn')?.click()
  })

  // --- Booking Modal ---
  initBookingModal()
}
