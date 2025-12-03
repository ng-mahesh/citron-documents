# Vercel Deployment Setup for Open Graph Images

## 🚨 CRITICAL Issue Found

Your Open Graph images are showing `http://localhost:3000/og-image.png` instead of `https://documents.citronsociety.in/og-image.png`.

This is why WhatsApp and other platforms can't load the images!

## ✅ Solution

Add the `NEXT_PUBLIC_APP_URL` environment variable to your Vercel deployment.

## Step-by-Step Fix

### Method 1: Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Login to your account

2. **Select Your Project**
   - Find and click on your project (likely named "citron-documents-frontend" or similar)

3. **Navigate to Settings**
   - Click on the "Settings" tab at the top

4. **Add Environment Variable**
   - Click "Environment Variables" in the left sidebar
   - Click "Add New" button

5. **Enter Variable Details**

   ```
   Name: NEXT_PUBLIC_APP_URL
   Value: https://documents.citronsociety.in
   ```

6. **Select Environments**
   - Check all three: ✅ Production ✅ Preview ✅ Development

7. **Save**
   - Click "Save" button

8. **Redeploy**
   - Go to "Deployments" tab
   - Find your latest deployment
   - Click the three dots (⋯) menu
   - Click "Redeploy"
   - Wait for deployment to complete

### Method 2: Using vercel.json (Already Created)

I've created a `vercel.json` file in your frontend directory. This will automatically set the environment variable on next deployment.

**To apply:**

```bash
cd frontend
git add vercel.json
git commit -m "Add NEXT_PUBLIC_APP_URL environment variable"
git push
```

Vercel will automatically redeploy.

### Method 3: Vercel CLI

If you have Vercel CLI installed:

```bash
cd frontend

# Add environment variable
vercel env add NEXT_PUBLIC_APP_URL

# When prompted, enter:
# Value: https://documents.citronsociety.in
# Environments: Select all (Production, Preview, Development)

# Redeploy
vercel --prod
```

## Verification

After redeployment, verify the fix:

### 1. Check Page Source

1. Visit: https://documents.citronsociety.in/
2. Right-click → View Page Source
3. Search for `og:image`
4. Should show:
   ```html
   <meta
     property="og:image"
     content="https://documents.citronsociety.in/og-image.png"
   />
   ```

**Before (Wrong):**

```html
<meta property="og:image" content="http://localhost:3000/og-image.png" />
```

**After (Correct):**

```html
<meta
  property="og:image"
  content="https://documents.citronsociety.in/og-image.png"
/>
```

### 2. Test Open Graph

**Use OpenGraph.xyz:**

1. Go to: https://www.opengraph.xyz/
2. Enter: `https://documents.citronsociety.in/`
3. Should now show the image preview correctly

**Use Facebook Debugger:**

1. Go to: https://developers.facebook.com/tools/debug/
2. Enter: `https://documents.citronsociety.in/`
3. Click "Scrape Again"
4. Should show image preview

### 3. Test WhatsApp

**Method 1: Query Parameter (Immediate)**
Share in WhatsApp:

```
https://documents.citronsociety.in/?v=1
```

**Method 2: Wait for Cache**
Share normal URL and wait 5-10 minutes for WhatsApp to refresh its cache.

## Troubleshooting

### Variable Not Working?

**Check if variable is set:**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Confirm `NEXT_PUBLIC_APP_URL` is listed
3. Confirm it's enabled for "Production"

**Check deployment:**

1. Go to Deployments tab
2. Check the latest deployment
3. Look at the "Build Logs"
4. Search for "Environment Variables" section
5. Should show `NEXT_PUBLIC_APP_URL` is set

### Still Showing localhost?

**Possible causes:**

1. **Environment variable not saved**
   - Re-add the variable in Vercel dashboard
   - Make sure to click "Save"

2. **Old build cached**
   - Force redeploy from Deployments tab
   - Or push a new commit

3. **Wrong environment selected**
   - Make sure "Production" is checked when adding the variable

4. **Browser/WhatsApp cache**
   - Use query parameter: `?v=2`
   - Clear Facebook cache via debugger

### Image Still Not Loading?

1. **Verify image exists:**

   ```
   https://documents.citronsociety.in/og-image.png
   ```

   Should load and show the blue gradient image.

2. **Check image permissions:**
   - Images should be publicly accessible
   - No authentication required

3. **Check image size:**
   - Should be under 8MB
   - Format: PNG
   - Dimensions: 1200×630px

## Expected Timeline

- **Environment Variable Added:** Immediate
- **Redeployment:** 2-5 minutes
- **DNS/CDN Propagation:** 5-15 minutes
- **Facebook/WhatsApp Cache:** 10 minutes to 48 hours
  - Use query parameter trick for immediate testing
  - Use Facebook Debugger to clear cache manually

## Quick Test After Deployment

Run this command to check if the environment variable is working:

```bash
curl -s https://documents.citronsociety.in/ | grep -o 'og:image.*content="[^"]*"'
```

**Should output:**

```
og:image" content="https://documents.citronsociety.in/og-image.png"
```

**Should NOT output:**

```
og:image" content="http://localhost:3000/og-image.png"
```

## Files Modified

- ✅ `.env.local` - Added `NEXT_PUBLIC_APP_URL`
- ✅ `.env.example` - Added `NEXT_PUBLIC_APP_URL`
- ✅ `vercel.json` - Created with environment variable

## Next Steps After Fixing

1. ✅ Add environment variable to Vercel
2. ✅ Redeploy
3. ✅ Verify page source shows correct URLs
4. ✅ Test with OpenGraph.xyz
5. ✅ Clear Facebook cache via debugger
6. ✅ Test WhatsApp with query parameter
7. ✅ Wait for full cache refresh (24 hours)

## Summary

The issue is that your deployment doesn't know your production URL, so it's defaulting to `localhost:3000`. Adding the `NEXT_PUBLIC_APP_URL` environment variable in Vercel will fix this immediately.

**Priority:** HIGH - This is blocking all social sharing functionality!
