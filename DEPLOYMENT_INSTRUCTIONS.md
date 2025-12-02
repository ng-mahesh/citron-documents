# Citron Society Documents - Vercel Deployment Instructions

## Your Deployment Configuration

### Domains
- **Frontend**: https://documents.citronsociety.in/
- **Backend**: https://api.citronsociety.in/

---

## Backend Deployment Steps

### 1. Deploy Backend to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Configure deployment:
   - **Framework Preset**: Other (or NestJS if available)
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2. Configure Backend Environment Variables

Go to your backend project → Settings → Environment Variables

Add the following variables (for Production, Preview, and Development):

```env
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://documents.citronsociety.in

# MongoDB Configuration (Use MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/citron-society-documents

# JWT Configuration
JWT_SECRET=your-strong-secret-key-generate-with-openssl
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
SMTP_PASS=your-gmail-app-password
SMTP_FROM_EMAIL=noreply@citronsociety.in
```

### 3. Configure Custom Domain for Backend

1. In your backend project, go to Settings → Domains
2. Add domain: `api.citronsociety.in`
3. Configure DNS records at your domain registrar:
   - **Type**: CNAME
   - **Name**: api
   - **Value**: cname.vercel-dns.com
4. Wait for DNS propagation (can take up to 48 hours)

### 4. Redeploy Backend

After adding environment variables:
1. Go to Deployments tab
2. Click (...) on latest deployment → Redeploy

---

## Frontend Deployment Steps

### 1. Deploy Frontend to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your Git repository (same repo or select if already imported)
4. Configure deployment:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 2. Configure Frontend Environment Variables

Go to your frontend project → Settings → Environment Variables

Add this variable (for Production, Preview, and Development):

```env
NEXT_PUBLIC_API_URL=https://api.citronsociety.in/api
```

**Important**: Make sure the URL ends with `/api` because your backend uses this global prefix.

### 3. Configure Custom Domain for Frontend

1. In your frontend project, go to Settings → Domains
2. Add domain: `documents.citronsociety.in`
3. Configure DNS records at your domain registrar:
   - **Type**: CNAME
   - **Name**: documents
   - **Value**: cname.vercel-dns.com
4. Wait for DNS propagation

### 4. Redeploy Frontend

After adding environment variables:
1. Go to Deployments tab
2. Click (...) on latest deployment → Redeploy

---

## DNS Configuration Summary

Configure these records at your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | api | cname.vercel-dns.com | Auto/3600 |
| CNAME | documents | cname.vercel-dns.com | Auto/3600 |

**Alternative**: If using Cloudflare, you may need to:
- Disable "Proxied" (orange cloud) and use "DNS only" (grey cloud)
- Or follow Vercel's specific Cloudflare instructions

---

## Environment Variables Reference

### Backend (.env)

```bash
# Server Configuration
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://documents.citronsociety.in

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/citron-society-documents

# JWT Configuration (Generate secret: openssl rand -base64 32)
JWT_SECRET=your-strong-secret-key-here
JWT_EXPIRES_IN=24h

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=citron-society-documents

# SMTP Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM_EMAIL=noreply@citronsociety.in
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=https://api.citronsociety.in/api
```

---

## Pre-Deployment Checklist

### MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
- [ ] Create a new cluster (free tier available)
- [ ] Create database user with password
- [ ] Whitelist all IPs (0.0.0.0/0) in Network Access
- [ ] Get connection string from "Connect" → "Connect your application"
- [ ] Replace `<password>` in connection string with actual password
- [ ] Replace `<database>` with `citron-society-documents`

### AWS S3 Setup
- [ ] Create S3 bucket (e.g., `citron-society-documents`)
- [ ] Configure bucket CORS policy (see AWS_S3_SETUP_GUIDE.md in backend folder)
- [ ] Create IAM user with S3 access
- [ ] Generate access key and secret key
- [ ] Save credentials securely

### Gmail SMTP Setup (if using Gmail)
- [ ] Enable 2-Factor Authentication on your Google account
- [ ] Generate App Password:
  1. Go to Google Account → Security
  2. Search for "App passwords"
  3. Select app: "Mail", device: "Other"
  4. Copy the 16-character password
- [ ] Use this app password as `SMTP_PASS`

### Generate JWT Secret
```bash
# Run this command to generate a secure JWT secret
openssl rand -base64 32
```

---

## Deployment Process

### Step-by-Step:

1. **Prepare External Services**
   - Set up MongoDB Atlas
   - Set up AWS S3 bucket
   - Set up Gmail App Password (or other SMTP)
   - Generate JWT secret

