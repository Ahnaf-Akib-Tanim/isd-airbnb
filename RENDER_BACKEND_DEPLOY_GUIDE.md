# Render Backend Deploy Guide

This guide is for deploying the backend monolith to Render as a beginner.

The backend is already prepared for Render with [`render.yaml`](./render.yaml) and the Docker image definition in [`backend/monolith/Dockerfile`](./backend/monolith/Dockerfile).

This guide deploys only the backend to Render.

## Before You Start

You need:

- a Render account
- your project pushed to GitHub
- your existing backend secrets from your local `.env`

Important:

- do not create new MongoDB or Supabase credentials if you already have working ones
- use the same existing values you are already using locally
- do not commit real secrets to GitHub

## What Render Will Deploy

Render will create one web service:

- service name: `isd-airbnb-monolith`
- runtime: Docker
- region: `singapore`
- health check: `/actuator/health`

The application already reads Render's `PORT` automatically.

## Step 1: Push Your Latest Code to GitHub

From your project root:

```powershell
git add -A
git commit -m "Prepare backend for Render deployment"
git push origin main
```

If you already committed everything, just run:

```powershell
git push origin main
```

## Step 2: Sign In to Render

1. Go to `https://render.com`
2. Log in
3. Open the Render dashboard

## Step 3: Create the Backend Service from `render.yaml`

This is the easiest option because the repo already contains the Render config.

1. In Render, click `New +`
2. Click `Blueprint`
3. Connect your GitHub account if Render asks
4. Select this GitHub repository
5. Render should detect the root `render.yaml`
6. Click `Apply`

If Render asks for confirmation of the service settings, keep the detected values.

## Step 4: Add the Environment Variables in Render

Render will ask for the secret variables listed in `render.yaml`.

Use the values from your current working local `.env`.

Add these variables:

- `JWT_SECRET`
- `JWT_EXPIRY`
- `JWT_REFRESH_EXPIRY`
- `MONGO_URI_USER`
- `MONGO_URI_BOOKING`
- `MONGO_URI_REVIEWS`
- `MONGO_URI_NOTIFICATION`
- `MONGO_URI_AVAILABILITY`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `FRONTEND_BASE_URL`

Notes:

- `JWT_EXPIRY` can stay `86400000`
- `JWT_REFRESH_EXPIRY` can stay `604800000`
- `FRONTEND_BASE_URL` should be your frontend URL
- if your frontend is not deployed yet, you can temporarily set `FRONTEND_BASE_URL=http://localhost:3000`

When your Vercel frontend is live, update `FRONTEND_BASE_URL` to something like:

```text
https://your-frontend-name.vercel.app
```

Do not add a trailing slash.

## Step 5: Start the First Deploy

After the environment variables are added:

1. Click `Create Blueprint` or `Apply`
2. Render will start building the Docker image
3. Wait for the deploy logs to finish

The first deploy can take several minutes.

## Step 6: Check That the Backend Is Healthy

When the deploy finishes, open the service page in Render.

Check:

- status should be `Live`
- the health check should pass

Then open:

```text
https://your-render-backend-url.onrender.com/actuator/health
```

You should see something like:

```json
{"status":"UP"}
```

Optional check:

```text
https://your-render-backend-url.onrender.com/swagger-ui/index.html
```

If Swagger loads, the backend is running correctly.

## Step 7: Connect the Frontend to the Render Backend

After the backend is live, copy the Render backend URL.

In Vercel, set:

- `REACT_APP_API_BASE_URL=https://your-render-backend-url.onrender.com`

Then redeploy the frontend.

Also go back to Render and set:

- `FRONTEND_BASE_URL=https://your-vercel-frontend-url.vercel.app`

Then redeploy the backend once so CORS matches the real frontend URL.

## Step 8: Test the Main Flows

After backend and frontend are connected, test:

1. Home page loads listings
2. Search page returns results
3. Listing details page loads
4. Map appears on listing details
5. Login/register works
6. Reservation flow reaches the backend

## Step 9: How Future Deploys Work

This repo is already configured so Render auto-deploys on backend-related commits.

Backend rebuilds will trigger when these change:

- anything inside `backend/monolith`
- `render.yaml`

Frontend-only commits should not trigger a backend rebuild on Render.

## If Deployment Fails

### Case 1: Build fails

Open the Render logs and check for:

- missing environment variables
- invalid MongoDB connection strings
- invalid Supabase values

### Case 2: Service deploys but health check fails

Check:

- `PORT` is not hardcoded anywhere else
- `/actuator/health` returns `UP`
- all MongoDB URIs are valid

### Case 3: Frontend cannot call backend

Check:

- `REACT_APP_API_BASE_URL` in Vercel
- `FRONTEND_BASE_URL` in Render
- browser console for CORS errors

### Case 4: Free plan sleeps

On the free plan, Render can spin down after inactivity.

That means:

- the first request after idle time can be slow
- later requests are faster after the service wakes up

## Manual Redeploy Later

If you change only Render environment variables:

1. open the service in Render
2. click `Manual Deploy`
3. choose `Deploy latest commit`

## Files You Should Know

- [`render.yaml`](./render.yaml)
- [`backend/monolith/Dockerfile`](./backend/monolith/Dockerfile)
- [`backend/monolith/src/main/resources/application.yml`](./backend/monolith/src/main/resources/application.yml)
- [`.env.example`](./.env.example)
- [`frontend/.env.example`](./frontend/.env.example)

## Quick Checklist

Before clicking deploy, make sure:

- code is pushed to GitHub
- `render.yaml` is in the repo root
- all required env vars are added in Render
- MongoDB Atlas allows Render to connect
- `FRONTEND_BASE_URL` is correct

After deploy, make sure:

- `/actuator/health` says `UP`
- frontend points to the Render backend URL
- login/search/listing pages work
