/**
 * LENSCAPE — BOOKING LOGIC
 * Sub-Agent C: Booking Logic & Spreadsheet Sync
 *
 * Handles: form validation, pricing flags, and Google Sheets submission.
 * To enable live sync: set SHEETS_ENDPOINT to your Google Apps Script Web App URL.
 */

// ============================================================
// CONFIG — replace with your deployed Apps Script URL
// ============================================================
export const BOOKING_CONFIG = {
  SHEETS_ENDPOINT: 'https://script.google.com/macros/s/AKfycbxzN7LpfOw6yduHM6uae-b7eryQMkJ1AWYjiKbrFbpFum9ik79HAIjTpwchDwtbQ6pncg/exec',
  MIN_DURATION_HOURS: 2,
  TRANSPORT_COST: 250,
  PRICING: {
    basic: { 2: 3250, 3: 3750, 4: 4250, 5: 4750 },
    glam:  { 2: 4250, 3: 4750, 4: 5250, 5: 5750 }
  }
}

// ============================================================
// 1. TIME VALIDATION — 2-Hour Minimum
// ============================================================

/**
 * Parses a "HH:MM" string into total minutes since midnight.
 */
function parseTime(timeStr) {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

/**
 * Validates that the booking duration meets the 2-hour minimum.
 * @param {string} startTime - "HH:MM" format
 * @param {string} endTime   - "HH:MM" format
 * @returns {{ valid: boolean, hours: number, message: string }}
 */
export function validateDuration(startTime, endTime) {
  const start = parseTime(startTime)
  const end   = parseTime(endTime)

  if (start === null || end === null) {
    return { valid: false, hours: 0, message: 'Please select both start and end times.' }
  }

  if (end <= start) {
    return { valid: false, hours: 0, message: 'End time must be after start time.' }
  }

  const diffMins = end - start
  const hours    = diffMins / 60

  if (hours < BOOKING_CONFIG.MIN_DURATION_HOURS) {
    const shortfall = BOOKING_CONFIG.MIN_DURATION_HOURS - hours
    return {
      valid: false,
      hours,
      message: `Minimum booking is 2 hours. You need ${shortfall.toFixed(1)} more hour(s).`
    }
  }

  return {
    valid: true,
    hours,
    message: `Duration: ${hours.toFixed(1)} hours ✓`
  }
}

// ============================================================
// 2. PRICING CALCULATOR
// ============================================================

/**
 * Calculates the estimated price for a booking.
 * @param {string} tier      - 'basic' | 'glam' | 'custom'
 * @param {number} hours     - booking duration in hours
 * @param {boolean} transport - whether transport is required
 * @returns {{ estimate: string, isCustom: boolean, breakdown: object }}
 */
export function calculatePrice(tier, hours, transport = false) {
  if (tier === 'custom') {
    return {
      estimate: 'Custom Quote',
      isCustom: true,
      breakdown: { note: 'Creative/Custom pricing requires team review.' }
    }
  }

  const roundedHours = Math.min(5, Math.max(2, Math.round(hours)))
  const basePrice    = BOOKING_CONFIG.PRICING[tier]?.[roundedHours] ?? null

  if (!basePrice) {
    return { estimate: 'Contact Us', isCustom: true, breakdown: {} }
  }

  const transportCost = transport ? BOOKING_CONFIG.TRANSPORT_COST : 0
  const total         = basePrice + transportCost

  return {
    estimate: `TTD $${total.toLocaleString()}`,
    isCustom: false,
    breakdown: {
      base: `$${basePrice}`,
      transport: transport ? `+$${transportCost}` : null,
      total: `$${total}`
    }
  }
}

// ============================================================
// 3. PREMIUM FLAG — Custom Arm Paths
// ============================================================

/**
 * Flags the payload as Premium/Creative if custom arm paths are selected.
 * @param {object} payload
 * @returns {object} mutated payload with premium flag
 */
export function flagPremium(payload) {
  if (payload.tier === 'custom' || payload.customArmPaths) {
    payload.status       = 'Pending — Premium Review Required'
    payload.isPremium    = true
    payload.notes        = `[PREMIUM FLAG] Custom Arm Paths requested. ${payload.notes || ''}`
  }
  return payload
}

// ============================================================
// 4. FORM SANITIZATION
// ============================================================

/**
 * Sanitizes and maps raw form data to the spreadsheet column schema.
 * Columns: Timestamp | Status | Client Name | Event Name | Date |
 *          Location | Time Slot | Add-ons | Tier | Notes | Is Premium
 */
export function buildPayload(formData) {
  const raw = { ...formData }

  const payload = {
    timestamp:   new Date().toISOString(),
    status:      'Pending',
    clientName:  sanitize(raw.clientName),
    eventName:   sanitize(raw.eventName),
    date:        raw.date || '',
    location:    sanitize(raw.location),
    timeSlot:    raw.startTime && raw.endTime ? `${raw.startTime} – ${raw.endTime}` : '',
    addons:      Array.isArray(raw.addons) ? raw.addons.join(', ') : (raw.addons || ''),
    tier:        raw.tier || 'basic',
    music:       sanitize(raw.music),
    notes:       sanitize(raw.notes),
    isPremium:   false,
    customArmPaths: raw.customArmPaths || false,
  }

  return flagPremium(payload)
}

function sanitize(str) {
  if (!str) return ''
  return String(str).trim().replace(/[<>]/g, '')
}

// ============================================================
// 5. SUBMIT — Google Apps Script Endpoint
// ============================================================

/**
 * Submits the booking payload to Google Sheets via Apps Script.
 * Falls back to console.log if endpoint is not configured.
 * @param {object} formData - raw form data object
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function submitBooking(formData) {
  const payload = buildPayload(formData)

  console.log('[Lenscape Booking] Payload:', payload)

  // Stub mode — no endpoint configured yet
  if (
    !BOOKING_CONFIG.SHEETS_ENDPOINT ||
    BOOKING_CONFIG.SHEETS_ENDPOINT.includes('YOUR_DEPLOYMENT_ID')
  ) {
    console.warn('[Lenscape Booking] Running in STUB MODE. Configure SHEETS_ENDPOINT to enable live sync.')
    await fakeDelay(1200)
    return {
      success: true,
      message: 'Booking request received (stub mode). Configure the Google Apps Script endpoint to enable live sync.',
      payload
    }
  }

  try {
    const res = await fetch(BOOKING_CONFIG.SHEETS_ENDPOINT, {
      method: 'POST',
      mode:   'no-cors', // Apps Script requires no-cors
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    // no-cors mode always returns opaque response; assume success if no throw
    return {
      success: true,
      message: 'Your booking request has been submitted. The Lenscape team will review and confirm within 24 hours.',
      payload
    }
  } catch (err) {
    console.error('[Lenscape Booking] Submission error:', err)
    return {
      success: false,
      message: 'Submission failed. Please try again or contact us directly.',
      error: err
    }
  }
}

function fakeDelay(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ============================================================
// 6. AVAILABILITY FETCH (Live Google Sheets sync)
// ============================================================

/**
 * Fetches booked dates and their details from the Google Sheets Web App.
 * Returns an object mapping "YYYY-MM-DD" to event details.
 * Falls back to mock dates if the endpoint is not yet configured.
 * @returns {Promise<Record<string, { event: string, time: string, booth: string }>>}
 */
export async function fetchBookedDates() {
  const isStub = !BOOKING_CONFIG.SHEETS_ENDPOINT || 
                 BOOKING_CONFIG.SHEETS_ENDPOINT.includes('YOUR_DEPLOYMENT_ID');

  if (isStub) {
    console.warn('[Lenscape Booking] Running in STUB MODE for availability. Configure SHEETS_ENDPOINT to enable live sync.');
    
    const today = new Date();
    const year  = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');

    // Return mock booked dates with event/time metadata
    return {
      [`${year}-${month}-07`]: { event: 'Private Party', time: '18:00 – 21:00', booth: 'BASIC' },
      [`${year}-${month}-14`]: { event: 'Corporate Gala', time: '19:00 – 23:00', booth: 'GLAM' },
      [`${year}-${month}-21`]: { event: 'Wedding Reception', time: '16:00 – 22:00', booth: 'BASIC' },
      [`${year}-${month}-28`]: { event: 'Sweet 16', time: '17:00 – 20:00', booth: 'GLAM' }
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout

    const res = await fetch(BOOKING_CONFIG.SHEETS_ENDPOINT, { 
      signal: controller.signal 
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error('Response data is not an array');
    }

    // Convert API response array to key-value object
    const bookedMap = {};
    data.forEach(item => {
      if (item.date) {
        bookedMap[item.date] = {
          event: item.event || 'Booked Event',
          time: item.time || 'Unavailable',
          booth: item.booth || ''
        };
      }
    });

    return bookedMap;
  } catch (err) {
    console.error('[Lenscape Booking] Failed to fetch live availability:', err);
    return {}; // Return empty to not break calendar rendering
  }
}

