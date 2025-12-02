# Vercel Deployment Guide

This guide will help you deploy both your frontend and backend applications to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed: `npm install -g vercel`
3. Git repository pushed to GitHub/GitLab/Bitbucket

## Backend Deployment (NestJS)

### Step 1: Prepare Backend for Deployment

The backend is already configured with a `vercel.json` file. Before deploying:

1. Make sure your code is committed to git
2. Build your backend locally to test:
   ```bash
   cd backend
   npm run build
   ```

### Step 2: Deploy Backend to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Vercel will auto-detect your project. Configure it as follows:
   - **Framework Preset**: Select "Other" or "NestJS"
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
cd backend
vercel --prod
```

### Step 3: Configure Backend Environment Variables

In the Vercel Dashboard for your backend project:

1. Go to "Settings" → "Environment Variables"
2. Add the following variables:

#### Required Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (Vercel handles this) | `4000` |
| `FRONTEND_URL` | Your frontend URL | `https://your-frontend.vercel.app` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-strong-secret-key-here` |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` |
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 | Your AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for S3 | Your AWS secret key |
| `AWS_REGION` | AWS region | `ap-south-1` |
| `AWS_S3_BUCKET_NAME` | S3 bucket name | `your-bucket-name` |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `465` |
| `SMTP_SECURE` | Use SSL/TLS | `true` |
| `SMTP_USER` | SMTP username | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP password/app password | `your-app-password` |
| `SMTP_FROM_EMAIL` | From email address | `noreply@yourdomain.com` |

**Important Notes:**
- For MongoDB, use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas
- For Gmail SMTP, you need to use an App Password (not your regular password)
- Make sure your AWS S3 bucket is properly configured with CORS

### Step 4: Get Backend URL

After deployment, Vercel will provide a URL like:
```
https://your-backend-name.vercel.app
```

Save this URL - you'll need it for the frontend configuration.

---

## Frontend Deployment (Next.js)

### Step 1: Prepare Frontend for Deployment

The frontend needs to know your backend URL.

### Step 2: Deploy Frontend to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your Git repository (if not already done)
4. Configure the deployment:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

5. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
cd frontend
vercel --prod
```

### Step 3: Configure Frontend Environment Variables

In the Vercel Dashboard for your frontend project:

1. Go to "Settings" → "Environment Variables"
2. Add the following variable:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://your-backend-name.vercel.app/api` |

**Important:**
- The variable MUST start with `NEXT_PUBLIC_` to be accessible in the browser
- Include the `/api` suffix as your backend uses this global prefix
- Example: `https://citron-backend.vercel.app/api`

### Step 4: Redeploy Frontend

After adding environment variables, you need to trigger a new deployment:
1. Go to "Deployments" tab
2. Click the three dots on the latest deployment
3. Select "Redeploy"
4. Check "Use existing Build Cache" (optional)
5. Click "Redeploy"

---

## Post-Deployment Configuration

### Update CORS Settings

After both deployments, you need to update the CORS configuration:

1. In Vercel Dashboard, go to your **backend** project
2. Update the `FRONTEND_URL` environment variable with your actual frontend URL:
   ```
   https://your-frontend-name.vercel.app
   ```
3. Redeploy the backend

### Update Frontend API URL

If you deployed backend after frontend:
1. Go to your **frontend** project in Vercel
2. Update `NEXT_PUBLIC_API_URL` with your backend URL
3. Redeploy the frontend

---

## Environment Variables Quick Reference

### Backend Environment Variables (.env)

```env
# Server Configuration
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://your-frontend.vercel.app

# MongoDB Configuration
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# JWT Configuration
JWT_SECRET=your-strong-secret-key-here
JWT_EXPIRES_IN=24h

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=your-s3-bucket-name

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

### Frontend Environment Variables (.env.local)

```env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api
```

---

## Setting Environment Variables via Vercel Dashboard

### Step-by-Step:

1. **Navigate to Project Settings**
   - Go to https://vercel.com/dashboard
   - Select your project
   - Click "Settings" tab

2. **Add Environment Variables**
   - Click "Environment Variables" in the left sidebar
   - For each variable:
     - Enter the **Key** (e.g., `MONGODB_URI`)
     - Enter the **Value** (e.g., your actual MongoDB URI)
     - Select environment: **Production**, **Preview**, **Development** (usually select all)
     - Click "Save"

3. **Redeploy After Adding Variables**
   - Go to "Deployments" tab
   - Click the three dots (...) on the latest deployment
   - Click "Redeploy"

### Using Vercel CLI to Set Variables:

```bash
# Set a single environment variable
vercel env add MONGODB_URI production

