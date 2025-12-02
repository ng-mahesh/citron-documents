# Quick Deployment Checklist

## Pre-Deployment

- [ ] Code tested locally
- [ ] All environment variables documented
- [ ] Production build tested
- [ ] Database backup created (if migrating)
- [ ] Admin credentials secured

## Frontend (Vercel)

- [ ] Repository pushed to GitHub
- [ ] Project imported to Vercel
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active

## Backend (AWS EC2)

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access configured
- [ ] EC2 instance launched
- [ ] Security groups configured
- [ ] Node.js & PM2 installed
- [ ] Nginx installed & configured
- [ ] Code cloned to server
- [ ] Dependencies installed
- [ ] Production build created
- [ ] Environment variables set
- [ ] Admin user created
- [ ] PM2 process started
- [ ] SSL certificate installed (optional)

## Integration

- [ ] Backend URL updated in Vercel
- [ ] Frontend URL updated in backend CORS
- [ ] Both apps redeployed

## Verification

- [ ] Frontend loads correctly
- [ ] API calls working
- [ ] Admin login functional
- [ ] File uploads working
- [ ] Email notifications sending
- [ ] Database writing correctly

## Post-Deployment

- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Team notified
- [ ] Documentation updated
- [ ] URLs shared with stakeholders

---

## Quick Reference URLs

**Frontend**: https://your-app.vercel.app
**Backend**: https://your-backend-url.com
**Admin Panel**: https://your-app.vercel.app/admin/login
**MongoDB Atlas**: https://cloud.mongodb.com
**AWS Console**: https://console.aws.amazon.com

---

## Emergency Contacts

**Vercel Support**: https://vercel.com/support
**AWS Support**: https://console.aws.amazon.com/support
**MongoDB Support**: https://support.mongodb.com
