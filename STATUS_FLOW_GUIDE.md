# Booking Status Flow Guide

## Status Definitions

| Status | Description | Who Can Set | Next Possible Status |
|--------|-------------|-------------|---------------------|
| `PENDING` | Booking created, awaiting admin approval | System (on booking creation) | CONFIRMED, CANCELLED |
| `NOT_PAID_YET` | Booking approved but payment pending (pay later option) | System (when pay later selected) | CONFIRMED, CANCELLED |
| `CONFIRMED` | Booking approved and ready for check-in | Admin (after payment approval) | CHECKED_IN, CANCELLED |
| `CHECKED_IN` | Guest has checked in (confirmed by host) | Host (on check-in date) | COMPLETED |
| `COMPLETED` | Guest has checked out (confirmed by host) | Host (after check-in) | - (final state) |
| `CANCELLED` | Booking cancelled by host or guest | Host, Guest, or Admin | REFUNDED |
| `REFUNDED` | Payment refunded to guest | Admin | - (final state) |

## Payment Status Definitions

| Payment Status | Description | Next Possible Status |
|----------------|-------------|---------------------|
| `PENDING` | Payment not yet completed | COMPLETED, FAILED |
| `PAY_LATER` | Guest chose to pay later | COMPLETED |
| `COMPLETED` | Payment successfully processed | REFUNDED |
| `FAILED` | Payment failed | PENDING |
| `REFUNDED` | Payment refunded to guest | - (final state) |

---

## Complete Workflows

### Workflow 1: Immediate Payment (Happy Path)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Guest Creates Booking (Immediate Payment)                    │
│    Status: PENDING                                               │
│    Payment: PENDING                                              │
│    Action: Guest fills reservation form, enters card details    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Guest Completes Payment                                       │
│    Status: PENDING                                               │
│    Payment: COMPLETED                                            │
│    Action: Payment gateway processes card                        │
│    Notification: Admin receives payment approval request        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Admin Approves Payment                                        │
│    Status: CONFIRMED                                             │
│    Payment: COMPLETED                                            │
│    Action: Admin clicks "Approve Payment"                        │
│    Notification: Guest and Host notified of confirmation        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Host Confirms Check-In (On Check-In Date)                    │
│    Status: CHECKED_IN                                            │
│    Payment: COMPLETED                                            │
│    Action: Host clicks "Confirm Check-In" on dashboard          │
│    Notification: Guest and Admin notified                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Host Confirms Check-Out                                       │
│    Status: COMPLETED                                             │
│    Payment: COMPLETED                                            │
│    Action: Host clicks "Confirm Check-Out"                       │
│    Notification: Admin receives payout request                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Admin Issues Payout                                           │
│    Status: COMPLETED                                             │
│    Payment: COMPLETED                                            │
│    Payout: ISSUED                                                │
│    Action: Admin clicks "Issue Payout"                           │
│    Notification: Host receives payout confirmation               │
└─────────────────────────────────────────────────────────────────┘
```

---

### Workflow 2: Pay Later Option

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Guest Creates Booking (Pay Later)                            │
│    Status: NOT_PAID_YET                                          │
│    Payment: PAY_LATER                                            │
│    Action: Guest selects "Pay Later" option                     │
│    Notification: Admin and Host notified of booking request     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Admin Approves Booking (Optional)                            │
│    Status: NOT_PAID_YET                                          │
│    Payment: PAY_LATER                                            │
│    Action: Admin reviews and approves booking                   │
│    Note: Booking still awaits payment                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Guest Pays (Before Check-In)                                 │
│    Status: NOT_PAID_YET                                          │
│    Payment: COMPLETED                                            │
│    Action: Guest clicks "Pay Now" and enters card details       │
│    Notification: Admin receives payment approval request        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Admin Approves Payment                                        │
│    Status: CONFIRMED                                             │
│    Payment: COMPLETED                                            │
│    Action: Admin clicks "Approve Payment"                        │
│    Notification: Guest and Host notified                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
        (Continue with steps 4-6 from Workflow 1)
```

---

