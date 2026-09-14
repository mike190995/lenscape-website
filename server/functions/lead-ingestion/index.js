/**
 * LENSCAPE — GOOGLE CLOUD FUNCTION (GEN 2)
 * Lead Ingestion Endpoint: /v1/lead
 * Ingests multi-pathway form inquiries, saves them securely to Firestore,
 * and triggers automated Google Apps Script proposal dispatchers.
 */

const { Firestore } = require('@google-cloud/firestore');
const cors = require('cors')({ origin: true });

// Initialize Firestore Native client
const firestore = new Firestore();

/**
 * Generates a high-entropy, human-friendly Lead Tracking Code
 * Example output: LNS-2026-X89A1
 */
function generateTrackingCode(formType) {
  const prefix = formType === 'booking_wizard' ? 'B' 
               : formType === 'project_scoper' ? 'S' 
               : 'C';
  const year = new Date().getFullYear();
  const randomHex = Math.random().toString(16).substring(2, 7).toUpperCase();
  return `LNS-${year}-${prefix}${randomHex}`;
}

exports.ingestLead = (req, res) => {
  // Wrap in CORS middleware
  return cors(req, res, async () => {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method Not Allowed. Use POST.'
      });
    }

    try {
      const payload = req.body;

      // 1. INPUT VALIDATION
      if (!payload || !payload.form_type || !payload.client) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields. Provide form_type and client details.'
        });
      }

      const formType = payload.form_type;
      const client = payload.client;

      if (!client.name || !client.email) {
        return res.status(400).json({
          success: false,
          error: 'Client name and email are mandatory.'
        });
      }

      // Validate allowed form pathways
      const validForms = ['booking_wizard', 'contact_form', 'project_scoper'];
      if (!validForms.includes(formType)) {
        return res.status(400).json({
          success: false,
          error: `Invalid form_type: '${formType}'. Must be one of: ${validForms.join(', ')}`
        });
      }

      // 2. LEAD CONTEXT PREPARATION
      const market = payload.market || 'TT';
      const currency = market === 'GY' ? 'GYD' : 'TTD';
      const leadId = generateTrackingCode(formType);
      const createdAt = new Date().toISOString();

      // Create robust structured database object
      const leadDocument = {
        lead_id: leadId,
        form_type: formType,
        market: market,
        currency: currency,
        created_at: createdAt,
        status: 'new',
        client: {
          name: client.name.trim(),
          email: client.email.toLowerCase().trim(),
          phone: client.phone ? client.phone.trim() : ''
        },
        payload: payload.payload || {},
        metadata: {
          ip: req.ip || req.headers['x-forwarded-for'] || '',
          user_agent: req.headers['user-agent'] || '',
          path: payload.path || ''
        }
      };

      // 3. PERSIST TO CLOUD FIRESTORE
      console.log(`Writing lead ${leadId} to Firestore collection 'leads'...`);
      await firestore.collection('leads').doc(leadId).set(leadDocument);
      console.log(`✓ Lead ${leadId} successfully written.`);

      // 4. TRIGGER AUTOMATED APPS SCRIPT WEBHOOK (If configured)
      const appsScriptUrl = process.env.APPS_SCRIPT_WEBHOOK_URL;
      let automationStatus = 'skipped';

      if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
        console.log(`Triggering proposal generation webhook: ${appsScriptUrl}`);
        try {
          const response = await fetch(appsScriptUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.APPS_SCRIPT_AUTH_TOKEN || ''}`
            },
            body: JSON.stringify(leadDocument)
          });
          
          if (response.ok) {
            automationStatus = 'triggered';
            console.log('✓ Automated proposal trigger successful.');
          } else {
            automationStatus = 'failed_trigger';
            console.error(`✕ Webhook returned status: ${response.status}`);
          }
        } catch (webhookErr) {
          automationStatus = 'failed_connection';
          console.error('✕ Webhook connection error:', webhookErr.message);
        }
      } else {
        console.log('- Apps Script Webhook skipped (APPS_SCRIPT_WEBHOOK_URL not configured).');
      }

      // 5. SUCCESS RESPONSE
      return res.status(200).json({
        success: true,
        lead_id: leadId,
        message: 'Lead ingested and processed successfully.',
        automation_status: automationStatus,
        data: {
          market,
          currency,
          created_at: createdAt
        }
      });

    } catch (error) {
      console.error('CRITICAL: Ingestion Pipeline Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        detail: error.message
      });
    }
  });
};
