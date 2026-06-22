/**
 * LENSCAPE — CONTACT PAGE JS
 * Form validation, submission, cursor, navbar, smooth scroll
 */

import './style.css'
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initBookingModal } from './booking.js'

gsap.registerPlugin(ScrollTrigger)

// ============================================================
// CONFIG — same Google Apps Script endpoint pattern
// ============================================================
const CONTACT_ENDPOINT = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'
const STUB_MODE = CONTACT_ENDPOINT.includes('YOUR_DEPLOYMENT_ID')

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
// FORM VALIDATION
// ============================================================
function validateContactForm() {
  let valid = true

  // Name
  const name = document.getElementById('cf-name')
  if (!name?.value.trim()) {
    showErr('err-cf-name', true); name?.classList.add('invalid'); valid = false
  } else {
    showErr('err-cf-name', false); name?.classList.remove('invalid')
  }

  // Email
  const email = document.getElementById('cf-email')
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.value || '')
  if (!emailOk) {
    showErr('err-cf-email', true); email?.classList.add('invalid'); valid = false
  } else {
    showErr('err-cf-email', false); email?.classList.remove('invalid')
  }

  // Subject
  const subject = document.getElementById('cf-subject')
  if (!subject?.value) {
    showErr('err-cf-subject', true); subject?.classList.add('invalid'); valid = false
  } else {
    showErr('err-cf-subject', false); subject?.classList.remove('invalid')
  }

  // Message
  const message = document.getElementById('cf-message')
  if (!message?.value.trim() || message.value.trim().length < 10) {
    showErr('err-cf-message', true); message?.classList.add('invalid'); valid = false
  } else {
    showErr('err-cf-message', false); message?.classList.remove('invalid')
  }

  return valid
}

function showErr(id, show) {
  const el = document.getElementById(id)
  if (el) el.classList.toggle('visible', show)
}

// ============================================================
// SUBMIT HANDLER
// ============================================================
async function submitContactForm(e) {
  e.preventDefault()
  if (!validateContactForm()) return

  const btn    = document.getElementById('cf-submit')
  const status = document.getElementById('cf-status')

  // Loading state
  btn.innerHTML = '<span>SENDING...</span>'
  btn.disabled  = true
  if (status) { status.className = 'contact-form-status'; status.textContent = '' }

  const payload = {
    timestamp: new Date().toISOString(),
    type:      'contact_enquiry',
    name:      document.getElementById('cf-name')?.value.trim(),
    email:     document.getElementById('cf-email')?.value.trim(),
    phone:     document.getElementById('cf-phone')?.value.trim(),
    subject:   document.getElementById('cf-subject')?.value,
    budget:    document.getElementById('cf-budget')?.value || 'Not specified',
    message:   document.getElementById('cf-message')?.value.trim(),
  }

  console.log('[Lenscape Contact] Payload:', payload)

  try {
    if (STUB_MODE) {
      // Stub: simulate network delay
      await new Promise(r => setTimeout(r, 1200))
      showSuccess(status, btn)
    } else {
      await fetch(CONTACT_ENDPOINT, {
        method:  'POST',
        mode:    'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      })
      showSuccess(status, btn)
    }
  } catch (err) {
    console.error('[Lenscape Contact] Error:', err)
    btn.innerHTML = '<span>SEND MESSAGE →</span>'
    btn.disabled  = false
    if (status) {
      status.className  = 'contact-form-status error'
      status.textContent = '// SEND FAILED — PLEASE TRY AGAIN OR CALL US DIRECTLY.'
    }
  }
}

function showSuccess(status, btn) {
  // Hide form fields with animation
  const form = document.getElementById('contact-form')
  gsap.to(form.querySelectorAll('.form-row, .form-group, .contact-submit-wrap'), {
    opacity:  0,
    y:       -20,
    stagger:  0.05,
    duration: 0.4,
    ease:     'power2.in',
    onComplete: () => {
      form.innerHTML = `
        <div style="padding: 4rem 0; text-align: left;">
          <div style="font-size: 3rem; margin-bottom: 2rem;">◆</div>
          <div class="drama-text" style="font-size: 2.2rem; font-weight: 800; margin-bottom: 1rem; color: var(--text-primary);">
            Message Received.
          </div>
          <div class="data-text" style="color: var(--accent); margin-bottom: 2rem;">
            // WE'LL BE IN TOUCH WITHIN 24 HOURS
          </div>
          <p style="color: var(--text-muted); font-size: 1rem; line-height: 1.8; max-width: 38ch; margin-bottom: 3rem;">
            Thank you for reaching out. A member of the Lenscape team will review your message
            and get back to you shortly.
          </p>
          <div style="display: flex; gap: 1.25rem; flex-wrap: wrap;">
            <a href="/" class="btn-ghost hover-target">← BACK TO HOME</a>
            <a href="/portfolio.html" class="btn-primary hover-target"><span>VIEW OUR WORK →</span></a>
          </div>
        </div>
      `
    }
  })
}

// ============================================================
// PAGE INIT
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
  gsap.fromTo('.contact-page-hero h1, .contact-page-hero p, .contact-page-hero .section-label',
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration: 1.1, stagger: 0.14, ease: 'power3.out', delay: 0.2 }
  )

  gsap.fromTo('.contact-form-wrap, .contact-info-panel',
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.5 }
  )

  // --- Form submit ---
  document.getElementById('contact-form')
    ?.addEventListener('submit', submitContactForm)

  // --- Live input feedback (remove invalid state on change) ---
  document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
    el.addEventListener('input', () => {
      el.classList.remove('invalid')
      const errId = el.id ? `err-${el.id.replace('cf-', 'cf-')}` : null
      if (errId) showErr(errId.replace('err-cf-', 'err-cf-'), false)
    })
  })

  // --- Navbar Scroll Class ---
  const navbar = document.querySelector('.navbar')
  ScrollTrigger.create({
    start:       '80px top',
    onEnter:     () => navbar?.classList.add('scrolled'),
    onLeaveBack: () => navbar?.classList.remove('scrolled')
  })

  // --- Scroll Reveal ---
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right')
    .forEach(el => observer.observe(el))

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

  // --- Info panel scroll reveal ---
  gsap.utils.toArray('.contact-info-block, .contact-map-block').forEach((block, i) => {
    gsap.fromTo(block,
      { opacity: 0, x: 30 },
      {
        scrollTrigger: { trigger: block, start: 'top 88%', once: true },
        opacity: 1, x: 0,
        duration: 0.7,
        delay:    i * 0.1,
        ease:     'power2.out'
      }
    )
  })

  // --- Booking Modal ---
  initBookingModal()
}
