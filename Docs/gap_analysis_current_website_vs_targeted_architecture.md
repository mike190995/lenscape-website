# Gap Analysis & Audit Strategy: The Lenscape Company Ltd.

**Target System:** Google-Native / Zero-SaaS Cloud Architecture  
**Subject:** `lenscapecompany.com` Modernization & Migration  
**Document Purpose:** Define current-state baseline artifacts, target capabilities, gap remediation criteria, and audit protocols required to transition from static web components to an automated, high-conversion agency platform.

---

## 1. Executive Baseline & Gap Overview

To achieve the primary strategic objective—scaling corporate event activations, achieving sub-3-minute quote dispatches, and supporting cross-regional growth in Trinidad & Tobago and Guyana—the existing web property must undergo a structured audit and gap analysis.

```
+------------------------------------+       +------------------------------------+
|       CURRENT STATE (AS-IS)        |       |      TARGET STATE (TO-BE)          |
+------------------------------------+       +------------------------------------+
| • Static modal drawers & forms     |  ==>  | • Interactive Firebase scope engine|
| • Local MP4 video serving          |  ==>  | • GCP HLS Video Streaming CDN      |
| • Client-side basic analytics      |  ==>  | • GTM Server-Side + BigQuery Export|
| • Manual proposal follow-up        |  ==>  | • Automated Apps Script + Gmail API|
| • Unstructured lead tracking       |  ==>  | • Google Sheets + AppSheet CRM     |
+------------------------------------+       +------------------------------------+
```

---

## 2. Current State vs. Target Architecture Comparison Matrix

| Domain | Current State (`lenscapecompany.com`) | Target State (Google-Native Roadmap) | Identified Gap & Remediation Path |
| :--- | :--- | :--- | :--- |
| **Media & CDN Infrastructure** | Direct `.mp4` video files served from root server `/Portfolio/Our Work/Videos/`. | GCP Cloud Storage (GCS) + GCP Transcoder API with adaptive HLS (`.m3u8`) streaming. | **High Gap:** Video buffering on Caribbean 3G/4G networks. Needs asset migration and Transcoder API job setup. |
| **Scoping & Proposals** | Static HTML drawers collecting generic booking requests (`sys:stack`). | Interactive pricing calculator backed by Firebase Cloud Functions & Firestore database. | **High Gap:** Manual calculations delay proposal turnaround. Needs dynamic scoping UI and serverless pricing logic. |
| **Backend Automation** | Manual lead intake and follow-up emails. | Google Apps Script webhook engine generating branded Google Docs PDFs and sending auto-dispatches via Gmail API. | **Medium Gap:** Absence of automated proposal engine. Needs Apps Script triggers and template mapping. |
| **Data & Telemetry** | Client-side tracking tags vulnerable to ad blockers and browser privacy restrictions. | GTM Server-Side on GCP Cloud Run streaming raw telemetry to BigQuery & Microsoft Clarity. | **Medium Gap:** Incomplete conversion attribution. Needs containerized GTM deployment on Cloud Run. |
| **Operational CRM** | Unconsolidated inbox leads and manual tracking. | Master Google Sheets database connected to an AppSheet mobile app for producer field teams. | **Low Gap:** Standardized sheet structure and AppSheet layout required for on-site dispatching. |

---

## 3. Required Baseline Extraction Checklist

Before executing code changes, the following current-state artifacts must be audited and documented from the existing website repository:

### A. Technical & Architecture Artifacts *(Audited in [`01_technical_and_architecture_audit.md`](./01_technical_and_architecture_audit.md))*

- [x] **Source Repository Audit:** Map of the project directory (`index.html`, `portfolio.html`, `motionmagic.html`, `contact.html`, `package.json`, and Vite configurations).
- [x] **Media & Asset Inventory:** Spreadsheet auditing all video (`.mp4`), thumbnail (`.webp`), image, and script files—including dimensions, byte sizes, and URL paths.
- [x] **Hosting & Network Configuration:** Records of DNS settings, registrar details, SSL certificates, host servers, and active proxy rules.

### B. Information Architecture (IA) & UX Components *(Audited in [`02_information_architecture_and_ux_audit.md`](./02_information_architecture_and_ux_audit.md))*

- [x] **Sitemap & Subpath Registry:** Document detailing all public routes, sub-folders (`/eventlabs/`), hidden modal triggers, and drawer elements.
- [x] **Interactive Component Registry:** Inventory of UI elements—specifically the **Capabilities Showreel Modal**, **Digital Partner Solution Drawer**, and navigation overlays.
- [x] **Content & Copy Deck:** Centralized text deck containing all current value propositions, headlines, service offerings, and client rosters (Popeyes, BK, VISA, Shell, etc.).

### C. Data Flow & Telemetry Artifacts *(Audited in [`03_data_flow_telemetry_and_seo_audit.md`](./03_data_flow_telemetry_and_seo_audit.md))*

- [x] **Form & Endpoint Inventory:** List of all form fields, input parameters, drop-down menus, and destination email/script endpoints.
- [x] **Analytics & Tag Audit:** Inventory of installed client-side scripts (GA4 measurement IDs, Meta Pixels, GTM container IDs).
- [x] **SEO & Metadata Map:** Export of canonical URLs, meta descriptions, OpenGraph image tags, and structured Schema.org markup.

> **Executive Baseline Summary & Matrix:** See [`00_master_audit_summary_and_remediation_roadmap.md`](./00_master_audit_summary_and_remediation_roadmap.md) for scorecard and remediation roadmap.

---

## 4. Evaluation Criteria & Remediation Framework

During document review and audit extraction, every element of the current site must be assigned one of three remediation flags:

1. **`[KEEP]` — Maintain & Retain:**
   - Visual aesthetic, terminal/cyberpunk branding guidelines (`SYSTEM_INIT // LENSCAPE`).
   - High-performing visual assets (`.webp` thumbnails, vector brand graphics).
   - Core portfolio structure and regional routing (`/eventlabs/`).

2. **`[OPTIMIZE]` — Upgrade Infrastructure:**
   - Convert static `.mp4` showcase reels into HLS streams via GCP Transcoder API.
   - Refactor client-side GTM containers into GCP Cloud Run server-side endpoints.
   - Enhance SEO metadata and regional Schema markup for Trinidad & Tobago and Guyana.

3. **`[REPLACE]` — Re-Architect:**
   - Replace static drawer contact forms with the dynamic Firebase scoping calculator.
   - Replace manual lead handling with automated Google Apps Script PDF proposals.
   - Replace disconnected tracking with unified GA4 + BigQuery + Microsoft Clarity telemetry.

---

## 5. Step-by-Step Action Plan for Audit Execution

```
STEP 1: Repository & Asset Crawl
  │  ├── Export media file list (Videos, Images, Scripts)
  │  └── Log page performance metrics & mobile network load times
  ▼
STEP 2: Data & Form Mapping
  │  ├── Document all input variables from current drawers
  │  └── Map payload structures needed for Google Apps Script & Firestore
  ▼
STEP 3: Gap Consolidation & Task Assignment
  │  ├── Assign [KEEP], [OPTIMIZE], or [REPLACE] flags to all components
  │  └── Populate Phase 1–4 execution tasks in the master project board
  ▼
STEP 4: Infrastructure Provisioning
     ├── Initialize GCP Project, BigQuery Dataset, and Storage Buckets
     └── Configure Google Workspace Apps Script template bindings
```