2. **Deploy Backend**
   - Push code to Git (if not already)
   - Import project to Vercel
   - Configure root directory: `backend`
   - Add all environment variables
   - Add custom domain: `api.citronsociety.in`
   - Deploy and verify

3. **Deploy Frontend**
   - Import project to Vercel (or select existing)
   - Configure root directory: `frontend`
   - Add environment variable: `NEXT_PUBLIC_API_URL`
   - Add custom domain: `documents.citronsociety.in`
   - Deploy and verify

4. **Configure DNS**
   - Add CNAME records at domain registrar
   - Wait for propagation (5 mins to 48 hours)
   - Verify SSL certificates are issued

5. **Verify Deployment**
   - Test backend: `https://api.citronsociety.in/api`
   - Test frontend: `https://documents.citronsociety.in/`
   - Test login functionality
   - Test file upload (S3)
   - Test email sending
   - Check browser console for errors

---

## Post-Deployment Testing

### 1. Test Backend API
Open browser and test:
```
https://api.citronsociety.in/api
```
You should see some response (even if it's an error, it means the server is running).

### 2. Test Frontend
Open:
```
https://documents.citronsociety.in/
```
You should see your application homepage.

### 3. Test Integration
1. Try to login with admin credentials
2. Upload a test document
3. Check if email notifications work
4. Verify documents are stored in S3

### 4. Check Browser Console
- Open DevTools (F12)
- Go to Console tab
- Look for any errors (especially CORS or API errors)
- Go to Network tab
- Verify API calls are going to `api.citronsociety.in`

---

## Troubleshooting

### CORS Errors
If you see CORS errors in the browser:
1. Verify `FRONTEND_URL` in backend is: `https://documents.citronsociety.in`
2. No trailing slash at the end
3. Redeploy backend after changing

### API Not Found (404)
If API calls return 404:
1. Verify `NEXT_PUBLIC_API_URL` ends with `/api`
2. Should be: `https://api.citronsociety.in/api`
3. Redeploy frontend after changing

### MongoDB Connection Failed
1. Check MongoDB Atlas Network Access allows 0.0.0.0/0
2. Verify connection string format
3. Ensure password is URL-encoded if it has special characters
4. Test connection string locally first

### S3 Upload Fails
1. Verify AWS credentials are correct
2. Check S3 bucket CORS configuration
3. Ensure IAM user has proper permissions
4. Check bucket region matches `AWS_REGION`

### Email Not Sending
1. Verify Gmail App Password is correct (16 characters, no spaces)
2. Check SMTP settings match your provider
3. Test with the `test-smtp.js` script in backend folder locally first
4. Check Vercel function logs for error messages

---

## Maintenance

### Update Environment Variables
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Edit the variable
3. **Important**: Redeploy after updating variables
4. Go to Deployments → Click (...) → Redeploy

### View Logs
1. Go to Vercel Dashboard → Project → Deployments
2. Click on a deployment
3. Click "View Function Logs"
4. Filter by time/status

### Rollback Deployment
1. Go to Deployments tab
2. Find a previous working deployment
3. Click (...) → Promote to Production

---

## Security Reminders

- [ ] Never commit `.env` files to Git
- [ ] Use strong passwords for MongoDB and other services
- [ ] Rotate AWS credentials periodically
- [ ] Enable 2FA on Vercel account
- [ ] Enable 2FA on MongoDB Atlas
- [ ] Enable 2FA on AWS account
- [ ] Review Vercel access logs regularly
- [ ] Keep dependencies updated (`npm audit`)

---

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **AWS S3 Docs**: https://docs.aws.amazon.com/s3/
- **NestJS Deployment**: https://docs.nestjs.com/faq/serverless
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

## Quick Commands

### Deploy Backend (CLI)
```bash
cd backend
vercel --prod
```

### Deploy Frontend (CLI)
```bash
cd frontend
vercel --prod
```

### View Logs (CLI)
```bash
vercel logs [deployment-url]
```

### Set Environment Variable (CLI)
```bash
cd backend  # or frontend
vercel env add VARIABLE_NAME production
```

---

## Success Indicators

Your deployment is successful when:
- ✅ Backend URL responds: `https://api.citronsociety.in/api`
- ✅ Frontend loads: `https://documents.citronsociety.in/`
- ✅ SSL certificate is valid (padlock icon in browser)
- ✅ Login works and creates session
- ✅ File upload saves to S3
- ✅ Email notifications are sent
- ✅ No CORS errors in browser console
- ✅ API calls appear in Network tab with 200/201 status codes

---

**Last Updated**: December 2, 2025

Good luck with your deployment! 🚀
