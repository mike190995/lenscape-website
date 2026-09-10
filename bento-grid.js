/**
 * LENSCAPE — BENTO GRID & INTERACTIVE USER FLOWS
 * 
 * Implements:
 * 1. 5 Distinct Card Micro-Interactions:
 *    - Card 1: Cinema Lens Pull & Video Zoom (scale 1.05 + focus pull blur)
 *    - Card 2: Strobe Camera Flash (150ms opacity flicker + strobe flash overlay)
 *    - Card 3: Interactive SVG Logo Line Drawing (stroke-dashoffset animation over 600ms)
 *    - Card 4: 3D Parallax Tilt & Multi-Layer Depth (Mousemove tilt + Y chart / X frame shift)
 *    - Card 5: Interactive Puzzle Block Grid (Cascading sliding tile physics)
 * 2. User Flows:
 *    - Flow A: High-Value Client Overlay (video showreel + native booking API calendar)
 *    - Flow B: Explorer Anchor-Scroll & Portfolio Filter
 *    - Flow C: Digital Partner Slide-Out Solution Drawer (framework diagrams + project builder form)
 */

import { fetchBookedDates, validateDuration, submitBooking } from './booking-logic.js'

// ============================================================
// STATE
// ============================================================
let selectedDateFlowA = null;
let flowABookedDates = new Map();
let flowACalMonth = new Date().getMonth();
let flowACalYear = new Date().getFullYear();

// ============================================================
// INITIALIZATION
// ============================================================
export function initBentoGrid() {
  initCardAnimations();
  initFlowA();
  initFlowB();
  initFlowC();
}

// ============================================================
// 1. CARD MICRO-INTERACTIONS (5 VARYING ANIMATION STYLES)
// ============================================================
function initCardAnimations() {
  // Card 1: Cinema Lens Pull & Video Zoom
  const card1 = document.querySelector('.bento-card-1');
  if (card1) {
    const video = card1.querySelector('.bento-video-bg');
    card1.addEventListener('mouseenter', () => {
      if (video) video.play().catch(() => {});
    });
    card1.addEventListener('mouseleave', () => {
      if (video) video.pause();
    });
  }

  // Card 2: Experiential Booth Video & Flash
  const card2 = document.querySelector('.bento-card-2');
  if (card2) {
    const video = card2.querySelector('.bento-video-bg');
    card2.addEventListener('mouseenter', () => {
      if (video) video.play().catch(() => {});
    });
    card2.addEventListener('mouseleave', () => {
      if (video) video.pause();
    });
  }

  // Card 3: SVG Signature Line Drawing
  const card3 = document.querySelector('.bento-card-3');
  if (card3) {
    const svgPath = card3.querySelector('.bento-svg-signature path');
    if (svgPath) {
      const length = svgPath.getTotalLength() || 400;
      svgPath.style.strokeDasharray = length;
      svgPath.style.strokeDashoffset = length;
      
      card3.addEventListener('mouseenter', () => {
        svgPath.style.transition = 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        svgPath.style.strokeDashoffset = '0';
      });
      card3.addEventListener('mouseleave', () => {
        svgPath.style.transition = 'stroke-dashoffset 0.4s ease';
        svgPath.style.strokeDashoffset = length;
      });
    }
  }

  // Card 4: 3D Parallax Tilt & Multi-Layer Depth
  const card4 = document.querySelector('.bento-card-4');
  if (card4) {
    const bgCharts = card4.querySelector('.parallax-charts');
    const fgFrame = card4.querySelector('.parallax-frame');
    
    card4.addEventListener('mousemove', (e) => {
      const rect = card4.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      
      card4.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      
      if (bgCharts) {
        bgCharts.style.transform = `translateY(${(y - centerY) * 0.08}px)`;
      }
      if (fgFrame) {
        fgFrame.style.transform = `translateX(${(x - centerX) * 0.08}px)`;
      }
    });

    card4.addEventListener('mouseleave', () => {
      card4.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      if (bgCharts) bgCharts.style.transform = 'translateY(0px)';
      if (fgFrame) fgFrame.style.transform = 'translateX(0px)';
    });
  }

  // Card 5: Interactive Puzzle Blocks Cascade
  const card5 = document.querySelector('.bento-card-5');
  if (card5) {
    const tiles = card5.querySelectorAll('.puzzle-tile');
    card5.addEventListener('mouseenter', () => {
      tiles.forEach((tile, idx) => {
        setTimeout(() => {
          tile.classList.add('pulse');
        }, idx * 60);
      });
    });
    card5.addEventListener('mouseleave', () => {
      tiles.forEach(tile => tile.classList.remove('pulse'));
    });
  }
}

