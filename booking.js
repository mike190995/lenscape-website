/**
 * LENSCAPE — BOOKING MODAL UI
 * Sub-Agent B: Frontend Component Builder
 *
 * Multi-step booking modal:
 * Step 1 — Calendar (date selection)
 * Step 2 — Data Capture Form (full field set)
 */

import { validateDuration, calculatePrice, submitBooking, fetchBookedDates } from './booking-logic.js'

// ============================================================
// STATE
// ============================================================
let currentStep    = 1
let selectedDate   = null
let calendarYear   = new Date().getFullYear()
let calendarMonth  = new Date().getMonth()
let formData       = {}

const bookedDates  = new Map()

// ============================================================
// MODAL HTML TEMPLATE
// ============================================================
function createModalHTML() {
  return `
  <div class="modal-backdrop" id="booking-modal-backdrop" role="dialog" aria-modal="true" aria-label="Book the MotionMagic Cam">
    <div class="booking-modal" data-lenis-prevent>

      <!-- Header -->
      <div class="modal-header">
        <div class="modal-header-text">
          <div class="modal-title">Book the Booth</div>
          <div class="modal-subtitle">// MOTIONMAGIC CAM — REQUEST FORM</div>
        </div>
        <button class="modal-close" id="modal-close-btn" aria-label="Close modal">✕</button>
      </div>

      <!-- Step Indicator -->
      <div class="modal-steps">
        <div class="step-item active" id="step-indicator-1">
          <div class="step-num">01</div>
          <div class="step-label">Select Date</div>
        </div>
        <div class="step-divider"></div>
        <div class="step-item" id="step-indicator-2">
          <div class="step-num">02</div>
          <div class="step-label">Event Details</div>
        </div>
      </div>

      <!-- Body -->
      <div class="modal-body">

        <!-- STEP 1: Calendar -->
        <div class="modal-step active" id="modal-step-1">
          <div class="calendar-container">
            <div class="calendar-nav">
              <button class="cal-nav-btn" id="cal-prev" aria-label="Previous month">‹</button>
              <div class="calendar-month" id="cal-month-label"></div>
              <button class="cal-nav-btn" id="cal-next" aria-label="Next month">›</button>
            </div>
            <div class="calendar-grid" id="calendar-grid"></div>
            <div class="calendar-legend">
              <div class="legend-item">
                <div class="legend-dot available"></div>
                <span>AVAILABLE</span>
              </div>
              <div class="legend-item">
                <div class="legend-dot booked"></div>
                <span>BOOKED</span>
              </div>
              <div class="legend-item">
                <div class="legend-dot today"></div>
                <span>TODAY</span>
              </div>
            </div>
          </div>

          <div class="form-group" style="margin-top: 1.5rem;">
            <div class="form-label">Selected Date</div>
            <div id="selected-date-display" style="
              font-family: var(--font-drama);
              font-size: 1.5rem;
              font-weight: 700;
              color: var(--text-muted);
              padding: 1rem 0;
              border-bottom: 1px solid rgba(255,255,255,0.08);
            ">— No date selected</div>
          </div>
        </div>

        <!-- STEP 2: Event Details Form -->
        <div class="modal-step" id="modal-step-2">
          <form id="booking-form" novalidate>

            <!-- Event Info -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="field-client-name">Your Name *</label>
                <input class="form-input" type="text" id="field-client-name" name="clientName"
                  placeholder="Full name" required autocomplete="name" />
                <div class="field-error" id="err-client-name">Please enter your name.</div>
              </div>
              <div class="form-group">
                <label class="form-label" for="field-event-name">Event Name *</label>
                <input class="form-input" type="text" id="field-event-name" name="eventName"
                  placeholder="e.g. Sweet 16, Corporate Launch" required />
                <div class="field-error" id="err-event-name">Please enter the event name.</div>
              </div>
            </div>

            <!-- Location -->
            <div class="form-group">
              <label class="form-label" for="field-location">Event Location *</label>
              <select class="form-select" id="field-location" name="location" required>
                <option value="" disabled selected>Select location</option>
                <optgroup label="Trinidad">
                  <option value="Port of Spain, Trinidad">Port of Spain</option>
                  <option value="San Fernando, Trinidad">San Fernando</option>
                  <option value="Chaguanas, Trinidad">Chaguanas</option>
                  <option value="Santa Cruz, Trinidad">Santa Cruz</option>
                  <option value="Arima, Trinidad">Arima</option>
                  <option value="Other, Trinidad">Other (Trinidad)</option>
                </optgroup>
                <optgroup label="Tobago">
                  <option value="Scarborough, Tobago">Scarborough, Tobago</option>
                  <option value="Other, Tobago">Other (Tobago)</option>
                </optgroup>
              </select>
              <div class="field-error" id="err-location">Please select a location.</div>
            </div>

            <!-- Time Slot -->
            <div class="form-group">
              <label class="form-label">Time Slot *</label>
              <div class="time-row">
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label" for="field-start-time" style="font-size:0.55rem; opacity:0.6;">START</label>
                  <input class="form-input" type="time" id="field-start-time" name="startTime" required />
                </div>
                <div class="time-separator">TO</div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label" for="field-end-time" style="font-size:0.55rem; opacity:0.6;">END</label>
                  <input class="form-input" type="time" id="field-end-time" name="endTime" required />
                </div>
              </div>
              <div class="duration-feedback" id="duration-feedback"></div>
              <div class="field-error" id="err-time">Please select valid start and end times.</div>
            </div>

            <!-- Music Preference -->
            <div class="form-group">
              <label class="form-label" for="field-music">Music Preference</label>
              <select class="form-select" id="field-music" name="music">
                <option value="" disabled selected>Select genre (optional)</option>
                <option value="Soca">Soca</option>
                <option value="Dancehall">Dancehall</option>
                <option value="Afrobeats">Afrobeats</option>
                <option value="Hip-Hop / R&B">Hip-Hop / R&amp;B</option>
                <option value="Pop">Pop</option>
                <option value="Classical / Background">Classical / Background</option>
                <option value="Client Playlist">Client Playlist (we'll use yours)</option>
                <option value="No preference">No preference</option>
              </select>
            </div>

            <!-- Add-ons -->
            <div class="form-group">
              <div class="form-label">Add-ons (optional)</div>
              <div class="check-group">
                <label class="check-item">
                  <input type="checkbox" name="addons" value="Props" id="addon-props" />
                  Props Package
                </label>
                <label class="check-item">
                  <input type="checkbox" name="addons" value="Custom Backdrops" id="addon-backdrops" />
                  Custom Backdrops
                </label>
                <label class="check-item">
                  <input type="checkbox" name="addons" value="Transport" id="addon-transport" />
                  Transport Required (+TTD $250)
                </label>
              </div>
            </div>

            <!-- Tier / Use Case -->
            <div class="form-group">
              <div class="form-label">Booking Tier *</div>
              <div class="radio-group" id="tier-group">
                <label class="radio-item" id="tier-basic-label">
                  <input type="radio" name="tier" value="basic" id="tier-basic" checked />
                  General Event (Basic)
                </label>
                <label class="radio-item" id="tier-glam-label">
                  <input type="radio" name="tier" value="glam" id="tier-glam" />
                  Premium Event (Glam)
                </label>
                <label class="radio-item" id="tier-custom-label">
                  <input type="radio" name="tier" value="custom" id="tier-custom" />
                  Creative / Custom Use
                </label>
              </div>

              <!-- Custom Arm Paths — revealed when Creative/Custom selected -->
              <div class="custom-arm-reveal" id="custom-arm-reveal">
                <label class="custom-arm-label">
                  <input type="checkbox" name="customArmPaths" id="field-custom-arm" />
                  <div>
                    <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.4rem;">
                      <span style="font-weight:600; color: var(--text-primary); font-size:0.92rem;">Custom Arm Paths</span>
                      <span class="custom-arm-badge">PREMIUM</span>
                    </div>
                    <div class="custom-arm-desc">
                      Fully choreographed, bespoke camera movement sequences designed for
                      creative shoots, brand campaigns, and high-production events.
                      Custom pricing applies — our team will reach out to discuss.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Price Estimate -->
            <div class="form-group" id="price-estimate-group" style="
              padding: 1.25rem 1.5rem;
              background: var(--accent-dim);
              border: 1px solid rgba(242,196,26,0.2);
              display: flex;
              justify-content: space-between;
              align-items: center;
            ">
              <div>
                <div class="form-label" style="margin-bottom:0.25rem;">Estimated Price</div>
                <div id="price-estimate-value" style="
                  font-family: var(--font-drama);
                  font-size: 1.5rem;
                  font-weight: 700;
                  color: var(--accent);
                ">TTD $3,250</div>
              </div>
              <div id="price-breakdown" style="
                font-family: var(--font-data);
                font-size: 0.6rem;
                color: var(--text-muted);
                letter-spacing: 0.08em;
                text-align: right;
                line-height: 1.8;
              "></div>
            </div>

            <!-- Notes -->
            <div class="form-group" style="margin-top: 1.5rem;">
              <label class="form-label" for="field-notes">Additional Notes</label>
              <textarea class="form-textarea" id="field-notes" name="notes"
                placeholder="Any special requirements, theme details, or questions..."></textarea>
            </div>

          </form>
        </div>

        <!-- STEP 3: Success -->
        <div class="modal-step" id="modal-step-3">
          <div class="booking-success">
            <div class="booking-success-icon">◆</div>
            <h3>Request Submitted</h3>
            <p>
              Your booking request is now in the queue. The Lenscape team will review your
              details and confirm availability within <strong>24 hours</strong>.
            </p>
            <div style="
              font-family: var(--font-data);
              font-size: 0.62rem;
              letter-spacing: 0.12em;
              color: var(--accent);
              opacity: 0.8;
              margin-bottom: 2rem;
            " id="success-ref-num">// REF: LSC-000000</div>
            <button class="btn-ghost" id="modal-done-btn">CLOSE</button>
          </div>
        </div>

      </div><!-- /modal-body -->

      <!-- Footer -->
      <div class="modal-footer" id="modal-footer">
        <div class="modal-footer-info">
          All bookings are subject to team review and confirmation.
          Minimum booking duration is 2 hours.
        </div>
        <div style="display:flex; gap: 1rem; align-items: center;">
          <button class="btn-ghost" id="modal-back-btn" style="display:none;">← BACK</button>
          <button class="btn-primary" id="modal-next-btn">
            <span>SELECT DATE →</span>
          </button>
        </div>
      </div>

    </div><!-- /booking-modal -->
  </div><!-- /modal-backdrop -->
  `
}

