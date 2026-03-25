# Testing Guide for Review System & History Tracking

## Quick Start Testing

### 1. Start Services

```bash
# Start all services
docker-compose up -d

# Check service health
docker-compose ps

# View logs
docker-compose logs -f review-service
docker-compose logs -f booking-service
```

### 2. Verify Review Service

```bash
# Check if review service is running
curl http://localhost:8089/actuator/health

# Get all reviews
curl http://localhost:8089/api/reviews/host/host_1

# Create a test review
curl -X POST http://localhost:8089/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "test_booking_1",
    "guestId": "guest_1",
    "hostId": "host_1",
    "propertyId": "property_1",
    "overallRating": 4.8,
    "cleanlinessRating": 4.9,
    "accuracyRating": 4.7,
    "checkInRating": 5.0,
    "communicationRating": 4.8,
    "locationRating": 4.6,
    "valueRating": 4.7,
    "reviewText": "Amazing stay! Highly recommend.",
    "guestName": "John Doe",
    "mentionedCategories": ["Cleanliness", "Hospitality", "Location"]
  }'
```

### 3. Test History Tracking

```bash
# Create a booking (should create history entry)
curl -X POST http://localhost:8082/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "guestId": "guest_1",
    "hostId": "host_1",
    "propertyName": "Test Property",
    "checkInDate": "2024-02-01",
    "checkOutDate": "2024-02-05",
    "totalPrice": 500,
    "paymentStatus": "PENDING"
  }'

# Get booking with history
curl http://localhost:8082/api/bookings/{bookingId}

# Verify history array contains entries
```

---

## Frontend Testing

### 1. Review Display Testing

**Test URL:** `http://localhost:3000/rooms/{hostId}`

**Checklist:**
- [ ] Overall rating displays with "Guest favorite" badge
- [ ] 6 category ratings show with progress bars
- [ ] Individual reviews display in grid
- [ ] Guest avatars and names show correctly
- [ ] Star ratings display properly
- [ ] Category tags appear below reviewer info
- [ ] Host responses show in gray boxes
- [ ] Helpful button displays count
- [ ] "Show more" button works correctly
- [ ] Responsive on mobile devices

### 2. Booking Timeline Testing

**Test URL:** `http://localhost:3000/booking/{bookingId}`

**Checklist:**
- [ ] Timeline displays all history entries
- [ ] Dots are color-coded by role
- [ ] Status changes show old → new status
- [ ] Timestamps display correctly
- [ ] Notes/details expand properly
- [ ] Summary cards show at bottom
- [ ] Current status displays correctly
- [ ] Payment status shows accurately
- [ ] Check-in/check-out times display (if applicable)
- [ ] Responsive on mobile devices

### 3. Booking Details Page Testing

**Test URL:** `http://localhost:3000/booking/{bookingId}`

**Checklist:**
- [ ] Page layout is clean and organized
- [ ] Status banner displays at top
- [ ] Stay details grid shows all information
- [ ] Host/guest information cards display
- [ ] Property images load correctly
- [ ] Timeline section is comprehensive
- [ ] Cancellation details show (if cancelled)
- [ ] Payout information displays (for hosts)
- [ ] Action buttons work correctly
- [ ] No excessive white space
- [ ] Responsive on all screen sizes

---

## Database Verification

### 1. Check Review Seeder

```bash
# Connect to MongoDB
mongo airbnb_reviews

# Count reviews
db.reviews.count()
# Should return 200

# Check sample review
db.reviews.findOne()

# Verify ratings distribution
db.reviews.aggregate([
  {
    $group: {
      _id: null,
      avgOverall: { $avg: "$overallRating" },
      avgCleanliness: { $avg: "$cleanlinessRating" },
      avgAccuracy: { $avg: "$accuracyRating" },
      avgCheckIn: { $avg: "$checkInRating" },
      avgCommunication: { $avg: "$communicationRating" },
      avgLocation: { $avg: "$locationRating" },
      avgValue: { $avg: "$valueRating" }
    }
  }
])
```

### 2. Check Booking History

```bash
# Connect to MongoDB
mongo airbnb_bookings

# Find booking with history
db.bookings.findOne({ "history.0": { $exists: true } })

# Count bookings with history
db.bookings.count({ "history.0": { $exists: true } })

# Check history structure
db.bookings.aggregate([
  { $unwind: "$history" },
  { $group: { _id: "$history.changedByRole", count: { $sum: 1 } } }
])
```

