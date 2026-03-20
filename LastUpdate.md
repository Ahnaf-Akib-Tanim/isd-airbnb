## ISD Airbnb - Progress Log

**Last updated:** 2026-03-20 15:30:36 +06:00  
**Active workstreams:** `develop`, `feature/user/initial-setup`, `feature/frontend/initial-setup`, `feature/admin/initial-setup`

---

### Current repo state

- The repository structure is in place for a full microservice-based Airbnb clone:
  - `backend/` contains `api-gateway` plus 8 domain services.
  - `frontend/` contains a React SPA with auth-aware routing and a styled landing page.
  - `.github/workflows/ci-cd.yml`, `docker-compose.yml`, and the docs folder are already set up.

- Actual implementation status is still uneven, but the user-related foundation is now much stronger:
  - `user-service` now covers auth, profile management, admin-approved verification requests, profile image storage, and realistic host onboarding data.
  - `api-gateway` has route configuration and CORS setup.
  - `notification-service` now has an internal notification endpoint and persistence layer for verification/admin review records.
  - `booking-service`, `payment-service`, `listing-service`, `availability-service`, `search-service`, and `admin-service` are still mostly scaffolds.
  - Those remaining scaffold services currently have a Spring Boot entry class plus config, but little or no domain logic yet.

- Generated / dependency folders exist locally:
  - `frontend/node_modules/` is installed.
  - Some backend `target/` folders exist from local builds.
  - These are build artifacts, not handwritten project implementation.

---

### Latest update on 2026-03-20 15:30:36 +06:00

- **Admin verification queue backend implemented**
  - `backend/admin-service` now has JWT auth (`JwtUtil`, `JwtAuthFilter`, `SecurityConfig`).
  - `AdminVerificationController` + `AdminVerificationService` provide moderation endpoints and merge pending requests from `notification-service` with fallback pending profiles from `user-service`.
- **Notification-service moderation workflow updated**
  - Added DTOs and updated the verification status lifecycle (create + update status, and safe read/resolve fields).
- **User-service verification refactor completed**
  - Email-token verification artifacts (`EmailVerificationToken*`) removed.
  - Verification status now flows through admin approval/rejection decision APIs.
  - Role-based persistence and legacy migration are in place (`UserPersistenceService`, `UserCollectionMigrationService`).
- **Frontend admin + notification UI added**
  - Added `/admin/login` and an admin verification queue page.
  - Added navbar `NotificationBell` with polling + mark-as-read behavior.
  - Added host location/map UI so admin cards can show detailed coordinates and structured address.
- **Verification**
  - `frontend`: rebuild required
  - `backend/admin-service`: build required
  - `backend/notification-service`: build required

---

### Latest update on 2026-03-20 12:25:00 +06:00

- **User storage split into role-based Mongo collections**
  - `user-service` no longer treats all accounts as one persistence bucket.
  - It now stores accounts into separate collections in `userdb` based on role:
    - `guests`
    - `hosts`
    - `admins`
  - A startup migration service was added to move legacy documents from the old `users` collection into the correct role collection and then drop the legacy collection.

- **User-service persistence layer refactored**
  - `user-service` now uses a dedicated persistence service built on `MongoTemplate` for cross-collection lookup by:
    - email
    - userId
    - all users
  - This keeps auth and admin flows working even though user data is now split by role.

- **Host schema expanded for listing-ready onboarding**
  - Host records now include:
    - `guestCapacity`
    - `bedCount`
    - `bedTypes`
    - `nightlyRateUsd`
    - `reviewCount`
  - Existing review-related fields like `averageRating` remain available for later review-system work.

- **Favorites support added for users**
  - User profiles now include `favoriteHostIds`, but this is guest-only data.
  - `HOST` and `ADMIN` accounts do not keep host favourites; that field is ignored and cleared for non-guest roles.

- **Frontend host forms aligned with the new backend contract**
  - Registration and profile-edit flows now send:
    - guest capacity
    - bed count
    - bed types
    - nightly USD rate
  - These are now required for host signup and persisted in the `hosts` collection.

