import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

/**
 * Interface for acknowledgement email data
 */
interface AcknowledgementEmailData {
  email: string | string[]; // Single email or multiple emails for To recipients
  name: string;
  acknowledgementNumber: string;
  type: string; // 'Share Certificate' or 'Nomination or 'NOC Request'
  ccEmails?: string[]; // Optional CC recipients
}

/**
 * Interface for status update email data
 */
interface StatusUpdateEmailData {
  email: string;
  name: string;
  acknowledgementNumber: string;
  status: string;
  remarks?: string;
  type: string;
}

/**
 * Service for sending emails using Nodemailer
 */
@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    const isDevelopment = this.configService.get<string>('NODE_ENV') !== 'production';

    const smtpConfig = {
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<boolean>('SMTP_SECURE'), // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      tls: {
        // Do not fail on invalid certs (common with shared hosting)
        rejectUnauthorized: false,
      },
      logger: isDevelopment, // Enable nodemailer logging in development only
      debug: false, // Disable verbose debug output (too noisy)
    };

    console.log('🔧 Email Service Configuration:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      user: smtpConfig.auth.user,
      from: this.configService.get<string>('SMTP_FROM_EMAIL'),
    });

    this.transporter = nodemailer.createTransport(smtpConfig);

    // Verify connection on startup (with error handling)
    this.transporter.verify((error, success) => {
      if (error) {
        console.warn('⚠️  SMTP Connection Warning:', error.message);
        console.warn(
          '   This may not be a critical issue. Email sending will be attempted when needed.',
        );
      } else {
        console.log('✅ SMTP Server is ready to send emails', success);
      }
    });
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified successfully');
      return { success: true, message: 'SMTP connection verified successfully' };
    } catch (error) {
      console.error('❌ SMTP connection verification failed:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Send acknowledgement email after successful submission
   */
  async sendAcknowledgementEmail(data: AcknowledgementEmailData): Promise<void> {
    const { email, name, acknowledgementNumber, type, ccEmails } = data;

    const fromEmail = this.configService.get<string>('SMTP_FROM_EMAIL');
    // Handle both single email and array of emails for To recipients
    const toEmails = Array.isArray(email) ? email.join(', ') : email;

    const mailOptions = {
      from: `"Citron Phase 2 - Office" <${fromEmail}>`,
      to: toEmails,
      cc: ccEmails && ccEmails.length > 0 ? ccEmails.join(', ') : undefined,
      subject: `${type} Submission Acknowledgement - ${acknowledgementNumber}`,
      text: `Dear ${name},\n\nThank you for submitting your ${type} application. We have received your documents successfully.\n\nAcknowledgement Number: ${acknowledgementNumber}\n\nYou can track your application status using this number.\n\nBest regards,\nCitron Phase 2 C & D Co-operative Housing Society Limited`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .ack-number { font-size: 24px; font-weight: bold; color: #4F46E5; margin: 20px 0; text-align: center; }
            .info-box { background-color: white; padding: 15px; border-left: 4px solid #4F46E5; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Submission Received</h1>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>Thank you for submitting your ${type} application. We have received your documents successfully.</p>

              <div class="ack-number">
                Acknowledgement Number:<br>
                ${acknowledgementNumber}
              </div>

              <div class="info-box">
                <h3>What's Next?</h3>
                <ul>
                  <li>Your application is currently under review</li>
                  <li>You can track your application status using the acknowledgement number above</li>
                  <li>You will receive email notifications when the status changes</li>
                  <li>Please keep this email for your records</li>
                </ul>
              </div>

              <p><strong>Note:</strong> Please save your acknowledgement number for future reference. You can use it to check the status of your application on our status checking page.</p>

              <div class="footer">
                <p>This is an automated email. Please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} Citron Phase 2 C & D Co-operative Housing Society Limited. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      console.log('='.repeat(60));
      console.log(`📧 Sending ${type} acknowledgement email`);
      console.log(`   From: ${mailOptions.from}`);
      console.log(`   To: ${toEmails}`);
      if (ccEmails && ccEmails.length > 0) {
        console.log(`   CC: ${ccEmails.join(', ')}`);
      }
      console.log(`   Subject: ${mailOptions.subject}`);
      console.log(`   Acknowledgement #: ${acknowledgementNumber}`);

      const info = await this.transporter.sendMail(mailOptions);

      console.log('✅ Email sent successfully!');
      console.log(`   Message ID: ${info.messageId}`);
      console.log(`   Server Response: ${info.response}`);
      console.log(`   Accepted: ${JSON.stringify(info.accepted)}`);
      console.log(`   Rejected: ${JSON.stringify(info.rejected)}`);
      if (info.pending && info.pending.length > 0) {
        console.log(`   Pending: ${JSON.stringify(info.pending)}`);
      }
      console.log('='.repeat(60));
    } catch (error) {
      console.error('='.repeat(60));
      console.error('❌ Error sending acknowledgement email');
      console.error(`   To: ${toEmails}`);
      console.error(`   Error: ${error.message}`);
      console.error(`   Code: ${error.code}`);
      console.error('='.repeat(60));
      throw error;
    }
  }

  /**
   * Send status update notification email
   */
  async sendStatusUpdateEmail(data: StatusUpdateEmailData): Promise<void> {
    const { email, name, acknowledgementNumber, status, remarks, type } = data;

    let statusColor = '#4F46E5';
    let statusMessage = '';

    switch (status) {
      case 'Approved':
        statusColor = '#10B981';
        statusMessage = 'Congratulations! Your application has been approved.';
        break;
      case 'Rejected':
        statusColor = '#EF4444';
        statusMessage = 'We regret to inform you that your application has been rejected.';
        break;
      case 'Under Review':
        statusColor = '#F59E0B';
        statusMessage = 'Your application is currently under review.';
        break;
      case 'Document Required':
        statusColor = '#F59E0B';
        statusMessage = 'Additional documents are required for your application.';
        break;
      default:
        statusMessage = `Your application status has been updated to: ${status}`;
    }

    const fromEmail = this.configService.get<string>('SMTP_FROM_EMAIL');
    const mailOptions = {
      from: `"Citron Phase 2 - Office" <${fromEmail}>`,
      to: email,
      subject: `${type} Application Status Update`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: ${statusColor}; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .status-box { background-color: white; padding: 20px; border-left: 4px solid ${statusColor}; margin: 20px 0; }
            .ack-number { color: #666; margin: 10px 0; }
            .remarks { background-color: #FEF3C7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Status Update</h1>
            </div>
            <div class="content">
              <p>Dear ${name},</p>

              <div class="status-box">
                <h2 style="color: ${statusColor}; margin-top: 0;">Status: ${status}</h2>
                <p class="ack-number">Acknowledgement Number: <strong>${acknowledgementNumber}</strong></p>
                <p>${statusMessage}</p>
              </div>

              ${
                remarks
                  ? `
                <div class="remarks">
                  <h3>Admin Remarks:</h3>
                  <p>${remarks}</p>
                </div>
              `
                  : ''
              }

              <p>You can check your application status anytime using your acknowledgement number on our status checking page.</p>

              <div class="footer">
                <p>This is an automated email. Please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} Citron Phase 2 C & D Co-operative Housing Society Limited. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      console.log('='.repeat(60));
      console.log(`📧 Sending ${type} status update email`);
      console.log(`   From: ${mailOptions.from}`);
      console.log(`   To: ${email}`);
      console.log(`   Subject: ${mailOptions.subject}`);
      console.log(`   Status: ${status}`);

      const info = await this.transporter.sendMail(mailOptions);

      console.log('✅ Email sent successfully!');
      console.log(`   Message ID: ${info.messageId}`);
      console.log(`   Server Response: ${info.response}`);
      console.log(`   Accepted: ${JSON.stringify(info.accepted)}`);
      console.log(`   Rejected: ${JSON.stringify(info.rejected)}`);
      if (info.pending && info.pending.length > 0) {
        console.log(`   Pending: ${JSON.stringify(info.pending)}`);
      }
      console.log('='.repeat(60));
    } catch (error) {
      console.error('='.repeat(60));
      console.error('❌ Error sending status update email');
      console.error(`   To: ${email}`);
      console.error(`   Error: ${error.message}`);
      console.error(`   Code: ${error.code}`);
      console.error('='.repeat(60));
      throw error;
    }
  }
}
