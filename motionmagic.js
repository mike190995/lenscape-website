/**
 * LENSCAPE — MOTIONMAGIC CAM PAGE
 * Scroll-driven canvas image sequence + booth showcase + booking modal
 */

import './style.css'
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initBookingModal } from './booking.js'
import './mobile-nav.js'
import './telemetry.js'
import { initCustomCursor } from './cursor.js'

gsap.registerPlugin(ScrollTrigger)

const isEventLabs = window.location.pathname.includes('/eventlabs') || document.body.classList.contains('eventlabs')
if (isEventLabs) {
  document.body.classList.add('eventlabs')
  document.documentElement.style.setProperty('--accent', '#CFDC3B')
  document.documentElement.style.setProperty('--accent-dim', 'rgba(207, 220, 59, 0.15)')
  document.documentElement.style.setProperty('--accent-glow', 'rgba(207, 220, 59, 0.35)')
  document.documentElement.style.setProperty('--accent-secondary', '#36B1D3')
  document.documentElement.style.setProperty('--accent-cyan', '#36B1D3')
  document.documentElement.style.setProperty('--accent-magenta', '#D32C87')
}

// --- Image Sequence Setup (Optimized WebP Pipeline) ---
const frameCount = 177
const CRITICAL_FRAMES = 25 // Unblock preloader with first 25 frames (~500KB)
const images     = new Array(frameCount)
let criticalLoaded = 0

const currentFrame = index =>
  `/hero/lenscape glambot_17902106327947948917_sample_${(1000 + index).toString()}.webp`

function loadSingleFrame(index) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => { images[index] = img; resolve(img) }
    img.onerror = () => { images[index] = img; resolve(img) }
    img.src = currentFrame(index)
  })
}

function preloadImages() {
  return new Promise(resolve => {
    // 1. Preload critical initial frames to unblock loader rapidly
    const criticalPromises = []
    for (let i = 0; i < CRITICAL_FRAMES; i++) {
      criticalPromises.push(loadSingleFrame(i))
    }

    Promise.all(criticalPromises).then(() => {
      resolve() // Dismiss loader!
      
      // 2. Stream remaining frames in background
      for (let i = CRITICAL_FRAMES; i < frameCount; i++) {
        loadSingleFrame(i)
      }
    })
  })
}

Promise.all([document.fonts.ready, preloadImages()]).then(() => {
  const loader = document.getElementById('loader')
  gsap.to(loader, {
    yPercent:  -100,
    duration:  1.0,
    ease:      'power4.inOut',
    onComplete: initInteractions
  })
})

