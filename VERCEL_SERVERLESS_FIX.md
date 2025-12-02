# Fix for Vercel Serverless Function Crash

## Problem
Backend deployment shows: "This Serverless Function has crashed" with error `FUNCTION_INVOCATION_FAILED`

## Root Cause
NestJS applications need special configuration to work as serverless functions on Vercel. The default setup tries to run as a long-running server, which doesn't work in Vercel's serverless environment.

## Solution Applied

I've updated your backend to work properly with Vercel serverless functions. Here's what changed:

### 1. Updated `vercel.json`

**Before:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/main.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/main.js"
    }
  ]
}
```

**After:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/main.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/main.ts"
    }
  ]
}
```

**Why:** Vercel needs to build from TypeScript source, not compiled JavaScript.

### 2. Updated `src/main.ts`

The main.ts file has been converted to a serverless-compatible entry point:

**Key Changes:**
- Uses `ExpressAdapter` to create an Express app that can handle serverless requests
- Implements caching (`cachedApp`) to reuse the NestJS app between function invocations
- Exports a default async function that Vercel can invoke
- Maintains local development compatibility

**Features:**
- Cold start optimization through app caching
- Works in both development (local) and production (Vercel) modes
- Maintains all your existing middleware, CORS, validation, etc.

## Deployment Steps

### Step 1: Commit and Push Changes

```bash
git add backend/src/main.ts backend/vercel.json
git commit -m "Fix: Update backend for Vercel serverless deployment"
git push
```

### Step 2: Redeploy on Vercel

Vercel will automatically detect the push and redeploy. Or manually:

1. Go to Vercel Dashboard → Your Backend Project
2. Go to Deployments tab
3. Click (...) on latest deployment
4. Click "Redeploy"

### Step 3: Wait for Build

- Watch the build logs in Vercel
- Should see successful compilation
- Function should deploy without crashes

### Step 4: Test

Visit: `https://api.citronsociety.in/api`

You should see a response (might be a 404 if there's no route at `/api`, but no crash error).

Test a specific endpoint:
```
https://api.citronsociety.in/api/auth/login
```

## Verification Checklist

- [ ] Code committed and pushed to Git
- [ ] Vercel detected changes and started redeploying
- [ ] Build completed successfully (check logs)
- [ ] No "Serverless Function has crashed" error
- [ ] Backend URL responds: https://api.citronsociety.in/api
- [ ] Test login endpoint works
- [ ] Check Vercel function logs for errors

## How It Works

### Cold Start Flow
1. Request arrives at Vercel
2. Vercel invokes the exported default function
3. Bootstrap checks if app is cached
4. If not cached: Creates NestJS app, initializes it, caches it
5. If cached: Reuses existing app (much faster)
6. Request is handled by Express app
7. Response sent back

### Warm Start Flow
1. Request arrives (app already cached from previous request)
2. Directly uses cached NestJS app
3. Much faster response time

## Environment Variables

Make sure all environment variables are still set in Vercel:
- Go to Settings → Environment Variables
- Verify all variables from `.env.vercel` are present
- Especially important: `FRONTEND_URL`, `MONGODB_URI`, `JWT_SECRET`

## Common Issues After Fix

### Issue 1: Build Timeout
If build takes too long:
- This is normal for first deployment
- Subsequent deployments are faster due to caching
- Vercel Pro has longer timeout limits

### Issue 2: MongoDB Connection
If MongoDB connection fails:
- Verify `MONGODB_URI` is set in Vercel
- Check MongoDB Atlas Network Access allows 0.0.0.0/0
- Test connection string locally first

### Issue 3: Function Size Limit
If function is too large:
- NestJS apps can be large
- Consider upgrading to Vercel Pro
- Or optimize dependencies

### Issue 4: Cold Start Delays
First request after idle period may be slow:
- This is normal for serverless functions
- Subsequent requests are fast (cached)
- Consider Vercel Pro for better cold start performance

## Local Development

The updated code still works locally:

```bash
cd backend
npm run start:dev
```

The code detects it's not in production and runs as a normal server.

## Testing Locally Before Deploy

To test the serverless setup locally:

```bash
# Install Vercel CLI if not already
npm i -g vercel

# Run in serverless mode locally
cd backend
vercel dev
```

This simulates Vercel's serverless environment on your local machine.

## Performance Considerations

### Cold Starts
- First request after idle: ~2-5 seconds
- Subsequent requests: ~50-200ms

### Optimization Tips
1. Keep dependencies minimal
2. Use the caching pattern (already implemented)
3. Consider Vercel Pro for better performance
4. Pre-warm functions with a cron job if needed

## Alternative Approach (If Issues Persist)

If this approach doesn't work, consider:

1. **Using Railway/Render**: Traditional server platforms that don't have serverless limitations
2. **AWS Lambda with API Gateway**: More control over serverless config
3. **Google Cloud Run**: Container-based, supports long-running servers
4. **DigitalOcean App Platform**: Easy NestJS deployment

However, the current fix should work for Vercel.

## Monitoring

After deployment, monitor:

1. **Function Logs**: Vercel Dashboard → Deployments → View Function Logs
2. **Response Times**: Check how long requests take
3. **Error Rate**: Watch for any 500 errors
4. **MongoDB Connections**: Ensure not hitting connection limits

## Need Help?

If the issue persists:

1. Check Vercel function logs for specific error messages
2. Test endpoints individually
3. Verify all environment variables are set
4. Check MongoDB Atlas is accessible
5. Review CORS settings

## Files Changed

- `backend/src/main.ts` - Serverless-compatible entry point
- `backend/vercel.json` - Updated build configuration

## Backup

If you need to revert, the original `main.ts` was:
```typescript
// Standard NestJS bootstrap
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({...});
  app.useGlobalPipes(...);
  app.setGlobalPrefix('api');
  const port = process.env.PORT || 4000;
  await app.listen(port);
}
bootstrap();
```

---

**Status**: Fix applied ✅
**Next Step**: Commit changes and redeploy to Vercel
**Expected Result**: Backend working without crashes

Let me know if you encounter any issues after redeploying!
