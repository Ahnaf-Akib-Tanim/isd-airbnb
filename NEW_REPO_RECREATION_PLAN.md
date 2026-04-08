# AirBnB New Repo Recreation Plan

Target repo:

`https://github.com/saidul-anam/AirBnB`

Target branches:

- `main`
- `tanim`
- `dulal`
- `rumman`
- `ifty`
- `siam`

This version restarts the reconstruction from a fresh `Phase 0`.

Main changes from the old plan:

- `tanim` adds `.github/workflows/ci-cd.yml` in `Phase 0`
- the workflow is meant to stay unchanged for the whole reconstruction
- `.github/workflows/ci-cd.yml` is removed from `Phase 5`
- branch ownership stays separated to keep merge conflicts near zero

## Core Rules

1. Run all commands from the root of the cloned new repo.
2. Before `git add`, first download the listed files from the actual repo and paste them into the new repo with the same relative paths.
3. Do not copy generated files or local-only files:
   - `frontend/node_modules`
   - `frontend/build`
   - `backend/monolith/target`
   - `frontend/.env.local`
4. Only one person should ever edit `.github/workflows/ci-cd.yml`.
5. After each phase is merged into `main`, everyone must sync `main` back into their own branch.

## Branch Ownership

- `tanim`: bootstrap, repo skeleton, workflow, shared docs, shared frontend shell, shared utils
- `dulal`: user/auth/message backend and auth/profile/inbox frontend
- `rumman`: availability, hosts, listing, homepage, search, map, wishlists
- `ifty`: booking, payment, trips, booking timeline, websocket booking flow
- `siam`: admin, notification, review, deployment/config/docs

## Clean Restart From Current Partial Attempt

If you want a truly fresh restart, all six branches in the new repo should point back to the same clean commit from before the old Phase 0.

Best approach:

1. Find the clean commit in the new repo history.
2. Force-reset `main` to that commit.
3. Force-reset all five working branches to the same commit.
4. Everyone hard-resets local branches to match origin.

### Maintainer reset commands

Replace `CLEAN_COMMIT` with the commit hash from before the old Phase 0.

```powershell
git switch main
git pull origin main
git reset --hard phase-0: bootstrap core repo structure
git push --force origin main

git switch tanim
git reset --hard phase-0: bootstrap core repo structure
git push --force origin tanim

git switch dulal
git reset --hard phase-0: bootstrap core repo structure
git push --force origin dulal

git switch rumman
git reset --hard phase-0: bootstrap core repo structure
git push --force origin rumman

git switch ifty
git reset --hard phase-0: bootstrap core repo structure
git push --force origin ifty

git switch siam
git reset --hard phase-0: bootstrap core repo structure
git push --force origin siam
```

### Everyone resyncs local branches after the reset

```powershell
git fetch --all
git switch main
git reset --hard origin/main
git switch <your-branch>
git reset --hard origin/<your-branch>
```

This also removes the old merge-from-`main` commit that `ifty` already pushed.

## One-Time Clone And Branch Setup

Each person should do this once after the reset is complete.

### Common start

```powershell
git clone https://github.com/saidul-anam/AirBnB.git
cd AirBnB
git fetch --all
git switch main
git pull origin main
```

### Tanim

```powershell
git switch -c tanim --track origin/tanim
git pull origin tanim
```

### Dulal

```powershell
git switch -c dulal --track origin/dulal
git pull origin dulal
```

### Rumman

```powershell
git switch -c rumman --track origin/rumman
git pull origin rumman
```

### Ifty

```powershell
git switch -c ifty --track origin/ifty
git pull origin ifty
```

### Siam

```powershell
git switch -c siam --track origin/siam
git pull origin siam
```

## End-Of-Phase Merge To `main`

After all five people push their work for a phase, merge in this order:

1. `tanim`
2. `dulal`
3. `rumman`
4. `ifty`
5. `siam`

Local merge flow:

