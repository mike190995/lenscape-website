# Services Bento Grid: Interaction Architecture & User Flows

This document details the micro-interactions, responsive grid layout, and conditional user flows for the expanded website bento component. The architecture prioritizes low-friction, single-page transitions to reflect the agency's high-energy and agile operational model.

---

## 1. Grid Structural Layout & Visual Weights

The Bento Grid uses a 4-column responsive grid system. Visual weight corresponds directly to service tiering and conversion value.
---

## 2. Granular Card Interaction Profiles

### Card 1: Content Production (Photography, Video, SPEED Reels)
*   **Visual Weight:** 2x2 (Double Width, Double Height).
*   **Default State:** High-contrast grid item with an ambient, muted video loop playing seamlessly in the card background.
*   **Hover Interaction:** The background video scales smoothly up by 5% over 300ms (`transform: scale(1.05)`). A lens-blur effect shifts rapidly into sharp focus to simulate a camera lens pulling into position.
*   **Click Destination:** Triggers Flow A (The High-Value Client Overlay).

### Card 2: The Booth Suite & Interactive Experiences
*   **Visual Weight:** 1x2 (Standard Width, Double Height).
*   **Default State:** Static clean card featuring structural outlines or high-fidelity renders of the MotionMagic Cam.
*   **Hover Interaction:** Triggers a quick, stylized "Camera Flash" animation—a 150ms opacity flicker (`opacity: 1` to `0.3` to `1`) accompanied by a white gradient overlay to mimic a physical strobe light.
*   **Click Destination:** Triggers Flow A (The High-Value Client Overlay) targeting experiential activations.

### Card 3: Strategic Branding & Design
*   **Visual Weight:** 1x2 (Standard Width, Double Height).
*   **Default State:** Minimalist typographic layout showcasing brand philosophy text against a solid dark color.
*   **Hover Interaction:** An embedded inline SVG stroke-dash animation activates automatically, drawing a clean, continuous vector outline of the corporate logo signature in real-time over 600ms.
*   **Click Destination:** Triggers Flow B (The Explorer Anchor-Scroll).

### Card 4: Digital Solutions & Technical Integration
*   **Visual Weight:** 2x1 (Double Width, Standard Height).
*   **Default State:** Clean layout showing structured dashboard icons and micro-charts indicating performance tracking.
*   **Hover Interaction:** Actives a localized parallax effect. The background performance data charts shift slightly on the Y-axis while a floating browser-frame layer moves on the X-axis, giving the card dimensional depth.
*   **Click Destination:** Triggers Flow C (The Digital Partner Slide-Out).

### Card 5: Custom Interactive Engagement Games
*   **Visual Weight:** 2x1 (Double Width, Standard Height).
*   **Default State:** Playful, grid-patterned visual element highlighting digital engagement mechanics (e.g., Connect 3, Match 2).
*   **Hover Interaction:** Micro-animations engage automatically—individual game puzzle blocks tile or slide smoothly along a tracking vector to indicate immediate interactivity.
*   **Click Destination:** Triggers Flow C (The Digital Partner Slide-Out).

---

## 3. Core User Journeys & Technical Execution

### Flow A: The High-Value Client (Instant Overlay)
Designed for immediate conversion. Eliminates page reloads to maintain momentum.
1.  **Trigger:** User clicks *Card 1* or *Card 2*.
2.  **DOM Action:** JavaScript intercepts the event, preventing a standard page link change. A full-screen container (`div.overlay-container`) injects smoothly into the DOM via a fade-in blur transition (`backdrop-filter: blur(15px); opacity: 1;`).
3.  **Content Delivery:**
    *   **Top Region:** A high-definition, dedicated capability showreel (e.g., `SPEED_Reels.mp4`) autoplays silently with a toggle-mute button overlay.
    *   **Body Copy:** Direct, punchy value propositions highlighting efficiency, zero infrastructure lag, and immediate on-site delivery times.
4.  **Conversion Point:** A fixed button styled as `button.cta-primary-booking` resides in the panel viewport. Clicking this button dynamically renders an integrated Google Calendar Appointment Scheduling iFrame natively within the overlay window, allowing users to pick a time slot in one click.

### Flow B: The Explorer (Dynamic Anchor & Filter)
Designed for deep validation through visual portfolios.
1.  **Trigger:** User clicks *Card 3*.
2.  **DOM Action:** Executes a smooth window scroll animation (`window.scrollTo({ behavior: 'smooth' })`) targeting the ID anchor `#portfolio-showcase`.
3.  **State Change:** Upon reaching the viewport coordinate intersection, an isotope-filtering script instantly triggers.
4.  **Result:** The comprehensive work portfolio layout dynamically transitions, filtering out unrelated assets and highlighting brand identity systems and physical design layouts created for key regional and international partners (e.g., Popeyes, Burger King, Coca-Cola).

### Flow C: The Digital Partner (Slide-Out Solution Panel)
Designed for multi-tier retainer scoping and long-term project briefs.
1.  **Trigger:** User clicks *Card 4* or *Card 5*.
2.  **DOM Action:** A navigation drawer panel (`aside.slide-out-drawer`) slides out laterally from the right-hand browser margin (`transform: translateX(0)`).
3.  **Content Delivery:**
    *   Presents structural checklists and visual diagrams explaining the agency's "Data over Opinions" framework.
    *   Highlights monthly tracking, performance analysis, and algorithmic optimization across digital touchpoints.
4.  **Conversion Point:** Includes an interactive, step-by-step project builder form. Users toggle specific requirements (e.g., Web Development + Monthly Analytics) and fill in brief parameters before completing the action with an immediate data submission event.