/**
 * Email Delivery Diagnostic Script
 * Tests multiple email providers and provides detailed delivery information
 *
 * Usage: node diagnose-email.js
 */

const nodemailer = require('nodemailer');
const dns = require('dns').promises;
require('dotenv').config();

console.log('\n📊 Email Delivery Diagnostic Tool\n');
console.log('='.repeat(70));

// Configuration
const config = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  from: process.env.SMTP_FROM_EMAIL,
};

console.log('Current SMTP Configuration:');
console.log(`  Host: ${config.host}`);
console.log(`  Port: ${config.port}`);
console.log(`  Secure: ${config.secure}`);
console.log(`  User: ${config.user}`);
console.log(`  From: ${config.from}`);
console.log('='.repeat(70));

// Test emails to try
const testEmails = [
  'thebodhgire@gmail.com',
  // Add more test emails if you have them
];

console.log('\nTest email addresses:');
testEmails.forEach((email, idx) => {
  console.log(`  ${idx + 1}. ${email}`);
});
console.log('='.repeat(70));

// Check DNS records
async function checkDNSRecords() {
  console.log('\n🔍 Checking DNS Records for citronsociety.in...\n');

  try {
    // Check MX records
    console.log('MX Records (Mail Exchange):');
    const mxRecords = await dns.resolveMx('citronsociety.in');
    if (mxRecords && mxRecords.length > 0) {
      mxRecords.forEach((record) => {
        console.log(`  ✓ ${record.exchange} (priority: ${record.priority})`);
      });
    } else {
      console.log('  ⚠️  No MX records found');
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }

  try {
    // Check SPF record
    console.log('\nSPF Record (Sender Policy Framework):');
    const txtRecords = await dns.resolveTxt('citronsociety.in');
    const spfRecord = txtRecords.find((record) =>
      record.join('').includes('v=spf1')
    );
    if (spfRecord) {
      console.log(`  ✓ ${spfRecord.join('')}`);
    } else {
      console.log('  ⚠️  No SPF record found');
      console.log('  ℹ️  This may cause emails to be marked as spam');
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }

  try {
    // Check DKIM record (using common selector)
    console.log('\nDKIM Record (DomainKeys Identified Mail):');
    try {
      const dkimRecords = await dns.resolveTxt('default._domainkey.citronsociety.in');
      console.log(`  ✓ DKIM record found`);
    } catch (err) {
      console.log('  ⚠️  No DKIM record found (tried default._domainkey)');
      console.log('  ℹ️  This may cause emails to be marked as spam');
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }

  console.log('='.repeat(70));
}

// Send test emails
async function sendTestEmails() {
  console.log('\n📧 Sending Test Emails...\n');

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Verify connection first
  console.log('Verifying SMTP connection...');
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified\n');
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    return;
  }

  // Send to each test email
  for (const testEmail of testEmails) {
    console.log(`Sending to: ${testEmail}`);

    const timestamp = new Date().toISOString();
    const mailOptions = {
      from: `"Citron Society - Test" <${config.from}>`,
      to: testEmail,
      subject: `Email Delivery Test - ${timestamp}`,
      text: `This is a test email to diagnose delivery issues.\n\nSent at: ${timestamp}\n\nIf you receive this, email delivery is working!`,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #4F46E5;">✉️ Email Delivery Test</h2>
            <p>This is a test email to diagnose delivery issues.</p>
            <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>Test Details:</strong><br>
              Sent at: ${timestamp}<br>
              From: ${config.from}<br>
              To: ${testEmail}<br>
              SMTP Host: ${config.host}<br>
              Port: ${config.port}
            </div>
            <p>If you receive this email, delivery is working correctly!</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Check locations:<br>
              • Inbox<br>
              • Spam/Junk folder<br>
              • Promotions tab (Gmail)<br>
              • All Mail (Gmail)
            </p>
          </body>
        </html>
      `,
      headers: {
        'X-Test-Email': 'true',
        'X-Mailer': 'Citron Society Diagnostic Tool',
      },
    };

    try {
      const info = await transporter.sendMail(mailOptions);

      console.log(`✅ Email sent successfully!`);
      console.log(`   Message ID: ${info.messageId}`);
      console.log(`   Response: ${info.response}`);
      console.log(`   Accepted: ${JSON.stringify(info.accepted)}`);
      console.log(`   Rejected: ${JSON.stringify(info.rejected)}`);

      if (info.rejected && info.rejected.length > 0) {
        console.log(`   ⚠️  Some recipients were rejected!`);
      }

      console.log('');
    } catch (error) {
      console.error(`❌ Failed to send email`);
      console.error(`   Error: ${error.message}`);
      console.error(`   Code: ${error.code}`);
      console.log('');
    }
  }

  console.log('='.repeat(70));
}

// Main execution
async function main() {
  await checkDNSRecords();
  await sendTestEmails();

  console.log('\n📋 Summary & Recommendations:\n');

  console.log('1. Check ALL email locations:');
  console.log('   • Main Inbox');
  console.log('   • Spam/Junk folder (most likely!)');
  console.log('   • Promotions tab (Gmail)');
  console.log('   • All Mail folder (Gmail)');
  console.log('   • Search for "citronsociety" in email');

  console.log('\n2. Wait for delivery:');
  console.log('   • Emails may take 5-30 minutes to arrive');
  console.log('   • Some servers queue emails during high load');

  console.log('\n3. If emails are in SPAM:');
  console.log('   • Ask hosting provider to configure SPF record');
  console.log('   • Ask hosting provider to configure DKIM signing');
  console.log('   • Mark one email as "Not Spam" to train Gmail');

  console.log('\n4. Check with different email providers:');
  console.log('   • Try sending to Yahoo, Outlook, or other providers');
  console.log('   • Gmail has strict spam filtering');

  console.log('\n5. Contact your hosting provider if needed:');
  console.log('   • Share this diagnostic output with them');
  console.log('   • Ask about email delivery rates and spam scores');
  console.log('   • Request SPF and DKIM setup assistance');

  console.log('\n' + '='.repeat(70));
  console.log('Diagnostic complete! Check your email now.');
  console.log('='.repeat(70) + '\n');
}

main().catch(console.error);