```powershell
git switch main
git pull origin main
git merge origin/tanim --no-ff -m "Merge phase work from tanim"
git merge origin/dulal --no-ff -m "Merge phase work from dulal"
git merge origin/rumman --no-ff -m "Merge phase work from rumman"
git merge origin/ifty --no-ff -m "Merge phase work from ifty"
git merge origin/siam --no-ff -m "Merge phase work from siam"
git push origin main
```

## End-Of-Phase Sync For Everyone

Run this after `main` has been updated.

```powershell
git switch main
git pull origin main
git switch <your-branch>
git pull origin <your-branch>
git merge main
git push origin <your-branch>
```

---

## Phase 0 - Fresh Bootstrap By `tanim`

Purpose:

- make GitHub Actions visible from the start
- create the minimum repo skeleton
- create the base backend/frontend structure

### Tanim downloads

- `.github/workflows/ci-cd.yml`
- `.env.example`
- `.gitignore`
- `README.md`
- `docker-compose.yml`
- `package.json`
- `package-lock.json`
- `backend/monolith/Dockerfile`
- `backend/monolith/pom.xml`
- `backend/monolith/src/main/java/com/airbnb/MonolithApplication.java`
- `backend/monolith/src/main/resources/application.yml`
- `frontend/.env.example`
- `frontend/Dockerfile`
- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/public/index.html`
- `frontend/src/App.js`
- `frontend/src/index.css`
- `frontend/src/index.js`

### Tanim push

```powershell
git switch tanim
git pull origin tanim
git add .github/workflows/ci-cd.yml .env.example .gitignore README.md docker-compose.yml package.json package-lock.json backend/monolith/Dockerfile backend/monolith/pom.xml backend/monolith/src/main/java/com/airbnb/MonolithApplication.java backend/monolith/src/main/resources/application.yml frontend/.env.example frontend/Dockerfile frontend/package.json frontend/package-lock.json frontend/public/index.html frontend/src/App.js frontend/src/index.css frontend/src/index.js
git commit -m "phase-0: bootstrap repo and add reconstruction workflow"
git push origin tanim
```

### After Phase 0

1. Merge `tanim` into `main`.
2. Everyone syncs their own branch from `main`.
3. GitHub Actions should start appearing from this point.

---

## Phase 1 - Core Domain Foundations

### ifty downloads

- `MODULAR_MONOLITH_STRUCTURE.md`
- `QUICK_START_GUIDE.md`
- `docs/architecture.md`
- `docs/data-models.md`

### ifty push

```powershell
git switch ifty
git pull origin ifty
git add MODULAR_MONOLITH_STRUCTURE.md QUICK_START_GUIDE.md docs/architecture.md docs/data-models.md
git commit -m "phase-1: add architecture and setup docs"
git push origin ifty
```

### Dulal downloads

- `backend/monolith/src/main/java/com/airbnb/user/model`
- `backend/monolith/src/main/java/com/airbnb/user/repository`
- `backend/monolith/src/main/java/com/airbnb/user/exception`

### Dulal push

```powershell
git switch dulal
git pull origin dulal
git add backend/monolith/src/main/java/com/airbnb/user/model backend/monolith/src/main/java/com/airbnb/user/repository backend/monolith/src/main/java/com/airbnb/user/exception
git commit -m "phase-1: add user models repositories and exceptions"
git push origin dulal
```

### Rumman downloads

- `backend/monolith/src/main/java/com/airbnb/availability/model`
- `backend/monolith/src/main/java/com/airbnb/availability/repository`
- `backend/monolith/src/main/java/com/airbnb/user/seed/HostSeeder.java`
- `sample-5-hosts.txt`

### Rumman push

```powershell
git switch rumman
git pull origin rumman
git add backend/monolith/src/main/java/com/airbnb/availability/model backend/monolith/src/main/java/com/airbnb/availability/repository backend/monolith/src/main/java/com/airbnb/user/seed/HostSeeder.java sample-5-hosts.txt
git commit -m "phase-1: add availability core and host seed data"
git push origin rumman
```

### siam downloads

- `backend/monolith/src/main/java/com/airbnb/booking/model`
- `backend/monolith/src/main/java/com/airbnb/booking/repository/BookingRepository.java`

### siam push

```powershell
git switch siam
git pull origin siam
git add backend/monolith/src/main/java/com/airbnb/booking/model backend/monolith/src/main/java/com/airbnb/booking/repository/BookingRepository.java
git commit -m "phase-1: add booking models and repository"
git push origin siam
```

### tanim downloads

- `backend/monolith/src/main/java/com/airbnb/admin/dto/response`
- `backend/monolith/src/main/java/com/airbnb/notification/model/NotificationRecord.java`
- `backend/monolith/src/main/java/com/airbnb/notification/repository/NotificationRecordRepository.java`
- `backend/monolith/src/main/java/com/airbnb/review/model`
- `backend/monolith/src/main/java/com/airbnb/review/repository/ReviewRepository.java`

### tanim push

```powershell
git switch tanim
git pull origin tanim
git add backend/monolith/src/main/java/com/airbnb/admin/dto/response backend/monolith/src/main/java/com/airbnb/notification/model/NotificationRecord.java backend/monolith/src/main/java/com/airbnb/notification/repository/NotificationRecordRepository.java backend/monolith/src/main/java/com/airbnb/review/model backend/monolith/src/main/java/com/airbnb/review/repository/ReviewRepository.java
git commit -m "admin review and notification core models"
git push origin tanim
```

### After Phase 1

1. Merge all five branches into `main`.
2. Everyone syncs their own branch.

---

## Phase 2 - Backend Controllers, DTOs, And Config

### Tanim downloads

- `backend/monolith/src/main/java/com/airbnb/monolith/config`

### Tanim push

```powershell
git switch tanim
git pull origin tanim
git add backend/monolith/src/main/java/com/airbnb/monolith/config
git commit -m "added monolith configuration"
git push origin tanim
```

### Dulal downloads

- `backend/monolith/src/main/java/com/airbnb/user/dto`
- `backend/monolith/src/main/java/com/airbnb/user/security`

### Dulal push

```powershell
git switch dulal
git pull origin dulal
git add backend/monolith/src/main/java/com/airbnb/user/dto backend/monolith/src/main/java/com/airbnb/user/security
git commit -m "added user dto and security"
git push origin dulal
```

### Rumman downloads

- `backend/monolith/src/main/java/com/airbnb/availability/controller/AvailabilityController.java`
- `backend/monolith/src/main/java/com/airbnb/availability/seed/AvailabilitySeeder.java`
- `frontend/src/services/hostsService.js`
- `frontend/src/utils/hostUtils.js`

### Rumman push

```powershell
git switch rumman
git pull origin rumman
git add backend/monolith/src/main/java/com/airbnb/availability/controller/AvailabilityController.java backend/monolith/src/main/java/com/airbnb/availability/seed/AvailabilitySeeder.java frontend/src/services/hostsService.js frontend/src/utils/hostUtils.js
git commit -m "availability controller seeder and host utilities"
git push origin rumman
```

### Ifty downloads

- `backend/monolith/src/main/java/com/airbnb/booking/config`
- `backend/monolith/src/main/java/com/airbnb/booking/controller/BookingController.java`

### Ifty push

```powershell
git switch ifty
git pull origin ifty
git add backend/monolith/src/main/java/com/airbnb/booking/config backend/monolith/src/main/java/com/airbnb/booking/controller/BookingController.java
git commit -m "booking config and controller"
git push origin ifty
```

### Siam downloads

- `backend/monolith/src/main/java/com/airbnb/admin/controller/AdminVerificationController.java`
- `backend/monolith/src/main/java/com/airbnb/admin/service/AdminVerificationService.java`
- `backend/monolith/src/main/java/com/airbnb/notification/controller/NotificationController.java`
- `backend/monolith/src/main/java/com/airbnb/notification/dto`
- `backend/monolith/src/main/java/com/airbnb/notification/service/NotificationService.java`
- `backend/monolith/src/main/java/com/airbnb/review/controller/ReviewController.java`
- `backend/monolith/src/main/java/com/airbnb/review/service/ReviewService.java`
- `backend/monolith/src/main/java/com/airbnb/review/seed/ReviewSeeder.java`

### Siam push

```powershell
git switch siam
git pull origin siam
git add backend/monolith/src/main/java/com/airbnb/admin/controller/AdminVerificationController.java backend/monolith/src/main/java/com/airbnb/admin/service/AdminVerificationService.java backend/monolith/src/main/java/com/airbnb/notification/controller/NotificationController.java backend/monolith/src/main/java/com/airbnb/notification/dto backend/monolith/src/main/java/com/airbnb/notification/service/NotificationService.java backend/monolith/src/main/java/com/airbnb/review/controller/ReviewController.java backend/monolith/src/main/java/com/airbnb/review/service/ReviewService.java backend/monolith/src/main/java/com/airbnb/review/seed/ReviewSeeder.java
git commit -m "admin notification and review services"
git push origin siam
```

### After Phase 2

1. Merge all five branches into `main`.
2. Everyone syncs their own branch.

---

## Phase 3 - Shared UI And Core Feature Wiring

### Tanim downloads

- `frontend/src/components/Navbar.css`
- `frontend/src/components/Navbar.jsx`
- `frontend/src/components/Footer.css`
- `frontend/src/components/Footer.jsx`
- `frontend/src/components/ErrorBoundary.jsx`

### Tanim push

```powershell
git switch tanim
git pull origin tanim
git add frontend/src/components/Navbar.css frontend/src/components/Navbar.jsx frontend/src/components/Footer.css frontend/src/components/Footer.jsx frontend/src/components/ErrorBoundary.jsx
git commit -m "add shared frontend shell"
git push origin tanim
```

### Dulal downloads

- `backend/monolith/src/main/java/com/airbnb/user/controller/AuthController.java`
- `backend/monolith/src/main/java/com/airbnb/user/controller/UserController.java`
- `backend/monolith/src/main/java/com/airbnb/user/service/UserCollectionMigrationService.java`
- `backend/monolith/src/main/java/com/airbnb/user/service/UserPersistenceService.java`
- `backend/monolith/src/main/java/com/airbnb/user/service/UserService.java`

### Dulal push

```powershell
git switch dulal
git pull origin dulal
git add backend/monolith/src/main/java/com/airbnb/user/controller/AuthController.java backend/monolith/src/main/java/com/airbnb/user/controller/UserController.java backend/monolith/src/main/java/com/airbnb/user/service/UserCollectionMigrationService.java backend/monolith/src/main/java/com/airbnb/user/service/UserPersistenceService.java backend/monolith/src/main/java/com/airbnb/user/service/UserService.java
git commit -m "add user controllers and services"
git push origin dulal
```

### Rumman downloads

- `frontend/src/pages/HomePage.jsx`
- `frontend/src/pages/SearchPage.css`
- `frontend/src/pages/SearchPage.jsx`

### Rumman push

```powershell
git switch rumman
git pull origin rumman
git add frontend/src/pages/HomePage.jsx frontend/src/pages/SearchPage.css frontend/src/pages/SearchPage.jsx
git commit -m "add homepage and search pages"
git push origin rumman
```

### Ifty downloads

- `backend/monolith/src/main/java/com/airbnb/booking/service/BookingService.java`
- `backend/monolith/src/main/java/com/airbnb/booking/service/WebSocketService.java`
- `frontend/src/context/WebSocketContext.js`
- `frontend/src/services/bookingService.js`

### Ifty push

```powershell
git switch ifty
git pull origin ifty
git add backend/monolith/src/main/java/com/airbnb/booking/service/BookingService.java backend/monolith/src/main/java/com/airbnb/booking/service/WebSocketService.java frontend/src/context/WebSocketContext.js frontend/src/services/bookingService.js
git commit -m "add booking services and websocket flow"
git push origin ifty
```

### Siam downloads

- `frontend/src/pages/AdminLoginPage.jsx`
- `frontend/src/pages/AdminVerificationPage.jsx`

### Siam push

```powershell
git switch siam
git pull origin siam
git add frontend/src/pages/AdminLoginPage.jsx frontend/src/pages/AdminVerificationPage.jsx
git commit -m "add admin pages"
git push origin siam
```

### After Phase 3

1. Merge all five branches into `main`.
2. Everyone syncs their own branch.

---

## Phase 4 - Main User-Facing Pages

### Tanim downloads

- `frontend/src/utils/apiUtils.js`
- `frontend/src/utils/axiosConfig.js`
- `frontend/src/utils/performanceUtils.js`

### Tanim push

```powershell
git switch tanim
git pull origin tanim
git add frontend/src/utils/apiUtils.js frontend/src/utils/axiosConfig.js frontend/src/utils/performanceUtils.js
git commit -m "add shared api utilities"
git push origin tanim
```

### Dulal downloads

- `frontend/src/context/AuthContext.jsx`
- `frontend/src/services/authService.js`
- `frontend/src/services/userService.js`
- `frontend/src/pages/LoginPage.jsx`
- `frontend/src/pages/RegisterPage.jsx`
- `frontend/src/pages/ForgotPasswordPage.jsx`
- `frontend/src/pages/VerifyEmailPage.jsx`

### Dulal push

```powershell
git switch dulal
git pull origin dulal
git add frontend/src/context/AuthContext.jsx frontend/src/services/authService.js frontend/src/services/userService.js frontend/src/pages/LoginPage.jsx frontend/src/pages/RegisterPage.jsx frontend/src/pages/ForgotPasswordPage.jsx frontend/src/pages/VerifyEmailPage.jsx
git commit -m "add auth pages and services"
git push origin dulal
```

### Rumman downloads

- `frontend/src/pages/ListingDetailsPage.css`
- `frontend/src/pages/ListingDetailsPage.jsx`
- `frontend/src/pages/HostDashboardPage.css`
- `frontend/src/pages/HostDashboardPage.jsx`
- `frontend/src/components/HostLocationMap.jsx`

### Rumman push

```powershell
git switch rumman
git pull origin rumman
git add frontend/src/pages/ListingDetailsPage.css frontend/src/pages/ListingDetailsPage.jsx frontend/src/pages/HostDashboardPage.css frontend/src/pages/HostDashboardPage.jsx frontend/src/components/HostLocationMap.jsx
git commit -m "add listing and host dashboard pages"
git push origin rumman
```

### Ifty downloads

- `frontend/src/pages/ReservationPage.css`
- `frontend/src/pages/ReservationPage.jsx`
- `frontend/src/pages/PaymentPage.css`
- `frontend/src/pages/PaymentPage.jsx`
- `frontend/src/pages/MyBookingsPage.css`
- `frontend/src/pages/MyBookingsPage.jsx`

### Ifty push

```powershell
git switch ifty
git pull origin ifty
git add frontend/src/pages/ReservationPage.css frontend/src/pages/ReservationPage.jsx frontend/src/pages/PaymentPage.css frontend/src/pages/PaymentPage.jsx frontend/src/pages/MyBookingsPage.css frontend/src/pages/MyBookingsPage.jsx
git commit -m "reservation payment and bookings pages"
git push origin ifty
```

### Siam downloads

- `frontend/src/pages/AdminBookingsPage.css`
- `frontend/src/pages/AdminBookingsPage.jsx`
- `frontend/src/components/NotificationBell.jsx`
- `frontend/src/services/notificationService.js`

### Siam push

```powershell
git switch siam
git pull origin siam
git add frontend/src/pages/AdminBookingsPage.css frontend/src/pages/AdminBookingsPage.jsx frontend/src/components/NotificationBell.jsx frontend/src/services/notificationService.js
git commit -m "admin bookings and notifications frontend"
git push origin siam
```

### After Phase 4

1. Merge all five branches into `main`.
2. Everyone syncs their own branch.

---

## Phase 5 - Final Feature Completion And Deployment Files

### Tanim downloads

- `LastUpdate.md`
- `how_to_run.txt`
- `frontend/src/components/ProtectedRoute.jsx`
- `frontend/src/utils/fileUtils.js`
- `frontend/src/utils/imageUtils.js`

### Tanim push

```powershell
git switch tanim
git pull origin tanim
git add LastUpdate.md how_to_run.txt frontend/src/components/ProtectedRoute.jsx frontend/src/utils/fileUtils.js frontend/src/utils/imageUtils.js
git commit -m "phase-5: add protected route utilities and run notes"
git push origin tanim
```

### Dulal downloads

- `backend/monolith/src/main/java/com/airbnb/user/controller/MessageController.java`
- `backend/monolith/src/main/java/com/airbnb/user/service/MessageService.java`
- `backend/monolith/src/main/java/com/airbnb/user/service/SupabaseStorageService.java`
- `frontend/src/pages/ProfilePage.jsx`
- `frontend/src/pages/InboxPage.css`
- `frontend/src/pages/InboxPage.jsx`
- `frontend/src/services/messageService.js`
- `frontend/src/context/AuthContext.test.jsx`
- `frontend/src/services/authService.test.js`

### Dulal push

```powershell
git switch dulal
git pull origin dulal
git add backend/monolith/src/main/java/com/airbnb/user/controller/MessageController.java backend/monolith/src/main/java/com/airbnb/user/service/MessageService.java backend/monolith/src/main/java/com/airbnb/user/service/SupabaseStorageService.java frontend/src/pages/ProfilePage.jsx frontend/src/pages/InboxPage.css frontend/src/pages/InboxPage.jsx frontend/src/services/messageService.js frontend/src/context/AuthContext.test.jsx frontend/src/services/authService.test.js
git commit -m "add messaging profile inbox and tests"
git push origin dulal
```

### Rumman downloads

- `frontend/src/components/SearchResultsMap.css`
- `frontend/src/components/SearchResultsMap.jsx`
- `frontend/src/pages/WishlistsPage.css`
- `frontend/src/pages/WishlistsPage.jsx`

### Rumman push

```powershell
git switch rumman
git pull origin rumman
git add frontend/src/components/SearchResultsMap.css frontend/src/components/SearchResultsMap.jsx frontend/src/pages/WishlistsPage.css frontend/src/pages/WishlistsPage.jsx
git commit -m "add search results map and wishlists"
git push origin rumman
```

### Ifty downloads

- `frontend/src/components/BookingTimeline.css`
- `frontend/src/components/BookingTimeline.jsx`
- `frontend/src/pages/BookingDetailsPage.css`
- `frontend/src/pages/BookingDetailsPage.jsx`
- `frontend/src/pages/CustomerTripsPage.css`
- `frontend/src/pages/CustomerTripsPage.jsx`

### Ifty push

```powershell
git switch ifty
git pull origin ifty
git add frontend/src/components/BookingTimeline.css frontend/src/components/BookingTimeline.jsx frontend/src/pages/BookingDetailsPage.css frontend/src/pages/BookingDetailsPage.jsx frontend/src/pages/CustomerTripsPage.css frontend/src/pages/CustomerTripsPage.jsx
git commit -m "booking timeline details and trips"
git push origin ifty
```

### Siam downloads

- `frontend/src/components/ReviewsSection.css`
- `frontend/src/components/ReviewsSection.jsx`
- `frontend/src/services/reviewService.js`
- `render.yaml`
- `frontend/vercel.json`
- `frontend/nginx.conf`
- `nginx/nginx.conf`
- `docs/github-setup.md`

### Siam push

```powershell
git switch siam
git pull origin siam
git add frontend/src/components/ReviewsSection.css frontend/src/components/ReviewsSection.jsx frontend/src/services/reviewService.js render.yaml frontend/vercel.json frontend/nginx.conf nginx/nginx.conf docs/github-setup.md
git commit -m "reviews deployment and github setup files"
git push origin siam
```

### After Phase 5

1. Merge all five branches into `main`.
2. Everyone syncs their own branch.
3. Final check:

```powershell
git switch main
git pull origin main
git status
```

If all phases are followed in order, the new repo structure will match the actual repo while keeping branch ownership clear and merge conflicts very low.
