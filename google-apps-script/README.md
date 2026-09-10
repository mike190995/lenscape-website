# Lenscape Dual-Sync (Google Sheets + Google Calendar) Setup Guide

This guide connects your Lenscape website's booking system (both the booking page and modal popup) directly to your **Google Sheet** and **Google Calendar** so every booking is saved in both places automatically.

---

## Step 1: Create your Google Sheet
1. Go to [Google Sheets](https://sheets.google.com) and create a **Blank spreadsheet**.
2. Name it something like **Lenscape Bookings 2026**.
3. Name the first tab at the bottom **Bookings**. (The script will automatically format and create the header columns for you on first submission).

---

## Step 2: Open the Apps Script Editor
1. In your Google Sheet, click the top menu: **Extensions** → **Apps Script**.
2. Rename the project at the top from *Untitled project* to **Lenscape Booking Sync**.
3. Select everything in the editor (`Code.gs`) and delete it.
4. Copy the entire contents of [`lenscape-booking-sync.gs`](./lenscape-booking-sync.gs) and paste it into the editor.
5. Click the **Save** icon (disk icon or `Ctrl + S`).

---

## Step 3: Test and Authorize Permissions
1. At the top of the Apps Script editor, in the function dropdown (next to "Debug"), choose **`doGet`**.
2. Click **Run**.
3. An **"Authorization required"** dialog will appear. Click **Review permissions**.
4. Choose your Google account.
5. You will see a standard Google warning: *"Google hasn't verified this app"*.
   - Click **Advanced** (bottom left of modal).
   - Click **Go to Lenscape Booking Sync (unsafe)**.
6. Click **Allow** to give the script access to Google Sheets and Google Calendar.
7. You should see "Execution completed" in the execution log at the bottom.

---

## Step 4: Deploy as a Web App
1. At the top right of the Apps Script editor, click the blue **Deploy** button → select **New deployment**.
2. Next to *Select type*, click the gear icon (⚙) and choose **Web app**.
3. Enter the configuration:
   - **Description**: `Lenscape Dual Sync v1`
   - **Execute as**: `Me (your email address)`
   - **Who has access**: `Anyone` *(Crucial: allows the website form to submit without requiring clients to log into Google)*
4. Click **Deploy**.
5. Copy the generated **Web App URL** (it will look like `https://script.google.com/macros/s/AKfycb.../exec`).

---

## Step 5: Update the Website Configuration
1. Open [`booking-logic.js`](../booking-logic.js).
2. Locate `BOOKING_CONFIG` at the top:
   ```javascript
   export const BOOKING_CONFIG = {
     SHEETS_ENDPOINT: 'PASTE_YOUR_COPIED_WEB_APP_URL_HERE',
     ...
   };
   ```
3. Save the file and run `npm run build`.

---

## What Happens When a Booking is Submitted:
1. **Google Sheet**: A new row is appended with Timestamp, Client Name, Email, Phone, Event Name, Date, Time Slot, Location, Service Tier, Add-ons, Price, Notes, and Calendar Event Link.
2. **Google Calendar**: An event titled `[LENSCAPE] Event Name — Client Name (Tier)` is placed directly on your calendar with full event specs in the description, location set, and automatic 24-hour and 2-hour reminders.
3. **Redundancy**: The Calendar Event ID and URL are stored right in the Google Sheet row so you can jump directly from the sheet into the calendar event.
4. **Availability Sync**: Booked dates are fetched automatically to disable or indicate taken slots on the website calendar.
