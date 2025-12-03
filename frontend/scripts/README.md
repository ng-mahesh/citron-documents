# Image Generation Script

This directory contains the script to automatically generate Open Graph images and app icons for the Citron Documents application.

## Generated Images

### Open Graph Images (1200×630px)

These images appear when sharing links on social media:

- `og-image.png` - Homepage
- `og-share-certificate.png` - Share Certificate page
- `og-nomination.png` - Nomination Form page
- `og-noc.png` - NOC Request page
- `og-status.png` - Track Status page

### App Icons

For PWA and mobile devices:

- `icon-192.png` (192×192px) - PWA icon
- `icon-512.png` (512×512px) - PWA icon
- `apple-icon.png` (180×180px) - Apple touch icon

## Usage

To generate or regenerate all images:

```bash
npm run generate:images
```

All images will be saved to the `public` directory.

## Customization

To customize the images, edit `generate-og-images.js`:

### Change Colors

```javascript
const colors = {
  primary: "#2563eb", // Main brand color
  primaryDark: "#1e40af", // Darker shade
  // ... other colors
};
```

### Modify Content

Each image is generated with this function:

```javascript
generateOGImage(
  "Page Title", // Main heading
  "Page description text", // Subtitle
  "output-filename.png" // Output file
);
```

### Design Elements

The script creates:

- Gradient background with brand colors
- White content card with rounded corners
- Document icon with brand colors
- Title and subtitle text
- Footer with society name

## Requirements

The script uses the `canvas` package, which is installed as a dev dependency:

```bash
npm install canvas --save-dev
```

## Troubleshooting

### Canvas Installation Issues

If you encounter issues installing `canvas`, you may need to install system dependencies:

**Windows:**

- No additional dependencies usually needed
- If issues persist, install Windows Build Tools: `npm install --global windows-build-tools`

**macOS:**

```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

### Regenerating Individual Images

To generate specific images, you can modify the script or run specific functions. For example, comment out the images you don't need to regenerate.

## Preview Images

After generation, you can preview the images:

1. Open the `public` directory
2. View the PNG files in any image viewer
3. Verify dimensions and quality

## Testing Social Sharing

After deploying with the generated images:

1. **Facebook:** [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
2. **Twitter:** [Twitter Card Validator](https://cards-dev.twitter.com/validator)
3. **LinkedIn:** Share the URL and check preview

## Notes

- Images are optimized for social media preview (1200×630px for OG images)
- All images use PNG format for quality
- The script is safe to run multiple times (overwrites existing images)
- Generated images are ignored in git (ensure they're deployed to production)
