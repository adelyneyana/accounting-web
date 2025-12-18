# Backend Implementation Guide

## Quick Start

All complete backend code has been provided in `BACKEND_COMPLETE_CODE.md`. This file contains:

✅ **3 Controllers** - AuthController, TaxController, FileController
✅ **3 Models** - User, TaxEntry, FileRecord
✅ **6 Migrations** - Users, Tax Entries, Files, Cache, Jobs, Personal Access Tokens
✅ **1 Seeder** - DatabaseSeeder with sample data
✅ **API Routes** - All endpoints configured
✅ **Config Files** - Sanctum, CORS, Filesystems
✅ **Environment Setup** - .env configuration

---

## File-by-File Implementation

### Step 1: Create/Replace Controllers
Copy the complete code from `BACKEND_COMPLETE_CODE.md` and place in:
- `app/Http/Controllers/AuthController.php`
- `app/Http/Controllers/TaxController.php`
- `app/Http/Controllers/FileController.php`

### Step 2: Create/Replace Models
Copy models from `BACKEND_COMPLETE_CODE.md` and place in:
- `app/Models/User.php`
- `app/Models/TaxEntry.php`
- `app/Models/FileRecord.php`

### Step 3: Update Routes
Replace `routes/api.php` with the complete route file from `BACKEND_COMPLETE_CODE.md`

### Step 4: Update Migrations
The migrations should already exist, but verify they match the code in `BACKEND_COMPLETE_CODE.md`:
- `database/migrations/0001_01_01_000000_create_users_table.php`
- `database/migrations/2025_01_01_000001_create_tax_entries_table.php`
- `database/migrations/2025_01_01_000002_create_files_table.php`

### Step 5: Update Seeder
Replace `database/seeders/DatabaseSeeder.php` with the complete seeder from `BACKEND_COMPLETE_CODE.md`

### Step 6: Update Config Files
Update configuration in `config/`:
- `sanctum.php`
- `cors.php`
- `filesystems.php`

### Step 7: Environment Setup
Update `.env` file with values from `BACKEND_COMPLETE_CODE.md` Section 7

---

## Key Features Implemented

### 1. Authentication (AuthController)
✅ User registration with default tax entries
✅ Login with token generation
✅ Logout with token revocation
✅ Get authenticated user info
✅ Password hashing with bcrypt

### 2. Tax Management (TaxController)
✅ CRUD operations for tax entries
✅ Graduated tax calculation for individuals
✅ Corporate tax calculation (20%/25%)
✅ Taxpayer type management (individual/corporation)
✅ Tax calculation endpoint
✅ Authorization checks on all operations

### 3. File Management (FileController)
✅ File upload with metadata
✅ File download with authorization
✅ File deletion with storage cleanup
✅ Metadata management (descriptions)
✅ File listing with sorting
✅ Storage path organization by user

### 4. Security Features
✅ Sanctum token-based authentication
✅ CORS configuration for frontend communication
✅ Authorization checks (users can only access their own data)
✅ Validation on all inputs
✅ Exception handling with proper error responses

### 5. Database Structure
✅ Users table with taxpayer_type
✅ Tax entries linked to users
✅ Files linked to users with metadata
✅ Proper foreign keys and indexes
✅ Cascading deletes for data integrity

---

## Testing the Backend

### Test Credentials (from Seeder)

**Individual User:**
- Email: `individual@example.com`
- Password: `password123`
- Type: Individual
- Tax Entries: Sales (₱500K), VAT (₱50K), Other (₱100K), Assets (₱0)

**Corporation User:**
- Email: `corporation@example.com`
- Password: `password123`
- Type: Corporation
- Tax Entries: Sales (₱10M), VAT (₱1M), Other (₱2M), Assets (₱50M)

### Sample API Requests

**Register:**
```
POST /api/register
Content-Type: application/json

{
  "name": "New User",
  "email": "user@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Login:**
```
POST /api/login
Content-Type: application/json

{
  "email": "individual@example.com",
  "password": "password123"
}
```

**Get Tax Entries:**
```
GET /api/tax
Authorization: Bearer {token}
```

**Update Tax Entry:**
```
PUT /api/tax/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "value": 750000
}
```

**Upload File:**
```
POST /api/files/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: <binary file data>
description: "Q4 Tax Documents"
```

---

## Environment Variables Needed

```
APP_NAME=Accounting Web
APP_ENV=local
APP_KEY=base64:xxxxx (generate with: php artisan key:generate)
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=accounting_db
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000,127.0.0.1:8000
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:8000

FILESYSTEM_DISK=public
```

---

## Database Setup

### Create Database:
```sql
CREATE DATABASE accounting_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Or using MariaDB/MySQL:
```bash
mysql -u root -p -e "CREATE DATABASE accounting_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

---

## File Storage Structure

After running `php artisan storage:link`, files will be stored in:
```
storage/app/public/user_uploads/{user_id}/{filename}
```

Accessible via:
```
http://localhost:8000/storage/user_uploads/{user_id}/{filename}
```

---

## Common Issues & Solutions

### Issue: "Class not found" errors
**Solution:** Run `composer dump-autoload`

### Issue: CORS errors from frontend
**Solution:** Update `config/cors.php` with correct frontend URL

### Issue: File upload fails
**Solution:** Ensure `storage/app/public` directory exists and is writable

### Issue: Database connection error
**Solution:** Verify MySQL is running and `.env` database credentials are correct

### Issue: Token not being recognized
**Solution:** Ensure `SANCTUM_STATEFUL_DOMAINS` includes your frontend domain

---

## Frontend Integration Points

The backend provides these endpoints for the React frontend:

### Tax Computation
- Frontend calls `GET /api/tax` to get financial entries
- Frontend calls `PUT /api/tax/{id}` when user updates slider values
- Frontend calls `PUT /api/tax/type/update` when user changes taxpayer type
- Frontend calls `POST /api/tax/calculate` for instant calculations

### File Management
- Frontend calls `GET /api/files` to list uploaded files
- Frontend calls `POST /api/files/upload` to add new files
- Frontend calls `DELETE /api/files/{id}` to remove files
- Frontend calls `GET /api/files/{id}/download` to retrieve files

### Authentication
- Frontend calls `POST /api/register` for new accounts
- Frontend calls `POST /api/login` for user login
- Frontend calls `POST /api/logout` on sign out
- Frontend stores token in localStorage for subsequent requests

---

## Deployment Notes

1. **Set APP_ENV=production** in production
2. **Set APP_DEBUG=false** in production
3. **Generate new APP_KEY** for production: `php artisan key:generate`
4. **Use strong database passwords**
5. **Configure proper CORS origins** for production domain
6. **Enable HTTPS** for all production requests
7. **Set up proper file permissions** for storage directory
8. **Configure backup strategy** for database and uploaded files
9. **Use proper logging** (update LOG_CHANNEL in config/logging.php)
10. **Enable rate limiting** for API endpoints (optional but recommended)

---

## Next Steps

1. Copy all code from `BACKEND_COMPLETE_CODE.md`
2. Place files in appropriate Laravel directories
3. Update `.env` with database credentials
4. Run migrations: `php artisan migrate`
5. Seed database: `php artisan db:seed`
6. Start server: `php artisan serve`
7. Test with provided credentials
8. Connect frontend to backend

---

