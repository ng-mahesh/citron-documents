const { createCanvas, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, "..", "public");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Color scheme
const colors = {
  primary: "#2563eb", // blue-600
  primaryDark: "#1e40af", // blue-700
  accent: "#3b82f6", // blue-500
  text: "#0f172a", // slate-900
  textLight: "#475569", // slate-600
  white: "#ffffff",
  background: "#f8fafc", // slate-50
};

// Helper function to create gradient background
function createGradientBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, colors.primary);
  gradient.addColorStop(1, colors.primaryDark);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

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

// Helper function to wrap text
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let yPos = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, yPos);
      line = words[i] + " ";
      yPos += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, yPos);
  return yPos + lineHeight;
}

// Generate Open Graph image (1200x630)
function generateOGImage(title, subtitle, filename) {
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext("2d");

  // Background gradient
  createGradientBackground(ctx, 1200, 630);

  // Add decorative elements
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.beginPath();
  ctx.arc(1000, 100, 200, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(200, 500, 150, 0, Math.PI * 2);
  ctx.fill();

  // White content card
  ctx.fillStyle = colors.white;
  roundRect(ctx, 80, 120, 1040, 390, 20);
  ctx.fill();

  // Logo/Icon circle
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.arc(150, 200, 40, 0, Math.PI * 2);
  ctx.fill();

  // Icon (simple document icon)
  ctx.strokeStyle = colors.white;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(135, 185);
  ctx.lineTo(135, 215);
  ctx.lineTo(165, 215);
  ctx.lineTo(165, 185);
  ctx.closePath();
  ctx.stroke();

  // Icon fold
  ctx.beginPath();
  ctx.moveTo(155, 185);
  ctx.lineTo(155, 195);
  ctx.lineTo(165, 195);
  ctx.stroke();

  // Title
  ctx.fillStyle = colors.text;
  ctx.font = "bold 64px Arial, sans-serif";
  ctx.textAlign = "left";
  wrapText(ctx, title, 220, 220, 880, 80);

  // Subtitle
  ctx.fillStyle = colors.textLight;
  ctx.font = "32px Arial, sans-serif";
  wrapText(ctx, subtitle, 220, 340, 880, 45);

  // Footer text
  ctx.fillStyle = colors.white;
  ctx.font = "bold 24px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Citron Phase 2 C & D Co-operative Housing Society", 600, 580);

  // Save image
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(path.join(outputDir, filename), buffer);
  console.log(`✓ Generated ${filename}`);
}

// Generate app icons (square)
function generateAppIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, colors.primary);
  gradient.addColorStop(1, colors.primaryDark);
  ctx.fillStyle = gradient;
  roundRect(ctx, 0, 0, size, size, size * 0.15);
  ctx.fill();

  // Document icon
  const iconSize = size * 0.5;
  const iconX = (size - iconSize) / 2;
  const iconY = (size - iconSize) / 2;

  ctx.fillStyle = colors.white;
  roundRect(ctx, iconX, iconY, iconSize, iconSize * 1.3, iconSize * 0.1);
  ctx.fill();

  // Document lines
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = size * 0.02;
  const lineY = iconY + iconSize * 0.3;
  const lineSpacing = iconSize * 0.15;

  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(iconX + iconSize * 0.2, lineY + i * lineSpacing);
    ctx.lineTo(iconX + iconSize * 0.8, lineY + i * lineSpacing);
    ctx.stroke();
  }

  // Save image
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(path.join(outputDir, filename), buffer);
  console.log(`✓ Generated ${filename}`);
}

// Generate Apple touch icon with specific requirements
function generateAppleIcon() {
  const size = 180;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Solid background (Apple adds rounded corners automatically)
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, colors.primary);
  gradient.addColorStop(1, colors.primaryDark);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Document icon
  const iconSize = size * 0.5;
  const iconX = (size - iconSize) / 2;
  const iconY = (size - iconSize) / 2;

  ctx.fillStyle = colors.white;
  roundRect(ctx, iconX, iconY, iconSize, iconSize * 1.3, iconSize * 0.1);
  ctx.fill();

  // Document lines
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = size * 0.02;
  const lineY = iconY + iconSize * 0.3;
  const lineSpacing = iconSize * 0.15;

  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(iconX + iconSize * 0.2, lineY + i * lineSpacing);
    ctx.lineTo(iconX + iconSize * 0.8, lineY + i * lineSpacing);
    ctx.stroke();
  }

  // Save image
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(path.join(outputDir, "apple-icon.png"), buffer);
  console.log("✓ Generated apple-icon.png");
}

// Main execution
console.log("🎨 Generating Open Graph images...\n");

// Generate OG images
generateOGImage(
  "Citron Documents",
  "Manage your society documents online - Share certificates, nominations & NOC requests",
  "og-image.png"
);

generateOGImage(
  "Share Certificate",
  "Apply for your share certificate with online document submission",
  "og-share-certificate.png"
);

generateOGImage(
  "Nomination Form",
  "Register your nominees for share certificate inheritance",
  "og-nomination.png"
);

generateOGImage(
  "NOC Request",
  "Request No Objection Certificate for flat transfer or sale",
  "og-noc.png"
);

generateOGImage(
  "Track Status",
  "Check real-time status of your applications",
  "og-status.png"
);

console.log("\n🎨 Generating app icons...\n");

// Generate app icons
generateAppIcon(192, "icon-192.png");
generateAppIcon(512, "icon-512.png");
generateAppleIcon();

console.log("\n✅ All images generated successfully!");
console.log("📁 Images saved to:", outputDir);
