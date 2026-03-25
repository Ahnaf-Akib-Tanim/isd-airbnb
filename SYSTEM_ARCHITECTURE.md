# System Architecture - Complete Airbnb-like Booking Platform

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
│                      http://localhost:3000                           │
├─────────────────────────────────────────────────────────────────────┤
│  Pages:                    Components:                               │
│  • HomePage                • ReviewsSection ⭐ NEW                   │
│  • SearchPage              • BookingTimeline ⭐ NEW                  │
│  • ListingDetailsPage      • BookingTimeline                         │
│  • ReservationPage         • Navbar                                  │
│  • BookingDetailsPage ✨   • Footer                                  │
│  • CustomerTripsPage       • ProtectedRoute                          │
│  • HostDashboardPage ✨                                              │
│  • AdminBookingsPage                                                 │
│  • PaymentPage                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTP/REST
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Port 8080)                         │
│                    Spring Cloud Gateway                              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ↓             ↓             ↓
        ┌───────────────┐ ┌──────────────┐ ┌──────────────┐
        │ User Service  │ │Booking Service│ │Review Service│ ⭐ NEW
        │  Port 8081    │ │  Port 8082    │ │  Port 8089   │
        └───────────────┘ └──────────────┘ └──────────────┘
                │                 │                 │
                │                 │                 │
                ↓                 ↓                 ↓
        ┌───────────────┐ ┌──────────────┐ ┌──────────────┐
        │   MongoDB     │ │   MongoDB    │ │   MongoDB    │
        │ airbnb_users  │ │airbnb_bookings│ │airbnb_reviews│ ⭐ NEW
        └───────────────┘ └──────────────┘ └──────────────┘
```

---

## 📦 Microservices Architecture

### 1. User Service (Port 8081)
**Responsibilities:**
- User authentication & authorization
- Host profile management
- Guest profile management
- Host verification
- User preferences

**Database:** `airbnb_users`
**Key Collections:**
- `users` - User profiles with host/guest data
- Host review scores ✨ NEW
- Languages spoken ✨ NEW
- Response time ✨ NEW

### 2. Booking Service (Port 8082)
**Responsibilities:**
- Booking creation & management
- Status tracking
- Check-in/check-out management ✨ ENHANCED
- Payment processing
- Cancellation & refunds
- **History tracking** ⭐ NEW

**Database:** `airbnb_bookings`
**Key Collections:**
- `bookings` - Booking records
  - History array ⭐ NEW
  - Review tracking ⭐ NEW
  - Enhanced timestamps ✨

### 3. Review Service (Port 8089) ⭐ NEW
**Responsibilities:**
- Review creation & management
- 6-category ratings
- Host responses
- Helpful votes
- Review moderation
- Guest favorite badges

**Database:** `airbnb_reviews`
**Key Collections:**
- `reviews` - Guest reviews with ratings

### 4. Payment Service (Port 8083)
**Responsibilities:**
- Payment processing
- Refund management
- Transaction history
- Payment method management

### 5. Listing Service (Port 8084)
**Responsibilities:**
- Property listings
- Amenities management
- Property images
- Availability calendar

### 6. Availability Service (Port 8085)
**Responsibilities:**
- Calendar management
- Date blocking
- Availability checking
- Booking conflicts

### 7. Search Service (Port 8086)
**Responsibilities:**
- Property search
- Filtering & sorting
- Location-based search
- Price range filtering

### 8. Notification Service (Port 8087)
**Responsibilities:**
- Email notifications
- In-app notifications
- WebSocket real-time updates
- Notification preferences

### 9. Admin Service (Port 8088)
**Responsibilities:**
- Admin authentication
- Booking approval
- Payment approval ✨ ENHANCED
- Payout management ✨ ENHANCED
- User verification
- Review moderation

---

## 🔄 Data Flow Diagrams

### Review Submission Flow

```
┌──────────┐
│  Guest   │
└────┬─────┘
     │ 1. Submit Review
     ↓
┌──────────────────┐
│ Review Service   │
│ POST /api/reviews│
└────┬─────────────┘
     │ 2. Validate & Save
     ↓
┌──────────────────┐
│ MongoDB Reviews  │
└────┬─────────────┘
     │ 3. Calculate Ratings
     ↓
┌──────────────────┐
│ User Service     │
│ Update Host Stats│
└────┬─────────────┘
     │ 4. Notify Host
     ↓
┌──────────────────┐
│Notification Svc  │
└──────────────────┘
```

### Booking History Tracking Flow

```
┌──────────┐
│Any Action│ (Create, Update, Cancel, etc.)
└────┬─────┘
     │
     ↓
┌──────────────────────┐
│ BookingService       │
│ addHistoryEntry()    │ ⭐ NEW
└────┬─────────────────┘
     │
     ↓