function initInteractions() {
  // --- Smooth Scroll ---
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

  // --- Canvas Image Sequence ---
  const canvas  = document.getElementById('hero-canvas')
  const context = canvas.getContext('2d', { alpha: false })

  context.imageSmoothingEnabled  = true
  context.imageSmoothingQuality  = 'high'

  const airship = {
    frame: 0,
    x:     window.innerWidth * 0.15,
    y:     window.innerHeight * 0.15
  }

  function resizeCanvas() {
    canvas.width  = window.innerWidth  * window.devicePixelRatio
    canvas.height = window.innerHeight * window.devicePixelRatio
    render()
  }

  window.addEventListener('resize', resizeCanvas)
  resizeCanvas()

  function render() {
    let frameIdx = airship.frame
    if (!images[frameIdx]) {
      for (let d = 1; d < frameCount; d++) {
        if (frameIdx - d >= 0 && images[frameIdx - d]) { frameIdx = frameIdx - d; break }
        if (frameIdx + d < frameCount && images[frameIdx + d]) { frameIdx = frameIdx + d; break }
      }
    }
    const img = images[frameIdx]
    if (!img || !img.complete) return
    const canvasAspect = canvas.width  / canvas.height
    const imgAspect    = img.width     / img.height
    let drawWidth, drawHeight, offsetX, offsetY

    if (canvasAspect > imgAspect) {
      drawWidth  = canvas.width
      drawHeight = canvas.width / imgAspect
      offsetX    = 0
      offsetY    = (canvas.height - drawHeight) / 2
    } else {
      drawHeight = canvas.height
      drawWidth  = canvas.height * imgAspect
      offsetX    = (canvas.width  - drawWidth)  / 2
      offsetY    = 0
    }

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(img, offsetX + airship.x, offsetY + airship.y, drawWidth, drawHeight)
  }

  // Hero Scroll Timeline
  const heroTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.hero-scroll-container',
      start:   'top top',
      end:     'bottom bottom',
      scrub:   1.5,
      onUpdate: render
    }
  })

  heroTl.to(airship, { frame: frameCount - 1, snap: 'frame', ease: 'none', duration: 5 }, 0)
  heroTl.to(airship, { x: 0, y: 0, duration: 2, ease: 'power1.out' }, 0)
  heroTl.to('.main-hero', { opacity: 0, y: -100, duration: 0.5 }, 0.2)

  heroTl.to('#basic-package', { autoAlpha: 1, duration: 1, ease: 'power2.inOut' }, 1)
  heroTl.to('#basic-package', { autoAlpha: 0, duration: 1, ease: 'power2.inOut' }, 2.5)

  heroTl.to('#glam-package', { autoAlpha: 1, duration: 1, ease: 'power2.inOut' }, 3.5)
  heroTl.to('#glam-package', { autoAlpha: 0, duration: 1, ease: 'power2.inOut' }, 4.8)

  heroTl.to('.hero-sticky', { y: '-15%', scale: 0.9, opacity: 0.5, duration: 1, ease: 'none' }, 5)

  // --- Booth Carousel Reveal ---
  const carouselWrapper = document.querySelector('.booth-carousel-wrapper')
  if (carouselWrapper) {
    gsap.fromTo(carouselWrapper,
      { y: 50, opacity: 0 },
      {
        scrollTrigger: {
          trigger: '.booth-section',
          start:   'top 85%',
          end:     'top 55%',
          scrub:   1
        },
        y:       0,
        opacity: 1,
        ease:    'power2.out'
      }
    )
  }

  // --- Booth CTA Reveal ---
  gsap.from('.booth-cta h3', {
    scrollTrigger: {
      trigger: '.booth-cta',
      start:   'top 80%',
      end:     'top 50%',
      scrub:   1
    },
    y:       60,
    opacity: 0
  })

  // --- Custom Cursor ---
  initCustomCursor()

  // --- Navbar Scroll Style ---
  const navbar = document.querySelector('.navbar')
  ScrollTrigger.create({
    start:   '80px top',
    onEnter: ()  => navbar?.classList.add('scrolled'),
    onLeaveBack: () => navbar?.classList.remove('scrolled')
  })

  // --- Realtime Clock ---
  setInterval(() => {
    const timeSpan = document.getElementById('hero-time')
    if (timeSpan) {
      const now = new Date()
      timeSpan.innerText = `| TIME: ${now.toLocaleTimeString('en-US', { hour12: false })} | SYS.OK`
    }
  }, 1000)

  // --- FAQ Accordion ---
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen   = btn.getAttribute('aria-expanded') === 'true'
      const answer   = btn.nextElementSibling

      // Close all others first
      document.querySelectorAll('.faq-question[aria-expanded="true"]').forEach(openBtn => {
        openBtn.setAttribute('aria-expanded', 'false')
        openBtn.nextElementSibling?.classList.remove('open')
      })

      // Toggle clicked one
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true')
        answer?.classList.add('open')
      }
    })
  })

  // --- Scroll reveal for FAQ items ---
  gsap.utils.toArray('.faq-item').forEach((item, i) => {
    gsap.fromTo(item,
      { opacity: 0, y: 24 },
      {
        scrollTrigger: {
          trigger: item,
          start: 'top 92%',
          once: true
        },
        opacity: 1,
        y: 0,
        duration: 0.5,
        delay: (i % 5) * 0.07,
        ease: 'power2.out'
      }
    )
  })

  // --- Booth Carousel Controller ---
  const track = document.getElementById('booth-carousel-track')
  const prevBtn = document.getElementById('booth-prev-btn')
  const nextBtn = document.getElementById('booth-next-btn')
  const paginationContainer = document.getElementById('booth-carousel-pagination')

  if (track) {
    const cards = track.querySelectorAll('.booth-card')
    const dots = paginationContainer ? paginationContainer.querySelectorAll('.carousel-dot') : []

    const getScrollStep = () => {
      const firstCard = track.querySelector('.booth-card')
      return firstCard ? firstCard.offsetWidth + 28 : 360
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' })
      })
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: getScrollStep(), behavior: 'smooth' })
      })
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        if (cards[idx]) {
          cards[idx].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
        }
      })
    })

    // --- Desktop Cursor Drag-to-Scroll & Swipe Controller ---
    let isDown = false
    let startX = 0
    let scrollStart = 0
    let dragged = false
    let lastX = 0
    let lastTime = 0
    let velX = 0

    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      isDown = true
      dragged = false
      startX = e.clientX
      scrollStart = track.scrollLeft
      lastX = e.clientX
      lastTime = Date.now()
      velX = 0

      track.classList.add('is-dragging')
      try {
        track.setPointerCapture(e.pointerId)
      } catch (_) {}
    })

    track.addEventListener('pointermove', (e) => {
      if (!isDown) return
      const dx = e.clientX - startX
      if (Math.abs(dx) > 4) {
        dragged = true
      }

      const now = Date.now()
      const dt = now - lastTime
      if (dt > 0) {
        velX = (e.clientX - lastX) / dt
      }
      lastX = e.clientX
      lastTime = now

      track.scrollLeft = scrollStart - dx
    })

    const endDrag = (e) => {
      if (!isDown) return
      isDown = false
      track.classList.remove('is-dragging')
      try {
        track.releasePointerCapture(e.pointerId)
      } catch (_) {}

      // Flick inertia
      if (dragged && Math.abs(velX) > 0.25) {
        track.scrollBy({ left: -velX * 240, behavior: 'smooth' })
      }

      // Suppress accidental click if user was dragging
      if (dragged) {
        const suppressClick = (ev) => {
          ev.preventDefault()
          ev.stopPropagation()
          track.removeEventListener('click', suppressClick, true)
        }
        track.addEventListener('click', suppressClick, true)
      }
    }

    track.addEventListener('pointerup', endDrag)
    track.addEventListener('pointercancel', endDrag)

    // Sync active pagination dot on scroll
    let isScrolling
    track.addEventListener('scroll', () => {
      window.clearTimeout(isScrolling)
      isScrolling = setTimeout(() => {
        const scrollLeft = track.scrollLeft
        let activeIdx = 0
        let minDiff = Infinity

        cards.forEach((card, idx) => {
          const diff = Math.abs(card.offsetLeft - track.offsetLeft - scrollLeft)
          if (diff < minDiff) {
            minDiff = diff
            activeIdx = idx
          }
        })

        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === activeIdx)
        })
      }, 40)
    }, { passive: true })
  }

  // --- Fleet Currency Switcher (Event Labs) ---
  const currencyBtns = document.querySelectorAll('.currency-toggle-btn')
  currencyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedCurrency = btn.getAttribute('data-currency') // 'GYD' or 'USD'
      currencyBtns.forEach(b => b.classList.toggle('active', b === btn))

      // Update hero rate amounts
      document.querySelectorAll('.rate-display-hero').forEach(el => {
        const gyd = el.getAttribute('data-gyd')
        const usd = el.getAttribute('data-usd')
        if (gyd && usd) {
          const prim = el.querySelector('.rate-primary')
          const sec = el.querySelector('.rate-secondary')
          if (selectedCurrency === 'USD') {
            if (prim) prim.textContent = usd
            if (sec) sec.textContent = `| ${gyd}`
          } else {
            if (prim) prim.textContent = gyd
            if (sec) sec.textContent = `| ${usd}`
          }
        }
      })

      // Update compact rate values
      document.querySelectorAll('.rate-compact-val').forEach(el => {
        const gyd = el.getAttribute('data-gyd')
        const usd = el.getAttribute('data-usd')
        if (gyd && usd) {
          el.textContent = selectedCurrency === 'USD' ? usd : gyd
        }
      })
    })
  })

  // --- Booth Finish Switcher (Roamer Black/White) ---
  document.querySelectorAll('.color-swatch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.booth-color-toggle')
      if (parent) {
        parent.querySelectorAll('.color-swatch-btn').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
      }
      const targetId = btn.getAttribute('data-target')
      const targetImg = document.getElementById(targetId)
      const newSrc = btn.getAttribute('data-src')
      if (targetImg && newSrc) {
        gsap.to(targetImg, {
          opacity: 0,
          scale: 0.96,
          duration: 0.15,
          onComplete: () => {
            targetImg.src = newSrc
            targetImg.onload = () => {
              gsap.to(targetImg, { opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out' })
            }
          }
        })
      }
    })
  })

  // --- Booking Modal ---
  initBookingModal()
}
