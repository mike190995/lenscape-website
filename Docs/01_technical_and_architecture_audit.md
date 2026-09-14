# Technical & Architecture Baseline Audit

**Project:** The Lenscape Company Ltd. & Event Labs Guyana  
**Subject URL:** `lenscapecompany.com` / `lenscapecompany.com/eventlabs/`  
**Audit Standard:** Google-Native / Zero-SaaS Cloud Architecture Baseline  
**Document Code:** `AUDIT-TECH-01`  
**Status:** Complete Baseline Extraction  

---

## 1. Source Repository & Codebase Audit

### 1.1 Repository Structure & Directory Map

The website repository is structured as a multi-page Vite application designed for containerized deployment to Google Cloud Run. The project encompasses both the primary brand (**The Lenscape Company Ltd.** in Trinidad & Tobago) and its regional operational subsidiary (**Event Labs Guyana**).

```
agency-website/
├── .dockerignore                            # Excludes node_modules, dist, git, raw archives from container
├── .gcloudignore                             # Google Cloud SDK deployment ignore list
├── .gitignore                               # Git version control exclusions
├── Dockerfile                               # Multi-stage Docker container build (Node 20 -> Nginx Alpine)
├── package.json                             # Dependency registry & build scripts
├── package-lock.json                        # Deterministic dependency lockfile
├── vite.config.js                           # Vite multi-page Rollup configuration (8 entry points)
├── style.css                                # Global design system (4,903 lines) - Lenscape TT
├── eventlabs.css                            # Regional stylesheet override (600 lines) - Event Labs GY
│
├── [Page Entrypoints - Trinidad & Tobago]
├── index.html                               # Homepage with Hero, Bento Grid, Portfolio Anchor, Overlays
├── portfolio.html                           # Comprehensive Portfolio Showcase (36 projects)
├── motionmagic.html                         # MotionMagic Cam 360 & Glambot Landing Page
├── contact.html                             # Direct Client Contact & Inquiries Page
│
├── [Page Entrypoints - Event Labs Guyana]
├── eventlabs/
│   ├── index.html                           # Regional Homepage with Guyana styling & currency defaults
│   ├── portfolio.html                       # Guyana & Caribbean Portfolio View
│   ├── motionmagic.html                     # Guyana MotionMagic Cam Showcase
│   ├── contact.html                         # Guyana Direct Contact & WhatsApp Portal
│   └── main.js                              # Guyana Homepage Controller (Cyan/Lime Canvas, Lenis, Bento)
│
├── [Core Frontend Runtime Scripts]
├── main.js                                  # Homepage Controller (Hero canvas, GSAP reveals, Lenis)
├── bento-grid.js                            # Bento Grid controller (Cards 1-5, Flow A, B, C interactions)
├── booking.js                               # 2-Step Interactive Booking Modal Wizard
├── booking-logic.js                         # Booking validation, pricing algorithms, Google Apps Script sync
├── contact.js                               # Contact form validation & submission handler
├── mobile-nav.js                            # Cyberpunk responsive mobile navigation drawer controller
├── motionmagic.js                           # Scroll-driven canvas sequence (177 frames) & booth viewer
├── portfolio.js                             # Isotope-style filtering, lightbox modals, deep-linking
├── portfolio-data.js                        # Master data registry (36 projects, 1,630 lines)
│
├── [Backend & Integration Assets]
├── google-apps-script/
│   ├── README.md                            # Setup guide for Dual-Sync Sheets & Calendar Web App
│   └── lenscape-booking-sync.gs             # Google Apps Script Web App (doPost/doGet sync engine)
│
├── [Build & Asset Optimization Pipelines]
├── scripts/
│   ├── build-portfolio-data.cjs             # Automated builder generating portfolio-data.js from public/
│   ├── build-webp-pipeline.cjs              # Sharp + FFmpeg pipeline extracting video posters & WebP
│   ├── optimize-media.cjs                   # Sharp media compression & unused video archiving
│   ├── inspect-images.cjs                   # PNG dimensional header inspector
│   └── update-data.cjs                      # Data update trigger script
│
├── [Static Assets Directory]
├── public/                                  # 854 static files (423.31 MB)
│   ├── Company Logo/                        # Vector PNG brand logos (TT and Guyana variations)
│   ├── brand pattern/                       # High-contrast geometric textures & overlays
│   ├── booths/                              # Equipment renders (Roamer, 360, Print, Glambot)
│   ├── hero/                                # 177 PNG frames for scroll canvas sequence (127.26 MB)
│   └── Portfolio/
│       ├── Our Work/                        # High-resolution original photography, ads, videos
│       └── thumbnails/                      # Optimized WebP thumbnails and video poster frames
│
└── [Archived Raw Media]
    └── raw-media-archive/                   # 8 unreferenced video files (173.79 MB)
        └── unused_videos/
```

