# SEO Setup Guide

This document provides instructions for completing the SEO setup for Citron Documents.

## What's Already Implemented

✅ **Root Layout Metadata** - Complete SEO metadata in `app/layout.tsx`
✅ **Page-specific Metadata** - Layout files with metadata for all major pages
✅ **PWA Manifest** - `public/manifest.json` for app installation
✅ **Metadata Helper** - Utility function in `lib/metadata.ts`
✅ **Robots.txt** - Search engine crawling rules
✅ **Sitemap** - Dynamic sitemap generation in `app/sitemap.ts`

## Generated Assets

✅ **Open Graph Images** - All required OG images have been auto-generated
✅ **App Icons** - PWA and Apple icons created automatically
✅ **Image Generation Script** - Available for future updates

## What You Need to Do

### 1. Set Environment Variables

Create a `.env.local` file in the `frontend` directory with:

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME="Citron Phase 2 Documents"
NEXT_PUBLIC_TWITTER_HANDLE=@citrondocs
```

Replace `https://yourdomain.com` with your actual production URL.

### 2. Regenerate Images (Optional)

All Open Graph images and app icons have been generated automatically! They're saved in the `public` directory.

If you want to customize or regenerate them:

```bash
npm run generate:images
```

To customize colors, text, or design, edit `scripts/generate-og-images.js`.

See `scripts/README.md` for detailed customization instructions.

### 3. Update robots.txt

Open `public/robots.txt` and update the sitemap URL:

```txt
Sitemap: https://yourdomain.com/sitemap.xml
```

### 4. Verify Social Media Preview

After deploying, test your social sharing:

- **Facebook**: Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- **Twitter**: Use [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- **LinkedIn**: Share your URL and check the preview

### 5. Submit Sitemap to Search Engines

After deployment:

- **Google**: Submit via [Google Search Console](https://search.google.com/search-console)
- **Bing**: Submit via [Bing Webmaster Tools](https://www.bing.com/webmasters)

### 6. Optional Enhancements

Consider adding:

- **Structured Data (JSON-LD)** - For rich search results
- **Analytics** - Google Analytics or similar
- **Search Console Verification** - Add verification meta tags
- **Favicon variations** - Different sizes for various devices

## Testing SEO

### Local Testing

1. Run your dev server: `npm run dev`
2. View page source to verify meta tags
3. Use browser extensions like "OpenGraph Preview" or "Meta SEO Inspector"

### Production Testing

1. Deploy to production
2. Check with [Google Rich Results Test](https://search.google.com/test/rich-results)
3. Validate with social media debuggers (mentioned above)
4. Use [web.dev](https://web.dev/measure/) for performance and SEO scores

## Metadata Structure

Each page now has:

- **Title** - Appears in browser tab and search results
- **Description** - Search engine snippet
- **Keywords** - Helps with categorization
- **Open Graph tags** - For social media sharing (Facebook, LinkedIn)
- **Twitter Cards** - For Twitter sharing
- **Canonical URLs** - Prevents duplicate content issues
- **Icons** - Favicon and app icons

## Questions?

If you need help with:
- Creating Open Graph images
- Setting up analytics
- Adding structured data
- Any other SEO enhancements

Feel free to ask for assistance!