---

## Integration Testing

### 1. Complete Booking Flow with History

```javascript
// 1. Create booking
POST /api/bookings
// Verify: history[0] = "Booking created" by GUEST

// 2. Admin confirms
PUT /api/bookings/{id}/confirm
// Verify: history[1] = "Booking confirmed" by ADMIN

// 3. Guest pays (if pay later)
PUT /api/bookings/{id}/process-payment
// Verify: history[2] = "Payment completed" by GUEST

// 4. Admin approves payment
PUT /api/bookings/{id}/approve-payment
// Verify: history[3] = "Payment approved" by ADMIN

// 5. Host confirms check-in
PUT /api/bookings/{id}/host-checkin
// Verify: history[4] = "Check-in confirmed" by HOST

// 6. Host confirms check-out
PUT /api/bookings/{id}/host-checkout
// Verify: history[5] = "Check-out confirmed" by HOST

// 7. Admin issues payout
PUT /api/bookings/{id}/payout
// Verify: history[6] = "Payout issued" by ADMIN
```

### 2. Review Submission Flow

```javascript
// 1. Complete booking (status = COMPLETED)

// 2. Submit review
POST /api/reviews
{
  bookingId: "...",
  guestId: "...",
  hostId: "...",
  overallRating: 4.8,
  ...
}

// 3. Verify review appears on host profile
GET /api/reviews/host/{hostId}

// 4. Host responds
PUT /api/reviews/{id}/response
{ response: "Thank you for staying!" }

// 5. Guest marks helpful
PUT /api/reviews/{id}/helpful?userId={userId}

// 6. Verify helpful count incremented
GET /api/reviews/{id}
```

---

## Performance Testing

### 1. Review Loading Performance

```bash
# Test with 200 reviews
time curl http://localhost:8089/api/reviews/host/host_1

# Should complete in < 500ms
```

### 2. History Tracking Performance

```bash
# Create 100 bookings with history
for i in {1..100}; do
  curl -X POST http://localhost:8082/api/bookings \
    -H "Content-Type: application/json" \
    -d "{...}"
done

# Measure query time
time curl http://localhost:8082/api/bookings/guest/guest_1

# Should complete in < 1000ms
```

---

## UI/UX Testing

### 1. Visual Regression Testing

**Review Section:**
- [ ] Overall rating badge is visually appealing
- [ ] Category ratings align properly
- [ ] Review cards have consistent spacing
- [ ] Host responses are clearly distinguished
- [ ] Helpful button is clickable and responsive
- [ ] "Show more" button is prominent

**Timeline Component:**
- [ ] Timeline dots align vertically
- [ ] Connecting lines are continuous
- [ ] Status badges are readable
- [ ] Timestamps are formatted correctly
- [ ] Summary cards are evenly spaced
- [ ] Colors match role assignments

**Booking Details:**
- [ ] Layout is balanced (no excessive white space)
- [ ] Information hierarchy is clear
- [ ] Action buttons are prominent
- [ ] Status banner is eye-catching
- [ ] Info boxes are color-coded correctly

### 2. Responsive Testing

**Breakpoints to Test:**
- [ ] Mobile (320px - 480px)
- [ ] Tablet (481px - 768px)
- [ ] Desktop (769px - 1024px)
- [ ] Large Desktop (1025px+)

**Elements to Verify:**
- [ ] Review grid collapses to single column on mobile
- [ ] Timeline remains readable on small screens
- [ ] Booking details stack properly
- [ ] Action buttons remain accessible
- [ ] Images scale appropriately

---

## Error Handling Testing

### 1. Review System Errors

```bash
# Test duplicate review
curl -X POST http://localhost:8089/api/reviews \
  -H "Content-Type: application/json" \
  -d '{ "bookingId": "existing_booking", ... }'
# Should return 400 error

# Test invalid rating
curl -X POST http://localhost:8089/api/reviews \
  -H "Content-Type: application/json" \
  -d '{ "overallRating": 6.0, ... }'
# Should return 400 error

# Test non-existent review
curl http://localhost:8089/api/reviews/invalid_id
# Should return 404 error
```

### 2. History Tracking Errors

