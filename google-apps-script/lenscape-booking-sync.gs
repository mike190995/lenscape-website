/**
 * =========================================================================
 * LENSCAPE — DUAL SYNC GOOGLE SHEETS & GOOGLE CALENDAR APPS SCRIPT
 * =========================================================================
 * 
 * This script runs inside Google Apps Script (connected to your Google Sheet).
 * Whenever a client books via the Lenscape website (either full booking page
 * or modal overlay), this script automatically:
 * 
 * 1. Appends a structured record into your Google Sheet (Bookings tab).
 * 2. Creates an official event in your Google Calendar with full client/event specs.
 * 3. Links the Calendar Event ID & URL back into the Google Sheet for redundancy.
 * 4. Serves live calendar availability back to the website via GET request.
 */

// =========================================================================
// CONFIGURATION
// =========================================================================
const CONFIG = {
  // Name of the sheet/tab where bookings should be saved
  SHEET_NAME: 'Bookings',

  // Optional: Set a specific Calendar ID (e.g. 'c_xxxx@group.calendar.google.com')
  // If left as null, it uses your primary Google Account calendar.
  CALENDAR_ID: null,

  // Timezone for your bookings (Trinidad & Tobago / Caribbean is UTC-4)
  TIMEZONE: 'America/Port_of_Spain',

  // Color of the calendar event (CalendarApp.EventColor)
  // YELLOW = 5, ORANGE = 6, RED = 11, CYAN = 7
  EVENT_COLOR: CalendarApp.EventColor.YELLOW
};

