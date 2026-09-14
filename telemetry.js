/**
 * LENSCAPE & EVENT LABS — UNIFIED TELEMETRY BASELINE
 * Provides structured first-party dataLayer dispatching, conversion tracking,
 * and future-proof Cloud Run Server-Side GTM streaming hooks.
 */

// Initialize standard dataLayer array
window.dataLayer = window.dataLayer || [];
function gtag(){ window.dataLayer.push(arguments); }
window.gtag = window.gtag || gtag;

// Resolve regional market context (TT = Trinidad & Tobago, GY = Guyana)
export const getMarketContext = () => {
  const isGuyana = window.location.pathname.includes('/eventlabs') || 
                   document.body?.classList.contains('eventlabs');
  const market = isGuyana ? 'GY' : 'TT';
  const cfg = window.LENSCAPE_CONFIG || {};

  const ga4Id = cfg.ga4MeasurementId || 
                (market === 'GY' 
                  ? (import.meta.env.VITE_GA4_GY_ID || 'G-EVENTLABS_GY') 
                  : (import.meta.env.VITE_GA4_TT_ID || 'G-LENSCAPE_TT'));

  const gtmId = cfg.gtmContainerId || 
                (market === 'GY' 
                  ? (import.meta.env.VITE_GTM_GY_ID || 'GTM-EVENTLABSGY') 
                  : (import.meta.env.VITE_GTM_TT_ID || 'GTM-LENSCAPETT'));

  return {
    market,
    currency: isGuyana ? 'GYD' : 'TTD',
    entity: isGuyana ? 'Event Labs Guyana' : 'The Lenscape Company Ltd.',
    ga4MeasurementId: ga4Id,
    gtmContainerId: gtmId
  };
};

/**
 * Initializes external GA4 or GTM scripts if valid production IDs are provided
 */
export function initAnalytics() {
  if (typeof window === 'undefined') return;
  const ctx = getMarketContext();
  
  // Initialize gtag base config
  window.gtag('js', new Date());
  window.gtag('config', ctx.ga4MeasurementId, {
    send_page_view: false, // Managed explicitly by telemetry module
    custom_map: {
      dimension1: 'market',
      dimension2: 'conversion_flow',
      dimension3: 'booking_id'
    }
  });

  // Inject Google Tag script only if real ID (not default placeholder)
  const isPlaceholder = ctx.ga4MeasurementId.includes('LENSCAPE_TT') || ctx.ga4MeasurementId.includes('EVENTLABS_GY');
  if (!isPlaceholder && !document.getElementById('ga4-script')) {
    const s = document.createElement('script');
    s.id = 'ga4-script';
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${ctx.ga4MeasurementId}`;
    document.head.appendChild(s);
  }

  // Inject GTM Container script if real GTM ID provided
  const isGtmPlaceholder = ctx.gtmContainerId.includes('LENSCAPETT') || ctx.gtmContainerId.includes('EVENTLABSGY');
  if (!isGtmPlaceholder && !document.getElementById('gtm-script')) {
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer',ctx.gtmContainerId);
  }
}

/**
 * Core event dispatcher
 * @param {string} eventName - Standard snake_case event name
 * @param {Object} eventParams - Additional structured parameters
 */
export function trackEvent(eventName, eventParams = {}) {
  const context = getMarketContext();
  const payload = {
    event: eventName,
    market: context.market,
    currency: context.currency,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
    ...eventParams
  };

  // 1. Dispatch to standard GTM dataLayer
  window.dataLayer.push(payload);

  // 2. Dispatch to GA4 gtag
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, payload);
  }

  // 3. Debug logging in development mode
  if (import.meta.env.DEV) {
    console.log(`[TELEMETRY // ${context.market}] [${context.ga4MeasurementId}]`, eventName, payload);
  }

  // 4. Future sGTM / Cloud Run beacon hook (if endpoint configured)
  const collectEndpoint = import.meta.env.VITE_COLLECT_ENDPOINT;
  if (collectEndpoint && typeof navigator.sendBeacon === 'function') {
    try {
      navigator.sendBeacon(collectEndpoint, JSON.stringify(payload));
    } catch (e) {
      // Graceful fallback - prevent telemetry from interrupting UX
    }
  }

  return payload;
}

// ============================================================
// CONVERSION & INTERACTION SHORTCUTS
// ============================================================

/**
 * Tracks Bento Grid interactions (Flow A, B, C)
 */
export function trackBentoCardClick(cardId, cardTitle, flowName) {
  return trackEvent('bento_card_click', {
    card_id: cardId,
    card_title: cardTitle,
    conversion_flow: flowName
  });
}

/**
 * Tracks High-Value Showreel engagement (Flow A)
 */
export function trackShowreelEngagement(mediaLabel, mediaSrc, service) {
  return trackEvent('showreel_engagement', {
    media_label: mediaLabel,
    media_src: mediaSrc,
    service: service
  });
}

/**
 * Tracks Booking Wizard progression (Step 1 -> Step 2 -> Dispatched)
 */
export function trackBookingStep(step, data = {}) {
  return trackEvent('booking_funnel_step', {
    step_number: step,
    step_name: step === 1 ? 'client_and_event_details' : 'tier_and_pricing_review',
    ...data
  });
}

/**
 * Tracks confirmed booking submission
 */
export function trackBookingSubmission(status, payload = {}) {
  return trackEvent('booking_submitted', {
    status: status, // 'success' | 'failure' | 'stub'
    event_name: payload.eventName || '',
    tier: payload.tier || '',
    estimated_total: payload.total || 0,
    has_custom_arm: Boolean(payload.customArmPaths),
    booking_id: payload.bookingId || ''
  });
}

/**
 * Tracks Solution Scoper Drawer interactions (Flow C)
 */
export function trackScoperDrawer(action, details = {}) {
  return trackEvent('scoper_interaction', {
    action: action, // 'open' | 'toggle_capability' | 'submit'
    ...details
  });
}

/**
 * Tracks Contact & General Inquiries
 */
export function trackContactSubmit(status, subject) {
  return trackEvent('contact_form_submit', {
    status: status,
    subject: subject
  });
}

/**
 * Tracks Direct Conversion Channels (WhatsApp, Phone, Maps)
 */
export function trackChannelClick(channel, target) {
  return trackEvent('direct_channel_click', {
    channel: channel, // 'whatsapp' | 'phone' | 'email' | 'location'
    target: target
  });
}

/**
 * Tracks Portfolio Video and Album Lightbox views
 */
export function trackPortfolioView(project, viewType = 'modal') {
  return trackEvent('portfolio_item_view', {
    project_id: project.id,
    project_title: project.title,
    project_category: project.category,
    project_type: project.type,
    view_type: viewType
  });
}

// Expose globally for vanilla scripts / HTML inline triggers
window.LenscapeTelemetry = {
  initAnalytics,
  trackEvent,
  trackBentoCardClick,
  trackShowreelEngagement,
  trackBookingStep,
  trackBookingSubmission,
  trackScoperDrawer,
  trackContactSubmit,
  trackChannelClick,
  trackPortfolioView,
  getMarketContext
};

// Initial Analytics & Pageview Dispatch
if (typeof document !== 'undefined') {
  const bootstrap = () => {
    initAnalytics();
    trackEvent('page_view', { page_title: document.title });
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    bootstrap();
  } else {
    document.addEventListener('DOMContentLoaded', bootstrap);
  }
}