// ============================================================
// 2. FLOW A: HIGH-VALUE CLIENT OVERLAY (WITH NATIVE BOOKING API)
// ============================================================

const SERVICE_MODAL_DATA = {
  'photo-video': {
    badge: '[LIVE DEMO] // COMMERCIAL CONTENT SUITE',
    tag: '// COMMERCIAL CINEMATOGRAPHY & EVENT PHOTOGRAPHY',
    title: 'Cinematic Storytelling.<br><span class="accent-text">Maximum Impact.</span>',
    col1Num: '[01]',
    col1Title: 'High-Velocity Delivery',
    col1Text: 'Rapid turnaround on event reels, multi-platform 9:16 and 16:9 deliverables, and color-graded edits engineered for immediate viral engagement.',
    col2Num: '[02]',
    col2Title: 'Commercial & Event Mastery',
    col2Text: 'Multi-camera cinematography, studio-grade lighting, crisp audio capture, and bespoke creative direction for corporate galas, festivals, and brands.',
    ctaText: 'BOOK A PRODUCTION SHOOT →',
    calHeading: 'Select Shoot Date & Details',
    eventPlaceholder: 'Project / Shoot Details *',
    items: [
      {
        type: 'video',
        label: '▶ KES REEL',
        src: '/Portfolio/Our Work/Videos/KES Iz We Promotion_REELS.mp4',
        poster: '/Portfolio/thumbnails/Videos/KES%20Iz%20We%20Promotion_REELS.webp',
        pos: 'center 14%'
      },
      {
        type: 'video',
        label: '▶ MARDI GRAS',
        src: '/Portfolio/Our Work/Videos/Tailgate_Mardi Gras.mp4',
        poster: '/Portfolio/thumbnails/Videos/Tailgate_Mardi%20Gras.webp',
        pos: 'center 16%'
      },
      {
        type: 'video',
        label: '▶ RBL CPL',
        src: '/Portfolio/Our Work/Videos/RBL_CPL.mp4',
        poster: '/Portfolio/thumbnails/Videos/RBL_CPL.webp',
        pos: 'center 18%'
      },
      {
        type: 'image',
        label: '📷 SHELL GALA',
        src: '/Portfolio/thumbnails/Photo Albums/SHELL Black & White Gala 2025/untitled-102.webp',
        pos: 'center 30%'
      },
      {
        type: 'image',
        label: '📷 ICC WORLD CUP',
        src: '/Portfolio/thumbnails/Photo Albums/Coca Cola ICC World Cup 2024/DSC00025.webp',
        pos: 'center 22%'
      },
      {
        type: 'image',
        label: '📷 GRAD PHOTOS',
        src: '/Portfolio/thumbnails/Photo Albums/Grad Photos/Picture-22.webp',
        pos: 'center 28%'
      }
    ]
  },
  'booth-suite': {
    badge: '[LIVE DEMO] // THE BOOTH SUITE ACTIVATIONS',
    tag: '// EXPERIENTIAL ACTIVATIONS & INSTANT GUEST DELIVERY',
    title: 'Zero Infrastructure Lag.<br><span class="accent-text">Maximum Social Impact.</span>',
    col1Num: '[01]',
    col1Title: 'Instant Guest Delivery',
    col1Text: 'On-site automated rendering, custom branded event overlays, and direct QR guest delivery straight to phones within 15 seconds.',
    col2Num: '[02]',
    col2Title: 'Glambot & 360° Choreography',
    col2Text: 'Bespoke robotic arm choreography, ultra-smooth 120fps slow-motion capture, studio-grade ring lighting, and red-carpet staging.',
    ctaText: 'INSTANT CALENDAR BOOKING →',
    calHeading: 'Select Activation Date & Details',
    eventPlaceholder: 'Event Name *',
    items: [
      {
        type: 'video',
        label: '⚡ GLAMBOT 01',
        src: '/Portfolio/Our Work/Videos/MMC videos/Ex_1.mp4',
        poster: '/Portfolio/thumbnails/Videos/MMC%20videos/Ex_1.webp',
        pos: 'center 16%'
      },
      {
        type: 'video',
        label: '⚡ GLAMBOT 02',
        src: '/Portfolio/Our Work/Videos/MMC videos/Ex 5.mp4',
        poster: '/Portfolio/thumbnails/Videos/MMC%20videos/Ex%205.webp',
        pos: 'center 28%'
      },
      {
        type: 'video',
        label: '⚡ GLAMBOT 03',
        src: '/Portfolio/Our Work/Videos/MMC videos/Ex 6.mp4',
        poster: '/Portfolio/thumbnails/Videos/MMC%20videos/Ex%206.webp',
        pos: 'center 28%'
      },
      {
        type: 'video',
        label: '🌀 360 BOOTH',
        src: '/Portfolio/Our Work/Videos/360 videos/001be6de-ed6e-4332-ba73-a2893c873e55.mp4',
        poster: '/Portfolio/thumbnails/Videos/360%20videos/001be6de-ed6e-4332-ba73-a2893c873e55.webp',
        pos: 'center 20%'
      }
    ]
  }
};

