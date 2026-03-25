# Booking Timeline Visual Guide

## What the Timeline Looks Like

### Example: Complete Booking Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Booking History & Status Tracking                              │
└─────────────────────────────────────────────────────────────────┘

    ⏳  Booking created                    Mar 20, 2026, 10:30 AM
    │   [null] → [PENDING]
    │   Guest initiated booking request
    │   By: GUEST | Payment: PENDING
    │
    ├───────────────────────────────────────────────────────────
    │
    💳  Payment completed                  Mar 20, 2026, 10:35 AM
    │   [PENDING] → [PENDING]
    │   Payment method: CARD | Amount: $450.00
    │   By: GUEST | Payment: COMPLETED
    │
    ├───────────────────────────────────────────────────────────
    │
    ✅  Payment approved                   Mar 20, 2026, 11:00 AM
    │   [PENDING] → [CONFIRMED]
    │   Admin approved payment of $450.00
    │   By: ADMIN | Payment: COMPLETED
    │
    ├───────────────────────────────────────────────────────────
    │
    🏨  Check-in confirmed                 Mar 25, 2026, 3:00 PM
    │   [CONFIRMED] → [CHECKED_IN]
    │   Host confirmed guest check-in at 2026-03-25T15:00:00
    │   By: HOST | Payment: COMPLETED
    │
    ├───────────────────────────────────────────────────────────
    │
    🎉  Check-out confirmed                Mar 27, 2026, 11:00 AM
    │   [CHECKED_IN] → [COMPLETED]
    │   Host confirmed guest check-out at 2026-03-27T11:00:00
    │   By: HOST | Payment: COMPLETED
    │
    ├───────────────────────────────────────────────────────────
    │
    💰  Payout issued                      Mar 27, 2026, 2:00 PM
        [COMPLETED] → [COMPLETED]
        Admin issued payout of $360.00 (80% of $450.00) to host
        By: ADMIN | Payment: COMPLETED

┌─────────────────────────────────────────────────────────────────┐
│  Current Status Summary                                         │
├─────────────────────────────────────────────────────────────────┤
│  Current Status: 🎉 COMPLETED                                   │
│  Payment Status: COMPLETED                                      │
│  Checked In: Mar 25, 2026, 3:00 PM                             │
│  Checked Out: Mar 27, 2026, 11:00 AM                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Color Coding

