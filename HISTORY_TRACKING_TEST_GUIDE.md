# History Tracking Test Guide

## Overview
This guide provides step-by-step instructions to test the comprehensive booking history and status tracking system.

## What Was Implemented

### Backend Changes (BookingService.java)
History tracking has been integrated into ALL booking status change methods:

1. **createBooking()** - Already had history tracking ✅
2. **processPayment()** - ✅ Added history entry for payment completion
3. **approvePayment()** - ✅ Added history entry for admin payment approval
4. **confirmBooking()** - ✅ Added history entry for admin confirmation
5. **hostConfirmCheckIn()** - Already had history tracking ✅
6. **hostConfirmCheckOut()** - ✅ Added history entry for check-out
7. **cancelBooking()** - ✅ Added history entry with cancellation details
8. **refundBooking()** - ✅ Added history entry for refund processing
9. **issuePayout()** - ✅ Added history entry for payout issuance
10. **updateBookingStatus()** - ✅ Added history entry for status updates

### Frontend Components
- **BookingTimeline.jsx** - Visual timeline component with role-based colors
- **BookingDetailsPage.jsx** - Integrated timeline display

## Test Scenarios

### Scenario 1: Complete Booking Flow (Immediate Payment)
**Expected History Entries:**
1. Booking created (GUEST)
2. Payment completed (GUEST)
3. Payment approved (ADMIN)
4. Booking confirmed (ADMIN)
5. Check-in confirmed (HOST)
6. Check-out confirmed (HOST)
7. Payout issued (ADMIN)

**Steps:**
1. Guest creates booking with immediate payment
2. Guest completes payment
3. Admin approves payment
4. Host confirms check-in on check-in date
5. Host confirms check-out
6. Admin issues payout

### Scenario 2: Pay Later Flow
**Expected History Entries:**
1. Booking created with PAY_LATER (GUEST)
2. Admin confirms booking (ADMIN)
3. Guest pays later (GUEST)
4. Payment approved (ADMIN)
5. Check-in confirmed (HOST)
6. Check-out confirmed (HOST)
7. Payout issued (ADMIN)

**Steps:**
1. Guest creates booking with "Pay Later" option
2. Admin confirms booking
3. Guest pays before check-in
4. Admin approves payment
5. Host confirms check-in
6. Host confirms check-out
7. Admin issues payout

### Scenario 3: Guest Cancellation
**Expected History Entries:**
1. Booking created (GUEST)
2. Payment completed (GUEST)
3. Payment approved (ADMIN)
4. Booking cancelled by GUEST (GUEST)
5. Refund processed (ADMIN)

**Steps:**
1. Guest creates and pays for booking
2. Admin approves payment
3. Guest cancels booking
4. Admin processes refund

### Scenario 4: Host Cancellation
**Expected History Entries:**
1. Booking created (GUEST)
2. Payment completed (GUEST)
3. Payment approved (ADMIN)
4. Booking cancelled by HOST (HOST)
5. Refund processed (ADMIN) - Full refund

**Steps:**
1. Guest creates and pays for booking
2. Admin approves payment
3. Host cancels booking
4. Admin processes full refund

## How to Test

### 1. Start All Services
```bash
docker-compose up -d
```

### 2. Access the Application
- Frontend: http://localhost:3000
- Backend API Gateway: http://localhost:8080

### 3. Create Test Booking
1. Login as a guest
2. Search for properties
3. Create a booking
4. Check booking details page for timeline

### 4. Verify Timeline Display
Navigate to booking details page and verify:
- Timeline shows all history entries
- Each entry displays:
  - Action description
  - Timestamp
  - Status change (old → new)
  - Notes with details
  - Changed by role (color-coded)
  - Payment status
- Current status summary at bottom

### 5. Test Different Flows
Follow each scenario above and verify history entries are created correctly.

## Expected Timeline Appearance

### Visual Elements
- **GUEST actions**: Red color (#FF385C)
- **HOST actions**: Teal color (#00A699)
- **ADMIN actions**: Dark gray (#484848)
- **SYSTEM actions**: Gray (#767676)

### Status Icons
- ⏳ PENDING
- 💳 NOT_PAID_YET
- ✅ CONFIRMED
- 🏨 CHECKED_IN
- 🎉 COMPLETED
- ❌ CANCELLED
- 💸 REFUNDED

## API Endpoints for Testing

### Get Booking with History
```
GET /api/bookings/{bookingId}
```

Response includes `history` array with all entries.

### Example History Entry
```json
{
  "timestamp": "2026-03-25T18:45:00",
  "previousStatus": "PENDING",
  "newStatus": "CONFIRMED",
  "changedBy": "admin123",
  "changedByRole": "ADMIN",
  "action": "Booking confirmed by admin",
  "notes": "Admin approved the booking request",
  "paymentStatus": "COMPLETED"
}
```

## Troubleshooting

### History Not Showing
1. Check if booking has `history` field in database
2. Verify BookingService methods are calling `addHistoryEntry()`
3. Check browser console for errors
4. Verify API response includes history array

### Timeline Not Rendering
1. Check if `BookingTimeline` component is imported
2. Verify `booking.history` is passed as prop
3. Check CSS is loaded correctly
4. Inspect browser console for React errors

### Missing History Entries
1. Verify the specific method was called
2. Check if `addHistoryEntry()` is invoked before `save()`
3. Review backend logs for errors
4. Query database directly to check history array

## Database Verification

### MongoDB Query
```javascript
db.bookings.findOne({ _id: ObjectId("bookingId") })
```

Check the `history` array contains entries with:
- timestamp
- previousStatus
- newStatus
- changedBy
- changedByRole
- action
- notes
- paymentStatus

## Success Criteria

✅ All booking status changes create history entries
✅ Timeline displays chronologically
✅ Role-based color coding works
✅ Status transitions show old → new
✅ Notes contain relevant details
✅ Current status summary displays correctly
✅ No compilation errors
✅ No runtime errors in browser console

## Next Steps

After verifying history tracking works:
1. Test with real user flows
2. Verify notifications are sent correctly
3. Test edge cases (rapid status changes, concurrent updates)
4. Performance test with large history arrays
5. Add pagination if history grows too large
