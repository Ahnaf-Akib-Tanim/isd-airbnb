# Last Update: March 22, 2026

## Features Implemented
- **Interactive Search Map:** 
  - Replaced static placeholder map with `SearchResultsMap` using Leaflet.
  - Markers now display nightly rates and are clickable.
  - Map automatically fits bounds to show all search results.
- **Listing Details & Reservation Page:**
  - Created `ListingDetailsPage.jsx` at route `/rooms/:userId`.
  - Displays host details, amenities, and image gallery.
  - Implemented Booking Widget with Date Picker, Guest count, and Price Calculation.
  - Added "Pay Part Later" option toggle.
- **Backend Booking Infrastructure:**
  - Initialized `booking-service` with `Booking` model, repository, and controller.
  - Implemented `POST /api/bookings` for reservation creation.
  - Implemented `GET /api/bookings` for admin monitoring.
  - Added `BookingStatus` (PENDING, CONFIRMED) and `PaymentStatus` (PAY_LATER, COMPLETED) enums.
  - **Notification Integration:** Booking service now sends notifications to Admin (on create) and Host/Guest (on confirm).
- **Admin Dashboard:**
  - Created `AdminBookingsPage.jsx` at `/admin/bookings`.
  - Lists all pending bookings with details.
  - "Approve" button triggers backend confirmation and notifications.
- **Payment Flow:**
  - Created `PaymentPage.jsx` at `/payment/:bookingId`.
  - Implemented redirect logic: Pay Later -> Home; Pay Now -> Payment Page.
- **Data Model Updates:**
  - Added `payLaterAllowed` boolean to `User` model to support flexible payment options.

## Pending Tasks / Next Steps
- **Availability Logic:** Implement strict date-overlap validation in `BookingService`.
- **Auth Integration:** Replace hardcoded `current-user-id` with actual logged-in user ID.