let currentOverlayService = 'photo-video';
let currentOverlayItemIndex = 0;

function switchOverlayMedia(item, itemIndex, tabsContainer) {
  const video = document.getElementById('overlay-showreel-video');
  const img = document.getElementById('overlay-showreel-img');
  const muteBtn = document.getElementById('overlay-mute-btn');

  if (tabsContainer) {
    const tabs = tabsContainer.querySelectorAll('.overlay-media-tab');
    tabs.forEach((t, i) => {
      t.classList.toggle('active', i === itemIndex);
    });
  }

  currentOverlayItemIndex = itemIndex;

  if (item.type === 'video') {
    if (img) img.style.display = 'none';
    if (video) {
      video.style.display = 'block';
      video.style.objectPosition = item.pos || 'center 18%';
      video.poster = item.poster || '';
      
      const currentSrc = video.currentSrc || video.src;
      if (!currentSrc || !currentSrc.endsWith(encodeURI(item.src)) && !currentSrc.endsWith(item.src)) {
        video.src = item.src;
        video.load();
      }
      video.muted = true;
      video.currentTime = 0;
      video.play().catch(() => {});
    }
    if (muteBtn) {
      muteBtn.style.display = 'block';
      muteBtn.textContent = 'UNMUTE 🔊';
    }
  } else {
    // Image item
    if (video) {
      video.pause();
      video.style.display = 'none';
    }
    if (img) {
      img.style.display = 'block';
      img.style.objectPosition = item.pos || 'center 18%';
      img.src = item.src;
      img.alt = item.label;
    }
    if (muteBtn) {
      muteBtn.style.display = 'none';
    }
  }
}

function initFlowA() {
  const triggers = document.querySelectorAll('.trigger-flow-a');
  const overlay = document.getElementById('high-value-overlay');
  const closeBtn = document.getElementById('overlay-close-btn');

  triggers.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const service = card.getAttribute('data-modal-service') || 'photo-video';
      openFlowAOverlay(service);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeFlowAOverlay);

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeFlowAOverlay();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay?.classList.contains('active')) {
      closeFlowAOverlay();
    }
  });

  // Mute button toggle
  const muteBtn = document.getElementById('overlay-mute-btn');
  const video = document.getElementById('overlay-showreel-video');
  if (muteBtn && video) {
    muteBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      muteBtn.textContent = video.muted ? 'UNMUTE 🔊' : 'MUTE 🔇';
    });
  }

  // Booking trigger inside Overlay
  const bookBtn = document.getElementById('overlay-booking-trigger');
  const bookingPanel = document.getElementById('overlay-booking-panel');
  if (bookBtn && bookingPanel) {
    bookBtn.addEventListener('click', () => {
      bookingPanel.classList.toggle('visible');
      if (bookingPanel.classList.contains('visible')) {
        initOverlayCalendar();
        setTimeout(() => {
          const overlayWindow = document.querySelector('.overlay-window');
          if (overlayWindow) {
            overlayWindow.scrollTo({
              top: bookingPanel.offsetTop - 20,
              behavior: 'smooth'
            });
          } else {
            bookingPanel.scrollIntoView({ behavior: 'smooth' });
          }
        }, 60);
      }
    });
  }
}