# You'll be prompted to enter the value

# Pull environment variables to local
vercel env pull
```

---

## Verification Steps

### Backend Verification:

1. Visit your backend URL: `https://your-backend.vercel.app/api`
2. You should see a response (may be a 404 or a default route response)
3. Test a specific endpoint: `https://your-backend.vercel.app/api/auth/login`

### Frontend Verification:

1. Visit your frontend URL: `https://your-frontend.vercel.app`
2. Open browser DevTools → Network tab
3. Try to login or perform an action
4. Check if API calls are going to your backend URL
5. Verify no CORS errors in the console

---

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Make sure `FRONTEND_URL` in backend matches your actual frontend URL
   - Verify backend is deployed and running
   - Check browser console for specific CORS error messages

2. **Environment Variables Not Working**
   - Redeploy after adding/updating environment variables
   - For Next.js, variables must start with `NEXT_PUBLIC_` for client-side access
   - Check "Environment Variables" in Vercel dashboard to confirm they're set

3. **MongoDB Connection Issues**
   - Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
   - Check MongoDB URI format: `mongodb+srv://username:password@cluster.mongodb.net/database`
   - Ensure password is URL-encoded if it contains special characters

4. **Build Failures**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Verify build command works locally

5. **API Calls Failing**
   - Check if `NEXT_PUBLIC_API_URL` ends with `/api`
   - Verify backend is deployed and accessible
   - Check Network tab in browser DevTools for actual URLs being called

---

## Domain Configuration (Optional)

### Add Custom Domain:

1. Go to project "Settings" → "Domains"
2. Click "Add Domain"
3. Enter your domain name (e.g., `citron-docs.com`)
4. Follow DNS configuration instructions
5. Vercel will automatically provision SSL certificate

### Point Backend to Subdomain:

- Backend: `api.citron-docs.com`
- Frontend: `citron-docs.com`

Update environment variables accordingly after domain setup.

---

## Continuous Deployment

Vercel automatically redeploys when you push to your connected Git branch:

1. **Production**: Push to `main` or `master` branch
2. **Preview**: Push to any other branch (creates preview deployment)

To disable auto-deployment:
- Go to "Settings" → "Git"
- Configure deployment branches

---

## Monitoring and Logs

### View Logs:

1. Go to your project in Vercel Dashboard
2. Click "Deployments"
3. Click on a deployment
4. Click "View Function Logs" or "View Build Logs"

### Monitor Performance:

- Vercel provides analytics in the "Analytics" tab
- Monitor API response times
- Track deployment frequency

---

## Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use strong JWT secrets** - Generate with: `openssl rand -base64 32`
3. **Rotate credentials regularly** - Especially AWS and database credentials
4. **Use MongoDB Atlas IP whitelist** - If possible, restrict to Vercel IPs
5. **Enable 2FA on Vercel** - Protect your deployment account
6. **Review Vercel logs** - Monitor for suspicious activity

---

## Support and Resources

- Vercel Documentation: https://vercel.com/docs
- NestJS Deployment: https://docs.nestjs.com/faq/serverless
- Next.js Deployment: https://nextjs.org/docs/deployment
- Vercel Support: https://vercel.com/support

---

## Quick Deployment Checklist

- [ ] MongoDB Atlas database created and connection string obtained
- [ ] AWS S3 bucket created and credentials obtained
- [ ] SMTP credentials configured (Gmail App Password if using Gmail)
- [ ] Backend deployed to Vercel
- [ ] Backend environment variables configured in Vercel
- [ ] Backend URL obtained
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variable (`NEXT_PUBLIC_API_URL`) configured
- [ ] Both apps redeployed after environment variable configuration
- [ ] Test login and API functionality
- [ ] Verify file upload works (S3)
- [ ] Verify email sending works (SMTP)
- [ ] Check for CORS errors in browser console
- [ ] Test all major features end-to-end

---

**Note**: After completing the deployment, save all your URLs and credentials securely. You'll need them for maintenance and updates.
