## ISD Airbnb - Progress Log

**Last updated:** 2026-03-19 20:02:38 +06:00  
**Active workstreams:** `develop`, `feature/user/initial-setup`, `feature/frontend/initial-setup`

---

### Current repo state

- The repository structure is in place for a full microservice-based Airbnb clone:
  - `backend/` contains `api-gateway` plus 8 domain services.
  - `frontend/` contains a React SPA with auth-aware routing and a styled landing page.
  - `.github/workflows/ci-cd.yml`, `docker-compose.yml`, and the docs folder are already set up.

- Actual implementation status is still uneven, but the user-related foundation is now much stronger:
  - `user-service` now covers auth, profile management, email verification flow, profile image storage, and realistic host onboarding data.
  - `api-gateway` has route configuration and CORS setup.
  - `notification-service` now has a real email notification endpoint and persistence layer for sent notification records.
  - `booking-service`, `payment-service`, `listing-service`, `availability-service`, `search-service`, and `admin-service` are still mostly scaffolds.
  - Those remaining scaffold services currently have a Spring Boot entry class plus config, but little or no domain logic yet.

- Generated / dependency folders exist locally:
  - `frontend/node_modules/` is installed.
  - Some backend `target/` folders exist from local builds.
  - These are build artifacts, not handwritten project implementation.

---

### Latest update on 2026-03-19 20:02:38 +06:00

- **User signup now supports profile image upload**
  - Registration accepts a profile image and stores it on the user document as a data URL for now.
  - The top-right navbar avatar now uses the signed-in user's profile image instead of a generic placeholder when available.

- **Email verification flow added**
  - `user-service` now creates a verification token during registration.
  - Verification email sending is delegated to `notification-service`.
  - New verification endpoints are now in place:
    - `GET /api/users/verify-email?token=...`
    - `POST /api/users/me/resend-verification`
  - Frontend now includes a verification page and resend-verification action.

- **Notification service is now implemented at a practical baseline**
  - `notification-service` now exposes an email sending endpoint.
  - It stores notification send attempts / records in MongoDB.
  - `user-service` now calls it after registration and on resend-verification.
  - This is enough for auth/email flows now, and can be expanded later for booking/payment notifications.

- **Host onboarding fields are now more realistic**
  - Host registration/profile data now includes fields needed later by listing, availability, and search flows:
    - host display name
    - host about/introduction
    - hosting since date
    - preferred check-in time
    - preferred check-out time
    - response time in hours
    - property types offered
    - offering highlights
    - house rules
    - host portfolio / room images
  - These fields are designed so the host profile can later support listing availability logic, stay rules, and host-facing dashboards.

- **Profile page was extended**
  - Profile editing now supports:
    - profile image update
    - richer host details
    - password change
    - email verification resend

---

### Done already

- **User service backend (`backend/user-service`)**
  - JWT-based auth is implemented with Spring Security.
  - MongoDB persistence is configured and Mongo auditing is enabled.
  - Main endpoints implemented:
    - `POST /api/users/register`
    - `POST /api/users/login`
    - `GET /api/users/verify-email`
    - `GET /api/users/me`
    - `PUT /api/users/me`
    - `POST /api/users/me/resend-verification`
    - `PUT /api/users/me/password`
    - `GET /api/users/{userId}`
    - `GET /api/users/admin/all`
    - `PUT /api/users/admin/{userId}/suspend`
    - `PUT /api/users/admin/{userId}/activate`
  - DTOs, repository, exception handling, and JWT filter/util classes are present.
  - User profile data now includes role, status, contact fields, email verification flags, profile image, realistic host onboarding fields, and timestamps like `createdAt`, `updatedAt`, and `lastLoginAt`.

- **Frontend user flow (`frontend/src`)**
  - Public pages implemented: home, register, login.
  - Verification page implemented: email verification result handling.
  - Protected page implemented: profile.
  - `AuthContext` manages login/register/logout, localStorage hydration, role helpers, and user updates.
  - `authService` calls the API gateway at `/api/users/**`.
  - Navbar reacts to auth state and now shows the user's profile image in the small top-right circle when available.
  - Register page now supports profile image upload and realistic host signup fields.
  - Profile page loads `/api/users/me` and supports profile editing, password change, host info updates, and resend-verification.
  - Home page now uses a single user-facing `Trips and hosting` card instead of project-marketing placeholders.
  - Frontend unit tests exist for `AuthContext` and `authService`.

- **Infra and platform setup**
  - API Gateway routes `/api/users/**`, `/api/bookings/**`, `/api/payments/**`, `/api/listings/**`, `/api/availability/**`, `/api/search/**`, `/api/notifications/**`, and `/api/admin/**`.
  - `docker-compose.yml` wires all services together and now passes notification/frontend URL config needed for verification mail links.
  - GitHub Actions pipeline is configured for backend build/test, frontend build, and Docker image build/push.

- **Notification service backend (`backend/notification-service`)**
  - Basic email notification sending endpoint is now implemented.
  - Notification records are persisted for later audit/history use.
  - This service can be reused later for booking status alerts, payment updates, and admin notifications.

---

### What is still left

- **User service remaining work**
  - Add backend tests for `user-service`. There are currently no Java test classes in the repo.
  - Add frontend/admin screens for listing all users, suspend, and activate actions.
  - Add proper file storage later for profile/host images instead of keeping data URLs in Mongo documents.
  - Add forgot-password / reset-password flow.
  - Add validation/size restrictions and image-type checks for uploaded images.
  - Add stronger access-control separation for future host-only and admin-only actions.

- **Frontend gaps**
  - Routes for `/my-listings` and `/bookings` are referenced from the wider UI plan, but there is no completed listings or bookings page yet.
  - There is no real listing, search, booking, payment, admin, or notification page yet.
  - Frontend unit tests still need cleanup around current axios/Jest mocking and broader page coverage.

- **Other microservices**
  - Booking service logic is not implemented yet even though the docs describe the lifecycle in detail.
  - Payment, listing, availability, search, and admin services are still setup-only.
  - `notification-service` now has a usable baseline, but still needs production-grade template management, retries, and provider integration.
  - No end-to-end integration exists yet between user, booking, payment, and notification flows.

---

### Homepage status

- The old 3-card project-summary section has been removed from `frontend/src/pages/HomePage.jsx`.
- The homepage now keeps one main supporting card: `Trips and hosting`.
- That card is intentionally user-facing and future-oriented:
  - it points toward booking history,
  - booking status tracking,
  - and host-side dashboard tools.
- The old CI/CD and Docker messaging has been removed from the homepage because it is engineering-facing, not end-user-facing.
- As booking-service and history features are built, this single card can later evolve into:
  - upcoming trip summary,
  - booking history preview,
  - status timeline snapshot,
  - or host dashboard shortcuts.

---

### Practical conclusion

- The repo now also has a working baseline `notification-service`, but the broader booking/listing/search/payment flow is still not implemented.
- The homepage is aligned with the actual delivered product: auth/profile first, trips and hosting next.

---

### Notes

- Frontend default base URL is `http://localhost:8080` unless overridden by `REACT_APP_API_BASE_URL`.
- `README.md` and docs are ahead of the actual implementation in several places; they describe the target architecture more than the current delivered state.
- Immediate next logical workstreams:
  - booking service lifecycle + history
  - listing + availability integration using the new host onboarding data
  - search service filters on availability, host/property type, and offering metadata
  - notification expansion for booking/payment events
- Update this file again after each major backend/frontend milestone with a timestamp, what changed, what remains, and what comes next.
