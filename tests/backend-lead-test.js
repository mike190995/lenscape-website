/**
 * LENSCAPE — BACKEND LEAD INGESTION TEST HARNESS
 * Simulates client-side form POST requests against the lead-ingestion Cloud Function.
 */

const http = require('http');

const LIVE_URL = 'https://us-east1-lenscape-company.cloudfunctions.net/ingestLead';

const TEST_LEADS = [
  {
    name: 'Test Contact Ingestion',
    payload: {
      form_type: 'contact_form',
      market: 'TT',
      client: {
        name: 'Trinidad Client Tester',
        email: 'tt-tester@lenscapecompany.com',
        phone: '+1-868-555-0101'
      },
      payload: {
        subject: 'Corporate Video Shoot',
        budget: 'TTD $15,000 - $35,000',
        message: 'This is a test submission verifying Phase 2 Contact form ingestion.'
      }
    }
  },
  {
    name: 'Test Booking Wizard Ingestion',
    payload: {
      form_type: 'booking_wizard',
      market: 'GY',
      client: {
        name: 'Guyana Booking Tester',
        email: 'gy-tester@eventlabs.agency',
        phone: '+592-600-0202'
      },
      payload: {
        event_name: 'Tech Conference 2026',
        date: '2026-11-20',
        location: 'Georgetown, Guyana',
        time_slot: '14:00 – 18:00',
        addons: 'Print Station, Custom Arm Paths',
        tier: 'glambot',
        notes: 'Testing automation flow triggers.',
        is_premium: true,
        estimated_total: 140000
      }
    }
  },
  {
    name: 'Test Project Scoper Brief',
    payload: {
      form_type: 'project_scoper',
      market: 'TT',
      client: {
        name: 'Design Partner Brief',
        email: 'partner-test@lenscapecompany.com'
      },
      payload: {
        capabilities: 'Web Design & Development, Analytics & Performance Tracking',
        budget: 'TTD $35,000+'
      }
    }
  }
];

async function runTests() {
  console.log('=== LENSCAPE BACKEND INTEGRATION TEST RUNNER ===\n');

  for (const t of TEST_LEADS) {
    console.log(`[TEST] Running: ${t.name}...`);
    try {
      const response = await fetch(LIVE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(t.payload)
      });

      const resJson = await response.json();
      console.log(`Status: ${response.status}`);
      console.log('Response:', JSON.stringify(resJson, null, 2));
      
      if (response.status === 200 && resJson.success) {
        console.log(`✓ SUCCESS: Tracking Code generated: ${resJson.lead_id}\n`);
      } else {
        console.log(`✕ FAILURE: ${resJson.error || 'Unknown Error'}\n`);
      }
    } catch (err) {
      console.error(`✕ CONNECTION ERROR: Could not reach endpoint at ${LIVE_URL}`);
      console.error(err.message, '\n');
    }
  }
}

runTests();