```bash
# Test invalid status transition
curl -X PUT http://localhost:8082/api/bookings/{id}/host-checkin
# (when booking is not CONFIRMED)
# Should return 400 error with message

# Test unauthorized action
curl -X PUT http://localhost:8082/api/bookings/{id}/host-checkin?hostId=wrong_host
# Should return 403 error
```

---

## Accessibility Testing

### 1. Keyboard Navigation

- [ ] Tab through review cards
- [ ] Tab through timeline entries
- [ ] Tab through action buttons
- [ ] Enter key activates buttons
- [ ] Escape key closes modals

### 2. Screen Reader Testing

- [ ] Review ratings are announced
- [ ] Timeline events are readable
- [ ] Status badges are descriptive
- [ ] Action buttons have labels
- [ ] Images have alt text

### 3. Color Contrast

- [ ] Text meets WCAG AA standards
- [ ] Status badges are readable
- [ ] Timeline colors are distinguishable
- [ ] Links are identifiable

---

## Security Testing

### 1. Review System Security

```bash
# Test SQL injection
curl -X POST http://localhost:8089/api/reviews \
  -H "Content-Type: application/json" \
  -d '{ "reviewText": "'; DROP TABLE reviews; --", ... }'
# Should be sanitized

# Test XSS
curl -X POST http://localhost:8089/api/reviews \
  -H "Content-Type: application/json" \
  -d '{ "reviewText": "<script>alert(1)</script>", ... }'
# Should be escaped

# Test rate limiting
for i in {1..100}; do
  curl -X POST http://localhost:8089/api/reviews \
    -H "Content-Type: application/json" \
    -d "{...}"
done
# Should be rate limited after threshold
```

### 2. History Tracking Security

```bash
# Test history tampering
curl -X PUT http://localhost:8082/api/bookings/{id} \
  -H "Content-Type: application/json" \
  -d '{ "history": [] }'
# Should be rejected (history is immutable)

# Test unauthorized access
curl http://localhost:8082/api/bookings/{id}
# (without auth token)
# Should return 401 error
```

---

## Monitoring & Logging

### 1. Check Logs

```bash
# Review service logs
docker-compose logs review-service | grep ERROR

# Booking service logs
docker-compose logs booking-service | grep "history"

# Check for exceptions
docker-compose logs | grep Exception
```

### 2. Metrics

```bash
# Review creation rate
curl http://localhost:8089/actuator/metrics/reviews.created

# History entry rate
curl http://localhost:8082/actuator/metrics/history.entries.created

# API response times
curl http://localhost:8089/actuator/metrics/http.server.requests
```

---

## Cleanup

```bash
# Stop services
docker-compose down

# Remove volumes (if needed)
docker-compose down -v

# Clean up test data
mongo airbnb_reviews --eval "db.reviews.deleteMany({})"
mongo airbnb_bookings --eval "db.bookings.updateMany({}, { $set: { history: [] } })"
```

---

## Success Criteria

### Review System
- ✅ 200 reviews seeded successfully
- ✅ All 6 category ratings display correctly
- ✅ Host responses work
- ✅ Helpful votes increment
- ✅ Guest favorite badges appear
- ✅ UI matches Airbnb design

### History Tracking
- ✅ All booking actions create history entries
- ✅ Timeline displays all entries correctly
- ✅ Role colors are accurate
- ✅ Timestamps are correct
- ✅ Status changes are tracked
- ✅ Payment history is recorded

### UI/UX
- ✅ No excessive white space
- ✅ Responsive on all devices
- ✅ Smooth transitions
- ✅ Clear information hierarchy
- ✅ Accessible to all users
- ✅ Matches Airbnb quality

---

## Troubleshooting

### Common Issues

**Reviews not displaying:**
- Check review service is running
- Verify MongoDB connection
- Check API gateway routing
- Verify seeder ran successfully

**History not tracking:**
- Check BookingService has history helper method
- Verify history array is initialized
- Check MongoDB schema allows history field
- Verify all status changes call addHistoryEntry

**UI issues:**
- Clear browser cache
- Check console for errors
- Verify CSS files are loaded
- Check component imports

**Performance issues:**
- Add database indexes
- Enable caching
- Optimize queries
- Use pagination

---

This testing guide ensures comprehensive verification of all implemented features.
