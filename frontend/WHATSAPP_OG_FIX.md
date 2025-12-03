# WhatsApp Open Graph & Favicon Fix

## Issues Fixed

### 1. ✅ WhatsApp Not Showing Open Graph Image

**Problem:** WhatsApp requires absolute URLs for Open Graph images, not relative paths.

**Solution:** Updated all Open Graph image URLs to use absolute URLs with `NEXT_PUBLIC_APP_URL`.

**Files Changed:**

- `app/layout.tsx` - Root layout
- `app/share-certificate/layout.tsx`
- `app/nomination/layout.tsx`
- `app/noc-request/layout.tsx`
- `app/status/layout.tsx`

### 2. ✅ Favicon Showing Default Next.js Icon

**Problem:** Custom favicon was not being recognized by browsers.

**Solution:** Generated multiple favicon formats and sizes for maximum compatibility.

**Generated Files:**

- `public/favicon.ico` (32×32) - Main favicon
- `public/favicon-16x16.png`
- `public/favicon-32x32.png`
- `public/favicon-48x48.png`
- `app/icon.tsx` - Dynamic Next.js icon generation
- `app/apple-icon.tsx` - Apple touch icon

## Required Setup

### 1. Set Environment Variable

Create or update `.env.local` in the `frontend` directory:

```env
NEXT_PUBLIC_APP_URL=https://documents.citronsociety.in
```

**IMPORTANT:** This MUST be set for WhatsApp and other social platforms to display images correctly!

### 2. Deploy Your Changes

After setting the environment variable:

```bash
npm run build
npm start
```

Or deploy to your hosting platform (Vercel, etc.)

### 3. Clear Cache & Test

#### For Favicon:

1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Or use incognito/private mode
4. Close and reopen browser completely

#### For WhatsApp Open Graph:

1. **Clear WhatsApp Cache**
   - WhatsApp caches previews aggressively
   - The cache can last for several days

2. **Force Refresh on WhatsApp:**
   - Add a query parameter to your URL: `?v=2`
   - Example: `https://documents.citronsociety.in/?v=2`
   - This tricks WhatsApp into fetching a fresh preview

3. **Use Facebook Debugger:**
   - Go to: https://developers.facebook.com/tools/debug/
   - Enter your URL
   - Click "Scrape Again"
   - This clears WhatsApp's cache (they share infrastructure)

4. **Wait:**
   - Sometimes you need to wait 24-48 hours for WhatsApp's cache to expire
   - Use the query parameter trick in the meantime

## Testing Your Implementation

### Test Open Graph Images

**Facebook Sharing Debugger:**

```
https://developers.facebook.com/tools/debug/
```

- Enter: `https://documents.citronsociety.in/`
- Click "Scrape Again"
- Should show your custom OG image

**Twitter Card Validator:**

```
https://cards-dev.twitter.com/validator
```

- Enter your URL
- Should show "summary_large_image" card

**LinkedIn Post Inspector:**

```
https://www.linkedin.com/post-inspector/
```

- Enter your URL
- Should show preview with image

### Test Favicon

1. Open your site in a new browser tab
2. Check the tab icon (should show document icon on blue background)
3. Bookmark the page and check bookmarks bar icon
4. Add to home screen on mobile (should show app icon)

## Troubleshooting

### WhatsApp Still Shows No Image

**Check 1: Environment Variable**

```bash
# In your deployment, verify the env var is set:
echo $NEXT_PUBLIC_APP_URL
```

**Check 2: Image URL in HTML**

```bash
# View page source and look for:
<meta property="og:image" content="https://documents.citronsociety.in/og-image.png" />
```

- URL must be absolute (start with https://)
- URL must be accessible publicly

**Check 3: Image Accessibility**

- Open `https://documents.citronsociety.in/og-image.png` directly in browser
- Should show the Open Graph image
- If 404, images weren't deployed correctly

**Check 4: Image Size**

- OG images should be 1200×630px
- File size should be under 8MB
- Format should be PNG or JPG

**Check 5: Use Query Parameter Trick**

```
https://documents.citronsociety.in/?v=3
```

Change the number each time to force a fresh fetch.

### Favicon Still Shows Default

**Check 1: Hard Refresh**

- Press Ctrl+Shift+R (Windows/Linux)
- Press Cmd+Shift+R (Mac)
- Or open in incognito mode

**Check 2: Clear Browser Cache**

```
Chrome: Settings → Privacy → Clear browsing data → Cached images
Firefox: Settings → Privacy → Clear Data → Cached Web Content
```

**Check 3: Verify Files Exist**

```bash
ls public/favicon*
```

Should show:

- favicon.ico
- favicon-16x16.png
- favicon-32x32.png
- favicon-48x48.png

**Check 4: Check Console**

- Open DevTools (F12)
- Look for 404 errors for favicon files
- If 404, files weren't deployed

## Regenerating Assets

If you need to regenerate images:

```bash
# Regenerate Open Graph images
npm run generate:images

# Regenerate favicon files
npm run generate:favicon

# Regenerate everything
npm run generate:all
```

## What Was Changed

### Open Graph URLs

**Before:**

```typescript
url: "/og-image.png";
```

**After:**

```typescript
url: `${process.env.NEXT_PUBLIC_APP_URL}/og-image.png`;
```

### Favicon Configuration

**Before:**

```typescript
icons: {
  icon: [{ url: "/favicon.ico" }];
}
```

**After:**

```typescript
icons: {
  icon: [
    { url: "/favicon.ico", sizes: "32x32" },
    { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
  ],
  apple: [
    { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
  ],
  shortcut: [{ url: "/favicon.ico" }],
}
```

## Expected Results

After deployment with proper configuration:

### WhatsApp Sharing

- Shows your custom blue gradient image with document icon
- Displays site title and description
- Image appears in both preview and sent message

### Browser Tab

- Shows custom document icon (white document on blue background)
- Icon appears in all browser tabs
- Icon shows in bookmarks

### Mobile Home Screen

- "Add to Home Screen" shows custom icon
- iOS uses apple-icon.png (180×180)
- Android uses icon-192.png and icon-512.png

## Need More Help?

If issues persist:

1. Check that `NEXT_PUBLIC_APP_URL` is set in your deployment environment
2. Verify all image files are in the `public` folder
3. Ensure images are publicly accessible (not blocked by auth)
4. Wait 24 hours for WhatsApp cache to clear
5. Use the query parameter trick to force immediate refresh

## Quick Reference

**Test URLs:**

- Facebook Debugger: https://developers.facebook.com/tools/debug/
- Twitter Validator: https://cards-dev.twitter.com/validator
- LinkedIn Inspector: https://www.linkedin.com/post-inspector/

**Generated Assets:**

- 5 Open Graph images (1200×630px)
- 4 Favicon files (16px to 48px)
- 3 App icons (192px, 512px, 180px)
- 2 Dynamic icon generators (icon.tsx, apple-icon.tsx)

**Key Files:**

- `frontend/.env.local` - Environment variables
- `frontend/public/` - All static assets
- `frontend/app/layout.tsx` - Main metadata configuration
- `frontend/app/icon.tsx` - Dynamic favicon generation