- **Verification**
  - `backend/user-service`: build passed
  - `frontend`: build passed

---

### Latest update on 2026-03-20 10:58:00 +06:00

- **Gateway CORS duplication fixed**
  - The API gateway now deduplicates `Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials` response headers.
  - This fixes the browser error where login through `http://localhost:8080` failed because duplicate CORS headers were present.

- **Admin queue internal authorization fixed**
  - `admin-service` now forwards the admin bearer token when it loads user profiles from `user-service`.
  - This fixes a failure mode where verification notifications existed but queue rows were skipped because internal profile reads were unauthorized.

- **Notification bell no longer spams toast popups**
  - Polling still updates the bell badge and pulse animation.
  - Repeated frontend toast popups for the same pending notification were removed.

- **Frontend shell cleanup**
  - Added an inline favicon to remove the missing `favicon.ico` 404.

- **Verification**
  - `frontend`: rebuild required
  - `backend/admin-service`: rebuild required
  - `backend/api-gateway`: rebuild required

---

### Latest update on 2026-03-20 10:40:00 +06:00

- **Navbar notification bell system added**
  - Logged-in users now get a bell icon in the navbar.
  - The bell polls `notification-service` and shows a badge when unread notifications exist.
  - When new notifications arrive after the page is already open, the bell animates and a toast alert is shown.

- **Role-aware notification feed added**
  - Admin users now see admin-role notifications such as new verification requests.
  - Guest and host users now see their own personal notifications such as verification submitted, approved, or rejected.
  - The dropdown behaves like a lightweight inbox and shows recent notifications in a Facebook-style list.

- **Safe read tracking added for notifications**
  - `notification-service` now exposes a dedicated `PUT /api/notifications/{notificationId}/read` endpoint.
  - This uses `readAt` safely instead of overloading the admin workflow status field.
  - That keeps admin verification requests visible in the queue while still letting the bell clear unread state.

- **Navbar route cleanup**
  - The public dropdown `Become a Host` option now routes to `/register?role=HOST` instead of the guest path.

- **Verification**
  - `frontend`: production build passed
  - `backend/notification-service`: build still needs to be rerun after the new read endpoint change

---

### Latest update on 2026-03-20 10:10:00 +06:00

- **Admin verification queue routing bug fixed**
  - `frontend/.env.local` had overridden `REACT_APP_API_BASE_URL` to `http://localhost:8081`.
  - That caused the admin UI to bypass the API gateway and call the wrong backend host directly.
  - The override now points back to `http://localhost:8080`, so admin queue requests go through the gateway again.

- **Admin queue backend hardened against stale verification records**
  - `admin-service` now skips broken notification-backed records instead of failing the whole queue load.
  - It also filters queue items so only still-pending, still-unverified users are shown.
  - If notification lookup or user-profile lookup fails for one record, the rest of the queue still loads.

- **Admin queue frontend stabilized for recovered pending users**
  - Queue rows that come from `user-service` without a notification id now use the user id as a stable fallback key.
  - This prevents action-state collisions and keeps approve/reject interactions working for recovered pending users.

- **Verification**
  - `frontend`: production build passed
  - `backend/admin-service`: build passed

---

### Latest update on 2026-03-20 01:20:00 +06:00

- **Docker stack switched to Atlas-only MongoDB configuration**
  - `docker-compose.yml` no longer starts a local `mongodb` container.
  - All backend services now read their Mongo URI directly from `MONGO_URI_*` environment variables.
  - This means new application data should go to Atlas instead of a local Docker volume, provided the `.env` file contains valid Atlas URIs.

- **Run instructions updated for Atlas-only mode**
  - `.env.example` now documents the Atlas-first setup more explicitly.
  - `how_to_run.txt` now reflects the required `.env` + `docker-compose up --build` flow for Atlas-backed development.

- **Remaining operational requirement**
  - Atlas IP allowlist and credentials still need to be valid for the machine running Docker.
  - If Atlas blocks the connection, the code is configured correctly but the containers will still fail at runtime.
### Latest update on 2026-03-20 01:05:00 +06:00

