# Complete Guide: MySQL 8 Database Setup with XAMPP

## Table of Contents
1. Installation & Startup
2. Database Creation
3. Configuration for Laravel
4. Data Seeding
5. Management & Monitoring
6. Backup & Recovery
7. Troubleshooting

---

## Part 1: Installation & Startup

### Step 1.1: Download XAMPP
1. Go to https://www.apachefriends.org/
2. Download **XAMPP for Windows** (latest version)
3. Choose the version with PHP 8.0+ and MySQL 8.0+

### Step 1.2: Install XAMPP
1. Run the installer: `xampp-windows-x64-8.x.x-installer.exe`
2. Accept default installation path: `C:\xampp`
3. Deselect unnecessary components (Tomcat, Perl)
4. Keep selected:
   - ✅ Apache
   - ✅ MySQL
   - ✅ PHP
   - ✅ phpMyAdmin
5. Complete installation

### Step 1.3: Start XAMPP Services
1. Open **XAMPP Control Panel** from Start Menu
2. Click **Start** next to:
   - Apache (turns green)
   - MySQL (turns green)

**Important:** MySQL must be running to create databases

---

## Part 2: Database Creation

### Step 2.1: Open phpMyAdmin
1. Open browser and go to: `http://localhost/phpmyadmin`
2. You should see phpMyAdmin interface
3. Login: usually automatic (no password needed locally)

### Step 2.2: Create Database

**Method 1: Using phpMyAdmin GUI (Easiest)**

1. Click **Databases** tab at top
2. Under "Create database" section, enter:
   - Database name: `accounting_db`
   - Collation: `utf8mb4_unicode_ci`
3. Click **Create**

**Expected result:** Green success message

---

### Step 2.3: Verify Database Creation

1. In left sidebar under **Databases**, you should see `accounting_db`
2. Click it to expand and view tables (should be empty now)

---

## Part 3: Configuration for Laravel

### Step 3.1: Configure .env File

1. Navigate to your Laravel backend folder:
   ```
   C:\Users\Diana Mabilen\accounting-web\backend\
   ```

2. Open (or create) `.env` file

3. Update database section to:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=accounting_db
   DB_USERNAME=root
   DB_PASSWORD=
   ```

**Key Points:**
- `DB_HOST=127.0.0.1` or `localhost` (XAMPP default)
- `DB_PORT=3306` (XAMPP MySQL default)
- `DB_USERNAME=root` (XAMPP MySQL default user)
- `DB_PASSWORD=` (Leave empty for XAMPP)

### Step 3.2: Verify Connection

1. Open PowerShell/Command Prompt
2. Navigate to backend directory:
   ```bash
   cd "c:\Users\Diana Mabilen\accounting-web\backend"
   ```

3. Test database connection:
   ```bash
   php artisan migrate:status
   ```

**Expected output:**
```
Migration Table Not Found
or
0 Up | X Down
```

**If error:** Check .env credentials above

---

## Part 4: Data Seeding

### Step 4.1: Run Migrations

Create all database tables:
```bash
php artisan migrate
```

**Expected output:**
```
Migrating: 0001_01_01_000000_create_users_table
Migrated:  0001_01_01_000000_create_users_table (XXXms)
Migrating: 0001_01_01_000001_create_cache_table
...
```

### Step 4.2: Seed Sample Data

Insert test users and tax entries:
```bash
php artisan db:seed
```

**Expected output:**
```
Seeding: Database\Seeders\DatabaseSeeder
Seeded: Database\Seeders\DatabaseSeeder (XXXms)
```

### Step 4.3: Verify in phpMyAdmin

1. Refresh phpMyAdmin in browser
2. Click `accounting_db` in left sidebar
3. You should see these tables:
   - ✅ users
   - ✅ tax_entries
   - ✅ files
   - ✅ personal_access_tokens
   - ✅ cache
   - ✅ jobs
   - ✅ job_batches
   - ✅ cache_locks
   - ✅ sessions
   - ✅ password_reset_tokens

4. Click **users** table, then **Browse** to see sample data:
   - Individual User: `individual@example.com`
   - Corporation User: `corporation@example.com`

---

## Part 5: Management & Monitoring

### Step 5.1: Viewing Tables in phpMyAdmin

**View table structure:**
1. Click table name → **Structure** tab
2. See all columns with types and constraints

**View table data:**
1. Click table name → **Browse** tab
2. See all records in table

**Execute custom SQL:**
1. Click **SQL** tab
2. Enter SQL query
3. Click **Go**

### Step 5.2: Common Database Operations

**View all users:**
```sql
SELECT id, name, email, taxpayer_type, created_at FROM users;
```

**View tax entries for specific user:**
```sql
SELECT * FROM tax_entries WHERE user_id = 1;
```

**View file uploads:**
```sql
SELECT id, user_id, filename, size, created_at FROM files;
```

**Check database size:**
```sql
SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'accounting_db';
```

### Step 5.3: Monitor MySQL Performance

**In XAMPP Control Panel:**
1. Click **MySQL** → **Admin**
2. Opens phpMyAdmin directly
3. Or click **Config** to view MySQL configuration

**Check MySQL status:**
```bash
mysql -u root -e "SHOW STATUS LIKE 'Threads%';"
```

---

## Part 6: Backup & Recovery

### Step 6.1: Automatic Backup (Recommended)

Create daily backups using batch script:

**File:** `C:\xampp\backup_db.bat`
```batch
@echo off
setlocal enabledelayedexpansion
set backup_dir=C:\xampp\backups
set timestamp=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set backup_dir=%backup_dir%\%timestamp%

