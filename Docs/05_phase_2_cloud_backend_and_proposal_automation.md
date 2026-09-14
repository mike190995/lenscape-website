# Implementation Plan — Phase 2: Zero-SaaS Cloud Backend & Proposal Automation
**Lenscape Trinidad & Tobago & Event Labs Guyana**  
*Document Ref: PLAN-PHASE-2-BACKEND* | *Last Updated: 2026-09-13*

---

## 1. Executive Summary

Having successfully completed **Phase 1 (Media CDN Offloading, WebP Canvas Optimization, Technical SEO, and Telemetry Baseline)**, the platform now loads instantly (<300ms preloader dismissal) and tracks user interactions reliably.

**Phase 2** focuses on replacing all remaining static stubs and simulated mock-submits with a **Google-Native, Zero-SaaS Serverless Backend**. This will securely ingest leads, store them in Firestore, and automate client proposals using Google Cloud Functions and Google Apps Script.

```
 [ Client Submits Form ] (Booking, Contact, or Custom Scope)
           │
           ▼
 [ Google Cloud Function ] (V2 Node.js / Python Endpoint)
           │
           ├─► [ Cloud Firestore ] (Lead records database)
           │
           └─► [ Apps Script Webhook ] (Triggered via API)
                     │
                     ├─► [ Docs/Slides API ] (Populates branded proposal template)
                     ├─► [ Calendar API ] (Confirms & holds availability)
                     └─► [ Gmail API ] (Auto-emails PDF to client in <3 minutes)
```

---

## 2. Technical Architecture & Components

### Component A: Unified Cloud Function Ingestion Endpoint (`/v1/lead`)
- **Technology**: Node.js 20 on Google Cloud Functions (2nd Gen) under the GCP project `lenscape-company`.
- **Purpose**: A secure, serverless API endpoint that replaces the `STUB_MODE` in [`contact.js`](file:///c:/Users/mike1/Documents/Antigravity/lenscape/agency-website/contact.js) and the mock timers in [`booking.js`](file:///c:/Users/mike1/Documents/Antigravity/lenscape/agency-website/booking.js) and [`bento-grid.js`](file:///c:/Users/mike1/Documents/Antigravity/lenscape/agency-website/bento-grid.js).
- **Features**:
  - CORS security mapping (only accepts requests from `lenscapecompany.com` and authorized domains).
  - Schema validation for 3 distinct request payloads:
    1. **General Contact Form** (Name, email, subject, message).
    2. **Booking Wizard Inquiry** (Selected dates, client details, pricing tier, total).
    3. **Custom Scope Brief** (Selected design pillars, slider metrics, description).
  - Geo-IP or URL-based regional tagging (`TT` vs `GY`) to assign leads to the correct sales team.

---

### Component B: Cloud Firestore Database Setup
- **Technology**: Firestore (Native Mode) in Google Cloud.
- **Collections Structure**:
  - `leads` (Documents keyed by `lead_id` or auto-UUID):
    ```json
    {
      "lead_id": "LNS-2026-X9A21",
      "market": "TT",
      "form_type": "booking_wizard" | "contact_form" | "project_scoper",
      "created_at": "2026-09-13T22:46:29Z",
      "client_info": {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "phone": "+1-868-555-1234"
      },
      "payload": {
        "selected_date": "2026-10-15",
        "pricing_tier": "Gold",
        "estimated_total": 4500.00,
        "currency": "TTD"
      },
      "status": "new"
    }
    ```

---

### Component C: Automated Google Apps Script & PDF Proposal Engine
To eliminate manual proposal writing, a light-weight Google Apps Script webhook will listen to the Cloud Function:
1. **Calendar Validation**: Cross-checks Google Calendar. If the requested slot is open, adds a temporary **Availability Hold** (marked in yellow).
2. **Template Merging**: Copies a master, beautifully styled Google Slides/Docs proposal template.
3. **Data Replacement**: Injects client details, selected brand filters (from Flow B), and scope metrics (from Flow C) into the template.
4. **PDF Generation**: Exports the merged document as a PDF to Google Drive under `/Leads/Proposals/`.
5. **Auto-Dispatch**: Sends a personalized email via Gmail API to the client with the PDF proposal attached, carbon-copying `info@lenscapecompany.com` or `guyana@eventlabs.agency`.
6. **Turnaround Time**: Under **3 minutes** from click to inbox.

---

## 3. Implementation Steps & Workflow

### Step 1: Provision Cloud Firestore & IAM Service Accounts
- Initialize Firestore Database in region `nam5` (multi-region US) or `us-east1` in GCP project `lenscape-company`.
- Create an IAM Service Account `lenscape-lead-ingester` with role `roles/datastore.user` to allow the Cloud Function to write directly to Firestore.

### Step 2: Develop & Deploy Google Cloud Function (`/v1/lead`)
- Create code workspace under `server/functions/lead-ingestion/`.
- Code standard Node.js handler using `@google-cloud/firestore`.
- Deploy using gcloud:
  ```bash
  gcloud functions deploy ingestLead \
      --gen2 \
      --runtime=nodejs20 \
      --region=us-east1 \
      --trigger-http \
      --allow-unauthenticated \
      --project=lenscape-company
  ```

### Step 3: Connect Frontend Form Scripts
- Update [`contact.js`](file:///c:/Users/mike1/Documents/Antigravity/lenscape/agency-website/contact.js), [`booking.js`](file:///c:/Users/mike1/Documents/Antigravity/lenscape/agency-website/booking.js), and [`bento-grid.js`](file:///c:/Users/mike1/Documents/Antigravity/lenscape/agency-website/bento-grid.js):
  - Replace raw stubs with dynamic `fetch('https://us-east1-lenscape-company.cloudfunctions.net/ingestLead', { method: 'POST', ... })`.
  - Wire up loading states and error boundaries.

### Step 4: Configure Apps Script Webhook
- Mount Apps Script on the Google Workspace Master Template.
- Publish as a Web App with `Execute as: Me` and `Who has access: Anyone` (secured via private authentication token shared with the Cloud Function).
- Script will listen for the JSON body, generate Slide decks, export PDFs, and create Calendar blocks.

---

## 4. Verification & QA Plan

### Automated Tests
- Script a local test harness (`tests/post-lead-test.js`) to simulate booking payloads, scoper metrics, and contact form submissions directly against the Cloud Function.
- Verify Firestore collection creates records cleanly.

### Manual Verification
- Perform a live mock booking in the frontend wizard.
- Verify receipt of the auto-generated PDF proposal email in under 3 minutes.
- Verify Google Calendar contains the slot reservation.
