# Setup & Run Checklist - Accounting Web (Laravel + React)

This file contains a concise, copy-paste friendly checklist to get the full stack running locally using XAMPP (MySQL 8), Laravel backend, and React/Vite frontend.

Prerequisites
- XAMPP installed (Apache, MySQL)
- PHP (bundled with XAMPP) and Composer installed
- Node.js and npm installed
- Project checked out at `c:\Users\Diana Mabilen\accounting-web`

Quick overview
1. Configure backend `.env` and frontend `VITE_API_URL`
2. Create MySQL database `accounting_db` (phpMyAdmin or CLI)
3. Install backend deps, run migrations + seeders, create storage link
4. Start Laravel server
5. Install frontend deps and start Vite
6. Test login, tax page, files page

---

## 1. Configure backend `.env`
Open `c:\Users\Diana Mabilen\accounting-web\backend\.env` and ensure these values match your local setup:

```env
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=accounting_db
DB_USERNAME=root
DB_PASSWORD=
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost
CORS_ALLOWED_ORIGINS=http://localhost:5173
FILESYSTEM_DISK=public
```

- If you run your frontend on a different port, add it to `SANCTUM_STATEFUL_DOMAINS` and `CORS_ALLOWED_ORIGINS`.

---

## 2. Create MySQL database
Using phpMyAdmin (recommended):
- Open `http://localhost/phpmyadmin`
- Click `Databases` → Create database `accounting_db` with collation `utf8mb4_unicode_ci`

Or via XAMPP MySQL CLI (PowerShell):

```powershell
"C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS accounting_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

---

## 3. Backend: dependencies, migrate, seed, storage link
Open PowerShell and run the following commands from backend folder:

```powershell
cd "c:\Users\Diana Mabilen\accounting-web\backend"

# Install composer dependencies
composer install

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed sample data
php artisan db:seed

# Create storage symlink (for public file access)
php artisan storage:link
```

Notes:
- If `php` is not the XAMPP PHP, use `"C:\xampp\php\php.exe" artisan migrate` instead.
- If migrations fail, re-check `.env` DB credentials and that MySQL is running.

---

## 4. Start Laravel server
Run in backend folder:

```powershell
cd "c:\Users\Diana Mabilen\accounting-web\backend"
php artisan serve --port=8000
```

Server will be available at `http://localhost:8000`.

---

## 5. Frontend: configure API URL, install deps, start Vite
Open `c:\Users\Diana Mabilen\accounting-web\frontend` and set `VITE_API_URL` if needed (or ensure `src/api.js` points to `http://localhost:8000/api`).

Install and run:

```powershell
cd "c:\Users\Diana Mabilen\accounting-web\frontend"

# Install node modules (once)
npm install

# Start Vite dev server
# If PowerShell blocks npm scripts, run in cmd: cmd /c "npm run dev"
npm run dev
```

If PowerShell blocks `npm`/`npx` scripts, either:
- Run `cmd /c "npm run dev"` from PowerShell, or
- Allow scripts (Admin): `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`

Vite typically runs on `http://localhost:5173` (or next available port).

---

## 6. Test end-to-end (manual)
Open frontend in browser (Vite port). Test the following flows:

- Login with seeded users:
  - `individual@example.com` / `password123`
  - `corporation@example.com` / `password123`

- Tax page:
  - Confirm entries load (from backend or mock fallback)
  - Adjust sliders or number inputs — tax should update
  - Switching taxpayer type should persist (if authenticated)

- Files page:
  - Add a mock file via the UI (temporary client-side)
  - If backend upload works, upload a real file and confirm it appears
  - Download/delete actions should work (if backend connected)

---

## 7. Useful API examples (curl)
Register:
```bash
curl -X POST http://localhost:8000/api/register \
 -H "Content-Type: application/json" \
 -d '{"name":"New User","email":"new@example.com","password":"password123","password_confirmation":"password123"}'
```

Login:
```bash
curl -X POST http://localhost:8000/api/login \
 -H "Content-Type: application/json" \
 -d '{"email":"individual@example.com","password":"password123"}'
```

Get public tax preview:
```bash
curl http://localhost:8000/api/tax
```

Update tax entry (requires token):
```bash
curl -X PUT http://localhost:8000/api/tax/1 \
 -H "Authorization: Bearer <TOKEN>" \
 -H "Content-Type: application/json" \
 -d '{"value":750000}'
```

Upload file (multipart):
```bash
curl -X POST http://localhost:8000/api/files/upload \
 -H "Authorization: Bearer <TOKEN>" \
 -F "file=@C:/path/to/yourfile.pdf" \
 -F "description=Q4 Papers"
```

---

## 8. Troubleshooting quick fixes
- **PowerShell blocks npm.ps1**: run `cmd /c "npm run dev"` or set `Set-ExecutionPolicy RemoteSigned`
- **DB connection errors**: ensure MySQL is running in XAMPP and `.env` credentials match
- **Duplicate React / invalid hook error**: run `npm ls react` and dedupe or reinstall frontend deps
- **Storage/download 404**: ensure `php artisan storage:link` executed and `FILESYSTEM_DISK=public`
- **Port conflicts**: use the ports reported by Vite or `php artisan serve --port=8001`

---

## 9. Quick checklist (copyable)
```powershell
# Start XAMPP: Apache and MySQL via XAMPP Control Panel
# Backend setup
cd "c:\Users\Diana Mabilen\accounting-web\backend"
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link
php artisan serve --port=8000

# Frontend setup (in new terminal)
cd "c:\Users\Diana Mabilen\accounting-web\frontend"
npm install
# If PowerShell blocks: cmd /c "npm run dev"
npm run dev
```

---

## 10. Next steps I can help with
- Create a PowerShell script to automate backend setup (composer, migrate, seed, storage link)
- Create a Postman collection with all API calls
- Wire the FilesPage to backend upload/download endpoints fully
- Add persistent folder name storage on backend

If you want one of these automated, tell me which and I'll implement it.

---

_Last updated: November 27, 2025_
