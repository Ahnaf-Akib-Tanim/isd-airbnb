# Pay Later Feature Guide

## Overview

The pay later feature allows guests to reserve properties without immediate payment when the host enables this option. This provides flexibility for both hosts and guests.

## How It Works

### For Hosts

Hosts can enable/disable the pay later option in their profile settings. This is controlled by the `payLaterAllowed` field in the User model.

**Current Distribution**: 
- Approximately 50% of hosts have pay later enabled (randomly assigned during seeding)
- Hosts can toggle this setting in their profile

### For Guests

When booking a property:

1. **Listing Details Page**
   - If a host allows pay later, you'll see a badge: "⏰ Pay later option available"
   - This appears below the "Reserve" button in the booking card

2. **Reservation Page**
   - If the host allows pay later, you'll see two payment options:
     - **💳 Pay now**: Pay the full amount immediately
     - **⏰ Pay later**: Reserve without payment, pay after admin confirmation
   
   - If the host requires immediate payment:
     - You'll see a notice: "Immediate payment required"
     - Only the pay now option is available

3. **Payment Flow**

   **Option A: Pay Now**
   - Enter card details during reservation
   - Payment is processed immediately
   - Booking status: `PENDING`
   - Payment status: `PENDING` → `COMPLETED` (after admin approval)

   **Option B: Pay Later**
   - No card details required during reservation
   - Booking is created with status: `PENDING`
   - Payment status: `PAY_LATER`
   - After admin confirms the booking:
     - You'll see a "Pay Now" button in your trips
     - Click to complete payment via the payment page
     - Payment status changes: `PAY_LATER` → `COMPLETED`

## Visual Indicators

### Listing Details Page
```
┌─────────────────────────────┐
│  $50 night                  │
│  ★ 4.8 · 12 reviews        │
│                             │
│  [Reserve Button]           │
│                             │
│  ⏰ Pay later option        │
│     available               │
│                             │
│  You won't be charged yet   │
└─────────────────────────────┘
```

### Reservation Page (Pay Later Enabled)
```
┌─────────────────────────────────────┐
│  Payment                            │
│                                     │
│  ✨ This host offers flexible      │
│     payment options                 │
│                                     │
│  ○ 💳 Pay now                      │
│     Pay the total amount now ($150) │
│                                     │
│  ● ⏰ Pay later                    │
│     Reserve now, pay after admin    │
│     confirms. No card required now! │
│                                     │
│  [Card details shown if Pay Now]    │
└─────────────────────────────────────┘
```

### Reservation Page (Immediate Payment Required)
```
┌─────────────────────────────────────┐
│  Payment                            │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 💳                            │ │
│  │ Immediate payment required    │ │
│  │ This host requires full       │ │
│  │ payment at booking time.      │ │
│  └───────────────────────────────┘ │
│                                     │
│  [Card details form]                │
└─────────────────────────────────────┘
```

## Testing the Feature

### Finding Hosts with Pay Later

Since 50% of hosts have pay later enabled, you can:

1. Browse multiple listings on the home page
2. Click on different properties
3. Look for the "⏰ Pay later option available" badge
4. Try booking to see the payment options

### Sample Hosts (Check These)

Look for hosts in different locations - about half should have pay later enabled. The feature is randomly distributed across:
- Dhaka hosts
- Chittagong hosts  
- Sylhet hosts
- Cox's Bazar hosts
- Rajshahi hosts

### Testing the Complete Flow

1. **Find a Pay Later Host**
   - Browse listings
   - Look for the pay later badge
   - Click "Reserve"

2. **Choose Pay Later**
   - Select dates and guests
   - Choose "⏰ Pay later" option
   - Notice: No card details required
   - Click "Request to reserve"

3. **Admin Confirms**
   - Admin reviews the booking
   - Admin approves it
   - Booking status: `PENDING` → `CONFIRMED`
   - Payment status remains: `PAY_LATER`

4. **Guest Pays**
   - Go to "My Trips"
   - Find the confirmed booking
   - Click "Pay Now" button
   - Complete payment on payment page
   - Payment status: `PAY_LATER` → `COMPLETED`

## Database Fields

### User Model
```java
private boolean payLaterAllowed = false;  // Host setting
```

### Booking Model
```java
private String paymentStatus;  // PENDING, PAY_LATER, COMPLETED, FAILED, REFUNDED
```

## Status Flow

### Pay Now Flow
```
Booking Created (PENDING, PENDING)
         ↓
Admin Approves (CONFIRMED, COMPLETED)
         ↓
Host Confirms Check-in (CHECKED_IN, COMPLETED)
         ↓
Host Confirms Check-out (COMPLETED, COMPLETED)
```

### Pay Later Flow
```
Booking Created (PENDING, PAY_LATER)
         ↓
Admin Approves (CONFIRMED, PAY_LATER)
         ↓
Guest Pays (CONFIRMED, COMPLETED)
         ↓
Host Confirms Check-in (CHECKED_IN, COMPLETED)
         ↓
Host Confirms Check-out (COMPLETED, COMPLETED)
```

## UI Enhancements Made

1. **Listing Details Page**
   - Added pay later badge below reserve button
   - Gradient purple badge with clock icon

2. **Reservation Page**
   - Enhanced payment section with clear visual distinction
   - Added gradient info badge for flexible payment
   - Improved immediate payment notice with icon and styling
   - Better radio button labels with icons

3. **My Trips Page**
   - "Pay Now" button appears for PAY_LATER bookings
   - Clear payment status badges

4. **Payment Page**
   - Dedicated page for completing deferred payments
   - Shows booking summary
   - Secure payment form

## Benefits

### For Guests
- Flexibility to reserve without immediate payment
- Time to arrange finances
- Can secure popular dates early
- Pay after admin confirmation

### For Hosts
- Attract more bookings
- Competitive advantage
- Build trust with guests
- Control over payment terms

## Current Implementation Status

✅ Database field exists and is seeded
✅ Frontend displays pay later option correctly
✅ Reservation flow handles both payment types
✅ Payment page allows deferred payment
✅ Status tracking works correctly
✅ Visual indicators added
✅ Admin approval flow integrated

The feature is fully functional and ready to use!
