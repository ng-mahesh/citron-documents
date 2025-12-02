# Citron Society Documents - Vercel Deployment Checklist

## Pre-Deployment Setup

### 1. MongoDB Atlas (Required)
- [ ] Create account at https://www.mongodb.com/cloud/atlas
- [ ] Create new cluster (M0 Free tier is fine for testing)
- [ ] Create database user:
  - Username: ________________
  - Password: ________________ (save securely!)
- [ ] Configure Network Access:
  - [ ] Add IP: 0.0.0.0/0 (allows from anywhere - needed for Vercel)
- [ ] Get connection string:
  - [ ] Click "Connect" → "Connect your application"
  - [ ] Copy connection string
  - [ ] Replace `<password>` with actual password
  - [ ] Replace `<database>` with: `citron-society-documents`
  - Final format: `mongodb+srv://username:password@cluster.mongodb.net/citron-society-documents`

**Save your MongoDB URI**: ____________________________________

---

### 2. AWS S3 Bucket (Required)
- [ ] Create AWS account at https://aws.amazon.com
- [ ] Create S3 bucket:
  - Bucket name: ________________
  - Region: ap-south-1 (Asia Pacific Mumbai)
  - [ ] Uncheck "Block all public access" for uploaded files
- [ ] Configure CORS (see backend/AWS_S3_SETUP_GUIDE.md)
- [ ] Create IAM user for programmatic access:
  - [ ] Go to IAM → Users → Add user
  - [ ] Enable "Programmatic access"
  - [ ] Attach policy: AmazonS3FullAccess
  - [ ] **Save credentials securely**:
    - Access Key ID: ________________
    - Secret Access Key: ________________

---

### 3. Gmail SMTP (Required for emails)
- [ ] Use existing Gmail account or create new one
- [ ] Enable 2-Factor Authentication:
  - [ ] Google Account → Security → 2-Step Verification
- [ ] Generate App Password:
  - [ ] Google Account → Security → App passwords
  - [ ] Select app: Mail, Device: Other (Custom name)
  - [ ] Copy 16-character password: ________________

**Note**: Do NOT use your regular Gmail password, use the App Password!

---

### 4. JWT Secret (Required)
- [ ] Generate a secure JWT secret:

**Run this command**:
```bash
openssl rand -base64 32
```

**Save your JWT secret**: ____________________________________

---

## Backend Deployment

### Step 1: Deploy to Vercel
- [ ] Go to https://vercel.com/dashboard
- [ ] Click "Add New..." → "Project"
- [ ] Import your Git repository
- [ ] Configure project:
  - [ ] Framework: Other
  - [ ] Root Directory: `backend`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
  - [ ] Install Command: `npm install`
