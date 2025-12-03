# SEO & Social Sharing Deployment Checklist

## Before Deployment

### ✅ 1. Set Environment Variable

**CRITICAL:** This must be set for WhatsApp and social sharing to work!

Create `.env.local` file:
```env
NEXT_PUBLIC_APP_URL=https://documents.citronsociety.in
```

Also set in your deployment platform (Vercel, etc.):
- Variable name: `NEXT_PUBLIC_APP_URL`
- Value: `https://documents.citronsociety.in`

### ✅ 2. Verify All Assets Exist

Run this command to check:
```bash
ls public/favicon* public/icon* public/apple* public/og-*
```

Should show 12 files:
- ✅ favicon.ico
- ✅ favicon-16x16.png
- ✅ favicon-32x32.png
- ✅ favicon-48x48.png
- ✅ icon-192.png
- ✅ icon-512.png
- ✅ apple-icon.png
- ✅ og-image.png
- ✅ og-share-certificate.png
- ✅ og-nomination.png
- ✅ og-noc.png
- ✅ og-status.png

### ✅ 3. Build & Test Locally

```bash
npm run build
npm start
```

Then test:
- Open http://localhost:3000
- Check favicon appears in browser tab
- View page source and verify meta tags have absolute URLs

## After Deployment

### ✅ 1. Verify Environment Variable

Visit your deployed site and check the page source (Right-click → View Page Source):

Look for:
```html
<meta property="og:image" content="https://documents.citronsociety.in/og-image.png" />
```

**Should be:** Absolute URL starting with `https://`
**Should NOT be:** Relative URL like `/og-image.png`

### ✅ 2. Test Image Accessibility

Open these URLs directly in browser:
- `https://documents.citronsociety.in/og-image.png`
- `https://documents.citronsociety.in/favicon.ico`
- `https://documents.citronsociety.in/apple-icon.png`

All should load and display the images.

### ✅ 3. Clear Browser Cache

**For Favicon:**
- Press Ctrl+Shift+Delete (Clear browsing data)
- Select "Cached images and files"
- Click Clear
- Hard refresh: Ctrl+Shift+R

**Or use incognito/private mode** to test without cache.

### ✅ 4. Test Social Sharing

#### Facebook/WhatsApp Debugger
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter: `https://documents.citronsociety.in/`
3. Click "Scrape Again"
4. Should show:
   - ✅ Title: "Citron Phase 2 Documents"
   - ✅ Description
   - ✅ Image preview (blue gradient with document icon)

#### Twitter Card Validator
1. Go to: https://cards-dev.twitter.com/validator
2. Enter your URL
3. Should show:
   - ✅ Card type: "summary_large_image"
   - ✅ Image preview

#### LinkedIn Post Inspector
1. Go to: https://www.linkedin.com/post-inspector/
2. Enter your URL
3. Click "Inspect"
4. Should show preview with image

### ✅ 5. Test WhatsApp Sharing

**Important:** WhatsApp caches previews aggressively!

**Method 1: Query Parameter Trick**
- Share: `https://documents.citronsociety.in/?v=1`
- Change the number (`?v=2`, `?v=3`) for each test
- This forces WhatsApp to fetch a fresh preview

**Method 2: Clear Cache via Facebook**
1. Use Facebook Debugger (step 4 above)
2. Click "Scrape Again" multiple times
3. Wait 5-10 minutes
4. Try sharing in WhatsApp again

**Method 3: Wait**
- WhatsApp cache can take 24-48 hours to expire
- Use Method 1 in the meantime

### ✅ 6. Test on Mobile

**iOS:**
- Safari → Share → Add to Home Screen
- Should show custom icon (document icon)

**Android:**
- Chrome → Menu → Add to Home Screen
- Should show custom icon

**WhatsApp:**
- Share your URL in a chat
- Should show image preview
- Tap to expand - should show full preview

## Common Issues & Solutions

### Issue: WhatsApp Shows No Image

**Solution 1: Check Environment Variable**
```bash
# In deployment, verify:
echo $NEXT_PUBLIC_APP_URL
```
Must output: `https://documents.citronsociety.in`

**Solution 2: Use Query Parameter**
Share URL with `?v=2` appended

**Solution 3: Clear Facebook Cache**
Use Facebook Debugger → Scrape Again

**Solution 4: Wait 24 Hours**
WhatsApp cache expires after 1-2 days

### Issue: Favicon Still Shows Next.js Default

**Solution 1: Hard Refresh**
- Ctrl+Shift+R (Windows/Linux)
- Cmd+Shift+R (Mac)

**Solution 2: Clear Cache**
- Ctrl+Shift+Delete → Clear cached images

**Solution 3: Close Browser**
- Close ALL browser windows
- Reopen browser
- Visit site again

**Solution 4: Incognito Mode**
- Open site in private/incognito window
- Favicon should show immediately

### Issue: Facebook Debugger Shows Old Image

**Solution:**
1. Click "Scrape Again" button
2. Wait 10 seconds
3. Click "Scrape Again" again
4. Repeat 2-3 times if needed

## Test Page by Page

### Homepage
- URL: `https://documents.citronsociety.in/`
- Image: `og-image.png`
- Title: "Citron Phase 2 Documents"

### Share Certificate
- URL: `https://documents.citronsociety.in/share-certificate`
- Image: `og-share-certificate.png`
- Title: "Share Certificate Application | Citron Phase 2 Documents"

### Nomination
- URL: `https://documents.citronsociety.in/nomination`
- Image: `og-nomination.png`
- Title: "Nomination Form | Citron Phase 2 Documents"

### NOC Request
- URL: `https://documents.citronsociety.in/noc-request`
- Image: `og-noc.png`
- Title: "NOC Request | Citron Phase 2 Documents"

### Status
- URL: `https://documents.citronsociety.in/status`
- Image: `og-status.png`
- Title: "Track Application Status | Citron Phase 2 Documents"

## Final Verification

Run through this quick checklist:

- [ ] Environment variable `NEXT_PUBLIC_APP_URL` is set
- [ ] All 12 image files exist in `public/` folder
- [ ] Site is deployed and accessible
- [ ] Page source shows absolute URLs for OG images
- [ ] Images are accessible directly via URL
- [ ] Facebook Debugger shows correct preview
- [ ] Twitter Validator shows card preview
- [ ] Favicon appears in browser tab (after cache clear)
- [ ] WhatsApp shows preview (with query parameter trick)
- [ ] Mobile "Add to Home Screen" shows custom icon

## Success Criteria

When everything is working correctly:

✅ **Browser Tab:** Custom document icon on blue background
✅ **WhatsApp Share:** Blue gradient image with title and description
✅ **Facebook Share:** Same preview with image
✅ **Twitter Share:** Large image card with preview
✅ **Mobile Home Screen:** Custom app icon
✅ **Search Results:** Proper title and description

## Need Help?

See these files for detailed troubleshooting:
- `WHATSAPP_OG_FIX.md` - WhatsApp-specific issues
- `SEO_SETUP.md` - Complete SEO documentation
- `SEO_IMPLEMENTATION_SUMMARY.md` - Implementation overview

## Regenerating Assets

If you need to update images:

```bash
# Regenerate all images
npm run generate:all

# Or individually:
npm run generate:images   # Open Graph images
npm run generate:favicon  # Favicon files
```

Then redeploy to production.

---

**Remember:** WhatsApp caching is the main issue. Use the query parameter trick (`?v=1`) to force fresh previews!