async function openFlowAOverlay(service = 'photo-video') {
  const overlay = document.getElementById('high-value-overlay');
  if (!overlay) return;

  currentOverlayService = service;
  const config = SERVICE_MODAL_DATA[service] || SERVICE_MODAL_DATA['photo-video'];

  // Update dynamic copy to match service
  const badgeEl = document.getElementById('overlay-media-badge');
  const tagEl = document.getElementById('overlay-tag');
  const titleEl = document.getElementById('overlay-title');
  const col1NumEl = document.getElementById('overlay-col1-num');
  const col1TitleEl = document.getElementById('overlay-col1-title');
  const col1TextEl = document.getElementById('overlay-col1-text');
  const col2NumEl = document.getElementById('overlay-col2-num');
  const col2TitleEl = document.getElementById('overlay-col2-title');
  const col2TextEl = document.getElementById('overlay-col2-text');
  const ctaTextEl = document.getElementById('overlay-booking-cta-text');
  const calHeadingEl = document.getElementById('flowa-cal-heading');
  const eventInput = document.getElementById('flowa-event');

  if (badgeEl) badgeEl.textContent = config.badge;
  if (tagEl) tagEl.textContent = config.tag;
  if (titleEl) titleEl.innerHTML = config.title;
  if (col1NumEl) col1NumEl.textContent = config.col1Num;
  if (col1TitleEl) col1TitleEl.textContent = config.col1Title;
  if (col1TextEl) col1TextEl.textContent = config.col1Text;
  if (col2NumEl) col2NumEl.textContent = config.col2Num;
  if (col2TitleEl) col2TitleEl.textContent = config.col2Title;
  if (col2TextEl) col2TextEl.textContent = config.col2Text;
  if (ctaTextEl) ctaTextEl.textContent = config.ctaText;
  if (calHeadingEl) calHeadingEl.textContent = config.calHeading;
  if (eventInput) eventInput.placeholder = config.eventPlaceholder;

  // Build switcher tabs
  const tabsContainer = document.getElementById('overlay-media-tabs');
  if (tabsContainer) {
    tabsContainer.innerHTML = '';
    config.items.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'overlay-media-tab';
      btn.textContent = item.label;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        switchOverlayMedia(item, idx, tabsContainer);
      });
      tabsContainer.appendChild(btn);
    });
  }

  // Choose starting item: For photo-video, pick a random video reel from the list; For booth, start with Glambot 01
  let initialIdx = 0;
  if (service === 'photo-video') {
    const videoItems = config.items.map((it, i) => ({ it, i })).filter(x => x.it.type === 'video');
    if (videoItems.length > 0) {
      const rand = Math.floor(Math.random() * videoItems.length);
      initialIdx = videoItems[rand].i;
    }
  }

  switchOverlayMedia(config.items[initialIdx], initialIdx, tabsContainer);

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  window.lenis?.stop();

  const overlayWindow = overlay.querySelector('.overlay-window');
  if (overlayWindow) overlayWindow.scrollTop = 0;
  overlay.scrollTop = 0;

  // Pre-load booked dates from backend API
  try {
    const dates = await fetchBookedDates();
    flowABookedDates.clear();
    for (const [d, info] of Object.entries(dates)) {
      flowABookedDates.set(d, info);
    }
  } catch (err) {
    console.error('Error fetching calendar availability:', err);
  }
}

function closeFlowAOverlay() {
  const overlay = document.getElementById('high-value-overlay');
  if (!overlay) return;

  overlay.classList.remove('active');
  document.body.style.overflow = '';
  window.lenis?.start();

  const video = document.getElementById('overlay-showreel-video');
  if (video) video.pause();
}

