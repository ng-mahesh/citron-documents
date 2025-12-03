const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Color scheme
const colors = {
  primary: '#2563eb',
  primaryDark: '#1e40af',
  white: '#ffffff',
};

// Helper function to draw rounded rectangle
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

// Generate favicon in PNG format
function generateFaviconPNG(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, colors.primary);
  gradient.addColorStop(1, colors.primaryDark);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Document icon
  const iconSize = size * 0.6;
  const iconX = (size - iconSize) / 2;
  const iconY = (size - iconSize) / 2;

  ctx.fillStyle = colors.white;
  roundRect(ctx, iconX, iconY, iconSize, iconSize * 1.2, iconSize * 0.08);
  ctx.fill();

  // Document lines
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = Math.max(1, size * 0.03);
  const lineY = iconY + iconSize * 0.25;
  const lineSpacing = iconSize * 0.15;
  const lineCount = size >= 32 ? 4 : 3;

  for (let i = 0; i < lineCount; i++) {
    ctx.beginPath();
    ctx.moveTo(iconX + iconSize * 0.15, lineY + i * lineSpacing);
    ctx.lineTo(iconX + iconSize * 0.85, lineY + i * lineSpacing);
    ctx.stroke();
  }

  // Save image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, filename), buffer);
  console.log(`✓ Generated ${filename} (${size}x${size})`);
}

// Generate ICO format (simple approach - using 32x32 PNG)
function generateFaviconICO() {
  // For proper ICO support, we'll generate a 32x32 PNG and rename it
  // Modern browsers support PNG favicons, but ICO is still preferred for older browsers
  const size = 32;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, colors.primary);
  gradient.addColorStop(1, colors.primaryDark);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Document icon
  const iconSize = size * 0.6;
  const iconX = (size - iconSize) / 2;
  const iconY = (size - iconSize) / 2;

  ctx.fillStyle = colors.white;
  roundRect(ctx, iconX, iconY, iconSize, iconSize * 1.2, iconSize * 0.08);
  ctx.fill();

  // Document lines
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 1;
  const lineY = iconY + iconSize * 0.25;
  const lineSpacing = iconSize * 0.15;

  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(iconX + iconSize * 0.15, lineY + i * lineSpacing);
    ctx.lineTo(iconX + iconSize * 0.85, lineY + i * lineSpacing);
    ctx.stroke();
  }

  // Save as ICO (browsers will accept PNG in .ico extension)
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, 'favicon.ico'), buffer);
  console.log('✓ Generated favicon.ico (32x32)');
}

// Main execution
console.log('🎨 Generating favicon files...\n');

// Generate favicon.ico (most important for browsers)
generateFaviconICO();

// Generate various PNG sizes for different use cases
generateFaviconPNG(16, 'favicon-16x16.png');
generateFaviconPNG(32, 'favicon-32x32.png');
generateFaviconPNG(48, 'favicon-48x48.png');

console.log('\n✅ All favicon files generated successfully!');
console.log('📁 Files saved to:', outputDir);
console.log('\n📝 Note: Clear your browser cache and hard refresh (Ctrl+Shift+R) to see the new favicon.');
