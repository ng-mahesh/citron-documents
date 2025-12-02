# SMTP Troubleshooting Guide

## Current Situation
✅ Webmail works - You can send emails from webmail
✅ Outlook works - You can send emails from Outlook
❌ Application doesn't work - Emails not being received

This indicates the SMTP credentials are correct, but the application's SMTP client configuration needs adjustment.

## Quick Test

### Step 1: Run the Standalone SMTP Test
```bash
cd backend
node test-smtp.js your-personal-email@example.com
```

This will:
1. Verify SMTP connection
2. Send a test email
3. Show detailed error messages if it fails

### Step 2: Check the Console Output
Look for these messages:
- ✅ "SMTP Connection Verified Successfully" - Good sign!
- ✅ "Test email sent successfully" - Email was accepted by server
- ❌ Any error messages - See solutions below

## Common Issues & Solutions

### Issue 1: Connection Timeout
**Error**: `Connection timeout`, `ETIMEDOUT`, or `ECONNREFUSED`

**Cause**: The application can't reach the SMTP server

**Solutions**:
1. **Try Port 587 instead of 465**
   ```env
   SMTP_PORT=587
   SMTP_SECURE=false
   ```

2. **Check if you're running on the same server as the email host**
   - If yes, try `SMTP_HOST=localhost`
   - Some shared hosting blocks external SMTP connections

3. **Firewall blocking the connection**
   - Contact hosting provider to whitelist outbound SMTP ports
   - Try from a different network to rule out local firewall

### Issue 2: Authentication Failed
**Error**: `Invalid login`, `Authentication failed`, `535 Authentication credentials invalid`

**Cause**: Credentials rejected by server

**Solutions**:
1. **Check for extra spaces in .env file**
   - Ensure no spaces before/after values
   - Password should be exactly: `@Office2611`

2. **Try full email as username**
   - Some servers need full email instead of just username
   - Already using: `office@citronsociety.in` ✓

3. **Check if password has special characters**
   - Your password has `@` symbol - might need escaping
   - Try wrapping in quotes: `SMTP_PASS="@Office2611"`

### Issue 3: Email Sent but Not Received
**No error in console, but email never arrives**

**Cause**: Email sent successfully but filtered or blocked

**Solutions**:
1. **Check spam/junk folder** (Most common!)

2. **SPF/DKIM records missing**
   - Your domain needs proper email authentication records
   - Contact hosting provider to set up SPF and DKIM
   - Check current records: https://mxtoolbox.com/spf.aspx

3. **Email server queuing delay**
   - Some shared hosting servers queue emails
   - Wait 15-30 minutes before concluding it failed

4. **Recipient server blocking**
   - Some email providers block emails from shared hosting
   - Try sending to different email providers (Gmail, Yahoo, Outlook)

### Issue 4: Self-Signed Certificate Error
**Error**: `self signed certificate`, `unable to verify the first certificate`

**Cause**: SSL certificate issues (already fixed in code)

**Verify Fix**:
Check `email.service.ts` has:
```typescript
tls: {
  rejectUnauthorized: false,
}
```

## Recommended Testing Steps

### 1. Run Standalone Test
```bash
node test-smtp.js your-email@example.com
```

### 2. If Test Fails, Try Port 587
Update `.env`:
```env
SMTP_PORT=587
SMTP_SECURE=false
```

Run test again:
```bash
node test-smtp.js your-email@example.com
```

### 3. If Still Failing, Check Hosting Provider Settings
Contact your hosting provider and ask:
- What is the correct SMTP server hostname?
- Which port should I use (25, 465, or 587)?
- Do I need to authenticate even from localhost?
- Are there any IP restrictions?
- Do you support SMTP connections from Node.js applications?

### 4. Test from Application
Once standalone test works:
```bash
npm run start:dev
```

Watch console for:
```
🔧 Email Service Configuration: {...}
✅ SMTP Server is ready to send emails
```

Then test via API or form submission.

## Alternative Configurations to Try

### Configuration 1: Port 587 with STARTTLS (Most Common)
```env
SMTP_HOST=mail.citronsociety.in
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=office@citronsociety.in
SMTP_PASS=@Office2611
SMTP_FROM_EMAIL=office@citronsociety.in
```

### Configuration 2: Port 465 with SSL (Current)
```env
SMTP_HOST=mail.citronsociety.in
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=office@citronsociety.in
SMTP_PASS=@Office2611
SMTP_FROM_EMAIL=office@citronsociety.in
```

### Configuration 3: Localhost (if app on same server)
```env
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=office@citronsociety.in
SMTP_PASS=@Office2611
SMTP_FROM_EMAIL=office@citronsociety.in
```

### Configuration 4: Alternative hostname
```env
SMTP_HOST=smtp.citronsociety.in
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=office@citronsociety.in
SMTP_PASS=@Office2611
SMTP_FROM_EMAIL=office@citronsociety.in
```

## Debug Checklist

- [ ] Standalone test script runs without errors
- [ ] Console shows "SMTP Server is ready to send emails"
- [ ] Console shows "Test email sent successfully"
- [ ] Check spam folder for test email
- [ ] Wait 15-30 minutes for email delivery
- [ ] Try different email providers (Gmail, Yahoo, Outlook)
- [ ] Verify SPF/DKIM records are configured
- [ ] Contact hosting provider if none of the above works

## Getting Detailed Logs

The application now has extensive logging enabled. When you restart the backend, you'll see:

1. **On Startup**:
   ```
   🔧 Email Service Configuration: {
     host: 'mail.citronsociety.in',
     port: 465,
     secure: true,
     user: 'office@citronsociety.in',
     from: 'office@citronsociety.in'
   }
   ✅ SMTP Server is ready to send emails
   ```

2. **When Sending Email**:
   ```
   📧 Attempting to send test email...
      From: office@citronsociety.in
      To: your-email@example.com
      Subject: Test Email - Citron Society Documents
   ✅ Test email sent successfully!
      Message ID: <unique-id@mail.citronsociety.in>
      Response: 250 2.0.0 Ok: queued as ABC123
   ```

3. **If Error Occurs**:
   ```
   ❌ Error sending test email:
      Error Type: Error
      Error Message: Connection timeout
      Error Code: ETIMEDOUT
   ```

## Next Steps

1. **Run the standalone test** - This will give us the exact error
2. **Share the console output** - Copy all the output from the test
3. **Try alternative configurations** - Based on the error message
4. **Contact hosting provider** - If all configurations fail

Would you like me to help analyze the output once you run the test?
