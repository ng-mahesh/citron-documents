# Production Deployment Guide

Complete guide for deploying the Housing Society Document Management System to production.

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
3. [Backend Deployment (AWS EC2)](#backend-deployment-aws-ec2)
4. [Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Troubleshooting](#troubleshooting)

---

## 🔍 Pre-Deployment Checklist

### Required Accounts & Services

- ✅ GitHub account (for code repository)
- ✅ Vercel account (for frontend hosting)
- ✅ AWS account (for backend hosting & S3)
- ✅ MongoDB Atlas account (for database)
- ✅ Domain name (optional, for custom domain)
- ✅ SMTP email service (already configured)

### Code Preparation

- [ ] All code committed to Git repository
- [ ] Environment variables documented
- [ ] Production build tested locally
- [ ] Database migrations ready
- [ ] Admin user creation script tested

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Production

#### 1.1 Update Environment Variables Template

Create `frontend/.env.production.example`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

#### 1.2 Verify Build Configuration

Check `frontend/package.json` has correct scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

#### 1.3 Test Production Build Locally

```bash
cd frontend
npm run build
npm run start
# Visit http://localhost:3000 to verify
```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push Code to GitHub**

   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Import Project to Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the `frontend` directory as root

3. **Configure Build Settings**

   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **Add Environment Variables**

   - Go to Project Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.com/api`
   - Click "Deploy"

5. **Get Your Deployment URL**
   - Vercel will provide: `https://your-app.vercel.app`
   - Note this URL for backend CORS configuration

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from frontend directory
cd frontend
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: citron-documents
# - Directory: ./
# - Override settings? No

# Deploy to production
vercel --prod
```

### Step 3: Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Wait for SSL certificate provisioning (automatic)

---

## 🚀 Backend Deployment (AWS EC2)

### Step 1: Prepare Backend for Production

#### 1.1 Create Production Environment File

Create `backend/.env.production.example`:

```bash
# Server Configuration
PORT=4000
NODE_ENV=production

# Frontend URL (Update after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app

# MongoDB Atlas (Update with your Atlas connection string)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/citron-documents?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-change-this
JWT_EXPIRES_IN=24h

# AWS S3 Configuration (Already configured)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=eu-north-1
AWS_S3_BUCKET_NAME=citron-documents

# SMTP Email Configuration (Already configured)
SMTP_HOST=mail.citronsociety.in
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=office@citronsociety.in
SMTP_PASS=your-smtp-password
SMTP_FROM_EMAIL=office@citronsociety.in
```

#### 1.2 Test Production Build Locally

```bash
cd backend
npm run build
npm run start:prod
# Verify it starts without errors
```

### Step 2: Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**

   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free tier

2. **Create a Cluster**

   - Choose AWS as cloud provider
   - Select region closest to your EC2 instance
   - Choose M0 (Free tier) or M10 (Recommended for production)

3. **Configure Database Access**

   - Database Access → Add New Database User
   - Username: `citron-admin`
   - Password: Generate secure password
   - Role: Atlas admin

4. **Configure Network Access**

   - Network Access → Add IP Address
   - For testing: Allow access from anywhere (0.0.0.0/0)
   - For production: Add your EC2 instance IP later

5. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy connection string:
   ```
   mongodb+srv://citron-admin:<password>@cluster0.xxxxx.mongodb.net/citron-documents?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password

### Step 3: Launch AWS EC2 Instance

#### 3.1 Create EC2 Instance

1. **Login to AWS Console**

   - Go to EC2 Dashboard
   - Click "Launch Instance"

2. **Configure Instance**

   - **Name**: citron-backend
   - **AMI**: Ubuntu Server 22.04 LTS
   - **Instance Type**: t2.micro (free tier) or t2.small (recommended)
   - **Key Pair**: Create new or use existing (download .pem file)
   - **Network Settings**:
     - Allow SSH (port 22) from your IP
     - Allow HTTP (port 80) from anywhere
     - Allow HTTPS (port 443) from anywhere
     - Allow Custom TCP (port 4000) from anywhere
   - **Storage**: 20 GB gp3
   - Click "Launch Instance"

3. **Note Your Instance Details**
   - Public IPv4 address: `xx.xx.xx.xx`
   - Public DNS: `ec2-xx-xx-xx-xx.compute.amazonaws.com`

#### 3.2 Connect to EC2 Instance

```bash
# Change permissions on key file (first time only)
chmod 400 your-key.pem

# Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

#### 3.3 Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x
npm --version

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx (Reverse Proxy)
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

### Step 4: Deploy Backend Application

#### 4.1 Clone Repository

```bash
# Create app directory
sudo mkdir -p /var/www
sudo chown -R ubuntu:ubuntu /var/www
cd /var/www

# Clone your repository
git clone https://github.com/your-username/citron-documents.git
cd citron-documents/backend
```

#### 4.2 Install Dependencies & Build

```bash
# Install dependencies
npm install

# Build application
npm run build

# Verify build
ls -la dist/
```

#### 4.3 Configure Environment Variables

```bash
# Create production environment file
nano .env.production

# Paste your production environment variables
# (Use the template from Step 1.1)
# Press Ctrl+X, then Y, then Enter to save
```

#### 4.4 Create Admin User

```bash
# Run admin creation script
NODE_ENV=production npx ts-node src/scripts/create-admin.ts

# Note the credentials displayed
```

#### 4.5 Start Application with PM2

```bash
# Start application
pm2 start dist/main.js --name citron-backend --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Copy and run the command it outputs

# Check status
pm2 status
pm2 logs citron-backend
```

### Step 5: Configure Nginx Reverse Proxy

#### 5.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/citron-backend
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Or use EC2 public DNS

    # Increase upload size for file uploads
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout settings for long uploads
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }
}
```

#### 5.2 Enable Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/citron-backend /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

### Step 6: Configure SSL with Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 7: Update Frontend with Backend URL

1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL`:
   - With SSL: `https://your-domain.com/api`
   - Without SSL: `http://your-ec2-ip/api`
4. Redeploy frontend (Deployments → Latest → Redeploy)

### Step 8: Update Backend CORS Settings

```bash
# On EC2 instance
cd /var/www/citron-documents/backend
nano .env.production
```

Update `FRONTEND_URL` to your Vercel URL:

```bash
FRONTEND_URL=https://your-app.vercel.app
```

Restart the backend:

```bash
pm2 restart citron-backend
```

---

## ✅ Post-Deployment Verification

### Frontend Checks

1. **Visit Your Frontend URL**

   ```
   https://your-app.vercel.app
   ```

2. **Test Pages**

   - [ ] Home page loads
   - [ ] Share Certificate form loads
   - [ ] Nomination form loads
   - [ ] Status check page works
   - [ ] Admin login page loads

3. **Check Console**
   - Open browser DevTools (F12)
   - No errors in Console tab
   - Network tab shows successful API calls

### Backend Checks

1. **Health Check**

   ```bash
   curl https://your-backend-url.com/api
   # Should return API response
   ```

2. **Test Admin Login**

   - Visit: `https://your-app.vercel.app/admin/login`
   - Login with admin credentials
   - Dashboard should load with stats

3. **Test File Upload**

   - Submit a test share certificate
   - Verify file uploads to S3
   - Check email received

4. **Check PM2 Status**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   pm2 status
   pm2 logs citron-backend --lines 50
   ```

### Database Checks

1. **MongoDB Atlas**
   - Login to Atlas dashboard
   - Check database has collections
   - Verify data is being written

---

## 🔧 Troubleshooting

### Frontend Issues

**Issue**: API calls failing with CORS error

- **Solution**: Verify `FRONTEND_URL` in backend `.env.production` matches your Vercel URL exactly

**Issue**: Environment variables not working

- **Solution**: Redeploy on Vercel after changing environment variables

**Issue**: Build failing on Vercel

- **Solution**: Check build logs, ensure `npm run build` works locally

### Backend Issues

**Issue**: PM2 process keeps restarting

```bash
pm2 logs citron-backend --lines 100
# Check for errors in logs
```

**Issue**: Cannot connect to MongoDB

- **Solution**: Check MongoDB Atlas network access allows EC2 IP
- Verify connection string is correct
- Test connection: `mongosh "your-connection-string"`

**Issue**: File uploads failing

- **Solution**: Verify AWS credentials in `.env.production`
- Check S3 bucket permissions
- Verify Nginx `client_max_body_size` is set

**Issue**: Nginx 502 Bad Gateway

```bash
# Check if backend is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart citron-backend
sudo systemctl restart nginx
```

### Common Commands

```bash
# View backend logs
pm2 logs citron-backend

# Restart backend
pm2 restart citron-backend

# Check Nginx status
sudo systemctl status nginx

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check disk space
df -h

# Check memory usage
free -h

# Update code
cd /var/www/citron-documents
git pull origin main
cd backend
npm install
npm run build
pm2 restart citron-backend
```

---

## 🔄 Updating Your Application

### Frontend Updates

```bash
# Local machine
git add .
git commit -m "Update frontend"
git push origin main

# Vercel will auto-deploy
# Or manually redeploy from Vercel dashboard
```

### Backend Updates

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Navigate to project
cd /var/www/citron-documents/backend

# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Rebuild
npm run build

# Restart application
pm2 restart citron-backend

# Check logs
pm2 logs citron-backend
```

---

## 📊 Monitoring & Maintenance

### Set Up Monitoring

1. **PM2 Monitoring**

   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 7
   ```

2. **Vercel Analytics**

   - Enable in Vercel dashboard
   - Monitor page views and performance

3. **MongoDB Atlas Monitoring**
   - Check Atlas dashboard for database metrics
   - Set up alerts for high CPU/memory usage

### Regular Maintenance

- [ ] Weekly: Check PM2 logs for errors
- [ ] Weekly: Review MongoDB Atlas metrics
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review S3 storage usage
- [ ] Quarterly: Renew SSL certificates (auto-renewed by Certbot)
- [ ] Quarterly: Review and optimize database indexes

---

## 📞 Support & Resources

- **Vercel Documentation**: https://vercel.com/docs
- **AWS EC2 Documentation**: https://docs.aws.amazon.com/ec2/
- **MongoDB Atlas Documentation**: https://docs.atlas.mongodb.com/
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/
- **Nginx Documentation**: https://nginx.org/en/docs/

---

## 🎉 Deployment Complete!

Your application is now live in production:

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend-url.com
- **Admin Panel**: https://your-app.vercel.app/admin/login

**Next Steps**:

1. Share the URLs with your team
2. Test all features thoroughly
3. Set up monitoring and alerts
4. Create backup strategy for database
5. Document any custom configurations

Good luck with your production deployment! 🚀