function initOverlayCalendar() {
  renderOverlayCalendar();
  
  // Navigation
  const prevBtn = document.getElementById('flowa-cal-prev');
  const nextBtn = document.getElementById('flowa-cal-next');

  prevBtn?.replaceWith(prevBtn.cloneNode(true));
  nextBtn?.replaceWith(nextBtn.cloneNode(true));

  document.getElementById('flowa-cal-prev')?.addEventListener('click', () => {
    flowACalMonth--;
    if (flowACalMonth < 0) { flowACalMonth = 11; flowACalYear--; }
    renderOverlayCalendar();
  });

  document.getElementById('flowa-cal-next')?.addEventListener('click', () => {
    flowACalMonth++;
    if (flowACalMonth > 11) { flowACalMonth = 0; flowACalYear++; }
    renderOverlayCalendar();
  });

  // Form submission logic inside Flow A panel
  const submitBtn = document.getElementById('flowa-submit-booking');
  if (submitBtn) {
    submitBtn.onclick = async () => {
      const name = document.getElementById('flowa-name')?.value.trim();
      const eventName = document.getElementById('flowa-event')?.value.trim();
      const location = document.getElementById('flowa-location')?.value;
      const startTime = document.getElementById('flowa-start-time')?.value;
      const endTime = document.getElementById('flowa-end-time')?.value;

      if (!name || !eventName || !location || !selectedDateFlowA || !startTime || !endTime) {
        alert('Please select a date and complete all required fields (*)');
        return;
      }

      const dur = validateDuration(startTime, endTime);
      if (!dur.valid) {
        alert(dur.message);
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'SUBMITTING...';

      const payload = {
        clientName: name,
        eventName: eventName,
        location: location,
        date: selectedDateFlowA,
        startTime: startTime,
        endTime: endTime,
        tier: currentOverlayService === 'photo-video' ? 'Photo / Video Shoot' : 'The Booth Suite',
        service: currentOverlayService,
        notes: `Submitted via ${currentOverlayService === 'photo-video' ? 'Photo / Video & SPEED Reels' : 'The Booth Suite'} Overlay`
      };

      const res = await submitBooking(payload);
      if (res.success) {
        document.getElementById('flowa-booking-form-wrap').style.display = 'none';
        const successBox = document.getElementById('flowa-booking-success');
        if (successBox) {
          successBox.style.display = 'block';
          document.getElementById('flowa-ref-code').textContent = `// REF: LSC-${Date.now().toString().slice(-6)}`;
        }
      } else {
        alert(res.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'CONFIRM BOOKING SLOT →';
      }
    };
  }
}

function renderOverlayCalendar() {
  const grid = document.getElementById('flowa-calendar-grid');
  const label = document.getElementById('flowa-month-label');
  if (!grid || !label) return;

  const today = new Date();
  const monthNames = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];

  label.textContent = `${monthNames[flowACalMonth]} ${flowACalYear}`;

  const dayNames = ['S','M','T','W','T','F','S'];
  let html = dayNames.map(d => `<div class="cal-day-name">${d}</div>`).join('');

  const firstDay = new Date(flowACalYear, flowACalMonth, 1).getDay();
  const daysInMonth = new Date(flowACalYear, flowACalMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    html += `<div class="cal-day other-month"></div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${flowACalYear}-${String(flowACalMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const cellDate = new Date(flowACalYear, flowACalMonth, d);
    const isPast = cellDate < new Date(today.setHours(0,0,0,0));
    const isBooked = flowABookedDates.has(dateStr);
    const isSelected = selectedDateFlowA === dateStr;

    let cls = 'cal-day';
    if (isPast) cls += ' disabled';
    if (isBooked) cls += ' booked';
    if (isSelected) cls += ' selected';

    if (isPast || isBooked) {
      html += `<div class="${cls}">${d}</div>`;
    } else {
      html += `<div class="${cls}" data-date="${dateStr}">${d}</div>`;
    }
  }

  grid.innerHTML = html;

  grid.querySelectorAll('.cal-day[data-date]').forEach(cell => {
    cell.addEventListener('click', () => {
      selectedDateFlowA = cell.dataset.date;
      const disp = document.getElementById('flowa-selected-date');
      if (disp) disp.textContent = selectedDateFlowA;
      renderOverlayCalendar();
    });
  });
}

// ============================================================
// 3. FLOW B: EXPLORER ANCHOR-SCROLL & PORTFOLIO FILTER
// ============================================================
function initFlowB() {
  const card3 = document.querySelector('.trigger-flow-b');
  if (!card3) return;

  card3.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Check if portfolio showcase exists on current page
    const showcase = document.getElementById('portfolio-showcase');
    if (showcase) {
      // Smooth scroll
      if (window.lenis) {
        window.lenis.scrollTo(showcase, { offset: -60, duration: 1.5 });
      } else {
        showcase.scrollIntoView({ behavior: 'smooth' });
      }
      
      // Auto trigger Branding tab filter
      const brandingTab = document.querySelector('#portfolio-showcase-filters [data-filter="branding"]');
      if (brandingTab) brandingTab.click();
    } else {
      // Navigate to portfolio.html with branding filter
      window.location.href = '/portfolio.html?filter=branding';
    }
  });

  // Init homepage portfolio showcase filters if present
  initHomepageShowcase();
}

function initHomepageShowcase() {
  const filterBtns = document.querySelectorAll('#portfolio-showcase-filters .filter-tab');
  const items = document.querySelectorAll('#portfolio-showcase-grid .showcase-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      items.forEach(item => {
        const itemCats = (item.dataset.category || '').split(' ');
        if (filter === 'all' || itemCats.includes(filter)) {
          item.style.display = 'block';
          setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'translateY(0)'; }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(20px)';
          setTimeout(() => { item.style.display = 'none'; }, 300);
        }
      });
    });
  });
}

// ============================================================
// 4. FLOW C: DIGITAL PARTNER SLIDE-OUT DRAWER
// ============================================================
function initFlowC() {
  const triggers = document.querySelectorAll('.trigger-flow-c');
  const drawer = document.getElementById('slide-out-drawer');
  const closeBtn = document.getElementById('drawer-close-btn');

  triggers.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      openFlowCDrawer();
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeFlowCDrawer);

  const backdrop = document.getElementById('drawer-backdrop');
  if (backdrop) backdrop.addEventListener('click', closeFlowCDrawer);

  // Initialize Custom Select Component
  initCustomSelects();

  // Interactive Project Scoper Form
  const form = document.getElementById('project-scoper-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('scoper-name')?.value.trim();
      const email = document.getElementById('scoper-email')?.value.trim();
      
      if (!name || !email) {
        alert('Please fill in your name and email address.');
        return;
      }

      const submitBtn = document.getElementById('scoper-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'SUBMITTING BRIEF...';
      }

      setTimeout(() => {
        form.style.display = 'none';
        const successState = document.getElementById('scoper-success');
        if (successState) {
          successState.style.display = 'block';
          document.getElementById('scoper-ref').textContent = `// BRIEF-ID: DIG-${Date.now().toString().slice(-6)}`;
        }
      }, 1000);
    });
  }
}

