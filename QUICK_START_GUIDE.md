# Quick Start Guide - Review System & History Tracking

## 🚀 Get Started in 5 Minutes

### Step 1: Build Review Service

```bash
cd backend/review-service
mvn clean package -DskipTests
cd ../..
```

### Step 2: Update Environment Variables

Add to `.env`:
```env
MONGO_URI_REVIEWS=mongodb://localhost:27017/airbnb_reviews
REVIEW_SERVICE_PORT=8089
```

### Step 3: Start All Services

```bash
docker-compose up -d
```

### Step 4: Verify Services

```bash
# Check all services are running
docker-compose ps

# Check review service health
curl http://localhost:8089/actuator/health

# Check if reviews were seeded
curl http://localhost:8089/api/reviews/host/host_1
```

### Step 5: Test Frontend

```bash
cd frontend
npm install  # if needed
npm start
```

Open browser: `http://localhost:3000`

---

## 📋 Quick Feature Overview

### ✅ Review System
- **6-category ratings** (Cleanliness, Accuracy, Check-in, Communication, Location, Value)
- **200 seeded reviews** with realistic data
- **Host responses** to reviews
- **Helpful votes** system
- **Guest favorite** badges
- **Beautiful UI** matching Airbnb

### ✅ History Tracking
- **Complete audit trail** of all booking events
- **Visual timeline** component
- **Role-based tracking** (Guest, Host, Admin, System)
- **Status change** indicators
- **Payment history** tracking
- **Check-in/check-out** timestamps

### ✅ UI Improvements
- **Airbnb-quality design**
- **Optimal space utilization**
- **Responsive layouts**
- **Smooth animations**
- **Professional appearance**

---

## 🎯 Key URLs

### Backend Services
- Review Service: `http://localhost:8089`
- Booking Service: `http://localhost:8082`
- User Service: `http://localhost:8081`
- API Gateway: `http://localhost:8080`

### Frontend
- Main App: `http://localhost:3000`
- Booking Details: `http://localhost:3000/booking/{id}`
- Host Dashboard: `http://localhost:3000/host-dashboard`
- Customer Trips: `http://localhost:3000/my-trips`

---

## 🧪 Quick Tests

### Test Review Display
```bash
# Get reviews for a host
curl http://localhost:8089/api/reviews/host/host_1

# Create a test review
curl -X POST http://localhost:8089/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "test_1",
    "guestId": "guest_1",
    "hostId": "host_1",
    "propertyId": "prop_1",
    "overallRating": 4.8,
    "cleanlinessRating": 4.9,
    "accuracyRating": 4.7,
    "checkInRating": 5.0,
    "communicationRating": 4.8,
    "locationRating": 4.6,
    "valueRating": 4.7,
    "reviewText": "Amazing stay!",
    "guestName": "John Doe"
  }'
```

### Test History Tracking
```bash
# Get booking with history
curl http://localhost:8082/api/bookings/{bookingId}

# Check history array in response
```

---

## 📊 Database Quick Check

```bash
# Connect to MongoDB
mongo

# Switch to reviews database
use airbnb_reviews

# Count reviews
db.reviews.count()
# Should return 200

# Check sample review
db.reviews.findOne()

# Switch to bookings database
use airbnb_bookings

# Find booking with history
db.bookings.findOne({ "history.0": { $exists: true } })
```

---

## 🎨 UI Components to Check

### 1. Review Section
- Navigate to any host profile
- Scroll to reviews section
- Check:
  - Overall rating badge
  - Category ratings with bars
  - Individual review cards
  - Host responses
  - Helpful buttons

### 2. Booking Timeline
- Navigate to booking details page
- Check:
  - Visual timeline with dots
  - Color-coded by role
  - Status changes
  - Summary cards at bottom

### 3. Booking Details
- Navigate to any booking
- Check:
  - Status banner
  - Stay details grid
  - Host/guest info cards
  - Timeline section
  - Cancellation details (if applicable)
  - Payout info (if applicable)

---

## 🐛 Troubleshooting

### Review Service Won't Start
```bash
# Check logs
docker-compose logs review-service

# Common fixes:
# 1. Check MongoDB is running
# 2. Verify port 8089 is available
# 3. Check environment variables
```

### Reviews Not Displaying
```bash
# Check if seeder ran
docker-compose logs review-service | grep "Seeded"

# Manually run seeder
docker-compose restart review-service
```

### History Not Tracking
```bash
# Check BookingService logs
docker-compose logs booking-service | grep "history"

# Verify history helper method exists
# Check backend/booking-service/src/main/java/com/airbnb/booking/service/BookingService.java
```

### UI Issues
```bash
# Clear browser cache
# Check console for errors (F12)
# Verify components are imported correctly
# Check CSS files are loaded
```

---

## 📚 Documentation

- **IMPLEMENTATION_SUMMARY.md** - Original features
- **STATUS_FLOW_GUIDE.md** - Booking workflows
- **REVIEW_AND_HISTORY_IMPLEMENTATION.md** - Detailed review & history docs
- **TEST_IMPLEMENTATION.md** - Comprehensive testing guide
- **FINAL_IMPLEMENTATION_SUMMARY.md** - Complete overview

---

## ✅ Success Checklist

- [ ] Review service is running (port 8089)
- [ ] 200 reviews are seeded
- [ ] Reviews display on frontend
- [ ] Category ratings show correctly
- [ ] Host responses work
- [ ] Helpful votes increment
- [ ] Booking timeline displays
- [ ] History entries are created
- [ ] Status changes are tracked
- [ ] UI matches Airbnb quality
- [ ] Responsive on mobile
- [ ] No excessive white space

---

## 🎉 You're All Set!

Your Airbnb-like booking system now has:
- ✅ Professional review system
- ✅ Complete history tracking
- ✅ Beautiful UI/UX
- ✅ Production-ready code

**Enjoy your enhanced booking platform!** 🚀

For detailed information, refer to the comprehensive documentation files.
