# **Sub-Agent B Directive: Frontend Development & Booking UI**

## **Objective**

Build out the interactive sections of the landing page and the detailed Booking Modal popup, ensuring a seamless, high-energy user experience.

## **Key Deliverables**

### **1\. Expanded Booth Showcase**

* Update the existing Motion Magic Cam layout to cleanly accommodate additional interactive photo and video booth offerings.  
* Use a grid or masonry layout with hover-to-play video previews for each booth type.

### **2\. The Booking Modal UI**

* Create a sleek popup triggered by "Book Now" buttons.  
* **Step 1: Real-Time Calendar:** Integrate a visual calendar component displaying available dates and time slots (communicating with Sub-Agent C for availability).  
* **Step 2: Data Capture Form:** Must include the following inputs:  
  * Event Name (Text)  
  * Event Location (Text/Dropdown for Trinidad/Tobago)  
  * Date of Event (Date Picker)  
  * Time Slot Start & End (Time Picker \- *Must trigger Sub-Agent C validation for 2hr minimum*)  
  * Music Preference (Text/Dropdown)  
  * Add-ons (Checkboxes: Props, Backdrops)  
  * Use Case/Tier (Radio Buttons: General Event vs. Creative/Custom Use)  
* **Dynamic UI Logic:** If "Creative/Custom Use" is selected, dynamically reveal the premium "Custom Arm Paths" option and display a tooltip explaining the different price point.

### **3\. Hero Section**

* Implement a full-bleed, auto-playing, muted background video component with a high-contrast text overlay and a primary CTA.