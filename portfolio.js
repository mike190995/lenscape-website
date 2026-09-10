/**
 * LENSCAPE — PORTFOLIO PAGE CONTROLLER
 * Dynamic grid rendering, video preview hover, photo album lightbox with filmstrip,
 * cinematic video player modal, graphic master inspection, and instant booking hooks.
 */

import './style.css'
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initBookingModal, openBookingModal } from './booking.js'
import { PORTFOLIO_PROJECTS, PORTFOLIO_CATEGORIES, getPortfolioProjects } from './portfolio-data.js'
import './mobile-nav.js'

gsap.registerPlugin(ScrollTrigger)

// ============================================================
// REGIONAL CONTEXT & EVENT LABS THEME ENFORCEMENT
// ============================================================
const isEventLabs = window.location.pathname.includes('/eventlabs') || document.body.classList.contains('eventlabs')
const activeProjects = getPortfolioProjects(isEventLabs)

if (isEventLabs) {
  document.body.classList.add('eventlabs')
  document.documentElement.style.setProperty('--accent', '#CFDC3B')
  document.documentElement.style.setProperty('--accent-dim', 'rgba(207, 220, 59, 0.15)')
  document.documentElement.style.setProperty('--accent-glow', 'rgba(207, 220, 59, 0.35)')
  document.documentElement.style.setProperty('--accent-secondary', '#36B1D3')
  document.documentElement.style.setProperty('--accent-cyan', '#36B1D3')
  document.documentElement.style.setProperty('--accent-magenta', '#D32C87')
}

// ============================================================
// GLOBAL STATE
// ============================================================
let activeFilter = 'all'
let currentAlbumProject = null
let currentPhotoIndex = 0
let currentVideoProject = null
let currentImageProject = null

// ============================================================
// LOADER
// ============================================================
document.fonts.ready.then(() => {
  setTimeout(() => {
    const loader = document.getElementById('loader')
    if (loader) {
      gsap.to(loader, {
        yPercent: -100,
        duration: 1.0,
        ease: 'power4.inOut',
        onComplete: initPage
      })
    } else {
      initPage()
    }
  }, 1400)
})