### 1.2 Runtime & Build Pipeline Configuration

#### `package.json` Audit
- **Engine / Architecture:** Pure ECMAScript Modules (`"type": "module"`).
- **Runtime Dependencies:**
  - `@studio-freight/lenis` (`^1.0.42`): Inertial smooth-scrolling engine for desktop browsers. `[KEEP]`
  - `gsap` (`^3.14.2`): GreenSock Animation Platform with `ScrollTrigger` plugin for micro-animations and entrance choreography. `[KEEP]`
- **Development & Asset Processing Dependencies:**
  - `vite` (`^7.3.1`): Next-generation ES module bundler. `[KEEP]`
  - `sharp` (`^0.35.4`): High-performance libvips image processing pipeline. `[KEEP]`
  - `ffmpeg-static` (`^5.3.0`): Standalone binary for video frame extraction and transcoding. `[KEEP]`

#### Multi-Page Rollup Input Matrix (`vite.config.js`)
Vite bundles 8 discrete HTML entry points into static HTML/CSS/JS artifacts under `dist/`:

| Entry Key | Target File Path | Territory | Primary Architectural Purpose |
| :--- | :--- | :--- | :--- |
| `main` | `/index.html` | Trinidad & Tobago | Master agency landing page with Bento Grid & Overlays |
| `portfolio` | `/portfolio.html` | Trinidad & Tobago | Dynamic 36 projects portfolio gallery with category filters |
| `motionmagic` | `/motionmagic.html` | Trinidad & Tobago | 360 & Glambot experiential product landing page |
| `contact` | `/contact.html` | Trinidad & Tobago | General and corporate inquiry page |
| `eventlabs` | `/eventlabs/index.html` | Guyana | Regional subsidiary homepage with custom palette & GYD pricing |
| `eventlabs_portfolio` | `/eventlabs/portfolio.html` | Guyana | Regional project highlights and cross-border commercial work |
| `eventlabs_motionmagic` | `/eventlabs/motionmagic.html` | Guyana | Guyana experiential activations landing page |
| `eventlabs_contact` | `/eventlabs/contact.html` | Guyana | Georgetown local direct contact and booking portal |

---

## 2. Media & Asset Inventory

### 2.1 Storage Footprint Summary

The repository currently stores **906 tracked assets** totaling **578.10 MB** (excluding `node_modules` and `.git`).