if not exist "%backup_dir%" mkdir "%backup_dir%"

C:\xampp\mysql\bin\mysqldump -u root --databases accounting_db > "%backup_dir%\accounting_db.sql"

echo Backup completed: %backup_dir%\accounting_db.sql
```

**Usage:**
1. Save as `backup_db.bat` in `C:\xampp\`
2. Double-click to run
3. Backup created in `C:\xampp\backups\`

### Step 6.2: Manual Backup

**From Command Prompt:**
```bash
cd C:\xampp\mysql\bin

mysqldump -u root accounting_db > C:\backup\accounting_db.sql
```

**Result:** SQL file with all database data

### Step 6.3: Restore from Backup

**Using phpMyAdmin:**
1. Click `accounting_db`
2. Click **Import** tab
3. Browse to `.sql` file
4. Click **Go**

**Using Command Line:**
```bash
mysql -u root accounting_db < C:\backup\accounting_db.sql
```

### Step 6.4: Export Data to CSV

**In phpMyAdmin:**
1. Click table → **Export** tab
2. Select format: **CSV**
3. Click **Go**

**Useful for:**
- Reporting
- Excel analysis
- Data sharing

---

## Part 7: Troubleshooting

### Issue 7.1: MySQL Won't Start

**Symptom:** MySQL button stays orange/red in XAMPP Control Panel

**Solutions:**

1. **Check port 3306 in use:**
   ```bash
   netstat -ano | findstr :3306
   ```
   - If port is in use, change MySQL port in `C:\xampp\mysql\bin\my.ini`

2. **Increase timeout:** Edit `C:\xampp\mysql\bin\my.ini`
   ```ini
   [mysqld]
   wait_timeout=600
   ```

3. **Reset MySQL:** Delete logs in `C:\xampp\mysql\data\`

4. **Reinstall:** Remove XAMPP and reinstall

### Issue 7.2: "Access Denied for user 'root'@'localhost'"

**Symptom:** Error when running `php artisan migrate`

**Solutions:**

1. **Verify .env file:**
   ```env
   DB_USERNAME=root
   DB_PASSWORD=
   (password must be empty)
   ```

2. **Test connection directly:**
   ```bash
   mysql -u root -h 127.0.0.1
   ```

3. **If connection fails:** MySQL may not be running - start it in XAMPP Control Panel

### Issue 7.3: "Connection refused on 127.0.0.1:3306"

**Symptom:** Laravel can't connect to database

**Solutions:**

1. **Ensure MySQL is running** in XAMPP Control Panel
2. **Try localhost instead:**
   ```env
   DB_HOST=localhost
   ```

3. **Check firewall** - Allow MySQL through Windows Firewall

4. **Verify port:** 
   ```bash
   mysql -u root -h 127.0.0.1 -P 3306
   ```

### Issue 7.4: "Database doesn't exist"

**Symptom:** Error during migration: `database accounting_db doesn't exist`

**Solutions:**

