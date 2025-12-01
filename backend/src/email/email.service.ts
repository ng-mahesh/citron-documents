import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

/**
 * Interface for acknowledgement email data
 */
interface AcknowledgementEmailData {
  email: string;
  name: string;
  acknowledgementNumber: string;
  type: string; // 'Share Certificate' or 'Nomination'
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
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<boolean>('SMTP_SECURE'), // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  /**
   * Send acknowledgement email after successful submission
   */
  async sendAcknowledgementEmail(data: AcknowledgementEmailData): Promise<void> {
    const { email, name, acknowledgementNumber, type } = data;

    const mailOptions = {
      from: this.configService.get<string>('SMTP_FROM_EMAIL'),
      to: email,
      subject: `${type} Submission Acknowledgement`,
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
                <p>&copy; ${new Date().getFullYear()} Housing Society. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending acknowledgement email:', error);
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

    const mailOptions = {
      from: this.configService.get<string>('SMTP_FROM_EMAIL'),
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
                <p>&copy; ${new Date().getFullYear()} Housing Society. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending status update email:', error);
      throw error;
    }
  }
}