┌──────────────────────┐
│ BookingHistory       │
│ {                    │
│   timestamp,         │
│   previousStatus,    │
│   newStatus,         │
│   changedBy,         │
│   changedByRole,     │
│   action,            │
│   notes,             │
│   paymentStatus      │
│ }                    │
└────┬─────────────────┘
     │
     ↓
┌──────────────────────┐
│ MongoDB Bookings     │
│ history: [...]       │
└──────────────────────┘
```

### Complete Booking Lifecycle

```
1. BOOKING CREATION
   Guest → Booking Service → MongoDB
   ↓
   History Entry: "Booking created" by GUEST

2. PAYMENT (Immediate or Later)
   Guest → Payment Service → Booking Service
   ↓
   History Entry: "Payment completed" by GUEST

3. ADMIN APPROVAL
   Admin → Admin Service → Booking Service
   ↓
   History Entry: "Payment approved" by ADMIN
   Status: PENDING → CONFIRMED

4. CHECK-IN (On check-in date)
   Host → Booking Service
   ↓
   History Entry: "Check-in confirmed" by HOST
   Status: CONFIRMED → CHECKED_IN

5. CHECK-OUT
   Host → Booking Service
   ↓
   History Entry: "Check-out confirmed" by HOST
   Status: CHECKED_IN → COMPLETED

6. PAYOUT
   Admin → Booking Service
   ↓
   History Entry: "Payout issued" by ADMIN

7. REVIEW (Optional)
   Guest → Review Service
   ↓
   Booking updated: reviewSubmitted = true
