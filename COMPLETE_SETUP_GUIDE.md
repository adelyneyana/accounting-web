# Complete Setup Guide - Accounting Web Application

This guide provides detailed step-by-step instructions to set up and run the full-stack accounting web application with Laravel backend and React frontend.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup (Laravel)](#backend-setup-laravel)
3. [Frontend Setup (React)](#frontend-setup-react)
4. [Testing the Application](#testing-the-application)
5. [Troubleshooting](#troubleshooting)
6. [Additional Configuration](#additional-configuration)

---

## Prerequisites

Before starting, ensure you have the following installed:

### Required Software
- **PHP 8.2 or higher** - [Download](https://www.php.net/downloads)
- **Composer** - [Download](https://getcomposer.org/download/)
- **Node.js 18+ and npm** - [Download](https://nodejs.org/)
- **MySQL 8.0+** - [Download](https://dev.mysql.com/downloads/) or use XAMPP
- **Git** (optional) - [Download](https://git-scm.com/)

### Check Installations
```bash
php -v          # Should show PHP 8.2+
composer -v     # Should show Composer 2.x
node -v         # Should show Node 18+
npm -v          # Should show npm 9+
mysql --version # Should show MySQL 8.0+
```

---

## Backend Setup (Laravel)

### Step 1: Navigate to Backend Directory
```bash
cd "c:\Users\Diana Mabilen\accounting-web\backend"
```

### Step 2: Install PHP Dependencies

**In backend folder:**
```bash
composer install
```

This installs all Laravel dependencies including:
- Laravel Framework 11
- Laravel Sanctum (API authentication)
- Database drivers
- Other required packages

**Expected output:** Should complete without errors and create a `vendor/` folder.

### Step 3: Configure Environment File

The `.env` file is already configured, but verify these critical settings:

**Database Configuration:**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=accounting
DB_USERNAME=root
DB_PASSWORD=
```

**Application Configuration:**
```env
APP_NAME=Laravel
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000
```

**Session & Sanctum Configuration:**
```env
SESSION_DRIVER=database
SESSION_DOMAIN=localhost

SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
```

### Step 4: Create Database

1. **Start MySQL Server**
   - If using XAMPP: Start Apache and MySQL from XAMPP Control Panel
   - If using standalone MySQL: Ensure MySQL service is running

2. **Create Database**
   ```bash
   # Option A: Using MySQL Command Line
   mysql -u root -p
   CREATE DATABASE accounting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;

   # Option B: Using phpMyAdmin (if using XAMPP)
   # Go to http://localhost/phpmyadmin
   # Click "New" and create database named "accounting"
   ```

### Step 5: Run Database Migrations and Seeders

Create all required tables and add sample data:

**In backend folder:**
```bash
php artisan migrate --seed
```

This creates:
- `users` - User accounts
- `tax_entries` - Tax calculation data
- `files` - Uploaded file records
- `personal_access_tokens` - API tokens (Sanctum)
- `cache`, `jobs`, `sessions` - System tables

And seeds:
- 2 test users (individual and corporation taxpayers)
- Sample tax entries
- Sample file records

**Expected output:**
```
Migration table created successfully.
Migrating: 0001_01_01_000000_create_users_table
Migrated:  0001_01_01_000000_create_users_table (XX.XXms)
...
Seeding: Database\Seeders\DatabaseSeeder
Seeded:  Database\Seeders\DatabaseSeeder (XX.XXms)
```

### Step 6: Create Storage Symlink

Link public storage for file uploads:

**In backend folder:**
```bash
php artisan storage:link
```

**Expected output:**
```
The [public/storage] link has been connected to [storage/app/public].
```

### Step 7: Set Directory Permissions (Important for Windows)

Ensure Laravel can write to storage and cache:
```bash
# PowerShell (Run as Administrator)
icacls "storage" /grant Everyone:F /T
icacls "bootstrap/cache" /grant Everyone:F /T
```

### Step 8: Start Laravel Development Server

**In backend folder:**
```bash
php artisan serve
```

**Expected output:**
```
INFO  Server running on [http://127.0.0.1:8000].
Press Ctrl+C to stop the server
```

**Test the backend:**
- Open browser: `http://127.0.0.1:8000`
- You should see Laravel welcome page
- **Confirm it runs at http://127.0.0.1:8000**

**Keep this terminal window open** - the server must stay running.

---

## Frontend Setup (React)

### Step 1: Open New Terminal/PowerShell

Keep the Laravel server running and open a **new terminal window**.

### Step 2: Navigate to Frontend Directory
```bash
cd "c:\Users\Diana Mabilen\accounting-web\frontend"
```

### Step 3: Install Node Dependencies
```bash
npm install
```

This installs:
- React 18.2.0
- React Router 6.14.1
- Axios (API client)
- Tailwind CSS 3.3.0
- Vite 5.1.0 (build tool)

**Expected output:** Should complete without errors and create a `node_modules/` folder.

**Troubleshooting npm install:**
- If you see warnings about deprecated packages, you can ignore them
- If you see peer dependency errors, try: `npm install --legacy-peer-deps`

### Step 4: Configure Environment File

The `.env` file should contain:
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

**Important:** The API URL must match your Laravel server address (default: `http://127.0.0.1:8000`).

### Step 5: Start Vite Development Server

```bash
npm run dev
```

**Expected output:**
```
VITE v5.1.0  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

**Keep this terminal window open** - the server must stay running.

---

## Testing the Application

### Step 1: Access the Application

Open your browser and go to: **http://localhost:5173**

You should see the **Login Page** with a beautiful gradient design.

### Step 2: Register a New User

1. Click **"Register"** or navigate to: `http://localhost:5173/register`
2. Fill in the registration form:
   - **Name:** Your Full Name
   - **Email:** your.email@example.com
   - **Password:** minimum 8 characters
   - **Confirm Password:** same as password
3. Click **"Register"**
4. You should see: "Registration successful! Redirecting to login..."
5. You'll be redirected to the login page

### Step 3: Login

1. On the login page, enter:
   - **Email:** The email you just registered
   - **Password:** Your password
2. Click **"Login"**
3. You should be redirected to the **Dashboard**

### Step 4: Test Dashboard Features

**Dashboard Overview:**
- See welcome message with your name (clickable for profile)
- View summary cards (Tax Due, Files, Reports)
- Access Tax and Files sections

**Test Tax Page:**
1. Click **"Tax"** card from dashboard
2. Select taxpayer type: **Individual** or **Corporation**
3. Adjust financial factors using:
   - Sliders
   - Number inputs
   - Quick adjustment buttons (±₱50K, ±₱100K)
4. See real-time tax calculations:
   - VAT Output (12% of Sales)
   - VAT Payable (Output - Input)
   - Net Income
   - Income Tax

**Test Files Page:**
1. Click **"Files"** card from dashboard
2. See mock file data displayed by type
3. Click folder names to expand/collapse
4. Try renaming folders (click edit icon)
5. Upload files (UI only - full backend integration pending)

**Test Profile Settings:**
1. Click your **name** next to "Welcome" on dashboard
2. Edit your profile:
   - Change name
   - Update email
   - Switch taxpayer type
3. Change password (in demo mode)
4. Logout

### Step 5: Verify Backend Connection

**Check API responses:**
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Navigate through the app and watch for API calls:
   - `/api/login` - Login endpoint
   - `/api/register` - Registration endpoint
   - `/api/tax` - Tax data (falls back to mock if not available)
   - `/api/files` - File data (falls back to mock if not available)

**If using mock data (backend not fully integrated):**
- The app will work with sample data
- Tax and Files pages show default mock data
- You can still test all UI features

---

## Troubleshooting

### Backend Issues

**Problem: "Access denied for user 'root'@'localhost'"**
```bash
# Solution: Fix database credentials in .env
DB_USERNAME=root
DB_PASSWORD=your_actual_password
```

**Problem: "SQLSTATE[HY000] [2002] No connection could be made"**
```bash
# Solution: Ensure MySQL is running
# For XAMPP: Start MySQL from control panel
# For standalone: Check MySQL service status
```

**Problem: "Class 'Laravel\Sanctum\HasApiTokens' not found"**
```bash
# Solution: Reinstall dependencies
composer install
# Or specifically require Sanctum
composer require laravel/sanctum
```

**Problem: "Route [api.php] not defined"**
- Solution: Already fixed in `bootstrap/app.php` - api routes are registered

**Problem: "Storage link already exists"**
```bash
# Solution: Remove and recreate
rm public/storage
php artisan storage:link
```

**Problem: Port 8000 already in use**
```bash
# Solution: Use a different port
php artisan serve --port=8001
# Update frontend .env: VITE_API_URL=http://127.0.0.1:8001/api
```

### Frontend Issues

**Problem: "Cannot GET /"**
- Solution: Ensure Vite server is running (`npm run dev`)

**Problem: "Network Error" when logging in**
```bash
# Solution 1: Check backend is running
# Go to http://127.0.0.1:8000 - should see Laravel page

# Solution 2: Verify API URL in frontend/.env
VITE_API_URL=http://127.0.0.1:8000/api

# Solution 3: Restart Vite server
# Press Ctrl+C, then: npm run dev
```

**Problem: "CORS error" in console**
- Solution: Already configured in `bootstrap/app.php` and `.env`
- Verify `SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173` in backend `.env`

**Problem: "Failed to resolve module specifier"**
```bash
# Solution: Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Problem: Port 5173 already in use**
```bash
# Solution: Kill the process or use different port
npm run dev -- --port 3000
```

### General Issues

**Problem: White/blank screen**
1. Check browser console (F12) for errors
2. Verify both backend and frontend servers are running
3. Clear browser cache (Ctrl+Shift+Delete)
4. Check `.env` files for correct URLs

**Problem: "Registration failed"**
1. Check Network tab in DevTools for error details
2. Verify database is created and migrations ran
3. Check Laravel logs: `storage/logs/laravel.log`

**Problem: CSS not loading (no styles)**
```bash
# Solution: Rebuild Vite assets
npm run build
# Or restart dev server
npm run dev
```

---

## Additional Configuration

### Production Build

**Backend (Laravel):**
```bash
# Set environment to production
# Edit .env:
APP_ENV=production
APP_DEBUG=false

# Optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**Frontend (React):**
```bash
# Build for production
npm run build

# Output will be in dist/ folder
# Deploy dist/ folder to web server
```

### Database Backups

**Export database:**
```bash
mysqldump -u root -p accounting > backup.sql
```

**Import database:**
```bash
mysql -u root -p accounting < backup.sql
```

### Environment Variables Reference

**Backend (.env):**
```env
# Application
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:... (auto-generated)
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=accounting
DB_USERNAME=root
DB_PASSWORD=

# Session & Auth
SESSION_DRIVER=database
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
```

**Frontend (.env):**
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

---

## Quick Reference Commands

**Backend:**
```bash
cd backend
composer install                # Install dependencies
php artisan migrate            # Run migrations
php artisan db:seed            # Seed database
php artisan storage:link       # Link storage
php artisan serve              # Start server (port 8000)
php artisan config:clear       # Clear config cache
php artisan route:list         # List all routes
```

**Frontend:**
```bash
cd frontend
npm install                    # Install dependencies
npm run dev                    # Start dev server (port 5173)
npm run build                  # Build for production
npm run preview                # Preview production build
```

---

## Next Steps

1. **Customize:** Modify UI colors, add company logo
2. **Extend:** Add more features (reports, charts, exports)
3. **Deploy:** Set up production hosting (VPS, shared hosting, cloud)
4. **Security:** Enable HTTPS, set strong passwords, configure firewall
5. **Backup:** Set up automated database backups

---

## Support & Resources

- **Laravel Documentation:** https://laravel.com/docs
- **React Documentation:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com
- **Laravel Sanctum:** https://laravel.com/docs/sanctum

---

**Setup Complete!** Your accounting web application is now running and ready to use. 🎉