// ============================================================
// DYNAMIC GRID BUILDER
// ============================================================
function buildPortfolioCards() {
  const grid = document.getElementById('portfolio-grid')
  const emptyState = document.getElementById('portfolio-empty')
  if (!grid) return

  const fragment = document.createDocumentFragment()

  activeProjects.forEach(project => {
    const card = document.createElement('div')
    card.className = 'portfolio-item'
    card.dataset.id = project.id
    card.dataset.category = project.category
    card.dataset.secondary = (project.secondaryCategories || []).join(' ')
    card.dataset.type = project.type
    card.dataset.aspect = project.aspectRatio || (project.type === 'video' ? '16-9' : '3-2')
    card.setAttribute('role', 'button')
    card.setAttribute('tabindex', '0')
    card.setAttribute('aria-label', `${project.title} — ${project.client}`)

    // Determine category badge label
    let badgeText = ''
    let catLabel = project.category.toUpperCase()
    if (project.type === 'album') {
      badgeText = `📸 ${project.photos?.length || 0} PHOTOS`
      catLabel = project.subCategory || 'EVENT & EXPERIENTIAL'
    } else if (project.type === 'video') {
      const dur = project.duration ? `${project.duration} · ` : ''
      badgeText = `▶ ${dur}${project.aspect || '16:9'}`
      catLabel = project.subCategory || 'COMMERCIAL SPOT'
    } else {
      badgeText = `✦ ${project.format || 'MASTER'}`
      catLabel = project.subCategory || 'BRANDING SYSTEM'
    }

    // Determine action link label
    let linkText = 'VIEW PROJECT →'
    if (project.type === 'album') {
      linkText = `EXPLORE ALBUM (${project.photos?.length || 0} PHOTOS) →`
    } else if (project.type === 'video') {
      linkText = `WATCH SPOT (${project.duration || 'PLAY'}) →`
    } else {
      linkText = 'INSPECT MASTER ARTWORK →'
    }

    // Media element markup
    let mediaMarkup = ''
    if (project.type === 'video' && project.videoSrc) {
      const posterSrc = project.poster || project.cover
      mediaMarkup = `
        <img class="portfolio-item-poster" src="${posterSrc}" alt="${project.title}" loading="lazy" decoding="async" />
        <video class="portfolio-item-video" src="${project.videoSrc}" muted loop playsinline preload="none"></video>
        <div class="video-play-indicator" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <polygon points="6 4 20 12 6 20 6 4"></polygon>
          </svg>
        </div>
      `
    } else {
      mediaMarkup = `
        <img class="portfolio-item-img" src="${project.cover}" alt="${project.title}" loading="lazy" decoding="async" />
        <div class="photo-sheen-sweep" aria-hidden="true"></div>
      `
    }

    card.innerHTML = `
      <div class="portfolio-item-media">
        ${mediaMarkup}
      </div>
      <div class="portfolio-item-overlay"></div>
      <div class="portfolio-item-badge">${badgeText}</div>
      <div class="portfolio-item-content">
        <div class="portfolio-item-cat">// ${catLabel}</div>
        <h3 class="portfolio-item-title">${project.title}</h3>
        <div class="portfolio-item-client">CLIENT // ${project.client.toUpperCase()}</div>
        <p class="portfolio-item-desc">${project.desc}</p>
        <div class="portfolio-item-link">${linkText}</div>
      </div>
    `

    // Card Interaction Listeners: Video hover playback
    if (project.type === 'video' && project.videoSrc) {
      const videoEl = card.querySelector('.portfolio-item-video')
      card.addEventListener('mouseenter', () => {
        card.classList.add('video-playing')
        if (videoEl) {
          videoEl.currentTime = 0
          videoEl.play().catch(() => {})
        }
      })
      card.addEventListener('mouseleave', () => {
        card.classList.remove('video-playing')
        if (videoEl) {
          videoEl.pause()
          videoEl.currentTime = 0
        }
      })
    }

    // Card Interaction Listeners: Photo album hover preview cycling
    if (project.type === 'album' && project.photos && project.photos.length > 2) {
      let cycleTimer = null
      let photoCycleIdx = 1
      const imgEl = card.querySelector('.portfolio-item-img')

      card.addEventListener('mouseenter', () => {
        if (!imgEl) return
        photoCycleIdx = 1
        cycleTimer = setInterval(() => {
          if (project.photos[photoCycleIdx]) {
            imgEl.src = project.photos[photoCycleIdx].thumb || project.photos[photoCycleIdx].src
            photoCycleIdx = (photoCycleIdx + 1) % Math.min(project.photos.length, 6)
          }
        }, 1400)
      })

      card.addEventListener('mouseleave', () => {
        if (cycleTimer) {
          clearInterval(cycleTimer)
          cycleTimer = null
        }
        if (imgEl) {
          imgEl.src = project.cover
        }
      })
    }

    // Click handler to open appropriate modal
    const triggerProject = () => {
      if (project.type === 'album') {
        openPhotoLightbox(project, 0)
      } else if (project.type === 'video') {
        openVideoModal(project)
      } else {
        openImageDetail(project)
      }
    }

    card.addEventListener('click', triggerProject)
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        triggerProject()
      }
    })

    fragment.appendChild(card)
  })

  // Insert before empty placeholder
  grid.insertBefore(fragment, emptyState)
}

// ============================================================
// FILTER LOGIC
// ============================================================
function getFilterFromURL() {
  const params = new URLSearchParams(window.location.search)
  const f = params.get('filter')
  return PORTFOLIO_CATEGORIES[f] ? f : 'all'
}

