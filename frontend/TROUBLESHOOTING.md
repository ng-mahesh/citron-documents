# Troubleshooting Guide - Open Graph & Favicon Issues

## Current Status Check

Based on the latest checks:
- ✅ Meta tags are correct with absolute URLs
- ✅ OG image file exists and is accessible
- ✅ Favicon files exist and are accessible
- ✅ Environment variable `NEXT_PUBLIC_APP_URL` is set

## Issue 1: WhatsApp Not Showing Large Image Preview

### Understanding the Issue

WhatsApp is showing your link with:
- Small thumbnail on the left ✅
- Title and description ✅
- Domain name ✅

But you want the large image preview (image on top, taking up more space).

### Important Clarification

**The small thumbnail display is actually CORRECT behavior** for website links. WhatsApp shows large images ONLY for:
- News articles (og:type="article")
- Blog posts
- Media content
- Direct image links

However, if you want to try forcing a larger display, here are the options:

### Solution 1: Change OG Type to Article (Experimental)

⚠️ **Warning:** This is semantically incorrect for a web application, but may result in larger image display.

### Solution 2: Use Twitter's Large Image Card Format

WhatsApp sometimes respects Twitter's image specifications. Your current setup already has this, but let's verify it's working.

### Solution 3: Ensure Image Meets WhatsApp's Requirements

WhatsApp prefers images that:
- ✅ Are exactly 1200x630px (you have this)
- ✅ Are under 8MB (your images are ~70-87KB - perfect)
- ✅ Use HTTPS (you have this)
- ✅ Are PNG or JPG format (you have PNG)
- ⚠️ Have an aspect ratio of 1.91:1 (1200:630 = 1.90:1 - close enough)

### Solution 4: Clear WhatsApp Cache

WhatsApp caches link previews aggressively. To force a refresh:

**Method 1: Query Parameter**
```
https://documents.citronsociety.in/?v=5
https://documents.citronsociety.in/?v=6
https://documents.citronsociety.in/?refresh=true
```
Change the number/parameter each time.

**Method 2: Facebook Debugger (Clears WhatsApp Cache)**
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter: `https://documents.citronsociety.in/`
3. Click "Scrape Again" button
4. Click it 3-4 times
5. Wait 10-15 minutes
6. Try sharing in WhatsApp again

**Method 3: Wait**
WhatsApp cache expires after 7-30 days (varies).

## Issue 2: Favicon Not Showing

### Quick Fixes

**1. Hard Refresh Browser**
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

**2. Clear Browser Cache**
```
Chrome: Settings → Privacy → Clear browsing data → Cached images
Firefox: Settings → Privacy → Clear Data → Cached Web Content
Edge: Settings → Privacy → Clear browsing data → Cached images
```

**3. Close Browser Completely**
- Close ALL browser windows and tabs
- Wait 10 seconds
- Reopen browser
- Visit site

**4. Use Incognito/Private Mode**
- Open incognito window
- Visit your site
- Favicon should show immediately

**5. Force Favicon Reload**
Visit these URLs directly:
```
https://documents.citronsociety.in/favicon.ico
https://documents.citronsociety.in/favicon-32x32.png
https://documents.citronsociety.in/apple-icon.png
```

If you see the icons (blue background with white document), they're working.

### Verify Favicon is Deployed

Check if favicon files exist on your server:

```bash
curl -I https://documents.citronsociety.in/favicon.ico
curl -I https://documents.citronsociety.in/favicon-32x32.png
```

Should return `200 OK`, not `404`.

### Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Look for favicon-related errors
4. Check Network tab for failed favicon requests

### Favicon Priority Order

Browsers load favicons in this order:
1. `/favicon.ico` (root)
2. `<link rel="icon">` tags in HTML
3. `/apple-icon.png` (iOS)

Make sure all these exist.

## Complete Debugging Checklist

### For WhatsApp OG Images

- [ ] Environment variable `NEXT_PUBLIC_APP_URL` is set in Vercel
- [ ] Site has been redeployed after adding env var
- [ ] Page source shows absolute URLs (not localhost)
- [ ] OG image URL loads in browser: https://documents.citronsociety.in/og-image.png
- [ ] Used Facebook Debugger to scrape page
- [ ] Clicked "Scrape Again" multiple times
- [ ] Tried sharing with query parameter (?v=1)
- [ ] Waited 10-15 minutes after clearing cache
- [ ] Image is exactly 1200x630px
- [ ] Image is under 8MB
- [ ] Using HTTPS (not HTTP)