- **Admin entry removed from the generic user UI**
  - The navbar no longer exposes an `Admin login` option to normal visitors.
  - Admin access remains available only by direct route: `/admin/login`.

- **Guest and host entry paths now preset different signup modes**
  - `Become a Host` now routes to `/register?role=HOST`.
  - Generic signup routes now use `/register?role=GUEST`.
  - The register page now reads the route query and preselects the correct account type automatically.

- **Database visibility clarified**
  - The Docker stack is still configured to use the local Mongo container by default.
  - New signups created in the running local stack will not appear in an online Atlas database unless the `MONGO_URI_*` environment variables are explicitly pointed there.
### Latest update on 2026-03-20 00:50:52 +06:00

- **Admin queue now recovers pending users even without notification records**
  - `admin-service` no longer depends only on notification documents for the verification queue.
  - It now merges:
    - open `ACCOUNT_VERIFICATION_REQUEST` notifications
    - users from `user-service` whose profile state is still `PENDING` and not verified
  - This fixes the case where older users existed in `user-service` but never appeared in the admin queue because their notification record was missing or created before the queue flow was fully in place.

- **Admin-only menu cleanup**
  - Admin dropdown no longer shows regular-user items like `My Bookings`.
  - For the admin role, the important working item is now the verification queue.

- **Admin login/session UX clarified**
  - If an admin session is already stored in the browser, visiting `/admin/login` redirects straight to the admin queue instead of pretending no one is signed in.
  - If a non-admin user is already signed in and opens `/admin/login`, the page now clearly asks them to log out first.

- **Build verification**
  - `backend/admin-service`: build passed again after queue fallback changes.
  - `frontend`: production build passed again after admin session/menu cleanup.

### Latest update on 2026-03-20 00:39:32 +06:00

- **Dedicated admin login UI added**
  - Frontend now has a separate admin login page at `/admin/login`.
  - Unauthenticated access to the admin verification queue now redirects to `/admin/login` instead of the generic user login page.
  - Guest-facing navbar dropdown now includes an `Admin login` entry for direct access.

- **Host signup validation bug fully cleaned up**
  - Remaining host validators for:
    - `hostingSince`
    - `preferredCheckInTime`
    - `preferredCheckOutTime`
    now return proper booleans instead of raw strings.
  - This removes the false red-field blocking that still persisted after the earlier host validation fix.

- **Build verification**
  - `frontend`: production build passed again after admin-login and validator cleanup.

### Latest update on 2026-03-19 23:19:29 +06:00

- **Detailed host location data is now part of user-service**
  - Host registration and profile data now persist:
    - `street`
    - `area`
    - `village`
    - `district`
    - `division`
    - `city`
    - `country`
    - `zipCode`
    - `latitude`
    - `longitude`
  - For hosts, structured location plus map coordinates are now mandatory.
  - This gives future listing, availability, and search flows realistic location input instead of a flat profile only.

- **Host signup now includes a real interactive map**
  - The host registration page now has a wider two-column layout.
  - A map is shown on the right side using OpenStreetMap via Leaflet.
  - Hosts can click to drop a pin and save coordinates.
  - Reverse geocoding is attempted to auto-fill address fields, but fields remain editable for correction.

- **Profile editing now supports mapped host locations**
  - Hosts can update their saved location later from the profile page.
  - The profile page now exposes the same structured address fields and map picker used during signup.

- **A separate admin verification UI is now implemented**
  - Frontend now includes an admin-only verification queue page:
    - `/admin/verification-requests`
  - Admins can:
    - load pending verification requests
    - review host identity and hosting details
    - review detailed location data and coordinates
    - inspect uploaded host/room images
    - approve or reject with a note
  - Navbar now exposes a `Verification Queue` entry for logged-in admins.

- **Frontend auth state now tracks access eligibility**
  - Stored frontend auth state now also keeps `canBook` and `canHost`.
  - This keeps UI gating aligned with backend verification logic as more guest/host flows are added.

- **Build verification**
  - `backend/user-service`: build passed
  - `backend/admin-service`: build passed
  - `frontend`: production build passed

### Latest update on 2026-03-19 20:34:25 +06:00