### Workflow 3: Guest Cancellation

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Guest Cancels Booking                                         │
│    Status: CANCELLED                                             │
│    Payment: REFUNDED (if applicable)                             │
│    Action: Guest clicks "Cancel Booking" and provides reason    │
│    Refund Calculation:                                           │
│      - FLEXIBLE: 100% if 1+ days before, 50% otherwise          │
│      - MODERATE: 100% if 5+ days, 50% if 1-4 days, 0% else     │
│      - STRICT: 50% if 7+ days before, 0% otherwise              │
│    Notification: Host and Admin notified with refund amount     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Admin Processes Refund                                        │
│    Status: REFUNDED                                              │
│    Payment: REFUNDED                                             │
│    Action: Admin clicks "Issue Refund"                           │
│    Notification: Guest receives refund confirmation              │
└─────────────────────────────────────────────────────────────────┘
```

---

### Workflow 4: Host Cancellation

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Host Cancels Booking                                          │
│    Status: CANCELLED                                             │
│    Payment: REFUNDED                                             │
│    Action: Host clicks "Cancel Booking" and provides reason     │
│    Refund Calculation: ALWAYS 100% (full refund)                │
│    Notification: Guest and Admin notified                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Admin Processes Full Refund                                   │
│    Status: REFUNDED                                              │
│    Payment: REFUNDED                                             │
│    Action: Admin clicks "Issue Refund"                           │
│    Notification: Guest receives full refund                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Role-Based Actions

### Guest Actions

| Action | Available When | Result |
|--------|---------------|--------|
| Create Booking | Anytime | Status: PENDING or NOT_PAID_YET |
| Pay Now | Status: NOT_PAID_YET, Payment: PAY_LATER | Payment: COMPLETED |
| Cancel Booking | Status: PENDING, CONFIRMED, NOT_PAID_YET | Status: CANCELLED |
| View Booking | Anytime | Read-only access |

### Host Actions

| Action | Available When | Result |
|--------|---------------|--------|
| Confirm Check-In | Status: CONFIRMED, On/After Check-In Date | Status: CHECKED_IN |
| Confirm Check-Out | Status: CHECKED_IN | Status: COMPLETED |
| Cancel Booking | Status: PENDING, CONFIRMED, NOT_PAID_YET | Status: CANCELLED (100% refund) |
| View Bookings | Anytime | Read-only access |

### Admin Actions

| Action | Available When | Result |
|--------|---------------|--------|
| Approve Booking | Status: PENDING | Status: CONFIRMED (if paid) or NOT_PAID_YET |
| Approve Payment | Payment: COMPLETED, Status: NOT_PAID_YET | Status: CONFIRMED |
| Issue Refund | Status: CANCELLED | Status: REFUNDED |
| Issue Payout | Status: COMPLETED, Payout not issued | Payout: ISSUED |
| Cancel Booking | Status: PENDING, CONFIRMED, NOT_PAID_YET | Status: CANCELLED |

---

## Cancellation Policy Details

### FLEXIBLE Policy
- **1+ days before check-in**: 100% refund
- **Less than 1 day**: 50% refund
- **Best for**: Guests who want flexibility

### MODERATE Policy (Default)
- **5+ days before check-in**: 100% refund
- **1-4 days before check-in**: 50% refund
- **Less than 1 day**: 0% refund
- **Best for**: Balanced approach

### STRICT Policy
- **7+ days before check-in**: 50% refund
- **Less than 7 days**: 0% refund
- **Best for**: Hosts who need commitment

### Host Cancellation
- **Always**: 100% refund to guest
- **Reason**: Required
- **Impact**: May affect host's reputation

---

## Payout Calculation

```
Payout Amount = Total Booking Price × (Payout Percentage / 100)

Example:
- Booking Total: $500
- Host Payout Percentage: 80%
- Host Receives: $500 × 0.80 = $400
- Platform Fee: $500 - $400 = $100
```

**Default Payout Percentage**: 80% (configurable per host)

---

## Notification Triggers

### Guest Notifications
- Booking created
- Booking confirmed by admin
- Payment approved
- Check-in confirmed by host
- Check-out confirmed by host
- Booking cancelled
- Refund issued

### Host Notifications
- New booking request
- Guest payment completed
- Booking confirmed
- Booking cancelled by guest
- Payout issued

### Admin Notifications
- New booking request
- Payment completed (needs approval)
- Check-in confirmed
- Check-out confirmed (payout needed)
- Cancellation (refund needed)

---

## Common Scenarios

### Scenario 1: Guest Doesn't Pay (Pay Later)
```
Status: NOT_PAID_YET → Admin can cancel → Status: CANCELLED
No refund needed (no payment made)
```

### Scenario 2: Guest Pays but Admin Doesn't Approve
```
Status: NOT_PAID_YET, Payment: COMPLETED
Guest can request cancellation → Full refund (admin didn't approve)
```

### Scenario 3: Host Doesn't Confirm Check-In
```
Status: CONFIRMED (stuck)
Admin can intervene:
- Contact host
- Cancel booking if needed
- Issue refund to guest
```

### Scenario 4: Host Doesn't Confirm Check-Out
```
Status: CHECKED_IN (stuck)
Admin can:
- Mark as completed manually
- Issue payout after verification
```

---

## Error Prevention

### Check-In Validation
- ✅ Booking must be CONFIRMED
- ✅ Must be on or after check-in date
- ✅ Only the booking's host can confirm
- ❌ Cannot check-in before check-in date
- ❌ Cannot check-in if not confirmed

### Check-Out Validation
- ✅ Booking must be CHECKED_IN
- ✅ Only the booking's host can confirm
- ❌ Cannot check-out before check-in
- ❌ Cannot check-out if not checked-in

### Payment Validation
- ✅ Booking must be NOT_PAID_YET or PENDING with PAY_LATER
- ✅ Payment details must be valid
- ❌ Cannot pay if already paid
- ❌ Cannot pay if cancelled

### Cancellation Validation
- ✅ Can cancel PENDING, CONFIRMED, NOT_PAID_YET
- ✅ Reason required for host cancellation
- ❌ Cannot cancel COMPLETED bookings
- ❌ Cannot cancel already CANCELLED bookings

---

## Quick Reference: Who Does What

| Task | Guest | Host | Admin |
|------|-------|------|-------|
| Create Booking | ✅ | ❌ | ❌ |
| Pay for Booking | ✅ | ❌ | ❌ |
| Approve Payment | ❌ | ❌ | ✅ |
| Confirm Check-In | ❌ | ✅ | ❌ |
| Confirm Check-Out | ❌ | ✅ | ❌ |
| Cancel Booking | ✅ | ✅ | ✅ |
| Issue Refund | ❌ | ❌ | ✅ |
| Issue Payout | ❌ | ❌ | ✅ |

---

## Status Badge Colors (UI)

| Status | Color | Background | Icon |
|--------|-------|------------|------|
| PENDING | #856404 | #ffeeba | ⏳ |
| CONFIRMED | #155724 | #d4edda | ✅ |
| NOT_PAID_YET | #856404 | #fff3cd | 💳 |
| CANCELLED | #721c24 | #f8d7da | ❌ |
| CHECKED_IN | #004085 | #cce5ff | 🏨 |
| COMPLETED | #0c5460 | #d1ecf1 | 🎉 |
| REFUNDED | #383d41 | #e2e3e5 | 💸 |

---

This guide provides a complete reference for understanding and implementing the booking status flow in the Airbnb-like system.