function openFlowCDrawer() {
  const drawer = document.getElementById('slide-out-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  if (!drawer) return;

  drawer.scrollTop = 0;
  drawer.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
  window.lenis?.stop();
}

function closeFlowCDrawer() {
  const drawer = document.getElementById('slide-out-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  if (!drawer) return;

  drawer.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  document.body.style.overflow = '';
  window.lenis?.start();
}

function initCustomSelects() {
  const customSelects = document.querySelectorAll('.custom-select-wrap');
  customSelects.forEach(wrap => {
    const trigger = wrap.querySelector('.custom-select-trigger');
    const options = wrap.querySelectorAll('.custom-option');
    const hiddenInput = wrap.querySelector('input[type="hidden"]');
    const valueDisplay = wrap.querySelector('.custom-select-value');

    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrap.classList.contains('open');
      customSelects.forEach(other => {
        other.classList.remove('open');
        other.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        wrap.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });

    options.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        options.forEach(o => {
          o.classList.remove('selected');
          o.setAttribute('aria-selected', 'false');
        });
        opt.classList.add('selected');
        opt.setAttribute('aria-selected', 'true');

        const val = opt.getAttribute('data-value');
        const label = opt.querySelector('.opt-label')?.textContent || val;
        if (hiddenInput) hiddenInput.value = val;
        if (valueDisplay) valueDisplay.textContent = label;

        wrap.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      });
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-select-wrap')) {
      document.querySelectorAll('.custom-select-wrap.open').forEach(w => {
        w.classList.remove('open');
        w.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded', 'false');
      });
    }
  });
}