### Latest update on 2026-03-19 22:29:13 +06:00

- **Host signup validation bug fixed**
  - The host registration form had frontend validators that returned the entered text itself.
  - In `react-hook-form`, returning a string from `validate` is treated as an error message, which is why valid host fields were still turning red and blocking submit.
  - Host-required fields now return proper booleans, so valid phone, host display name, host intro, property type, offering highlights, and house rules no longer get flagged incorrectly.
  - Frontend production build was rerun successfully after this fix.

### Latest update on 2026-03-19 22:09:55 +06:00

- **Docker local stack was corrected to include MongoDB**
  - `docker-compose.yml` now starts a dedicated `mongodb` container for the local stack.
  - Service Mongo URIs now point to `mongodb:27017` inside the Docker network instead of `host.docker.internal:27017`.
  - This avoids the repeated container startup warnings and health-check failures caused by missing host-level MongoDB.

- **Admin service no longer receives stray Mongo environment config in Compose**
  - `admin-service` itself does not need a MongoDB URI for the current moderation/orchestration design.
  - The compose-level Mongo env was removed from `admin-service` to keep the container wiring aligned with its real responsibility.

- **Local Docker run expectation is now clearer**
  - Running `docker-compose up --build` should provision MongoDB as part of the stack instead of assuming a separate local Mongo install.
  - If old containers are still present, recreate the stack so the new `mongodb` service and updated env values take effect.

- **Signup reliability and UI shell cleanup**
  - `user-service` notification dispatch now uses a short timeout so registration does not hang if `notification-service` is down.
  - `user-service` now logs generic backend exceptions, so real signup failures are easier to diagnose from the console.
  - Frontend router future flags were enabled to remove React Router v7 warning noise in development.
  - Frontend shell branding was simplified toward `Airbnb`, and the missing favicon reference was removed to avoid the 404 in development.

- **Admin verification workflow added**
  - `admin-service` now acts as the verification moderation layer.
  - It can:
    - list pending verification requests from `notification-service`
    - approve verification requests through `user-service`
    - reject verification requests through `user-service`
    - proxy admin user listing
  - New admin endpoints:
    - `GET /api/admin/verification-requests`
    - `PUT /api/admin/verification-requests/{userId}/approve`
    - `PUT /api/admin/verification-requests/{userId}/reject`
    - `GET /api/admin/users`

- **Booking/hosting eligibility is now exposed from user-service**
  - `user-service` now returns `canBook` and `canHost` based on verification and account status.
  - New access endpoints:
    - `GET /api/users/me/access`
    - `GET /api/users/{userId}/access`
  - Current rule:
    - no guest or host should get booking/hosting eligibility unless verified
    - `canBook = ACTIVE + verified`
    - `canHost = HOST + ACTIVE + verified`

- **Verification flow changed from email-link verification to admin approval**
  - Verification is no longer based on SMTP email links.
  - New accounts now create an internal verification request for admin review.
  - Admin-oriented endpoints were added:
    - `PUT /api/users/admin/{userId}/approve-verification`
    - `PUT /api/users/admin/{userId}/reject-verification`
  - User profile data now exposes:
    - `emailVerified`
    - `verificationStatus`
    - `verificationRequestedAt`
    - `verifiedAt`

- **Notification service was converted into an internal notification system**
  - `notification-service` now stores admin review requests and user-facing verification notifications.
  - It supports internal notification creation, querying by user/role/type, and status updates.
  - `user-service` now uses it for:
    - verification request creation
    - verification re-request
    - approval notification
    - rejection notification

- **User signup now supports profile image upload**
  - Registration accepts a profile image and stores it on the user document as a data URL for now.
  - The top-right navbar avatar now uses the signed-in user's profile image instead of a generic placeholder when available.

- **Verification request flow added**
  - Registration now creates a verification review request during signup.
  - `POST /api/users/me/resend-verification` now re-requests admin review, not email delivery.
  - Frontend now shows request status instead of saying "verification email sent".