// ============================================================
// CALENDAR RENDERER
// ============================================================
function renderCalendar() {
  const monthLabel = document.getElementById('cal-month-label')
  const grid       = document.getElementById('calendar-grid')
  if (!monthLabel || !grid) return

  const today      = new Date()
  const date       = new Date(calendarYear, calendarMonth, 1)
  const monthNames = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December']

  monthLabel.textContent = `${monthNames[calendarMonth]} ${calendarYear}`

  // Day headers
  const dayNames = ['SUN','MON','TUE','WED','THU','FRI','SAT']
  let html = dayNames.map(d => `<div class="cal-day-name">${d}</div>`).join('')

  // Pad to start of week
  const startDay = date.getDay()
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate()
  const prevDays    = new Date(calendarYear, calendarMonth, 0).getDate()

  // Previous month overflow
  for (let i = startDay - 1; i >= 0; i--) {
    html += `<div class="cal-day other-month">${prevDays - i}</div>`
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr  = `${calendarYear}-${String(calendarMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const cellDate = new Date(calendarYear, calendarMonth, d)
    const isToday  = cellDate.toDateString() === today.toDateString()
    const isPast   = cellDate < new Date(today.setHours(0,0,0,0))
    const isBooked = bookedDates.has(dateStr)
    const isSelected = selectedDate === dateStr

    let classes = 'cal-day'
    if (isToday)    classes += ' today'
    if (isPast)     classes += ' disabled'
    if (isBooked)   classes += ' booked'
    if (isSelected) classes += ' selected'

    if (isBooked) {
      const info = bookedDates.get(dateStr) || { event: 'Booked Event', time: 'Unavailable' };
      html += `<div class="${classes}" data-tooltip="${info.event} (${info.time})">${d}</div>`;
    } else {
      const disabled = isPast;
      html += `<div class="${classes}" ${disabled ? '' : `data-date="${dateStr}"`}>${d}</div>`;
    }
  }

  // Next month overflow
  const totalCells = startDay + daysInMonth
  const remaining  = 7 - (totalCells % 7)
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      html += `<div class="cal-day other-month">${i}</div>`
    }
  }

  grid.innerHTML = html

  // Bind day click
  grid.querySelectorAll('.cal-day[data-date]').forEach(cell => {
    cell.addEventListener('click', () => {
      selectedDate = cell.dataset.date
      updateDateDisplay()
      renderCalendar()
    })
  })
}

function updateDateDisplay() {
  const el = document.getElementById('selected-date-display')
  if (!el) return
  if (selectedDate) {
    const d = new Date(selectedDate + 'T00:00:00')
    el.textContent = d.toLocaleDateString('en-TT', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
    el.style.color = 'var(--text-primary)'
  } else {
    el.textContent = '— No date selected'
    el.style.color = 'var(--text-muted)'
  }
}

// ============================================================
// STEP NAVIGATION
// ============================================================
function goToStep(step) {
  // Hide all steps
  document.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'))
  document.querySelectorAll('.step-item').forEach(s => {
    s.classList.remove('active')
    if (parseInt(s.id.replace('step-indicator-','')) < step) s.classList.add('done')
    else s.classList.remove('done')
  })

  // Show target step
  document.getElementById(`modal-step-${step}`)?.classList.add('active')
  document.getElementById(`step-indicator-${step}`)?.classList.add('active')

  currentStep = step

  const backBtn = document.getElementById('modal-back-btn')
  const nextBtn = document.getElementById('modal-next-btn')
  const footer  = document.getElementById('modal-footer')

  if (step === 1) {
    backBtn.style.display = 'none'
    nextBtn.innerHTML     = '<span>CONTINUE →</span>'
  } else if (step === 2) {
    backBtn.style.display = 'flex'
    nextBtn.innerHTML     = '<span>SUBMIT REQUEST →</span>'
  } else if (step === 3) {
    footer.style.display  = 'none'
  }
}

// ============================================================
// FORM VALIDATION (Step 2)
// ============================================================
function validateStep2() {
  let valid = true

  // Client name
  const clientName = document.getElementById('field-client-name')
  if (!clientName.value.trim()) {
    showError('err-client-name', true)
    clientName.classList.add('invalid')
    valid = false
  } else {
    showError('err-client-name', false)
    clientName.classList.remove('invalid')
  }

  // Event name
  const eventName = document.getElementById('field-event-name')
  if (!eventName.value.trim()) {
    showError('err-event-name', true)
    eventName.classList.add('invalid')
    valid = false
  } else {
    showError('err-event-name', false)
    eventName.classList.remove('invalid')
  }

  // Location
  const location = document.getElementById('field-location')
  if (!location.value) {
    showError('err-location', true)
    location.classList.add('invalid')
    valid = false
  } else {
    showError('err-location', false)
    location.classList.remove('invalid')
  }

  // Time validation
  const start = document.getElementById('field-start-time').value
  const end   = document.getElementById('field-end-time').value
  const dur   = validateDuration(start, end)

  if (!dur.valid) {
    showError('err-time', false)
    const fb = document.getElementById('duration-feedback')
    fb.className = 'duration-feedback error'
    fb.textContent = dur.message
    valid = false
  }

  return valid
}

function showError(id, show) {
  const el = document.getElementById(id)
  if (!el) return
  el.classList.toggle('visible', show)
}

// ============================================================
// COLLECT FORM DATA
// ============================================================
function collectFormData() {
  const form   = document.getElementById('booking-form')
  if (!form) return {}

  const addons = Array.from(form.querySelectorAll('input[name="addons"]:checked'))
    .map(el => el.value)

  return {
    clientName:    document.getElementById('field-client-name').value.trim(),
    eventName:     document.getElementById('field-event-name').value.trim(),
    location:      document.getElementById('field-location').value,
    date:          selectedDate || '',
    startTime:     document.getElementById('field-start-time').value,
    endTime:       document.getElementById('field-end-time').value,
    music:         document.getElementById('field-music').value,
    addons,
    tier:          form.querySelector('input[name="tier"]:checked')?.value || 'basic',
    customArmPaths: document.getElementById('field-custom-arm')?.checked || false,
    notes:         document.getElementById('field-notes').value.trim(),
  }
}

// ============================================================
// PRICE ESTIMATOR (live update)
// ============================================================
function updatePriceEstimate() {
  const form  = document.getElementById('booking-form')
  if (!form) return

  const tier      = form.querySelector('input[name="tier"]:checked')?.value || 'basic'
  const start     = document.getElementById('field-start-time').value
  const end       = document.getElementById('field-end-time').value
  const transport = document.getElementById('addon-transport')?.checked || false

  const { hours } = validateDuration(start, end)
  const result    = calculatePrice(tier, hours || 2, transport)

  const valEl = document.getElementById('price-estimate-value')
  const brkEl = document.getElementById('price-breakdown')
  if (valEl) valEl.textContent = result.estimate
  if (brkEl) {
    if (result.breakdown.note) {
      brkEl.textContent = result.breakdown.note
    } else if (result.breakdown.transport) {
      brkEl.textContent = `Base: ${result.breakdown.base}\nTransport: ${result.breakdown.transport}`
    } else {
      brkEl.textContent = `Base: ${result.breakdown.base}`
    }
  }
}

// ============================================================
// DURATION LIVE FEEDBACK
// ============================================================
function bindDurationFeedback() {
  const startEl = document.getElementById('field-start-time')
  const endEl   = document.getElementById('field-end-time')

  function check() {
    const result = validateDuration(startEl.value, endEl.value)
    const fb     = document.getElementById('duration-feedback')
    if (!fb) return

    if (startEl.value && endEl.value) {
      fb.className  = `duration-feedback ${result.valid ? 'ok' : 'error'}`
      fb.textContent = result.message
    } else {
      fb.className  = 'duration-feedback'
      fb.textContent = ''
    }

    updatePriceEstimate()
  }

  startEl?.addEventListener('change', check)
  endEl?.addEventListener('change', check)
}

// ============================================================
// MODAL OPEN / CLOSE
// ============================================================
async function openModal() {
  const backdrop = document.getElementById('booking-modal-backdrop')
  if (!backdrop) return
  
  // Pause background smooth scroll (Lenis)
  window.lenis?.stop()
  
  backdrop.classList.add('open')
  document.body.style.overflow = 'hidden'
  goToStep(1)
  
  // Render immediately with whatever we have (or empty)
  renderCalendar()
  
  // Fetch live availability from Sheets (with fallback stub)
  try {
    const freshBooked = await fetchBookedDates();
    bookedDates.clear();
    for (const [date, info] of Object.entries(freshBooked)) {
      bookedDates.set(date, info);
    }
    renderCalendar();
  } catch (err) {
    console.error('[Lenscape Booking] Error fetching availability:', err);
  }
}

function closeModal() {
  const backdrop = document.getElementById('booking-modal-backdrop')
  if (!backdrop) return
  backdrop.classList.remove('open')
  document.body.style.overflow = ''
  
  // Resume background smooth scroll (Lenis)
  window.lenis?.start()
}

// ============================================================
// INIT
// ============================================================
export function initBookingModal() {
  // Inject modal HTML
  document.body.insertAdjacentHTML('beforeend', createModalHTML())

  // Bind open buttons (all .book-now-btn on page)
  document.querySelectorAll('.book-now-btn').forEach(btn => {
    btn.addEventListener('click', openModal)
  })

  // Close
  document.getElementById('modal-close-btn')?.addEventListener('click', closeModal)
  document.getElementById('booking-modal-backdrop')?.addEventListener('click', e => {
    if (e.target.id === 'booking-modal-backdrop') closeModal()
  })
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal()
  })

  // Calendar nav
  document.getElementById('cal-prev')?.addEventListener('click', () => {
    calendarMonth--
    if (calendarMonth < 0) { calendarMonth = 11; calendarYear-- }
    renderCalendar()
  })
  document.getElementById('cal-next')?.addEventListener('click', () => {
    calendarMonth++
    if (calendarMonth > 11) { calendarMonth = 0; calendarYear++ }
    renderCalendar()
  })

  // Done button (success screen)
  document.getElementById('modal-done-btn')?.addEventListener('click', closeModal)

  // Next / Submit
  document.getElementById('modal-next-btn')?.addEventListener('click', async () => {
    if (currentStep === 1) {
      if (!selectedDate) {
        updateDateDisplay()
        const disp = document.getElementById('selected-date-display')
        if (disp) {
          disp.style.color = '#FF4444'
          disp.textContent = '— Please select a date to continue'
          setTimeout(() => updateDateDisplay(), 2000)
        }
        return
      }
      goToStep(2)
      bindDurationFeedback()
      updatePriceEstimate()
      bindTierChange()
      bindAddonChange()
    } else if (currentStep === 2) {
      if (!validateStep2()) return

      const nextBtn = document.getElementById('modal-next-btn')
      nextBtn.innerHTML = '<span>SUBMITTING...</span>'
      nextBtn.disabled  = true

      formData = collectFormData()
      const result = await submitBooking(formData)

      if (result.success) {
        const ref = document.getElementById('success-ref-num')
        if (ref) ref.textContent = `// REF: LSC-${Date.now().toString().slice(-6)}`
        goToStep(3)
      } else {
        nextBtn.innerHTML = '<span>RETRY →</span>'
        nextBtn.disabled  = false
        alert(result.message)
      }
    }
  })

  // Back
  document.getElementById('modal-back-btn')?.addEventListener('click', () => {
    if (currentStep === 2) goToStep(1)
  })
}

function bindTierChange() {
  document.querySelectorAll('input[name="tier"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const reveal = document.getElementById('custom-arm-reveal')
      if (reveal) {
        reveal.classList.toggle('visible', radio.value === 'custom')
      }
      updatePriceEstimate()
    })
  })
}

function bindAddonChange() {
  document.getElementById('addon-transport')?.addEventListener('change', updatePriceEstimate)
}