```
+---------------------------------------------------------------------------------+
| TOTAL REPOSITORY MEDIA FOOTPRINT: 578.10 MB                                     |
+--------------------------------------+--------------+----------------+----------+
| Asset Category                       | File Count   | Storage Volume | Status   |
+--------------------------------------+--------------+----------------+----------+
| 1. Active Video Assets (.mp4)        | 17 files     | 126.38 MB      | REPLACE  |
| 2. Raw Archive Video Assets (.mp4)   | 8 files      | 173.79 MB      | REPLACE  |
| 3. MotionMagic Hero PNG Sequence     | 177 files    | 127.26 MB      | REPLACE  |
| 4. Portfolio Original Photography    | 177 files    | 71.33 MB       | OPTIMIZE |
| 5. Processed WebP Thumbnails         | 437 files    | 45.08 MB       | KEEP     |
| 6. Commercial Ads & Graphic Media    | 15 files     | 31.60 MB       | OPTIMIZE |
| 7. Event Labs Portfolio Media        | 5 files      | 1.42 MB        | OPTIMIZE |
| 8. Brand Logos & Vector Assets       | 11 files     | 0.16 MB        | KEEP     |
| 9. Booth Suite Renders & UI Graphics | 13 files     | 0.33 MB        | KEEP     |
| 10. Brand Background Textures        | 2 files      | 0.82 MB        | KEEP     |
+--------------------------------------+--------------+----------------+----------+
```

### 2.2 Active Production Video Assets Inventory (`public/`)

All 17 production videos are currently served as static monolithic `.mp4` files directly through Nginx/Vite without range request streaming optimization or adaptive bitrate delivery.

| File Name / Relative Path | Size (MB) | Current Usage in Codebase | Remediation Flag | Target Remediation Path |
| :--- | :---: | :--- | :---: | :--- |
| `Videos/Tailgate_Mardi Gras.mp4` | **32.75 MB** | Portfolio Project Video (`tailgate-mardi-gras`) | `[REPLACE]` | Upload to GCS Bucket; Transcode to HLS (`.m3u8`) via GCP Transcoder API. |
| `Videos/360 videos/001be6de-ed6e...mp4` | **12.51 MB** | Portfolio 360 Video Project (`360-brand-activation-1`) | `[REPLACE]` | HLS Stream on Cloud Storage CDN. |
| `Videos/Bmobile Emerald City.mp4` | **11.55 MB** | Portfolio Commercial Video (`bmobile-emerald-city`) | `[REPLACE]` | HLS Stream on Cloud Storage CDN. |
| `Videos/360 videos/video_1720055785.mp4` | **10.90 MB** | Portfolio 360 Video Project (`360-brand-activation-2`) | `[REPLACE]` | HLS Stream on Cloud Storage CDN. |
| `Videos/BK MOTHER_S DAY OFFER...mp4` | **9.77 MB** | Commercial Motion Ad Project (`bk-mothers-day`) | `[REPLACE]` | HLS Stream on Cloud Storage CDN. |
| `Videos/RBL_CPL.mp4` | **8.30 MB** | Commercial Sports Broadcast (`rbl-cpl-campaign`) | `[REPLACE]` | HLS Stream on Cloud Storage CDN. |
| `Videos/Burger King Maraval Motion Ad.mp4` | **7.10 MB** | Commercial Digital OOH Project (`bk-maraval`) | `[REPLACE]` | HLS Stream on Cloud Storage CDN. |
| `Videos/MMC videos/Ex 5.mp4` | **5.66 MB** | MotionMagic Video Project (`glambot-showcase-5`) | `[REPLACE]` | HLS Stream on Cloud Storage CDN. |
| `Videos/Burger King - Steakhouse...mp4` | **5.28 MB** | Commercial Social Story Project (`bk-steakhouse`) | `[REPLACE]` | HLS Stream on Cloud Storage CDN. |
| `Videos/MMC videos/Ex_1.mp4` | **4.38 MB** | Bento Card 2 Background Video & Flow A Showcase | `[REPLACE]` | 720p HLS loop stream / WebM fallback. |
| `Videos/KES Iz We Promotion_REELS.mp4` | **3.94 MB** | Event Promotion Reel Project (`kes-iz-we`) | `[REPLACE]` | HLS Stream on Cloud Storage CDN. |
| `Videos/BK - Thi_King Sandwich Vertical.mp4` | **3.90 MB** | Vertical Commercial Project (`bk-thi-king-vertical`) | `[REPLACE]` | HLS Stream on Cloud Storage CDN. |
| `Videos/BK - Thi_King Sandwich - Horiz...mp4` | **3.78 MB** | Bento Card 1 Background Video & Flow A Hero | `[REPLACE]` | 720p HLS loop stream / WebM fallback. |
| `Videos/MMC videos/Ex_2.mp4` | **3.45 MB** | MotionMagic Video Project (`glambot-showcase-2`) | `[REPLACE]` | HLS Stream on Cloud Storage CDN. |
| `Videos/Digicel Back to School.mp4` | **1.65 MB** | Commercial Campaign Project (`digicel-back-to-school`) | `[REPLACE]` | HLS Stream on Cloud Storage CDN. |
| `Videos/iCATT_2.mp4` | **0.81 MB** | Corporate Event Reel Project (`icatt-conference`) | `[REPLACE]` | HLS Stream on Cloud Storage CDN. |
| `Event labs portfolio/WhatsApp Video...mp4` | **0.68 MB** | Guyana Event Activation Reel | `[REPLACE]` | HLS Stream on Cloud Storage CDN. |