### Role Colors
- 🔴 **GUEST** - Red (#FF385C) - Airbnb brand color
- 🟢 **HOST** - Teal (#00A699) - Airbnb secondary color
- ⚫ **ADMIN** - Dark Gray (#484848) - Professional
- ⚪ **SYSTEM** - Gray (#767676) - Automated actions

### Status Icons
- ⏳ **PENDING** - Waiting for action
- 💳 **NOT_PAID_YET** - Payment required
- ✅ **CONFIRMED** - Booking approved
- 🏨 **CHECKED_IN** - Guest arrived
- 🎉 **COMPLETED** - Stay finished
- ❌ **CANCELLED** - Booking cancelled
- 💸 **REFUNDED** - Money returned

---

## Example Scenarios

### Scenario 1: Guest Cancellation

```
    ⏳  Booking created                    Mar 20, 2026, 10:30 AM
    │   By: GUEST
    │
    ├───────────────────────────────────────────────────────────
    │
    💳  Payment completed                  Mar 20, 2026, 10:35 AM
    │   By: GUEST
    │
    ├───────────────────────────────────────────────────────────
    │
    ✅  Payment approved                   Mar 20, 2026, 11:00 AM
    │   By: ADMIN
    │
    ├───────────────────────────────────────────────────────────
    │
    ❌  Booking cancelled                  Mar 22, 2026, 9:00 AM
    │   [CONFIRMED] → [CANCELLED]
    │   Cancelled by GUEST | Reason: Change of plans
    │   Refund: $225.00
    │   By: GUEST
    │
    ├───────────────────────────────────────────────────────────
    │
    💸  Refund processed                   Mar 22, 2026, 10:00 AM
        [CANCELLED] → [REFUNDED]
        Admin processed refund of $225.00
        By: ADMIN
```

### Scenario 2: Host Cancellation (Full Refund)

```
    ⏳  Booking created                    Mar 20, 2026, 10:30 AM
    │   By: GUEST
    │
    ├───────────────────────────────────────────────────────────
    │
    💳  Payment completed                  Mar 20, 2026, 10:35 AM
    │   By: GUEST
    │
    ├───────────────────────────────────────────────────────────
    │
    ✅  Payment approved                   Mar 20, 2026, 11:00 AM
    │   By: ADMIN
    │
    ├───────────────────────────────────────────────────────────
    │
    ❌  Booking cancelled                  Mar 23, 2026, 2:00 PM
    │   [CONFIRMED] → [CANCELLED]
    │   Cancelled by HOST | Reason: Property maintenance issue
    │   Refund: $450.00 (Full refund)
    │   By: HOST
    │
    ├───────────────────────────────────────────────────────────
    │
    💸  Refund processed                   Mar 23, 2026, 3:00 PM
        [CANCELLED] → [REFUNDED]
        Admin processed refund of $450.00
        By: ADMIN
```

### Scenario 3: Pay Later Flow

```
    ⏳  Booking created                    Mar 20, 2026, 10:30 AM
    │   [null] → [NOT_PAID_YET]
    │   Guest initiated booking request
    │   By: GUEST | Payment: PAY_LATER
    │
    ├───────────────────────────────────────────────────────────
    │
    ✅  Booking confirmed by admin         Mar 20, 2026, 11:00 AM
    │   [NOT_PAID_YET] → [CONFIRMED]
    │   Admin approved the booking request
    │   By: ADMIN | Payment: PAY_LATER
    │
    ├───────────────────────────────────────────────────────────
    │
    💳  Payment completed                  Mar 24, 2026, 5:00 PM
    │   [CONFIRMED] → [CONFIRMED]
    │   Payment method: CARD | Amount: $450.00
    │   By: GUEST | Payment: COMPLETED
    │
    ├───────────────────────────────────────────────────────────
    │
    ✅  Payment approved                   Mar 24, 2026, 6:00 PM
    │   [CONFIRMED] → [CONFIRMED]
    │   Admin approved payment of $450.00
    │   By: ADMIN | Payment: COMPLETED
    │
    ├───────────────────────────────────────────────────────────
    │
    🏨  Check-in confirmed                 Mar 25, 2026, 3:00 PM
        By: HOST
```

---

## Timeline Component Features

### Visual Elements
1. **Vertical Timeline**
   - Dots for each event
   - Connecting lines between events
   - Color-coded by role

2. **Event Cards**
   - Action title (bold)
   - Timestamp (right-aligned)
   - Status transition badges
   - Detailed notes
   - Role and payment status

3. **Status Badges**
   - Old status → New status
   - Icons for visual recognition
   - Color-coded backgrounds

4. **Summary Cards**
   - Current booking status
   - Payment status
   - Check-in/out timestamps
   - Quick overview at bottom

### Responsive Design
- **Desktop:** Full timeline with all details
- **Tablet:** Compact timeline, stacked cards
- **Mobile:** Simplified view, essential info only

---

## CSS Classes

### Main Container
```css
.booking-timeline {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

### Timeline Item
```css
.timeline-item {
  display: flex;
  gap: 16px;
  position: relative;
}
```

### Timeline Marker
```css
.timeline-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}
```

### Status Badge
```css
.status-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
```

---

## Data Flow

### Backend → Frontend

1. **BookingService creates history entry:**
```java
addHistoryEntry(booking, previousStatus, newStatus, 
    changedBy, changedByRole, action, notes);
```

2. **Booking saved with history:**
```java
booking.getHistory().add(historyEntry);
bookingRepository.save(booking);
```

3. **API returns booking with history:**
```json
{
  "id": "booking123",
  "status": "COMPLETED",
  "history": [
    {
      "timestamp": "2026-03-20T10:30:00",
      "previousStatus": null,
      "newStatus": "PENDING",
      "changedBy": "guest123",
      "changedByRole": "GUEST",
      "action": "Booking created",
      "notes": "Guest initiated booking request",
      "paymentStatus": "PENDING"
    },
    // ... more entries
  ]
}
```

4. **Frontend displays timeline:**
```jsx
<BookingTimeline history={booking.history} booking={booking} />
```

---

## Testing the Timeline

### Manual Testing Steps

1. **Create Booking**
   - Login as guest
   - Create new booking
   - Navigate to booking details
   - ✅ Verify "Booking created" appears in timeline

2. **Complete Payment**
   - Click "Pay Now"
   - Complete payment
   - Return to booking details
   - ✅ Verify "Payment completed" appears

3. **Admin Approval**
   - Login as admin
   - Approve payment
   - View booking as guest
   - ✅ Verify "Payment approved" appears

4. **Check-in**
   - Login as host
   - Confirm check-in on check-in date
   - View booking details
   - ✅ Verify "Check-in confirmed" appears

5. **Check-out**
   - Login as host
   - Confirm check-out
   - View booking details
   - ✅ Verify "Check-out confirmed" appears

6. **Payout**
   - Login as admin
   - Issue payout
   - View booking as host
   - ✅ Verify "Payout issued" appears

### Automated Testing

```javascript
// Test timeline renders
expect(screen.getByText('Booking History & Status Tracking')).toBeInTheDocument();

// Test history entries display
expect(screen.getByText('Booking created')).toBeInTheDocument();
expect(screen.getByText('Payment completed')).toBeInTheDocument();

// Test role colors
const guestActions = screen.getAllByText('By: GUEST');
expect(guestActions[0]).toHaveStyle({ color: '#FF385C' });

// Test status badges
expect(screen.getByText('PENDING')).toBeInTheDocument();
expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
```

---

## Troubleshooting

### Timeline Not Showing
**Problem:** Timeline component doesn't render  
**Solution:** 
- Check if `booking.history` exists and has entries
- Verify `BookingTimeline` is imported correctly
- Check browser console for errors

### Missing History Entries
**Problem:** Some status changes don't appear  
**Solution:**
- Verify `addHistoryEntry()` is called in the method
- Check if booking was saved after adding history
- Query database to verify history array

### Wrong Colors
**Problem:** Role colors don't match  
**Solution:**
- Check `getRoleColor()` function in component
- Verify `changedByRole` is set correctly in backend
- Inspect CSS for color overrides

### Timestamps Wrong
**Problem:** Dates/times display incorrectly  
**Solution:**
- Check timezone settings
- Verify `LocalDateTime` is serialized correctly
- Check `formatDate()` function in component

---

## Summary

The booking timeline provides:
- ✅ Complete audit trail
- ✅ Visual status tracking
- ✅ Role-based color coding
- ✅ Detailed action logs
- ✅ Payment status history
- ✅ Beautiful Airbnb-like design
- ✅ Responsive layout
- ✅ Easy to understand

Every booking status change is automatically tracked and displayed in a clear, visual timeline that helps users understand the complete booking lifecycle.
