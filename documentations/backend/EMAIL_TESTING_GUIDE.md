# Email Testing Guide

## Overview
This guide helps you test and troubleshoot email functionality in the Citron Society Documents application.

## Current SMTP Configuration
Based on your `.env` file:
- **Host**: mail.citronsociety.in
- **Port**: 465
- **Secure**: true (SSL/TLS)
- **User**: office@citronsociety.in
- **From**: office@citronsociety.in

## Testing Steps

### 1. Start the Backend Server
```bash
cd backend
npm run start:dev
```

Watch the console for the SMTP configuration log when the server starts:
```
🔧 Email Service Configuration: {
  host: 'mail.citronsociety.in',
  port: 465,
  secure: true,
  user: 'office@citronsociety.in',
  from: 'office@citronsociety.in'
}
```

### 2. Login to Admin Panel
1. Go to `http://localhost:3000/admin/login`
2. Login with admin credentials

### 3. Test SMTP Connection (Option 1 - API Call)
**Verify Connection:**
```bash
curl -X GET http://localhost:4000/api/admin/email/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected Response:
```json
{
  "success": true,
  "message": "SMTP connection verified successfully"
}
```

### 4. Send Test Email (Option 2 - API Call)
```bash
curl -X POST http://localhost:4000/api/admin/email/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test-email@example.com"}'
```

Expected Response:
```json
{
  "success": true,
  "message": "Test email sent successfully"
}
```

### 5. Test via Form Submission
1. Go to `http://localhost:3000/share-certificate` or `http://localhost:3000/nomination`
2. Fill out the form with your email address
3. Submit the form
4. Check backend console for logs:
   ```
   📧 Sending Share Certificate acknowledgement email to: your-email@example.com
   ✅ Acknowledgement email sent successfully: <message-id>
   ```
5. Check your email inbox for the acknowledgement email

### 6. Test Status Update Email
1. Login to admin panel
2. Go to dashboard and select a submission
3. Update the status (e.g., from "Pending" to "Under Review")
4. Click Update/Save
5. Check backend console for logs:
   ```
   📧 Sending Share Certificate status update email to: user@example.com | Status: Under Review
   ✅ Status update email sent successfully: <message-id>
   ```
6. Check the user's email inbox

## Common Issues & Solutions

### Issue 1: "SMTP connection verification failed"
**Possible Causes:**
1. Incorrect SMTP host or port
2. Firewall blocking port 465
3. Invalid credentials

**Solutions:**
- Verify SMTP settings with your hosting provider
- Try port 587 with `SMTP_SECURE=false` if port 465 is blocked
- Check if credentials are correct
- Ensure the hosting provider allows SMTP connections from your server IP

### Issue 2: "Error: self signed certificate"
**Solution:**
Add `rejectUnauthorized: false` to email service (only for development):
```typescript
this.transporter = nodemailer.createTransport({
  ...smtpConfig,
  tls: {
    rejectUnauthorized: false
  }
});
```

### Issue 3: "Error: Authentication failed"
**Solutions:**
- Double-check username and password in `.env`
- Ensure no extra spaces in credentials
- Try logging into your email provider's webmail to verify credentials
- Check if 2FA is enabled (may need app-specific password)

### Issue 4: Emails not sending but no error
**Solutions:**
- Check spam/junk folder
- Verify the "from" email is valid
- Check email server logs on hosting provider
- Ensure DNS records (SPF, DKIM) are configured

### Issue 5: Port 465 connection timeout
**Solution:**
Try using port 587 with STARTTLS:
```env
SMTP_PORT=587
SMTP_SECURE=false
```

## Email Logs to Monitor

### Successful Email Flow:
```
📧 Sending Share Certificate acknowledgement email to: user@example.com
✅ Acknowledgement email sent successfully: <unique-message-id>
```

### Failed Email Flow:
```
📧 Sending Share Certificate acknowledgement email to: user@example.com
❌ Error sending acknowledgement email: [Error details]
```

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] SMTP configuration appears in console on startup
- [ ] SMTP connection verification returns success
- [ ] Test email endpoint sends email successfully
- [ ] Share certificate form submission sends acknowledgement email
- [ ] Nomination form submission sends acknowledgement email
- [ ] Status update triggers automatic email notification
- [ ] Emails appear in recipient inbox (not spam)

## Need Help?

If emails still aren't working after following this guide:

1. **Check Backend Console Logs** - Look for specific error messages
2. **Contact Hosting Provider** - Verify SMTP settings and any restrictions
3. **Test SMTP Credentials** - Use an email client or online SMTP tester
4. **Check Firewall Rules** - Ensure outbound connections on port 465/587 are allowed