### For Favicon

- [ ] Favicon files exist in public folder
- [ ] Favicon files are deployed to production
- [ ] Can access favicon.ico directly via URL
- [ ] Cleared browser cache completely
- [ ] Did hard refresh (Ctrl+Shift+R)
- [ ] Closed and reopened browser
- [ ] Tried incognito/private mode
- [ ] Checked browser console for errors
- [ ] Verified favicon appears in page source HTML

## Advanced Debugging

### Check Meta Tags in Production

View your page source:
```
Right-click → View Page Source
```

Search for:
1. `og:image` - Should be absolute URL with https://
2. `favicon` - Should have multiple link tags
3. `twitter:image` - Should be absolute URL

### Test on Different Platforms

**Twitter:**
1. Go to: https://cards-dev.twitter.com/validator
2. Enter your URL
3. Should show "Card preview" with large image

**LinkedIn:**
1. Go to: https://www.linkedin.com/post-inspector/
2. Enter your URL
3. Should show preview with image

**Facebook:**
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter your URL
3. Should show preview with warnings/errors if any

### Check Image Format

WhatsApp prefers:
- PNG or JPG (you're using PNG ✅)
- RGB color space (not CMYK)
- No transparency issues
- Standard encoding

To verify your image:
```bash
cd frontend/public
file og-image.png
# Should show: PNG image data, 1200 x 630, 8-bit/color RGB
```

## Still Not Working?

### For WhatsApp Large Image

If you've tried everything and still want larger images:

**Option A: Create a Separate Landing Page**
Create a special landing page with `og:type="article"`:

```
/shared/homepage → og:type="article" with large image
```

**Option B: Accept Current Behavior**
The small thumbnail is actually the standard and correct behavior for web applications. Major sites like Google, GitHub, and Amazon all show small thumbnails on WhatsApp.

### For Favicon

If favicon still doesn't show after:
- Clearing cache
- Hard refresh
- Incognito mode
- Different browser

Then check:

**1. Deployment Issue**
Verify files are actually deployed:
```bash
curl https://documents.citronsociety.in/favicon.ico --output test.ico
file test.ico
# Should be: Icon image data
```

**2. CDN/Cache Issue**
Your hosting might be caching old files. In Vercel:
- Go to Deployments
- Force redeploy
- Or change file names and update references

**3. Browser-Specific Issue**
Try on a completely different device/computer to rule out local cache issues.

## Getting Help

If issues persist after trying all steps above, provide:

1. **Screenshot** of page source showing meta tags
2. **Screenshot** of Facebook Debugger results
3. **URL** to your live site
4. **Browser** and version you're testing on
5. **Steps** you've already tried from this guide

## Expected Timeline

After making changes:

| Action | Time to Take Effect |
|--------|---------------------|
| Deploy to Vercel | 2-5 minutes |
| DNS/CDN propagation | 5-15 minutes |
| Browser cache clear | Immediate |
| Facebook cache clear | 5-10 minutes |
| WhatsApp cache (with Facebook clear) | 10-30 minutes |
| WhatsApp cache (natural expiry) | 7-30 days |
| Favicon in browser | Immediate after cache clear |
| Favicon without cache clear | Varies, can be days |

## Quick Command Reference

```bash
# Check if environment variable is set
echo $NEXT_PUBLIC_APP_URL

# Verify image exists
curl -I https://documents.citronsociety.in/og-image.png

# Verify favicon exists
curl -I https://documents.citronsociety.in/favicon.ico

# Download and check image
curl https://documents.citronsociety.in/og-image.png --output test.png
file test.png

# Check image dimensions
identify og-image.png  # requires ImageMagick
```

## Summary

**WhatsApp Issue:**
- The small thumbnail is actually correct behavior
- To force larger image, would need to change to article type (not recommended)
- Clear cache using Facebook Debugger
- Use query parameters for immediate testing

**Favicon Issue:**
- Files exist and are accessible
- Problem is likely browser cache
- Hard refresh and clear cache should fix it
- Try incognito mode for immediate verification

Both issues are likely **caching problems**, not implementation problems. Your code is correct! ✅