function setFilter(filter, pushState = true) {
  activeFilter = filter
  const items = document.querySelectorAll('.portfolio-item')
  const tabs = document.querySelectorAll('.filter-tab')
  const countEl = document.getElementById('filter-count')
  const empty = document.getElementById('portfolio-empty')

  // Update tabs active state
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.filter === filter)
  })

  // Show/hide items with smooth stagger
  let visible = 0
  items.forEach(item => {
    const category = item.dataset.category
    const secondaries = (item.dataset.secondary || '').split(' ')
    const match =
      filter === 'all' ||
      category === filter ||
      secondaries.includes(filter)

    if (match) {
      item.classList.remove('hidden')
      gsap.fromTo(item,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, delay: (visible % 6) * 0.05, ease: 'power2.out' }
      )
      visible++
    } else {
      item.classList.add('hidden')
    }
  })

  // Update count indicator
  if (countEl) {
    if (filter === 'all') {
      countEl.textContent = `${visible} CURATED WORKS`
    } else {
      const catName = PORTFOLIO_CATEGORIES[filter]?.label || 'PROJECTS'
      countEl.textContent = `${visible} ${catName} PIECES`
    }
  }

  // Toggle empty state
  if (empty) empty.classList.toggle('visible', visible === 0)

  // Update URL history
  if (pushState) {
    const url = filter === 'all'
      ? window.location.pathname
      : `${window.location.pathname}?filter=${filter}`
    window.history.pushState({ filter }, '', url)
  }

  // Refresh scroll coordinates
  ScrollTrigger.refresh()
}

// ============================================================
// PHOTO ALBUM LIGHTBOX CONTROLLER
// ============================================================
function openPhotoLightbox(project, startIndex = 0) {
  currentAlbumProject = project
  currentPhotoIndex = startIndex

  const modal = document.getElementById('photo-lightbox-modal')
  const catEl = document.getElementById('lightbox-cat')
  const titleEl = document.getElementById('lightbox-title')
  const filmstrip = document.getElementById('lightbox-filmstrip')

  if (!modal || !project.photos || project.photos.length === 0) return

  // Stop background smooth scroll
  window.lenis?.stop()

  // Set header
  if (catEl) catEl.textContent = `// ${project.subCategory || 'EVENT ALBUM'}`
  if (titleEl) titleEl.textContent = `${project.title} — ${project.client}`

  // Render filmstrip thumbnails
  if (filmstrip) {
    filmstrip.innerHTML = ''
    project.photos.forEach((ph, i) => {
      const thumb = document.createElement('div')
      thumb.className = `lightbox-filmstrip-thumb ${i === startIndex ? 'active' : ''}`
      thumb.dataset.index = i
      thumb.innerHTML = `<img src="${ph.thumb}" alt="Photo ${i + 1}" loading="lazy" />`
      thumb.addEventListener('click', () => {
        updateLightboxPhoto(i)
      })
      filmstrip.appendChild(thumb)
    })
  }

  // Display initial photo
  updateLightboxPhoto(startIndex)

  // Open modal
  modal.classList.add('open')
}

function updateLightboxPhoto(index) {
  if (!currentAlbumProject || !currentAlbumProject.photos) return
  const total = currentAlbumProject.photos.length
  if (total === 0) return

  // Boundary wrap
  if (index < 0) index = total - 1
  if (index >= total) index = 0
  currentPhotoIndex = index

  const photo = currentAlbumProject.photos[index]
  const mainImg = document.getElementById('lightbox-main-img')
  const counterEl = document.getElementById('lightbox-counter')
  const filmstrip = document.getElementById('lightbox-filmstrip')

  if (counterEl) {
    const padIndex = String(index + 1).padStart(2, '0')
    const padTotal = String(total).padStart(2, '0')
    counterEl.textContent = `${padIndex} / ${padTotal}`
  }

  if (mainImg) {
    // Immediate preview using already loaded thumbnail to prevent black screen while full-res loads
    if (photo.thumb) {
      mainImg.src = photo.thumb
      mainImg.alt = `${currentAlbumProject.title} — Photo ${index + 1}`
      mainImg.style.opacity = '1'
    }

    const temp = new Image()
    temp.onload = () => {
      // Guard against race conditions when user rapidly clicks next/prev
      if (currentPhotoIndex === index) {
        mainImg.src = photo.src
        mainImg.alt = `${currentAlbumProject.title} — Photo ${index + 1}`
        mainImg.style.opacity = '1'
      }
    }
    temp.onerror = () => {
      console.warn('High-res photo load failed, falling back to thumb:', photo.src)
      if (currentPhotoIndex === index && photo.thumb) {
        mainImg.src = photo.thumb
        mainImg.style.opacity = '1'
      }
    }
    temp.src = photo.src
  }

  // Update filmstrip highlight and scroll into view
  if (filmstrip) {
    const thumbs = filmstrip.querySelectorAll('.lightbox-filmstrip-thumb')
    thumbs.forEach((t, i) => {
      const isActive = i === index
      t.classList.toggle('active', isActive)
      if (isActive) {
        t.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      }
    })
  }
}