1. **Create database in phpMyAdmin** (see Part 2)
2. **Or create via command line:**
   ```bash
   mysql -u root -e "CREATE DATABASE accounting_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

3. **Verify creation:**
   ```bash
   mysql -u root -e "SHOW DATABASES LIKE 'accounting_db';"
   ```

### Issue 7.5: "No tables found"

**Symptom:** Database exists but is empty

**Solutions:**

1. **Run migrations:**
   ```bash
   php artisan migrate
   ```

2. **Run seeder:**
   ```bash
   php artisan db:seed
   ```

3. **Check migration status:**
   ```bash
   php artisan migrate:status
   ```

### Issue 7.6: Slow Database Performance

**Symptom:** Queries take long time

**Solutions:**

1. **Add indexes:** Already configured in migrations
2. **Increase buffer pool:**
   ```ini
   [mysqld]
   innodb_buffer_pool_size=1G
   ```

3. **Monitor queries:**
   ```sql
   SET GLOBAL slow_query_log=1;
   SET GLOBAL long_query_time=2;
   ```

---

## Part 8: Advanced Configuration

### Step 8.1: Enable Remote Access (Optional)

**For connecting from other machines:**

Edit `C:\xampp\mysql\bin\my.ini`:
```ini
[mysqld]
bind-address=0.0.0.0
```

**Warning:** Only for development network, not production

### Step 8.2: Increase Max Upload Size

**For large file uploads:**

Edit `C:\xampp\mysql\bin\my.ini`:
```ini
[mysqld]
max_allowed_packet=256M
```

Edit `C:\xampp\php\php.ini`:
```ini
upload_max_filesize=256M
post_max_size=256M
```

### Step 8.3: Optimize Query Performance

**Add missing indexes:**
```sql
CREATE INDEX idx_user_id ON tax_entries(user_id);
CREATE INDEX idx_label ON tax_entries(label);
CREATE INDEX idx_created ON files(created_at);
```

### Step 8.4: Enable Query Logging (Debugging)

**In `C:\xampp\mysql\bin\my.ini`:**
```ini
[mysqld]
general_log=1
general_log_file="C:/xampp/mysql/logs/query.log"
```

**View logs:**
```bash
tail -f C:\xampp\mysql\logs\query.log
```

---

## Part 9: Daily Maintenance Checklist

### Weekly Tasks
- [ ] Backup database (run backup script)
- [ ] Check database size
- [ ] Review slow query log
- [ ] Test restore procedure

### Monthly Tasks
- [ ] Analyze tables for optimization
- [ ] Update MySQL to latest patch
- [ ] Review disk space usage
- [ ] Test disaster recovery plan

### Quarterly Tasks
- [ ] Clean old backup files
- [ ] Review security configuration
- [ ] Optimize storage
- [ ] Archive old logs

---

## Part 10: Quick Reference

### Essential Commands

**Start services:**
```bash
# Open XAMPP Control Panel and click Start for Apache and MySQL
```

**Database operations:**
```bash
# Create database
mysql -u root -e "CREATE DATABASE accounting_db CHARACTER SET utf8mb4;"

# Show databases
mysql -u root -e "SHOW DATABASES;"

# Connect to database
mysql -u root -D accounting_db

# Backup
mysqldump -u root accounting_db > backup.sql

# Restore
mysql -u root accounting_db < backup.sql
```

**Laravel operations:**
```bash
# Run migrations
php artisan migrate

# Seed data
php artisan db:seed

# Check status
php artisan migrate:status

# Rollback
php artisan migrate:rollback

# Fresh install
php artisan migrate:fresh --seed
```

### Important Paths
- **XAMPP folder:** `C:\xampp`
- **MySQL config:** `C:\xampp\mysql\bin\my.ini`
- **PHP config:** `C:\xampp\php\php.ini`
- **Web root:** `C:\xampp\htdocs`
- **Database files:** `C:\xampp\mysql\data\`
- **MySQL logs:** `C:\xampp\mysql\logs\`

### Default Credentials
- **MySQL User:** `root`
- **MySQL Password:** (empty)
- **phpMyAdmin URL:** `http://localhost/phpmyadmin`
- **MySQL Port:** `3306`

---

## Part 11: Security Best Practices

### Development Machine
✅ No password for root (XAMPP default)
✅ Only accessible from localhost
✅ Regular backups
✅ File permissions: 755 for folders, 644 for files

### Before Production
❌ **DO NOT** use root with empty password
✅ Create specific user with limited privileges
✅ Set strong password
✅ Restrict database to internal network only
✅ Enable SSL encryption
✅ Regular security updates

**Create production user:**
```sql
CREATE USER 'accounting_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON accounting_db.* TO 'accounting_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## Part 12: Next Steps

After completing this guide:

1. ✅ XAMPP installed and running
2. ✅ Database `accounting_db` created
3. ✅ Laravel migrations completed
4. ✅ Sample data seeded
5. ✅ Database accessible via phpMyAdmin

**Now you can:**
- Run backend: `php artisan serve --port 8000`
- Run frontend: `npm run dev`
- Login with test credentials
- Upload files
- Calculate taxes

---

## Support & Resources

### Official Documentation
- MySQL 8.0 Docs: https://dev.mysql.com/doc/
- XAMPP Documentation: https://www.apachefriends.org/
- Laravel Database: https://laravel.com/docs/database
- phpMyAdmin: https://www.phpmyadmin.net/

### Useful Tools
- **MySQL Workbench:** Advanced database tool
- **Sequel Pro:** Database GUI (Mac only)
- **DBeaver:** Universal database tool
- **HeidiSQL:** Lightweight SQL client

### Common Errors & Fixes
- Check MySQL error log: `C:\xampp\mysql\logs\error.log`
- Check Apache error log: `C:\xampp\apache\logs\error.log`
- Check PHP error log: `C:\xampp\php\logs\error.log`

---

## Conclusion

You now have:
✅ MySQL 8 properly configured with XAMPP
✅ Database fully set up with all tables
✅ Sample data for testing
✅ Backup and recovery procedures
✅ Troubleshooting guide
✅ Security best practices

**Your database is ready for development!** 🚀

