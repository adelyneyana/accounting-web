# 🚀 RAILWAY BACKEND DEPLOYMENT - STEP BY STEP

## ✅ Easy Web-Based Deployment (No CLI needed!)

Follow these simple steps to deploy your backend:

### STEP 1: Create GitHub Repository

1. Go to https://github.com and sign in (or create account)
2. Click "New repository" (green button)
3. Name it: `accounting-web-backend`
4. Click "Create repository"

### STEP 2: Upload Backend to GitHub

**Option A: Using GitHub Website (Easiest)**
1. On your new repo page, click "uploading an existing file"
2. Drag and drop your entire `backend` folder
3. Click "Commit changes"

**Option B: Using Git (if installed)**
```bash
cd "c:\Users\Diana Mabilen\accounting-web\backend"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/accounting-web-backend.git
git push -u origin main
```

### STEP 3: Deploy on Railway

1. **Go to https://railway.app**
2. **Click "Start a New Project"**
3. **Select "Deploy from GitHub repo"**
   - Sign in with GitHub
   - Select `accounting-web-backend` repository
   - Click "Deploy Now"

### STEP 4: Add MySQL Database

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"** → **"MySQL"**
3. Railway will create a MySQL database instantly!

### STEP 5: Configure Environment Variables

1. Click on your **backend service** (not the database)
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** and add these one by one:

```
APP_NAME=AccountingWeb
APP_ENV=production
APP_DEBUG=false
APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}

DB_CONNECTION=mysql
DB_HOST=${{MYSQL_HOST}}
DB_PORT=${{MYSQL_PORT}}
DB_DATABASE=${{MYSQL_DATABASE}}
DB_USERNAME=${{MYSQL_USER}}
DB_PASSWORD=${{MYSQL_PASSWORD}}

SESSION_DRIVER=file
CACHE_DRIVER=file
```

4. Click **"+ New Variable"** → **"Add Reference"**:
   - Select all the MYSQL variables (Railway will auto-fill them from your database)

5. **Generate APP_KEY:**
   - On your computer, run: `cd backend && php artisan key:generate --show`
   - Copy the output (looks like: `base64:abc123...`)
   - Add as new variable: `APP_KEY=base64:abc123...`

### STEP 6: Enable Public Access

1. In your backend service, go to **"Settings"** tab
2. Scroll to **"Networking"**
3. Click **"Generate Domain"**
4. Copy your URL (e.g., `https://accounting-web-production.up.railway.app`)

### STEP 7: Run Migrations

1. In your backend service, click **"Deployments"** tab
2. Click on the latest deployment
3. Click **"View Logs"**
4. The migrations should run automatically!

If not:
1. Go to **"Settings"** → **"Deploy"**
2. Add custom start command:
   ```
   php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT
   ```

---

## ✅ STEP 8: Update Frontend with Backend URL

1. **Copy your Railway backend URL** (from Step 6)

2. **Update frontend environment:**
   ```bash
   cd frontend
   ```
   
   Edit `.env.production` (or create it):
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app/api
   ```

3. **Redeploy frontend to Vercel:**
   ```bash
   vercel --prod
   ```

---

## 🎉 YOU'RE LIVE!

Your backend is now deployed and accessible from anywhere!

### Your URLs:
- **Frontend:** `https://your-app.vercel.app`
- **Backend API:** `https://your-backend.railway.app/api`

### Test it:
1. Open your Vercel frontend URL
2. Register a new account
3. Upload a file
4. Everything should work!

---

## 💡 Pro Tips

1. **Free Tier Limits:**
   - Railway: $5 free credit/month
   - Enough for ~500 hours of uptime
   - Perfect for testing and small usage

2. **Monitor Usage:**
   - Check Railway dashboard for usage
   - Upgrade to $20/month for unlimited if needed

3. **Database Backups:**
   - Railway has automatic backups
   - Can also manually export from dashboard

4. **Custom Domain (Optional):**
   - Buy domain from Namecheap ($10/year)
   - Add to both Vercel and Railway
   - Get: `https://myaccounting.com`

---

## 🆘 Troubleshooting

**If deployment fails:**
1. Check Railway logs (Deployments → View Logs)
2. Make sure all environment variables are set
3. Verify MySQL connection variables are correct

**If migrations don't run:**
1. Go to service → Settings
2. Update start command to include migrations
3. Redeploy

**If CORS errors:**
1. Backend already has CORS middleware
2. Make sure APP_URL matches your Railway domain

---

Your accounting system is now PUBLICLY ACCESSIBLE! 🌍