```

---

## 🗄️ Database Schema

### Reviews Collection ⭐ NEW

```javascript
{
  _id: ObjectId,
  id: String,
  bookingId: String (unique),
  guestId: String,
  hostId: String,
  propertyId: String,
  
  // 6-Category Ratings
  overallRating: Double,
  cleanlinessRating: Double,
  accuracyRating: Double,
  checkInRating: Double,
  communicationRating: Double,
  locationRating: Double,
  valueRating: Double,
  
  // Content
  reviewText: String,
  guestName: String,
  guestProfileImage: String,
  
  // Host Response
  hostResponse: String,
  hostResponseDate: DateTime,
  
  // Metadata
  status: Enum,
  isGuestFavorite: Boolean,
  helpfulCount: Integer,
  helpfulByUserIds: [String],
  mentionedCategories: [String],
  
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Bookings Collection (Enhanced)

```javascript
{
  _id: ObjectId,
  id: String,
  guestId: String,
  hostId: String,
  propertyId: String,
  propertyName: String,
  checkInDate: Date,
  checkOutDate: Date,
  totalPrice: Decimal,
  status: Enum,
  paymentStatus: Enum,
  
  // Check-in/Check-out Tracking ✨
  actualCheckInTime: DateTime,
  actualCheckOutTime: DateTime,
  checkInConfirmedBy: String,
  checkOutConfirmedBy: String,
  
  // Cancellation ✨
  cancellationReason: String,
  cancelledBy: String,
  cancelledAt: DateTime,
  refundAmount: Decimal,
  cancellationPolicy: String,
  
  // Payout ✨
  payoutAmount: Decimal,
  payoutPercentage: Double,
  payoutIssued: Boolean,
  payoutIssuedAt: DateTime,
  
  // Payment Tracking ✨
  paymentMethod: String,
  paymentCompletedAt: DateTime,
  paymentApprovedAt: DateTime,
  
  // Review Tracking ⭐ NEW
  reviewSubmitted: Boolean,
  reviewId: String,
  reviewSubmittedAt: DateTime,
  
  // History Tracking ⭐ NEW
  history: [
    {
      timestamp: DateTime,
      previousStatus: String,
      newStatus: String,
      changedBy: String,
      changedByRole: String,
      action: String,
      notes: String,
      paymentStatus: String
    }
  ],
  
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Users Collection (Enhanced)

```javascript
{
  _id: ObjectId,
  userId: String,
  email: String,
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: Enum (GUEST, HOST, ADMIN),
  
  // Host-specific ✨
  hostDisplayName: String,
  averageRating: Double,
  reviewCount: Integer,
  
  // Review Scores ⭐ NEW
  cleanlinessScore: Double,
  accuracyScore: Double,
  checkInScore: Double,
  communicationScore: Double,
  locationScore: Double,
  valueScore: Double,
  
  // Host Stats ⭐ NEW
  yearsHosting: Integer,
  languagesSpoken: String,
  responseTime: String,
  
  // Properties
  hostedProperties: [
    {
      propertyId: String,
      propertyName: String,
      // ... property details
      
      // Property Review Scores ⭐ NEW
      averageRating: Double,
      reviewCount: Integer,
      cleanlinessScore: Double,
      accuracyScore: Double,
      checkInScore: Double,
      communicationScore: Double,
      locationScore: Double,
      valueScore: Double,
      
      // Amenities ⭐ NEW
      essentials: [String],
      features: [String],
      safety: [String]
    }
  ],
  
  createdAt: DateTime,
  updatedAt: DateTime
}
```

---

## 🔐 Security Architecture

### Authentication Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │ 1. Login Request
     ↓
┌──────────────────┐
│ User Service     │
│ POST /api/login  │
└────┬─────────────┘
     │ 2. Validate Credentials
     ↓
┌──────────────────┐
│ JWT Token        │
│ Generated        │
└────┬─────────────┘
     │ 3. Return Token
     ↓
┌──────────────────┐
│  Client          │
│ Store Token      │
└────┬─────────────┘
     │ 4. Subsequent Requests
     │    (Authorization: Bearer <token>)
     ↓
┌──────────────────┐
│ API Gateway      │
│ Validate Token   │
└────┬─────────────┘
     │ 5. Forward to Service
     ↓
┌──────────────────┐
│ Microservice     │
└──────────────────┘
```

### Role-Based Access Control

```
GUEST:
- Create bookings
- View own bookings
- Submit reviews
- Cancel own bookings
- Make payments

HOST:
- View host bookings
- Confirm check-in ⭐
- Confirm check-out ⭐
- Cancel bookings (full refund)
- Respond to reviews
- View payout information

ADMIN:
- Approve bookings
- Approve payments ⭐
- Issue refunds
- Issue payouts ⭐
- Moderate reviews
- View all bookings
- Manage users
```

---

## 📊 Performance Optimization

### Database Indexes

```javascript
// Reviews
db.reviews.createIndex({ hostId: 1, status: 1 })
db.reviews.createIndex({ propertyId: 1, status: 1 })
db.reviews.createIndex({ bookingId: 1 }, { unique: true })
db.reviews.createIndex({ createdAt: -1 })

// Bookings
db.bookings.createIndex({ guestId: 1, createdAt: -1 })
db.bookings.createIndex({ hostId: 1, createdAt: -1 })
db.bookings.createIndex({ status: 1 })
db.bookings.createIndex({ "history.timestamp": -1 })

// Users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ userId: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
```

### Caching Strategy

```
┌──────────────────┐
│  Redis Cache     │
│                  │
│ • User Sessions  │
│ • Review Stats   │
│ • Host Ratings   │
│ • Popular Listings│
└──────────────────┘
```

---

## 🚀 Deployment Architecture

### Docker Compose Setup

```yaml
services:
  # Frontend
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
  
  # API Gateway
  api-gateway:
    build: ./backend/api-gateway
    ports: ["8080:8080"]
  
  # Microservices
  user-service:
    build: ./backend/user-service
    ports: ["8081:8081"]
  
  booking-service:
    build: ./backend/booking-service
    ports: ["8082:8082"]
  
  review-service: ⭐ NEW
    build: ./backend/review-service
    ports: ["8089:8089"]
  
  # ... other services ...
  
  # Databases
  mongodb:
    image: mongo:latest
    ports: ["27017:27017"]
```

---

## 📈 Monitoring & Logging

### Logging Strategy

```
┌──────────────────┐
│  Application     │
│  Logs            │
└────┬─────────────┘
     │
     ↓
┌──────────────────┐
│  Log Aggregation │
│  (ELK Stack)     │
└────┬─────────────┘
     │
     ↓
┌──────────────────┐
│  Kibana          │
│  Dashboard       │
└──────────────────┘
```

### Metrics Collection

```
┌──────────────────┐
│  Spring Boot     │
│  Actuator        │
└────┬─────────────┘
     │
     ↓
┌──────────────────┐
│  Prometheus      │
└────┬─────────────┘
     │
     ↓
┌──────────────────┐
│  Grafana         │
│  Dashboard       │
└──────────────────┘
```

---

## 🎯 Key Features Summary

### ✅ Review System
- 6-category ratings
- Host responses
- Helpful votes
- Guest favorites
- 200 seeded reviews

### ✅ History Tracking
- Complete audit trail
- Role-based tracking
- Visual timeline
- Immutable records
- Detailed logging

### ✅ Booking Management
- Host check-in/check-out control
- Payment approval workflow
- Cancellation policies
- Payout system
- Status tracking

### ✅ UI/UX
- Airbnb-quality design
- Responsive layouts
- Smooth animations
- Optimal space usage
- Professional appearance

---

This architecture provides a scalable, maintainable, and production-ready booking platform with comprehensive features matching Airbnb's functionality.
