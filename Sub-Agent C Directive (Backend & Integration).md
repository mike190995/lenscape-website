# **Sub-Agent C Directive: Booking Logic & Spreadsheet Sync**

## **Objective**

Develop the semi-automated booking architecture, handling form validation, complex pricing logic, and the real-time Google Sheets integration.

## **Key Deliverables**

### **1\. Form Validation Logic**

* **Time Constraint:** Write the function to calculate the difference between the user's selected Start Time and End Time. If the duration is \< 2 hours, block submission and return an elegant error message.  
* **Conditional Flagging:** If the "Custom Arm Paths" feature is selected, flag the payload as "Premium/Creative" so the team knows special pricing applies before approving.

### **2\. Google Sheets Integration (The "Pending" Flow)**

* Set up the API connection or webhook payload to push the sanitized form data to a designated Google Spreadsheet.  
* Data must map to specific columns: Timestamp, Status (defaults to "Pending"), Client Name, Event Name, Date, Location, Time Slot, Add-ons, Tier, Notes.

### **3\. The Real-Time Approval Loop**

* Create a webhook endpoint designed to receive updates *from* the Google Sheet.  
* When a Lenscape team member changes the "Status" column to "Approved", the webhook must trigger an update to the website's database/cache.  
* Update the API endpoint that feeds Sub-Agent B's calendar component to mark that specific time slot as "Booked/Unavailable" in real-time.