// =========================================================================
// 1. POST HANDLER — RECEIVES BOOKING SUBMISSION FROM WEBSITE
// =========================================================================
function doPost(e) {
  try {
    let payload = {};

    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (err) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const timestamp = payload.timestamp || new Date().toISOString();
    const clientName = payload.clientName || 'Unnamed Client';
    const email = payload.email || 'N/A';
    const phone = payload.phone || 'N/A';
    const eventName = payload.eventName || 'Client Event';
    const dateStr = payload.date || ''; // "YYYY-MM-DD"
    const location = payload.location || 'Trinidad';
    const timeSlot = payload.timeSlot || (payload.startTime && payload.endTime ? `${payload.startTime} – ${payload.endTime}` : 'TBD');
    const tier = payload.tier || payload.service || 'Standard';
    const addons = payload.addons || 'None';
    const music = payload.music || 'N/A';
    const notes = payload.notes || '';
    const isPremium = payload.isPremium === true || payload.customArmPaths === true;
    const price = payload.price || 'TBD';
    const status = isPremium ? 'Pending — Premium Review' : 'Pending Confirmation';

    // ---------------------------------------------------------------------
    // A. SYNC TO GOOGLE CALENDAR
    // ---------------------------------------------------------------------
    let calResult = { eventId: '', eventUrl: '' };
    try {
      calResult = createCalendarEvent({
        clientName: clientName,
        email: email,
        phone: phone,
        eventName: eventName,
        dateStr: dateStr,
        startTime: payload.startTime,
        endTime: payload.endTime,
        timeSlot: timeSlot,
        location: location,
        tier: tier,
        addons: addons,
        music: music,
        notes: notes,
        isPremium: isPremium
      });
    } catch (calErr) {
      Logger.log('Calendar creation failed: ' + calErr.toString());
      calResult = { eventId: 'ERROR: ' + calErr.message, eventUrl: '' };
    }

    // ---------------------------------------------------------------------
    // B. SYNC TO GOOGLE SHEETS
    // ---------------------------------------------------------------------
    appendBookingToSheet({
      timestamp: timestamp,
      status: status,
      clientName: clientName,
      email: email,
      phone: phone,
      eventName: eventName,
      dateStr: dateStr,
      timeSlot: timeSlot,
      location: location,
      tier: tier,
      addons: addons,
      music: music,
      price: price,
      notes: notes,
      isPremium: isPremium ? 'YES' : 'NO',
      calEventId: calResult.eventId,
      calEventUrl: calResult.eventUrl
    });

    // ---------------------------------------------------------------------
    // C. RETURN SUCCESS RESPONSE
    // ---------------------------------------------------------------------
    const output = {
      success: true,
      message: 'Booking successfully synchronized to Google Sheet and Google Calendar.',
      calendarEventId: calResult.eventId,
      calendarEventUrl: calResult.eventUrl
    };

    return ContentService.createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (globalErr) {
    Logger.log('Global error in doPost: ' + globalErr.toString());
    const errOutput = {
      success: false,
      error: globalErr.toString()
    };
    return ContentService.createTextOutput(JSON.stringify(errOutput))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =========================================================================
// 2. GET HANDLER — SERVES BOOKED DATES TO WEBSITE AVAILABILITY CALENDAR
// =========================================================================
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) {
      sheet = ss.getSheets()[0];
    }

    const data = sheet.getDataRange().getValues();
    const bookedList = [];

    if (data.length > 1) {
      const headers = data[0].map(h => String(h).trim().toLowerCase());
      const dateIdx = headers.indexOf('date');
      const eventIdx = headers.indexOf('event name');
      const timeIdx = headers.indexOf('time slot');
      const tierIdx = headers.indexOf('service / tier');
      const statusIdx = headers.indexOf('status');

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const statusVal = statusIdx !== -1 ? String(row[statusIdx]).toLowerCase() : '';
        
        // Skip cancelled bookings
        if (statusVal.includes('cancel')) continue;

        let rawDate = dateIdx !== -1 ? row[dateIdx] : '';
        let dateFormatted = '';

        if (rawDate instanceof Date) {
          dateFormatted = Utilities.formatDate(rawDate, CONFIG.TIMEZONE, 'yyyy-MM-dd');
        } else if (typeof rawDate === 'string' && rawDate.match(/^\d{4}-\d{2}-\d{2}/)) {
          dateFormatted = rawDate.slice(0, 10);
        }

        if (dateFormatted) {
          bookedList.push({
            date: dateFormatted,
            event: eventIdx !== -1 ? String(row[eventIdx]) : 'Booked',
            time: timeIdx !== -1 ? String(row[timeIdx]) : 'Unavailable',
            booth: tierIdx !== -1 ? String(row[tierIdx]) : 'STANDARD'
          });
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify(bookedList))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('Error in doGet: ' + err.toString());
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =========================================================================
// 3. HELPER: CREATE GOOGLE CALENDAR EVENT
// =========================================================================
function createCalendarEvent(data) {
  const calendar = CONFIG.CALENDAR_ID ? 
    CalendarApp.getCalendarById(CONFIG.CALENDAR_ID) : 
    CalendarApp.getDefaultCalendar();

  if (!calendar) {
    throw new Error('Could not access Google Calendar.');
  }

  const title = `[LENSCAPE] ${data.eventName} — ${data.clientName} (${data.tier})`;

  const description = [
    `══════════════════════════════════════`,
    `LENSCAPE BOOKING REQUEST`,
    `══════════════════════════════════════`,
    `Client Name : ${data.clientName}`,
    `Email       : ${data.email}`,
    `Phone       : ${data.phone}`,
    `Event Name  : ${data.eventName}`,
    `Service     : ${data.tier}`,
    `Location    : ${data.location}`,
    `Time Slot   : ${data.timeSlot}`,
    `Add-ons     : ${data.addons}`,
    `Audio/Custom: ${data.music}`,
    `Notes       : ${data.notes || 'None'}`,
    `Premium Arm : ${data.isPremium ? 'YES (Bespoke Choreography)' : 'Standard'}`,
    `══════════════════════════════════════`
  ].join('\n');

  let event = null;

  // If start & end time provided (e.g. "18:00" and "21:00")
  if (data.dateStr && data.startTime && data.endTime) {
    const startDateTime = parseDateTime(data.dateStr, data.startTime);
    const endDateTime = parseDateTime(data.dateStr, data.endTime);

    event = calendar.createEvent(title, startDateTime, endDateTime, {
      description: description,
      location: data.location
    });
  } else if (data.dateStr) {
    // Fallback to all-day event if times are flexible
    const parts = data.dateStr.split('-');
    const allDayDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    event = calendar.createAllDayEvent(title, allDayDate, {
      description: description,
      location: data.location
    });
  }

  if (!event) {
    throw new Error('Failed to instantiate calendar event.');
  }

  // Set visual tag color
  try {
    event.setColor(CONFIG.EVENT_COLOR);
  } catch (e) {}

  // Set reminders (24 hours and 2 hours before)
  try {
    event.addEmailReminder(1440); // 24 hours
    event.addPopupReminder(120);  // 2 hours
  } catch (e) {}

  const eventId = event.getId();
  const calIdForLink = calendar.getId();
  const eventUrl = `https://calendar.google.com/calendar/r/eventedit/${Utilities.base64Encode(eventId.split('@')[0] + ' ' + calIdForLink)}`;

  return {
    eventId: eventId,
    eventUrl: eventUrl
  };
}

// =========================================================================
// 4. HELPER: APPEND ROW TO GOOGLE SHEETS
// =========================================================================
function appendBookingToSheet(row) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  // If sheet tab doesn't exist, create it
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }

  // Setup headers if empty
  if (sheet.getLastRow() === 0) {
    const headers = [
      'Timestamp',
      'Status',
      'Client Name',
      'Email',
      'Phone',
      'Event Name',
      'Date',
      'Time Slot',
      'Location',
      'Service / Tier',
      'Add-ons',
      'Music / Arm Paths',
      'Estimated Price',
      'Client Notes',
      'Is Premium',
      'Calendar Event ID',
      'Calendar Event Link'
    ];

    sheet.appendRow(headers);

    // Style the header row (Dark cyberpunk styling to match Lenscape aesthetic)
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#0d0d11');
    headerRange.setFontColor('#f2c41a'); // Lenscape Gold
    headerRange.setFontWeight('bold');
    headerRange.setFontFamily('Roboto Mono');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    row.timestamp,
    row.status,
    row.clientName,
    row.email,
    row.phone,
    row.eventName,
    row.dateStr,
    row.timeSlot,
    row.location,
    row.tier,
    row.addons,
    row.music,
    row.price,
    row.notes,
    row.isPremium,
    row.calEventId,
    row.calEventUrl
  ]);

  // Auto-resize columns for readability
  sheet.autoResizeColumns(1, 17);
}

// =========================================================================
// 5. UTILITY: PARSE DATE & TIME
// =========================================================================
function parseDateTime(dateStr, timeStr) {
  const dateParts = dateStr.split('-');
  const timeParts = timeStr.split(':');

  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1;
  const day = parseInt(dateParts[2], 10);

  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);

  return new Date(year, month, day, hours, minutes, 0);
}