function closePhotoLightbox() {
  const modal = document.getElementById('photo-lightbox-modal')
  if (!modal) return
  modal.classList.remove('open')
  currentAlbumProject = null
  window.lenis?.start()
}

// ============================================================
// CINEMATIC VIDEO PLAYER MODAL CONTROLLER
// ============================================================
function openVideoModal(project) {
  currentVideoProject = project
  const modal = document.getElementById('video-player-modal')
  const videoEl = document.getElementById('video-modal-element')
  const catEl = document.getElementById('video-modal-cat')
  const titleEl = document.getElementById('video-modal-title')
  const durEl = document.getElementById('video-modal-duration')
  const clientEl = document.getElementById('video-modal-client')
  const formatEl = document.getElementById('video-modal-format')
  const descEl = document.getElementById('video-modal-desc')

  if (!modal || !videoEl) return

  window.lenis?.stop()

  if (catEl) catEl.textContent = `// ${project.subCategory || 'COMMERCIAL SPOT'}`
  if (titleEl) titleEl.textContent = project.title
  if (durEl) durEl.textContent = project.duration || 'VIDEO'
  if (clientEl) clientEl.textContent = project.client
  if (formatEl) formatEl.textContent = `${project.aspect || '16:9'} · High Definition Master`
  if (descEl) descEl.textContent = project.desc

  videoEl.src = project.videoSrc
  videoEl.currentTime = 0
  modal.classList.add('open')

  videoEl.play().catch(() => {})
}

function closeVideoModal() {
  const modal = document.getElementById('video-player-modal')
  const videoEl = document.getElementById('video-modal-element')
  if (!modal) return
  if (videoEl) {
    videoEl.pause()
    videoEl.src = ''
  }
  modal.classList.remove('open')
  currentVideoProject = null
  window.lenis?.start()
}

// ============================================================
// IMAGE / GRAPHIC DETAIL INSPECTOR CONTROLLER
// ============================================================
function openImageDetail(project) {
  currentImageProject = project
  const modal = document.getElementById('image-detail-modal')
  const catEl = document.getElementById('img-detail-cat')
  const titleEl = document.getElementById('img-detail-title')
  const imgEl = document.getElementById('img-detail-img')
  const clientEl = document.getElementById('img-detail-client')

  if (!modal || !imgEl) return

  window.lenis?.stop()

  if (catEl) catEl.textContent = `// ${project.subCategory || 'BRANDING SYSTEM'}`
  if (titleEl) titleEl.textContent = project.title
  if (clientEl) clientEl.textContent = `// CLIENT: ${project.client.toUpperCase()} — ${project.format || 'MASTER ARTWORK'}`

  imgEl.src = project.highRes || project.cover
  imgEl.alt = project.title
  modal.classList.add('open')
}

function closeImageDetail() {
  const modal = document.getElementById('image-detail-modal')
  if (!modal) return
  modal.classList.remove('open')
  currentImageProject = null
  window.lenis?.start()
}

