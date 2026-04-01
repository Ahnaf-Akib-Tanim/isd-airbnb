# Vercel Frontend Deploy Guide

This guide is for deploying the React frontend to Vercel as a beginner.

This project's frontend lives in [`frontend`](./frontend).

The frontend is a Create React App project and is already prepared for Vercel with [`frontend/vercel.json`](./frontend/vercel.json).

This guide deploys only the frontend to Vercel.

## Before You Start

You need:

- a Vercel account
- your project pushed to GitHub
- the Render backend URL after your backend is deployed

For this project, the most important frontend environment variable is:

- `REACT_APP_API_BASE_URL`

Example:

```text
https://isd-airbnb-monolith.onrender.com
```

Do not add a trailing slash.

## What Vercel Will Deploy

Vercel will deploy the React app from:

- root directory: `frontend`

Important files:

- [`frontend/package.json`](./frontend/package.json)
- [`frontend/vercel.json`](./frontend/vercel.json)
- [`frontend/.env.example`](./frontend/.env.example)

The SPA rewrite is already configured so routes like `/search` and `/rooms/...` work after refresh.

## Step 1: Push Your Latest Code to GitHub

From the project root:

```powershell
git add -A
git commit -m "Prepare frontend for Vercel deployment"
git push origin main
```

If your changes are already committed, just run:

```powershell
git push origin main
```

## Step 2: Sign In to Vercel

1. Go to `https://vercel.com`
2. Sign in
3. Open your dashboard

## Step 3: Import the GitHub Repository

1. In Vercel, click `Add New...`
2. Click `Project`
3. Import your GitHub repository
4. If Vercel asks for GitHub access, allow it

## Step 4: Configure the Project Correctly

When Vercel shows the project settings, set these values:

- Framework Preset: `Create React App`
- Root Directory: `frontend`

If Vercel does not auto-detect correctly, set manually:

- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

Do not point Vercel at the repo root for this frontend deployment.

It should use the `frontend` folder.

## Step 5: Add the Frontend Environment Variable

Before deploying, add:

- `REACT_APP_API_BASE_URL`

Value:

```text
https://your-render-backend-url.onrender.com
```

Example:

```text
https://isd-airbnb-monolith.onrender.com
```

How to add it:

1. In the Vercel project setup page, find `Environment Variables`
2. Add:
   - Name: `REACT_APP_API_BASE_URL`
   - Value: your Render backend URL
3. Apply it to:
   - `Production`
   - `Preview`
   - optionally `Development`

If the project is already created, you can later add it from:

- `Project Settings`
- `Environment Variables`

## Step 6: Deploy

1. Click `Deploy`
2. Wait for the build to finish

If successful, Vercel will give you a URL like:

```text
https://your-project-name.vercel.app
```

If the project name `airbnb154` is available, you can rename the Vercel project to get:

```text
https://airbnb154.vercel.app
```

## Step 7: Test the Frontend

After deployment, test these pages:

1. Home page
2. Search page
3. Listing details page
4. Login/register page

Also test browser refresh on routes like:

- `/search`
- `/rooms/<id>`

That should work because [`frontend/vercel.json`](./frontend/vercel.json) already rewrites all routes to `index.html`.

## Step 8: Connect Vercel Frontend Back to Render

After you know your final Vercel URL, go to Render and set:

- `FRONTEND_BASE_URL=https://your-frontend-name.vercel.app`

Example:

```text
https://airbnb154.vercel.app
```

Then manually redeploy the backend on Render so CORS matches the real frontend URL.

## Step 9: Future Deploys

Once GitHub is connected:

- every push to `main` creates a production deployment
- other branches can create preview deployments

If you change `REACT_APP_API_BASE_URL`, you must redeploy for the new value to apply.

## If Deployment Fails

### Case 1: Build fails

Check:

- Root Directory is `frontend`
- Build Command is `npm run build`
- Output Directory is `build`

### Case 2: Frontend deploys but API calls fail

Check:

- `REACT_APP_API_BASE_URL` is set correctly
- the Render backend is live
- backend `FRONTEND_BASE_URL` matches the real Vercel URL
- browser console for CORS or network errors

### Case 3: Refreshing `/search` or `/rooms/...` gives 404

Check that [`frontend/vercel.json`](./frontend/vercel.json) is present and committed.

### Case 4: Environment variable changed but frontend still uses old backend URL

Vercel only applies new env vars to new deployments.

Fix:

1. update the variable
2. redeploy the frontend

## Manual Redeploy Later

If you need to redeploy:

1. open the Vercel project
2. open `Deployments`
3. find the latest deployment
4. click `Redeploy`

## Useful URLs After Deploy

Frontend:

```text
https://your-project-name.vercel.app
```

Backend:

```text
https://your-render-service-name.onrender.com
```

Typical setup for this project:

- frontend: `https://airbnb154.vercel.app`
- backend: `https://isd-airbnb-monolith.onrender.com`

## Quick Checklist

Before deploying, make sure:

- code is pushed to GitHub
- Vercel project root is `frontend`
- `REACT_APP_API_BASE_URL` points to your Render backend
- backend is already deployed and healthy

After deploying, make sure:

- homepage loads
- search works
- listing details page works
- refresh on route pages works
- backend CORS allows the Vercel frontend URL
