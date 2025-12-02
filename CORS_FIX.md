# CORS Error Fix

## Problem
CORS error when frontend tries to call backend API:
```
Request URL: https://api.citronsociety.in/api/admin/login
Referrer Policy: strict-origin-when-cross-origin
Error: CORS policy blocked
```

## Root Cause
The `FRONTEND_URL` environment variable in Vercel had a trailing slash:
- Environment variable: `https://documents.citronsociety.in/`
- Actual frontend origin: `https://documents.citronsociety.in`
- CORS requires **exact match** → Request blocked

## Solution Applied

Updated `backend/src/main.ts` to automatically remove trailing slashes:

```typescript
// Remove trailing slash if present to ensure exact match
const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

app.enableCors({
  origin: frontendUrl,
  credentials: true,
});
```

Now it works whether you set:
- `https://documents.citronsociety.in` ✅
- `https://documents.citronsociety.in/` ✅ (trailing slash removed automatically)

## Deploy the Fix

### Step 1: Commit and Push
```bash
git add backend/src/main.ts
git commit -m "fix: Handle trailing slash in FRONTEND_URL for CORS"
git push
```

### Step 2: Vercel Auto-Deploys
Wait 2-3 minutes for deployment to complete.

### Step 3: Test
1. Open frontend: `https://documents.citronsociety.in`
2. Try to login
3. Check browser console - no CORS error
4. Should see successful API calls in Network tab

## Alternative: Just Fix the Environment Variable

If you prefer to keep the code simple, you can:

1. Go to Vercel Dashboard → Backend Project
2. Settings → Environment Variables
3. Edit `FRONTEND_URL`
4. Change from: `https://documents.citronsociety.in/`
5. Change to: `https://documents.citronsociety.in` (no trailing slash)
6. Save and Redeploy

**However**, the code fix is better because it handles both cases automatically.

## Understanding CORS

### What is CORS?
Cross-Origin Resource Sharing - a security feature that controls which websites can call your API.

### How CORS Works
1. Browser sends request from `documents.citronsociety.in`
2. Request includes `Origin: https://documents.citronsociety.in` header
3. Backend checks if this origin is allowed
4. If allowed, adds `Access-Control-Allow-Origin` header to response
5. Browser allows the request

### Why Exact Match?
Security! CORS matching must be exact to prevent:
- `https://documents.citronsociety.in` (legitimate)
- `https://documents.citronsociety.in.evil.com` (attack)

Even a trailing slash difference causes mismatch:
- Origin: `https://documents.citronsociety.in` (from browser)
- Allowed: `https://documents.citronsociety.in/` (in config)
- Result: ❌ No match → CORS error

## Verification

### Check CORS Headers
1. Open browser DevTools (F12)
2. Go to Network tab
3. Make a request to backend
4. Click on the request
5. Look at Response Headers:

Should see:
```
Access-Control-Allow-Origin: https://documents.citronsociety.in
Access-Control-Allow-Credentials: true
```

### Common CORS Headers

| Header | Purpose |
|--------|---------|
| `Access-Control-Allow-Origin` | Which origin can access |
| `Access-Control-Allow-Credentials` | Allow cookies/auth |
| `Access-Control-Allow-Methods` | Allowed HTTP methods |
| `Access-Control-Allow-Headers` | Allowed custom headers |

## Testing CORS

### Test 1: From Frontend
```javascript
// In browser console on documents.citronsociety.in
fetch('https://api.citronsociety.in/api/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'test' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

Should work without CORS error.

### Test 2: From Different Origin
```javascript
// In browser console on google.com
fetch('https://api.citronsociety.in/api/auth/login')
```

Should get CORS error - this is correct! Only your frontend should access your API.

## Environment Variables Checklist

Backend should have:
- `FRONTEND_URL` = `https://documents.citronsociety.in` (no trailing slash)

Frontend should have:
- `NEXT_PUBLIC_API_URL` = `https://api.citronsociety.in/api` (with /api suffix)

## Troubleshooting

### Still Getting CORS Error After Fix?

1. **Clear browser cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear cache in DevTools

2. **Verify deployment completed**
   - Check Vercel dashboard
   - Should say "Ready"

3. **Check environment variable**
   - Vercel → Backend → Settings → Environment Variables
   - Verify `FRONTEND_URL` is correct

4. **Check browser console**
   - Look for exact error message
   - Note which origin is being blocked

5. **Test in incognito mode**
   - Eliminates cache issues

### CORS Error on Specific Routes?

If CORS works for some routes but not others:
- Check if route exists
- Verify authentication middleware isn't blocking
- Look for route-specific CORS config

### Preflight Requests Failing?

If you see `OPTIONS` requests failing:
- This is a "preflight" check
- NestJS handles this automatically
- Ensure `Access-Control-Allow-Methods` includes your method (POST, PUT, etc.)

## Best Practices

1. **Always remove trailing slashes** from URLs in environment variables
2. **Use exact URLs** - no wildcards in production
3. **Enable credentials** if using cookies/sessions
4. **Test CORS** before deployment
5. **Document allowed origins** for your team

## Related Files

- `backend/src/main.ts` - CORS configuration
- `backend/.env.vercel` - Environment variable template
- Vercel Dashboard → Environment Variables - Actual config

## Security Notes

### Good CORS Config ✅
```typescript
app.enableCors({
  origin: 'https://documents.citronsociety.in',  // Specific origin
  credentials: true,                              // Allow cookies
});
```

### Bad CORS Config ❌
```typescript
app.enableCors({
  origin: '*',  // Allows ANY website - INSECURE!
  credentials: true,  // Won't work with '*' anyway
});
```

Never use `origin: '*'` in production!

## Quick Reference

| Issue | Solution |
|-------|----------|
| CORS error | Check `FRONTEND_URL` has no trailing slash |
| Wrong origin | Update `FRONTEND_URL` in Vercel |
| Cache issue | Hard refresh browser (Ctrl+Shift+R) |
| Still failing | Check Vercel deployment logs |
| Preflight fail | Ensure backend deployed successfully |

## Status

✅ **Code Fix Applied**: Trailing slash automatically removed
✅ **Build Tested**: Compiles successfully
⏳ **Deploy Status**: Waiting for deployment
🎯 **Next Step**: Commit and push changes

---

**After deploying**: Test login from frontend to verify CORS is working!