// ============================================================
// MODAL EVENTS BINDING
// ============================================================
function initModalEvents() {
  // Photo Lightbox controls
  document.getElementById('lightbox-close-btn')?.addEventListener('click', closePhotoLightbox)
  document.getElementById('lightbox-prev-btn')?.addEventListener('click', () => {
    updateLightboxPhoto(currentPhotoIndex - 1)
  })
  document.getElementById('lightbox-next-btn')?.addEventListener('click', () => {
    updateLightboxPhoto(currentPhotoIndex + 1)
  })
  document.getElementById('lightbox-book-btn')?.addEventListener('click', () => {
    closePhotoLightbox()
    openBookingModal()
  })

  // Video Modal controls
  document.getElementById('video-modal-close-btn')?.addEventListener('click', closeVideoModal)
  document.getElementById('video-modal-book-btn')?.addEventListener('click', () => {
    closeVideoModal()
    openBookingModal()
  })

  // Image Detail controls
  document.getElementById('img-detail-close-btn')?.addEventListener('click', closeImageDetail)
  document.getElementById('img-detail-book-btn')?.addEventListener('click', () => {
    closeImageDetail()
    openBookingModal()
  })

  // Backdrop click to close
  document.querySelectorAll('.lenscape-modal-backdrop').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        if (modal.id === 'photo-lightbox-modal') closePhotoLightbox()
        else if (modal.id === 'video-player-modal') closeVideoModal()
        else if (modal.id === 'image-detail-modal') closeImageDetail()
      }
    })
  })

  // Keyboard navigation
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (document.getElementById('photo-lightbox-modal')?.classList.contains('open')) closePhotoLightbox()
      if (document.getElementById('video-player-modal')?.classList.contains('open')) closeVideoModal()
      if (document.getElementById('image-detail-modal')?.classList.contains('open')) closeImageDetail()
    } else if (e.key === 'ArrowLeft') {
      if (document.getElementById('photo-lightbox-modal')?.classList.contains('open')) {
        updateLightboxPhoto(currentPhotoIndex - 1)
      }
    } else if (e.key === 'ArrowRight') {
      if (document.getElementById('photo-lightbox-modal')?.classList.contains('open')) {
        updateLightboxPhoto(currentPhotoIndex + 1)
      }
    }
  })
}

// ============================================================
// MAIN PAGE INIT
// ============================================================
function initPage() {
  // --- Lenis Smooth Scroll ---
  const lenis = new Lenis({
    duration: 1.4,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    mouseMultiplier: 1,
    lerp: 0.1
  })
  window.lenis = lenis

  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(time => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  // --- Hero entrance ---
  gsap.fromTo(
    'h1.drama-text, .portfolio-hero p, .section-label',
    { opacity: 0, y: 35 },
    { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: 'power3.out', delay: 0.2 }
  )

  // --- Build Dynamic Cards ---
  buildPortfolioCards()

  // --- Initialize Modal Events ---
  initModalEvents()

  // --- Filter Tab Clicks ---
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => setFilter(tab.dataset.filter))
  })

  // --- Apply URL filter on load ---
  const initialFilter = getFilterFromURL()
  setFilter(initialFilter, false)

  // --- Deep link project support: ?project=... ---
  const urlParams = new URLSearchParams(window.location.search)
  const projParam = urlParams.get('project')
  if (projParam) {
    const targetProject = activeProjects.find(p => p.id === projParam || (projParam === 'popeyes-campaign-system' && p.id === 'liqliquors-retail-launch'))
    if (targetProject) {
      if (targetProject.type === 'album') openPhotoLightbox(targetProject, 0)
      else if (targetProject.type === 'video') openVideoModal(targetProject)
      else openImageDetail(targetProject)
    }
  }

  // --- Browser back/forward ---
  window.addEventListener('popstate', e => {
    const f = e.state?.filter || 'all'
    setFilter(f, false)
  })

  // --- Navbar Scroll Class ---
  const navbar = document.querySelector('.navbar')
  ScrollTrigger.create({
    start: '80px top',
    onEnter: () => navbar?.classList.add('scrolled'),
    onLeaveBack: () => navbar?.classList.remove('scrolled')
  })

  // --- Magnetic Cursor ---
  const cursor = document.querySelector('.custom-cursor')
  let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX
    mouseY = e.clientY
  })

  gsap.ticker.add(() => {
    cursorX += (mouseX - cursorX) * 0.18
    cursorY += (mouseY - cursorY) * 0.18
    if (cursor) gsap.set(cursor, { x: cursorX, y: cursorY })
  })

  document.querySelectorAll('.hover-target, a, button, .portfolio-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (cursor) gsap.to(cursor, { scale: 2.8, opacity: 0.45, duration: 0.25, ease: 'power2.out' })
    })
    el.addEventListener('mouseleave', () => {
      if (cursor) gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.25, ease: 'power2.out' })
    })
  })

  // --- Booking Modal ---
  initBookingModal()
}