- **Notification service is now implemented at a practical baseline**
  - `notification-service` now exposes internal notification endpoints.
  - It stores notification records in MongoDB.
  - `user-service` now calls it after registration, resend-verification, approval, and rejection.
  - This is enough for auth/admin-approval flows now, and can be expanded later for booking/payment notifications.

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
    - `PUT /api/users/admin/{userId}/approve-verification`
    - `PUT /api/users/admin/{userId}/reject-verification`
    - `GET /api/users/me/access`
    - `GET /api/users/{userId}/access`
  - DTOs, repository, exception handling, and JWT filter/util classes are present.
  - User profile data now includes role, status, contact fields, email verification flags, profile image, realistic host onboarding fields, and timestamps like `createdAt`, `updatedAt`, and `lastLoginAt`.

- **Frontend user flow (`frontend/src`)**
  - Public pages implemented: home, register, login.
  - Verification page implemented: legacy verification-route messaging.
  - Protected page implemented: profile.
  - `AuthContext` manages login/register/logout, localStorage hydration, role helpers, and user updates.
  - `authService` calls the API gateway at `/api/users/**`.
  - Navbar reacts to auth state and now shows the user's profile image in the small top-right circle when available.
  - Register page now supports profile image upload and realistic host signup fields.
  - Profile page loads `/api/users/me` and supports profile editing, password change, host info updates, and verification re-request.
  - Home page now uses a single user-facing `Trips and hosting` card instead of project-marketing placeholders.
  - Frontend unit tests exist for `AuthContext` and `authService`.

- **Infra and platform setup**
  - API Gateway routes `/api/users/**`, `/api/bookings/**`, `/api/payments/**`, `/api/listings/**`, `/api/availability/**`, `/api/search/**`, `/api/notifications/**`, and `/api/admin/**`.
  - `docker-compose.yml` wires all services together and now has safer local defaults for service Mongo URIs and JWT config.
  - GitHub Actions pipeline is configured for backend build/test, frontend build, and Docker image build/push.

- **Notification service backend (`backend/notification-service`)**
  - Internal notification creation/query/update endpoints are now implemented.
  - Notification records are persisted for later audit/history use.
  - This service can be reused later for booking status alerts, payment updates, and admin notifications.

- **Admin service backend (`backend/admin-service`)**
  - Admin JWT-protected moderation endpoints are now implemented.
  - It orchestrates verification review between `notification-service` and `user-service`.
  - This is the backend base for a future admin dashboard page.

---

### What is still left

- **User service remaining work**
  - Add backend tests for `user-service`. There are currently no Java test classes in the repo.
  - Add frontend/admin screens for listing all users, suspend, and activate actions.
  - Add frontend/admin screens for viewing verification requests and approving/rejecting them.
  - Add proper file storage later for profile/host images instead of keeping data URLs in Mongo documents.
  - Add forgot-password / reset-password flow.
  - Add validation/size restrictions and image-type checks for uploaded images.
  - Add stronger access-control separation for future host-only and admin-only actions.

- **Frontend gaps**
  - Routes for `/my-listings` and `/bookings` are referenced from the wider UI plan, but there is no completed listings or bookings page yet.
  - There is no real listing, search, booking, payment, admin, or notification page yet.
  - There is still no admin UI for verification-review notifications.
  - Frontend unit tests still need cleanup around current axios/Jest mocking and broader page coverage.

- **Other microservices**
  - Booking service logic is not implemented yet even though the docs describe the lifecycle in detail.
  - Payment, listing, availability, search, and admin services are still setup-only.
  - `notification-service` now has a usable baseline, but still needs richer inbox UX, authorization, and event-specific flows.
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
  - frontend admin verification dashboard
  - booking/listing services should consume `canBook` / `canHost` rules
  - notification expansion for booking/payment events
- Docker note:
  - compose warnings for missing service env vars were reduced by adding defaults
  - if `dockerDesktopLinuxEngine` is missing, Docker Desktop itself is not running yet
  - scaffold service Maven files were normalized so Docker is less likely to fail on invalid test dependencies during `mvn dependency:go-offline`
- Update this file again after each major backend/frontend milestone with a timestamp, what changed, what remains, and what comes next.
