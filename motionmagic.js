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

// --- Image Sequence Setup ---
const frameCount = 177
const images     = []
let imagesLoaded = 0

const currentFrame = index =>
  `/hero/lenscape glambot_17902106327947948917_sample_${(1000 + index).toString()}.png`

function preloadImages() {
  return new Promise(resolve => {
    for (let i = 0; i < frameCount; i++) {
      const img    = new Image()
      img.onload  = () => { if (++imagesLoaded === frameCount) resolve() }
      img.onerror = () => { if (++imagesLoaded === frameCount) resolve() }
      img.src      = currentFrame(i)
      images.push(img)
    }
  })
}

Promise.all([document.fonts.ready, preloadImages()]).then(() => {
  const loader = document.getElementById('loader')
  gsap.to(loader, {
    yPercent:  -100,
    duration:  1.2,
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

  const getIsMobile = () => window.innerWidth <= 768;

  const airship = {
    frame: 0,
    x:     getIsMobile() ? 0 : window.innerWidth * 0.15,
    y:     getIsMobile() ? 0 : window.innerHeight * 0.15
  }

  function resizeCanvas() {
    canvas.width  = window.innerWidth  * window.devicePixelRatio
    canvas.height = window.innerHeight * window.devicePixelRatio
    if (airship.frame === 0) {
      airship.x = getIsMobile() ? 0 : window.innerWidth * 0.15
      airship.y = getIsMobile() ? 0 : window.innerHeight * 0.15
    }
    render()
  }

  window.addEventListener('resize', resizeCanvas)
  resizeCanvas()

  function render() {
    if (!images[airship.frame]) return
    const img          = images[airship.frame]
    const canvasAspect = canvas.width  / canvas.height
    const imgAspect    = img.width     / img.height
    let drawWidth, drawHeight, offsetX, offsetY

    if (canvasAspect > imgAspect) {
      drawWidth  = canvas.width
      drawHeight = canvas.width / imgAspect
      offsetX    = 0
      offsetY    = (canvas.height - drawHeight) / 2
    } else {
      const isMobile = getIsMobile()
      // On mobile portrait, scale comfortably so the full robotic arm & camera head are framed
      const scaleMultiplier = isMobile ? 0.90 : 1.0
      drawHeight = canvas.height * scaleMultiplier
      drawWidth  = drawHeight * imgAspect
      offsetX    = (canvas.width  - drawWidth)  / 2
      // On mobile portrait, position slightly lower so the top camera head clears the mobile navbar with breathing room
      offsetY    = isMobile ? (canvas.height - drawHeight) * 0.65 : 0
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

  // --- Booth Cards Scroll Reveal ---
  gsap.utils.toArray('.booth-card').forEach((card, i) => {
    gsap.fromTo(card,
      { y: 80, opacity: 0 },
      {
        scrollTrigger: {
          trigger: card,
          start:   'top 88%',
          end:     'top 60%',
          scrub:   1
        },
        y:       0,
        opacity: 1,
        ease:    'power2.out',
        delay:   i * 0.05
      }
    )
  })

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

  // --- Magnetic Cursor ---
  const cursor = document.querySelector('.custom-cursor')
  let mouseX = 0, mouseY = 0
  let cursorX = 0, cursorY = 0

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
      gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }))
  })

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

  // --- Booking Modal ---
  initBookingModal()
}
