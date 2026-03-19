## ISD Airbnb - Progress Log

**Last updated:** 2026-03-19  
**Current branch:** `develop`

---

### Current repo state

- The repository structure is in place for a full microservice-based Airbnb clone:
  - `backend/` contains `api-gateway` plus 8 domain services.
  - `frontend/` contains a React SPA with auth-aware routing and a styled landing page.
  - `.github/workflows/ci-cd.yml`, `docker-compose.yml`, and the docs folder are already set up.

- Actual implementation status is uneven:
  - `user-service` is the only backend service with real business logic and multiple source files.
  - `api-gateway` has route configuration and CORS setup.
  - `booking-service`, `payment-service`, `listing-service`, `availability-service`, `search-service`, `notification-service`, and `admin-service` are still mostly scaffolds.
  - Those scaffold services currently have a Spring Boot entry class plus config, but no controllers, services, repositories, DTOs, or tests yet.

- Generated / dependency folders exist locally:
  - `frontend/node_modules/` is installed.
  - Some backend `target/` folders exist from local builds.
  - These are build artifacts, not handwritten project implementation.

---

### Done already

- **User service backend (`backend/user-service`)**
  - JWT-based auth is implemented with Spring Security.
  - MongoDB persistence is configured and Mongo auditing is enabled.
  - Main endpoints implemented:
    - `POST /api/users/register`
    - `POST /api/users/login`
    - `GET /api/users/me`
    - `PUT /api/users/me`
    - `PUT /api/users/me/password`
    - `GET /api/users/{userId}`
    - `GET /api/users/admin/all`
    - `PUT /api/users/admin/{userId}/suspend`
    - `PUT /api/users/admin/{userId}/activate`
  - DTOs, repository, exception handling, and JWT filter/util classes are present.
  - User profile data includes role, status, contact fields, host stats, and timestamps like `createdAt`, `updatedAt`, and `lastLoginAt`.

- **Frontend user flow (`frontend/src`)**
  - Public pages implemented: home, register, login.
  - Protected page implemented: profile.
  - `AuthContext` manages login/register/logout, localStorage hydration, role helpers, and user updates.
  - `authService` calls the API gateway at `/api/users/**`.
  - Navbar reacts to auth state and shows profile-related actions.
  - Profile page loads `/api/users/me` and supports profile editing.
  - Frontend unit tests exist for `AuthContext` and `authService`.

- **Infra and platform setup**
  - API Gateway routes `/api/users/**`, `/api/bookings/**`, `/api/payments/**`, `/api/listings/**`, `/api/availability/**`, `/api/search/**`, `/api/notifications/**`, and `/api/admin/**`.
  - `docker-compose.yml` wires all services together.
  - GitHub Actions pipeline is configured for backend build/test, frontend build, and Docker image build/push.

---

### What is still left

- **User service remaining work**
  - Add backend tests for `user-service`. There are currently no Java test classes in the repo.
  - Add frontend UI for password change.
  - Add frontend/admin screens for listing all users, suspend, and activate actions.
  - Optional but useful next steps: refresh token flow, email verification, forgot-password flow, profile image upload, stronger admin authorization checks around internal endpoints.

- **Frontend gaps**
  - Routes for `/my-listings` and `/bookings` are referenced from the UI, but they are not defined in `App.js` yet.
  - There is no real listing, search, booking, payment, admin, or notification page yet.

- **Other microservices**
  - Booking service logic is not implemented yet even though the docs describe the lifecycle in detail.
  - Payment, listing, availability, search, notification, and admin services are still setup-only.
  - No end-to-end integration exists yet between user, booking, payment, and notification flows.

---

### About the 3 homepage cards

- The three cards on the landing page are hardcoded in `frontend/src/pages/HomePage.jsx`.
- They are not dynamic status panels and they are not coming from the backend.
- Their current purpose is to summarize the project direction:
  - `Microservices / User service` = the part that is actually implemented now.
  - `Status & history / Booking lifecycle` = planned booking-service and trip-history functionality.
  - `CI/CD / Docker` = platform/infrastructure setup already present in the repo.

- So why are they showing now?
  - Because the current homepage is acting like a project showcase / portfolio hero section.
  - They help explain the architecture while the rest of the product pages are still unfinished.

- What should replace them later?
  - The `User service` card can be replaced by real user/account quick actions or profile summary widgets.
  - The `Booking lifecycle` card should be replaced by actual booking history / trips / timeline components once booking-service is built.
  - The `CI/CD - Docker` card is not really an end-user feature. Later it should either be removed or replaced with real marketplace content like featured listings, categories, destinations, or host highlights.

---

### Practical conclusion

- Your statement is accurate: the **user service portion is mostly the only completed functional module right now**.
- The repo already looks strong from an architecture/setup perspective, but most non-user business services are still at the scaffold stage.
- The current homepage mixes:
  - real user-service capability,
  - planned booking/history capability,
  - engineering/infrastructure messaging.

- That is why those three cards appear together.

---

### Notes

- Frontend default base URL is `http://localhost:8080` unless overridden by `REACT_APP_API_BASE_URL`.
- `README.md` and docs are ahead of the actual implementation in several places; they describe the target architecture more than the current delivered state.
- Update this file again when booking pages, listing pages, or real booking-status history are implemented.