- [ ] Click "Deploy" (will fail without env vars - that's OK)

### Step 2: Add Environment Variables
- [ ] Go to Settings → Environment Variables
- [ ] Add each variable from `backend/.env.vercel`:

**Copy values from your setup above**:

| Variable | Value | ✓ |
|----------|-------|---|
| NODE_ENV | production | [ ] |
| PORT | 4000 | [ ] |
| FRONTEND_URL | https://documents.citronsociety.in | [ ] |
| MONGODB_URI | (from step 1) | [ ] |
| JWT_SECRET | (from step 4) | [ ] |
| JWT_EXPIRES_IN | 24h | [ ] |
| AWS_ACCESS_KEY_ID | (from step 2) | [ ] |
| AWS_SECRET_ACCESS_KEY | (from step 2) | [ ] |
| AWS_REGION | ap-south-1 | [ ] |
| AWS_S3_BUCKET_NAME | (from step 2) | [ ] |
| SMTP_HOST | smtp.gmail.com | [ ] |
| SMTP_PORT | 465 | [ ] |
| SMTP_SECURE | true | [ ] |
| SMTP_USER | (your gmail) | [ ] |
| SMTP_PASS | (App Password from step 3) | [ ] |
| SMTP_FROM_EMAIL | noreply@citronsociety.in | [ ] |

**Important**: Select "Production", "Preview", and "Development" for each variable!

### Step 3: Configure Custom Domain
- [ ] Go to Settings → Domains
- [ ] Add domain: `api.citronsociety.in`
- [ ] Configure DNS at your domain registrar:
  - Type: CNAME
  - Name: api
  - Value: cname.vercel-dns.com
  - TTL: Auto or 3600
- [ ] Wait for DNS propagation (can take up to 48 hours)
- [ ] Verify SSL certificate is issued (green padlock)

### Step 4: Redeploy
- [ ] Go to Deployments tab
- [ ] Click (...) on latest deployment
- [ ] Click "Redeploy"
- [ ] Wait for deployment to complete
- [ ] Check deployment logs for errors

### Step 5: Test Backend
- [ ] Visit: https://api.citronsociety.in/api
- [ ] Should see response (may be 404, but proves it's running)

---

## Frontend Deployment

### Step 1: Deploy to Vercel
- [ ] Go to https://vercel.com/dashboard
- [ ] Click "Add New..." → "Project"
- [ ] Select same Git repository (or import again)
- [ ] Configure project:
  - [ ] Framework: Next.js (should auto-detect)
  - [ ] Root Directory: `frontend`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `.next`
  - [ ] Install Command: `npm install`
- [ ] Click "Deploy"

### Step 2: Add Environment Variables
- [ ] Go to Settings → Environment Variables
- [ ] Add variable:

| Variable | Value | ✓ |
|----------|-------|---|
| NEXT_PUBLIC_API_URL | https://api.citronsociety.in/api | [ ] |

**Important**:
- Must start with `NEXT_PUBLIC_`
- Must end with `/api`
- Select "Production", "Preview", and "Development"

### Step 3: Configure Custom Domain
- [ ] Go to Settings → Domains
- [ ] Add domain: `documents.citronsociety.in`
- [ ] Configure DNS at your domain registrar:
  - Type: CNAME
  - Name: documents
  - Value: cname.vercel-dns.com
  - TTL: Auto or 3600
- [ ] Wait for DNS propagation
- [ ] Verify SSL certificate is issued

### Step 4: Redeploy
- [ ] Go to Deployments tab
- [ ] Click (...) on latest deployment
- [ ] Click "Redeploy"
- [ ] Wait for deployment to complete

### Step 5: Test Frontend
- [ ] Visit: https://documents.citronsociety.in
- [ ] Should see your application homepage
- [ ] Open browser DevTools (F12)
- [ ] Check Console for errors
- [ ] Check Network tab - API calls should go to api.citronsociety.in

---

## Post-Deployment Verification

### 1. Test Complete Flow
- [ ] Open: https://documents.citronsociety.in
- [ ] Try to login with admin credentials
- [ ] Create a test share certificate
- [ ] Upload a document
- [ ] Verify email notification is sent
- [ ] Download the generated PDF
- [ ] Check browser console - no CORS errors

### 2. Backend Verification
- [ ] Backend URL accessible: https://api.citronsociety.in/api
- [ ] MongoDB connected (check Vercel function logs)
- [ ] No errors in Vercel deployment logs

### 3. Frontend Verification
- [ ] Frontend loads: https://documents.citronsociety.in
- [ ] No 404 errors
- [ ] API calls work (check Network tab)
- [ ] No CORS errors in console

### 4. Integration Tests
- [ ] Authentication works (login/logout)
- [ ] File upload works (saves to S3)
- [ ] File download works
- [ ] Email sending works
- [ ] PDF generation works
- [ ] All forms submit successfully

---

## Troubleshooting

### If Backend Deployment Fails
- [ ] Check build logs in Vercel
- [ ] Verify all dependencies in package.json
- [ ] Test build locally: `cd backend && npm run build`

### If Environment Variables Don't Work
- [ ] Verify variables are added in Vercel dashboard
- [ ] Redeploy after adding variables
- [ ] Check variable names are exact (case-sensitive)
- [ ] For Next.js, ensure variables start with NEXT_PUBLIC_

### If CORS Errors Occur
- [ ] Verify FRONTEND_URL in backend matches exactly: https://documents.citronsociety.in
- [ ] No trailing slash
- [ ] Redeploy backend after fixing

### If MongoDB Connection Fails
- [ ] Check Network Access in MongoDB Atlas allows 0.0.0.0/0
- [ ] Verify connection string format is correct
- [ ] Test connection string locally first
- [ ] Check username/password have no special characters (or are URL-encoded)

### If S3 Upload Fails
- [ ] Verify AWS credentials are correct
- [ ] Check IAM user has S3 permissions
- [ ] Verify bucket CORS configuration
- [ ] Check bucket region matches AWS_REGION env var

### If Emails Don't Send
- [ ] Verify using Gmail App Password (not regular password)
- [ ] Check 2FA is enabled on Gmail
- [ ] App Password is 16 characters with no spaces
- [ ] Test SMTP locally with backend/test-smtp.js first

### If Domain Not Working
- [ ] Wait longer (DNS can take up to 48 hours)
- [ ] Check DNS records are configured correctly
- [ ] Use `nslookup api.citronsociety.in` to verify DNS
- [ ] Try clearing browser cache
- [ ] Try incognito/private browsing mode

---

## Final Checks

- [ ] Both apps are deployed and accessible
- [ ] Custom domains are configured and SSL is active
- [ ] All environment variables are set correctly
- [ ] Test user can login
- [ ] Test document upload works
- [ ] Test email sending works
- [ ] No console errors
- [ ] No CORS errors
- [ ] Production URLs saved securely

---

## Maintenance

### Regular Tasks
- [ ] Monitor Vercel function logs weekly
- [ ] Check MongoDB Atlas usage monthly
- [ ] Review AWS S3 storage monthly
- [ ] Rotate credentials quarterly
- [ ] Update dependencies monthly (`npm audit`)

### Backup Strategy
- [ ] MongoDB Atlas has automatic backups
- [ ] AWS S3 has versioning enabled (recommended)
- [ ] Keep copy of environment variables secure
- [ ] Document any custom configurations

---

## Contact & Support

If you encounter issues:
1. Check Vercel function logs first
2. Check browser console for client-side errors
3. Review this checklist for missed steps
4. Consult DEPLOYMENT_INSTRUCTIONS.md for detailed guidance
5. Reach out to Vercel support: https://vercel.com/support

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Backend URL**: https://api.citronsociety.in
**Frontend URL**: https://documents.citronsociety.in

---

## Success! 🎉

Once all checkboxes are marked, your Citron Society Documents application is fully deployed and ready for production use!

**Next Steps**:
1. Share URLs with stakeholders
2. Create admin users as needed
3. Import any existing data
4. Set up monitoring/alerts
5. Plan regular maintenance schedule
