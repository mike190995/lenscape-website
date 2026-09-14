# Google Analytics 4 (GA4) & Google Tag Manager (GTM) Setup Guide
**Lenscape Trinidad & Tobago & Event Labs Guyana**  
*Document Ref: DOCS-04-GA4-GTM* | *Last Updated: 2026-09-11*

---

## 1. Executive Summary & Telemetry Architecture

The website uses a hybrid telemetry architecture managed by [`telemetry.js`](file:///c:/Users/mike1/Documents/Antigravity/lenscape/agency-website/telemetry.js). 

```
                                  [ User Interaction ]
                                           │
                                           ▼
                                 [ telemetry.js Core ]
                                           │
                  ┌────────────────────────┴────────────────────────┐
                  ▼                                                 ▼
      [ window.dataLayer.push() ]                         [ window.gtag('event') ]
                  │                                                 │
                  ▼                                                 ▼
     [ Google Tag Manager (GTM) ]                      [ Google Analytics 4 (GA4) ]
   (GTM-LENSCAPETT / GTM-EVENTLABSGY)              (G-LENSCAPE_TT / G-EVENTLABS_GY)
                  │                                                 │
                  ▼                                                 ▼
      [ Conversions / Pixels ]                        [ Real-Time & Funnel Reports ]
```

### Key Architectural Highlights
1. **Dual-Market Isolation**: Automatically attaches `market: 'TT'` or `market: 'GY'`, `currency: 'TTD'` or `currency: 'GYD'`, and local timestamps to every event.
2. **First-Party DataLayer**: Standardized `dataLayer.push` structure fully compatible with Google Tag Manager, Meta Pixel, TikTok Pixel, and server-side tagging.
3. **Automatic Fallback & Zero Crash**: If GA4 or GTM scripts are blocked by ad-blockers or placeholders are left unconfigured, telemetry operations fail silently without interrupting the user experience.

---

## 2. Step-by-Step GA4 Setup & Measurement ID Retrieval

### Step 1.1: Create or Access your Google Analytics Account
1. Open [Google Analytics](https://analytics.google.com/) and sign in with your administrator Google Account (`mike190995@gmail.com`).
2. Click **Admin** (gear icon in the bottom-left corner).
3. Under the **Account** column, select your existing account or click **+ Create Account** (e.g., `The Lenscape Company`).

---

### Step 1.2: Set Up GA4 Properties
You can set up one property with two web data streams, or two dedicated properties (recommended for clean regional financial separation):

#### Property A: Trinidad & Tobago Flagship
- **Property Name**: `Lenscape Trinidad & Tobago`
- **Reporting Time Zone**: `Trinidad & Tobago (GMT-4)`
- **Currency**: `Trinidad & Tobago Dollar (TTD $)` (or `US Dollar (USD $)` depending on bookkeeping)
- Click **Next**, fill industry category (*Arts & Entertainment* or *Business Services*), and click **Create**.

#### Property B: Event Labs Guyana
- **Property Name**: `Event Labs Guyana`
- **Reporting Time Zone**: `Guyana (GMT-4)`
- **Currency**: `Guyana Dollar (GYD)`
- Click **Next** and click **Create**.

---

### Step 1.3: Retrieve the GA4 Measurement IDs (`G-XXXXXXXXXX`)
1. In the property view, navigate to **Data Streams** (under *Data display* or *Data collection*).
2. Click **Web**.
3. Enter your website details:
   - **Website URL**: `https://lenscapecompany.com`
   - **Stream Name**: `Lenscape Web TT`
4. Click **Create stream**.
5. In the **Web stream details** pane, locate the **Measurement ID** in the top right:
   ```text
   MEASUREMENT ID: G-XXXXXXXXXX
   ```
   *(e.g., `G-9K3827XYZ1`)*
6. Repeat for the Guyana data stream / property:
   - **Website URL**: `https://lenscapecompany.com/eventlabs`
   - **Stream Name**: `Event Labs Guyana Web`
   - Copy the second **Measurement ID** (`G-YYYYYYYYYY`).

---

## 3. Step-by-Step Google Tag Manager (GTM) Setup

### Step 2.1: Create GTM Containers
1. Open [Google Tag Manager](https://tagmanager.google.com/).
2. Click **Create Account**:
   - **Account Name**: `The Lenscape Company`
   - **Country**: Trinidad and Tobago (or Guyana)
3. Container Setup:
   - **Container Name**: `Lenscape TT Web`
   - **Target Platform**: `Web`
   - Click **Create**.
4. Repeat for Guyana:
   - **Container Name**: `Event Labs GY Web`
   - **Target Platform**: `Web`

### Step 2.2: Retrieve GTM Container IDs (`GTM-XXXXXXX`)
1. In your GTM workspace, locate your Container ID in the top navigation bar next to "Default Workspace":
   ```text
   GTM-XXXXXXX
   ```
   *(e.g., `GTM-N84KZ9P`)*
2. Note both container IDs:
   - Trinidad Container: `GTM-XXXXXXX`
   - Guyana Container: `GTM-YYYYYYY`

---

## 4. Activating IDs in the Codebase

The platform provides two seamless ways to inject your live IDs. **Choose either Option A or Option B**:

### Option A: Environment Variables (Recommended for CI/CD & Cloud Run)
Edit [`.env.production`](file:///c:/Users/mike1/Documents/Antigravity/lenscape/agency-website/.env.production) (or provide environment variables during build):

```env
# Google Cloud Storage Media CDN
VITE_MEDIA_CDN_URL=https://storage.googleapis.com/lenscape-media-cdn

# Live GA4 Measurement IDs
VITE_GA4_TT_ID=G-XXXXXXXXXX
VITE_GA4_GY_ID=G-YYYYYYYYYY

# Live GTM Container IDs
VITE_GTM_TT_ID=GTM-XXXXXXX
VITE_GTM_GY_ID=GTM-YYYYYYY
```

Rebuild the application:
```bash
npm run build
```

---

### Option B: Direct HTML Head Configuration
If editing without a build server, replace the placeholders directly inside the `<script>` tag in the `<head>` of each HTML file:

**Trinidad Pages** ([`index.html`](file:///c:/Users/mike1/Documents/Antigravity/lenscape/agency-website/index.html), [`portfolio.html`](file:///c:/Users/mike1/Documents/Antigravity/lenscape/agency-website/portfolio.html), [`motionmagic.html`](file:///c:/Users/mike1/Documents/Antigravity/lenscape/agency-website/motionmagic.html), [`contact.html`](file:///c:/Users/mike1/Documents/Antigravity/lenscape/agency-website/contact.html)):
```html
<script>
  window.dataLayer = window.dataLayer || [];
  window.LENSCAPE_CONFIG = {
    market: 'TT',
    ga4MeasurementId: 'G-XXXXXXXXXX', // <-- Paste real Trinidad GA4 ID
    gtmContainerId: 'GTM-XXXXXXX',     // <-- Paste real Trinidad GTM ID
    mediaCdnUrl: 'https://storage.googleapis.com/lenscape-media-cdn'
  };
</script>
```

**Guyana Pages** ([`eventlabs/index.html`](file:///c:/Users/mike1/Documents/Antigravity/lenscape/agency-website/eventlabs/index.html), [`eventlabs/portfolio.html`](file:///c:/Users/mike1/Documents/Antigravity/lenscape/agency-website/eventlabs/portfolio.html), [`eventlabs/motionmagic.html`](file:///c:/Users/mike1/Documents/Antigravity/lenscape/agency-website/eventlabs/motionmagic.html), [`eventlabs/contact.html`](file:///c:/Users/mike1/Documents/Antigravity/lenscape/agency-website/eventlabs/contact.html)):
```html
<script>
  window.dataLayer = window.dataLayer || [];
  window.LENSCAPE_CONFIG = {
    market: 'GY',
    ga4MeasurementId: 'G-YYYYYYYYYY', // <-- Paste real Guyana GA4 ID
    gtmContainerId: 'GTM-YYYYYYY',     // <-- Paste real Guyana GTM ID
    mediaCdnUrl: 'https://storage.googleapis.com/lenscape-media-cdn'
  };
</script>
```

---

## 5. Event Catalog & GA4 Custom Definitions

When events are fired by the application, GA4 receives parameters that must be registered in the GA4 Admin console to appear in custom reports and explorations.

### Step 5.1: Event Specification Table

| Event Name | Trigger Context | Custom Parameters Dispatched |
| :--- | :--- | :--- |
| `page_view` | Initial page load & route transitions | `page_title`, `market`, `currency`, `path` |
| `bento_card_click` | Bento Grid card clicks (Cards 1–5) | `card_id`, `card_title`, `conversion_flow`, `market` |
| `showreel_engagement` | Hero video play/pause or service switcher | `media_label`, `media_src`, `service`, `market` |
| `booking_funnel_step`| Transitioning between Booking Wizard steps | `step_number`, `step_name`, `market` |
| `booking_submitted`  | Booking inquiry submission (AppSheet sync) | `status`, `event_name`, `tier`, `estimated_total`, `booking_id`, `market` |
| `scoper_interaction` | Custom Scope Drawer open, toggle, or submit | `action`, `brief_id`, `market` |
| `contact_form_submit`| General Contact form submission | `status`, `subject`, `market` |
| `direct_channel_click`| Clicks on Phone, WhatsApp, Maps | `channel`, `target`, `market` |
| `portfolio_item_view`| Lightbox photo album or video modal opened | `project_id`, `project_title`, `project_category`, `view_type`, `market` |

---

### Step 5.2: Registering Custom Dimensions in GA4
In GA4 Admin $\to$ **Custom definitions** $\to$ **Custom dimensions** $\to$ **Create custom dimension**:

| Dimension Name | Scope | Description | Event Parameter |
| :--- | :--- | :--- | :--- |
| `Market` | Event | Regional Caribbean Market (`TT` or `GY`) | `market` |
| `Conversion Flow` | Event | Bento Flow (`Flow A`, `Flow B`, `Flow C`) | `conversion_flow` |
| `Card ID` | Event | Bento grid card identifier (`card_1` to `card_5`) | `card_id` |
| `Service Category`| Event | Category of selected work or showreel | `service` |
| `Funnel Step` | Event | Step number in booking wizard (1, 2, 3) | `step_number` |
| `Booking ID` | Event | Unique client booking tracking code | `booking_id` |
| `Pricing Tier` | Event | Selected package (`Silver`, `Gold`, `Platinum`) | `tier` |
| `Direct Channel` | Event | Direct communication channel (`whatsapp`, `phone`) | `channel` |
| `View Type` | Event | Media viewing container (`modal`, `lightbox`) | `view_type` |

### Step 5.3: Registering Custom Metrics in GA4
In GA4 Admin $\to$ **Custom definitions** $\to$ **Custom metrics** $\to$ **Create custom metric**:
- **Metric Name**: `Estimated Total Value`
- **Scope**: `Event`
- **Description**: Total estimated booking value submitted by client
- **Event parameter**: `estimated_total`
- **Unit of measurement**: `Currency`

---

## 6. Testing & Verifying Your Setup

### 1. Browser Console Verification (Immediate)
1. Open Chrome DevTools (`F12`) on the website.
2. Select the **Console** tab.
3. In local development or staging, observe tagged events outputting in real-time:
   ```text
   [TELEMETRY // TT] [G-LENSCAPE_TT] page_view {event: 'page_view', market: 'TT', ...}
   [TELEMETRY // TT] [G-LENSCAPE_TT] bento_card_click {card_id: 'card_1', ...}
   ```
4. Verify `window.dataLayer`:
   ```javascript
   console.table(window.dataLayer);
   ```

### 2. GA4 DebugView Verification
1. Install the official **Google Analytics Debugger** Chrome extension.
2. Turn the extension ON.
3. In Google Analytics, navigate to **Admin** $\to$ **DebugView** (under *Data display*).
4. Browse the website, click Bento cards, and open booking modals.
5. Watch events arrive in real-time within the 60-second activity stream.

### 3. GTM Preview Mode
1. In Google Tag Manager, click **Preview** in the top right.
2. Enter `https://lenscapecompany.com/` (or your local development server `http://localhost:5173`).
3. Click **Connect**. Tag Assistant will open in a new window.
4. Verify that tags fire on triggers corresponding to `bento_card_click`, `booking_funnel_step`, and `booking_submitted`.

---

## 7. Media CDN & Storage Bucket Usage

The Google Cloud Storage bucket has been provisioned:
- **Bucket URL**: `gs://lenscape-media-cdn`
- **Public HTTP Base**: `https://storage.googleapis.com/lenscape-media-cdn/`
- **Location**: `us-east1` (low latency Caribbean interconnect)
- **CORS Configuration**: Enabled for `GET`, `HEAD`, `Range` requests across `lenscapecompany.com` and local servers.

### Syncing Media to GCS:
To upload local video reels and portfolio albums to Cloud Storage:
```powershell
.\scripts\sync-media-to-gcs.ps1 -BucketName "lenscape-media-cdn"
```
Or with Bash:
```bash
gcloud storage rsync -r public/Portfolio/ gs://lenscape-media-cdn/Portfolio/ --cache-control="public, max-age=31536000, immutable"
```

Once uploaded, `media-config.js` automatically prepends the CDN base to all video and image assets while preserving instant local development fallbacks.