### 2.3 Hero Glambot Image Sequence Bottleneck (`public/hero/`)

The `motionmagic.html` page executes a canvas-based frame-scrubbing animation controlled by `motionmagic.js`:
- **Asset Set:** 177 discrete files (`lenscape glambot_..._sample_1000.png` through `sample_1176.png`).
- **File Format:** High-resolution uncompressed `.png`.
- **Total Payload:** **127.26 MB**.
- **Delivery Mechanism:** Preloaded simultaneously via `preloadImages()` in `motionmagic.js` on initial page load:
  ```javascript
  const frameCount = 177;
  const currentFrame = index => `/hero/lenscape glambot_..._sample_${(1000 + index)}.png`;
  ```
- **Performance Impact:** On typical Caribbean mobile networks (Digicel/bmobile 4G LTE with real-world speeds of 10–25 Mbps), downloading 127 MB takes between **40 to 100 seconds**, locking the page loader and causing extreme data drain for mobile users.
- **Remediation (`[REPLACE]`):**
  1. Replace the 177 individual PNG frames with a single compressed H.265/H.264 video scrubbed via HTML5 `<video>` using canvas timeupdate or GSAP ScrollTrigger timeline.
  2. Fallback: Convert frames to WebP with 80% lossy compression and resize to 960px width, reducing payload from 127 MB to under **6.5 MB** (95% bandwidth reduction).

### 2.4 Archived Unused Video Assets (`raw-media-archive/`)

The `raw-media-archive/unused_videos/` folder stores 8 high-bitrate video clips totaling **173.79 MB** that were disconnected during previous optimization passes:
- `360 videos/01e188af-714f-4f2e-817a-f45fe856ca2b.mp4` (24.92 MB)
- `360 videos/0fa6927a-733b-4eaf-9a12-edce96863d38.mp4` (24.86 MB)
- `360 videos/2e20988e-7df2-4163-b8af-967ba855d931.mp4` (24.80 MB)
- `360 videos/fc546627-d89e-45a8-855d-874bdc9e3b0d.mp4` (24.66 MB)
- `360 videos/video_1720057025.mp4` (24.09 MB)
- `360 videos/video_1720061201.mp4` (24.08 MB)
- `MMC videos/Ex 6.mp4` (24.48 MB)
- `MMC videos/Ex_3.MP4` (1.90 MB)

**Remediation (`[REPLACE]`):** These files must not be packaged inside the Docker container image. They should be moved to a private Google Cloud Storage cold archive bucket (`gs://lenscape-raw-archive/`).

---

## 3. Hosting, Containerization & Network Configuration

### 3.1 Dockerfile Architecture & Container Specification

The website is packaged using a multi-stage Docker build optimized for stateless cloud container runtimes:

```dockerfile
# Stage 1: Build
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:stable-alpine as production-stage
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build-stage /app/dist /usr/share/nginx/html
RUN printf "server {\n\
    listen 8080;\n\
    server_name localhost;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html index.htm;\n\
        try_files \$uri \$uri/ /index.html;\n\
    }\n\
    error_page 500 502 503 504 /50x.html;\n\
    location = /50x.html {\n\
        root /usr/share/nginx/html;\n\
    }\n\
}\n" > /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

#### Evaluation of Container Setup:
1. **Cloud Run Port Compatibility:** Nginx binds to port `8080`, conforming to Google Cloud Run's default `PORT` environment contract. `[KEEP]`
2. **SPA Routing vs Multi-Page Setup:** The Nginx directive `try_files $uri $uri/ /index.html;` directs unmatched paths to `/index.html`. While suitable for single-page apps, for this multi-page setup (`/eventlabs/`, `/portfolio.html`), 404 errors on missing sub-assets silently fallback to `/index.html`, which can mask broken asset links. `[OPTIMIZE]`
3. **Absence of Cache-Control & Compression:** Nginx default configuration lacks Gzip/Brotli compression and long-lived HTTP caching headers (`Cache-Control: public, max-age=31536000, immutable`) for WebP and CSS/JS assets. `[OPTIMIZE]`
4. **Image Bloat in Container:** Because `public/` is copied in whole, the resulting Docker image exceeds **750 MB**, leading to slow cold-start container spin-up times on Cloud Run. Offloading videos and raw archives will shrink the image to under **80 MB**. `[REPLACE]`

### 3.2 Network & Edge Infrastructure Analysis

| Infrastructure Component | Current State | Target State (Google-Native Roadmap) |
| :--- | :--- | :--- |
| **Hosting Platform** | Local Docker / Unmanaged Host | Google Cloud Run (`us-east4` or `us-east1`) |
| **Domain Registrar / DNS** | `lenscapecompany.com` (External DNS) | Cloud DNS with DNSSEC and global Anycast routing |
| **SSL / TLS Certificate** | Server-level certificate | Google-managed auto-renewing SSL certificate via Cloud Run domain mapping |
| **CDN / Caching Layer** | Direct Nginx static serving | Cloud CDN backed by Cloud Storage and Cloud Run backend service |
| **Caribbean Network Latency** | Direct origin requests (~180–320ms TTFB) | Cloud CDN edge points in Miami (`MIA`) with sub-60ms asset latency |
| **Proxy & Firewall Rules** | None (Direct open port) | Google Cloud Armor for DDoS mitigation and WAF security |

---

## 4. Remediation Action Matrix (Technical & Architecture)

| Component | Current Metric / State | Target Remediation | Action Flag |
| :--- | :--- | :--- | :---: |
| **Hero Frame Sequence** | 177 PNGs (127.26 MB) | Transcode into scrubbed video or WebP frame sequence (<6.5 MB) | `[REPLACE]` |
| **Production Videos** | 17 MP4 files (126.38 MB) | Offload to Cloud Storage (`gs://lenscape-video-cdn/`) + GCP Transcoder HLS | `[REPLACE]` |
| **Unused Video Archive** | 8 MP4 files (173.79 MB) | Remove from build context; move to cold storage bucket | `[REPLACE]` |
| **Docker Build Context** | >750 MB image footprint | Add `.dockerignore` rules for raw media; streamline Nginx config to <80 MB | `[OPTIMIZE]` |
| **Nginx Server Config** | Basic port 8080 listening | Add Gzip/Brotli, correct multi-page fallbacks, and Cache-Control headers | `[OPTIMIZE]` |
| **Vite Multi-Page Config** | 8 entrypoints cleanly configured | Maintain Rollup architecture; verify subpath output mappings | `[KEEP]` |
| **Lenis & GSAP Engine** | Smooth scroll & ScrollTrigger | Maintain high-performance animation stack | `[KEEP]` |
