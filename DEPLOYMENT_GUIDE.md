# Deployment Guide - Accounting Web Application

## Option 1: Deploy to Cloud Platform (Recommended)

### A. Frontend Deployment (Vercel - Free)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**
   ```bash
   cd frontend
   vercel
   ```
   - Follow prompts
   - Your app will be live at: `https://your-app.vercel.app`

### B. Backend Deployment (Railway/Heroku)

#### Railway (Free Tier Available)

1. Create account at https://railway.app
2. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

3. Deploy backend:
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

4. Add MySQL database:
   - In Railway dashboard, click "New" → "Database" → "MySQL"
   - Copy connection string
   - Add to environment variables

5. Set environment variables in Railway dashboard:
   ```
   APP_URL=https://your-backend.railway.app
   DB_CONNECTION=mysql
   DB_HOST=<from railway>
   DB_PORT=<from railway>
   DB_DATABASE=<from railway>
   DB_USERNAME=<from railway>
   DB_PASSWORD=<from railway>
   ```

6. Run migrations:
   ```bash
   railway run php artisan migrate
   railway run php artisan storage:link
   ```

---

## Option 2: Deploy as Desktop Application (Electron)

### Convert to Desktop App

1. **Install Electron**
   ```bash
   cd frontend
   npm install electron electron-builder --save-dev
   ```

2. **Create electron-main.js**
   (File created automatically - see electron-main.js)

3. **Update package.json**
   (File updated automatically - see frontend/package.json)

4. **Build Desktop App**
   ```bash
   npm run electron:build
   ```

   This creates installers in `dist/`:
   - Windows: `.exe` installer
   - Mac: `.dmg` installer
   - Linux: `.AppImage` installer

---

## Option 3: Deploy on Your Own Server (VPS)

### Requirements
- Ubuntu/Debian server
- Domain name (optional)
- SSH access

### Steps

1. **Connect to your server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install dependencies**
   ```bash
   sudo apt update
   sudo apt install nginx mysql-server php8.2 php8.2-fpm php8.2-mysql nodejs npm composer git
   ```

3. **Clone your project**
   ```bash
   cd /var/www
   git clone <your-repo> accounting-web
   cd accounting-web
   ```

4. **Setup Backend**
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate
   php artisan storage:link
   ```

5. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run build
   ```

6. **Configure Nginx**
   (See nginx.conf file created)

7. **Setup SSL (Free with Let's Encrypt)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

---

## Option 4: Docker Deployment

### Using Docker Compose

1. **Build and run**
   ```bash
   docker-compose up -d
   ```

2. **Access**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

---

## Recommended Setup for Production

### Free Tier Stack:
- **Frontend**: Vercel (Free)
- **Backend**: Railway (Free tier)
- **Database**: Railway MySQL (Free tier)
- **File Storage**: AWS S3 Free Tier or Railway Storage

### Total Cost: $0/month (with usage limits)

### Paid Stack (Scalable):
- **Frontend**: Vercel Pro ($20/month)
- **Backend**: Railway ($5-20/month)
- **Database**: Railway MySQL or Amazon RDS
- **File Storage**: AWS S3 ($0.023/GB)

---

## Post-Deployment Checklist

- [ ] Update frontend .env with production API URL
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up database backups
- [ ] Configure file upload limits
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Add analytics (Google Analytics)
- [ ] Test all features in production
- [ ] Set up error logging
- [ ] Configure email notifications
- [ ] Set up automated backups

---

## Quick Deploy Commands

### Vercel (Frontend)
```bash
cd frontend
npm run build
vercel --prod
```

### Railway (Backend)
```bash
cd backend
railway up
```

### Desktop App
```bash
cd frontend
npm run electron:build
```

Your installer will be in `frontend/dist/`!
