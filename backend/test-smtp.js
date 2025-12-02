/**
 * Standalone SMTP Test Script
 * This script tests your SMTP configuration independently of the main application
 *
 * Usage: node test-smtp.js thebodhgire@gmail.com
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

// Get test email from command line argument
const testEmail = process.argv[2];

if (!testEmail) {
  console.error('❌ Please provide a test email address');
  console.log('Usage: node test-smtp.js your-email@example.com');
  process.exit(1);
}

console.log('\n🔍 SMTP Configuration Test\n');
console.log('='.repeat(50));

// Display current configuration
const config = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER,
  from: process.env.SMTP_FROM_EMAIL,
};

console.log('Current Configuration:');
console.log('  Host:', config.host);
console.log('  Port:', config.port);
console.log('  Secure:', config.secure);
console.log('  User:', config.user);
console.log('  From:', config.from);
console.log('  Test Email:', testEmail);
console.log('='.repeat(50));

// Create transporter
console.log('\n📧 Creating SMTP transporter...');

const transporter = nodemailer.createTransport({
  host: config.host,
  port: config.port,
  secure: config.secure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  logger: true,
  debug: true,
});

// Test 1: Verify connection
console.log('\n✓ Test 1: Verifying SMTP connection...\n');

transporter.verify((error, success) => {
  if (error) {
    console.error('\n❌ SMTP Connection Failed!');
    console.error('Error:', error.message);
    console.error('\nPossible solutions:');
    console.error('  1. Check if SMTP host and port are correct');
    console.error('  2. Verify username and password');
    console.error('  3. Check firewall settings');
    console.error('  4. Try alternative port (587 instead of 465, or vice versa)');
    console.error('  5. Contact your hosting provider\n');
    process.exit(1);
  } else {
    console.log('✅ SMTP Connection Verified Successfully!\n');

    // Test 2: Send test email
    console.log('✓ Test 2: Sending test email...\n');

    const mailOptions = {
      from: config.from,
      to: testEmail,
      subject: 'SMTP Test Email - Citron Society',
      text: 'This is a test email sent from the SMTP test script. If you receive this, your SMTP configuration is working!',
      html: `
        <h1>✅ SMTP Test Successful!</h1>
        <p>This is a test email sent from the SMTP test script.</p>
        <p>If you receive this email, your SMTP configuration is working correctly!</p>
        <hr>
        <p><strong>Configuration used:</strong></p>
        <ul>
          <li>Host: ${config.host}</li>
          <li>Port: ${config.port}</li>
          <li>Secure: ${config.secure}</li>
          <li>User: ${config.user}</li>
        </ul>
        <p><small>Sent at: ${new Date().toLocaleString()}</small></p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('\n❌ Failed to send test email!');
        console.error('Error:', error.message);
        console.error('Error Code:', error.code);
        console.error('\nFull error details:');
        console.error(error);
        process.exit(1);
      } else {
        console.log('\n✅ Test email sent successfully!\n');
        console.log('Message Details:');
        console.log('  Message ID:', info.messageId);
        console.log('  Response:', info.response);
        console.log('  Accepted:', info.accepted);
        console.log('  Rejected:', info.rejected);

        console.log('\n' + '='.repeat(50));
        console.log('✅ All Tests Passed!');
        console.log('='.repeat(50));
        console.log('\nCheck your email inbox (and spam folder) for the test email.');
        console.log('If you don\'t receive it within 5 minutes, there may be an issue with:');
        console.log('  - Email delivery (check spam folder)');
        console.log('  - Email server configuration on hosting provider side');
        console.log('  - SPF/DKIM records for your domain\n');
      }
    });
  }
});

// Alternative configurations to try
console.log('\n💡 If the test fails, try these alternative configurations in your .env file:\n');
console.log('Option 1 (Port 587 with STARTTLS):');
console.log('  SMTP_PORT=587');
console.log('  SMTP_SECURE=false\n');

console.log('Option 2 (Port 465 with SSL):');
console.log('  SMTP_PORT=465');
console.log('  SMTP_SECURE=true\n');

console.log('Option 3 (Check with hosting provider):');
console.log('  Ask your hosting provider for the correct SMTP settings\n');
