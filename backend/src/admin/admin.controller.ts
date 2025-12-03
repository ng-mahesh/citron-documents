import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Res,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ShareCertificateService } from '../share-certificate/share-certificate.service';
import { NominationService } from '../nomination/nomination.service';
import { NocRequestService } from '../noc-request/noc-request.service';
import { EmailService } from '../email/email.service';
import { UploadService } from '../upload/upload.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

/**
 * Controller for admin operations
 */
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly shareCertificateService: ShareCertificateService,
    private readonly nominationService: NominationService,
    private readonly nocRequestService: NocRequestService,
    private readonly emailService: EmailService,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * Admin login
   * POST /api/admin/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.adminService.login(loginDto);
    return {
      success: true,
      message: 'Login successful',
      data: result,
    };
  }

  /**
   * Get admin profile
   * GET /api/admin/profile
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const admin = await this.adminService.findById(req.user.userId);
    return {
      success: true,
      data: admin,
    };
  }

  /**
   * Get dashboard statistics
   * GET /api/admin/dashboard/stats
   */
  @Get('dashboard/stats')
  @UseGuards(JwtAuthGuard)
  async getDashboardStats() {
    const shareCertStats = await this.shareCertificateService.getStatistics();
    const nominationStats = await this.nominationService.getStatistics();

    return {
      success: true,
      data: {
        shareCertificates: shareCertStats,
        nominations: nominationStats,
        totalSubmissions: shareCertStats.total + nominationStats.total,
      },
    };
  }

  /**
   * Verify SMTP connection
   * GET /api/admin/email/verify
   */
  @Get('email/verify')
  @UseGuards(JwtAuthGuard)
  async verifyEmailConnection() {
    const result = await this.emailService.verifyConnection();
    return {
      success: result.success,
      message: result.message,
    };
  }

  /**
   * Send notification email to resident
   * POST /api/admin/send-notification
   */
  @Post('send-notification')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async sendNotification(
    @Body() body: { type: 'share-certificate' | 'nomination'; acknowledgementNumber: string },
  ) {
    const { type, acknowledgementNumber } = body;

    let submission;
    if (type === 'share-certificate') {
      submission =
        await this.shareCertificateService.findByAcknowledgementNumber(acknowledgementNumber);
    } else {
      submission = await this.nominationService.findByAcknowledgementNumber(acknowledgementNumber);
    }

    await this.emailService.sendStatusUpdateEmail({
      email: submission.email || submission.primaryMemberEmail,
      name: submission.fullName || submission.primaryMemberName,
      acknowledgementNumber: submission.acknowledgementNumber,
      status: submission.status,
      remarks: submission.adminRemarks,
      type: type === 'share-certificate' ? 'Share Certificate' : 'Nomination',
    });

    return {
      success: true,
      message: 'Notification sent successfully',
    };
  }

  /**
   * Export share certificates to Excel
   * GET /api/admin/export/share-certificates
   */
  @Get('export/share-certificates')
  @UseGuards(JwtAuthGuard)
  async exportShareCertificates(@Res() res: Response) {
    const certificates = await this.shareCertificateService.findAll();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Share Certificates');

    // Define columns
    worksheet.columns = [
      { header: 'Acknowledgement Number', key: 'acknowledgementNumber', width: 25 },
      { header: 'Primary Applicant Name', key: 'fullName', width: 30 },
      { header: 'Co-Applicant Name', key: 'coApplicantName', width: 30 },
      { header: 'Flat Number', key: 'flatNumber', width: 15 },
      { header: 'Wing', key: 'wing', width: 15 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Mobile', key: 'mobileNumber', width: 15 },
      { header: 'Carpet Area', key: 'carpetArea', width: 15 },
      { header: 'Built Up Area', key: 'builtUpArea', width: 15 },
      { header: 'Membership Type', key: 'membershipType', width: 20 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Submitted At', key: 'createdAt', width: 20 },
      { header: 'Admin Remarks', key: 'adminRemarks', width: 30 },
    ];

    // Add rows - all data in single row with co-applicants separated by line breaks
    certificates.forEach((cert) => {
      // Join co-applicant names with line breaks
      const coApplicantNames =
        cert.index2ApplicantNames && cert.index2ApplicantNames.length > 0
          ? cert.index2ApplicantNames.join('\n')
          : '';

      worksheet.addRow({
        acknowledgementNumber: cert.acknowledgementNumber,
        fullName: cert.fullName,
        coApplicantName: coApplicantNames,
        flatNumber: cert.flatNumber,
        wing: cert.wing,
        email: cert.email,
        mobileNumber: cert.mobileNumber,
        carpetArea: cert.carpetArea,
        builtUpArea: cert.builtUpArea,
        membershipType: cert.membershipType,
        status: cert.status,
        createdAt: new Date(cert.createdAt).toLocaleString(),
        adminRemarks: cert.adminRemarks || '',
      });
    });

    // Enable text wrapping for Co-Applicant Name column
    worksheet.getColumn('coApplicantName').alignment = {
      vertical: 'top',
      wrapText: true,
    };

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=share-certificates-${Date.now()}.xlsx`,
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Export nominations to Excel
   * GET /api/admin/export/nominations
   */
  @Get('export/nominations')
  @UseGuards(JwtAuthGuard)
  async exportNominations(@Res() res: Response) {
    const nominations = await this.nominationService.findAll();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Nominations');

    // Define columns
    worksheet.columns = [
      { header: 'Acknowledgement Number', key: 'acknowledgementNumber', width: 25 },
      { header: 'Primary Member Name', key: 'primaryMemberName', width: 30 },
      { header: 'Flat Number', key: 'flatNumber', width: 15 },
      { header: 'Wing', key: 'wing', width: 15 },
      { header: 'Email', key: 'primaryMemberEmail', width: 30 },
      { header: 'Mobile', key: 'primaryMemberMobile', width: 15 },
      { header: 'Joint Member Name', key: 'jointMemberName', width: 30 },
      { header: 'Number of Nominees', key: 'nomineeCount', width: 18 },
      { header: 'Nominee Names', key: 'nomineeNames', width: 40 },
      { header: 'Nominee Details', key: 'nomineeDetails', width: 60 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Submitted At', key: 'createdAt', width: 20 },
      { header: 'Admin Remarks', key: 'adminRemarks', width: 30 },
    ];

    // Add rows
    nominations.forEach((nom) => {
      // Format nominee names (just names)
      const nomineeNames =
        nom.nominees && nom.nominees.length > 0
          ? nom.nominees.map((n) => n.name).join('\n')
          : 'N/A';

      // Format nominee details (name, relationship, share percentage)
      const nomineeDetails =
        nom.nominees && nom.nominees.length > 0
          ? nom.nominees
              .map((n) => `${n.name} (${n.relationship}) - ${n.sharePercentage}%`)
              .join('\n')
          : 'N/A';

      worksheet.addRow({
        acknowledgementNumber: nom.acknowledgementNumber,
        primaryMemberName: nom.primaryMemberName,
        flatNumber: nom.flatNumber,
        wing: nom.wing,
        primaryMemberEmail: nom.primaryMemberEmail,
        primaryMemberMobile: nom.primaryMemberMobile,
        jointMemberName: nom.jointMemberName || 'N/A',
        nomineeCount: nom.nominees.length,
        nomineeNames: nomineeNames,
        nomineeDetails: nomineeDetails,
        status: nom.status,
        createdAt: new Date(nom.createdAt).toLocaleString(),
        adminRemarks: nom.adminRemarks || '',
      });
    });

    // Enable text wrapping for nominee columns
    worksheet.getColumn('nomineeNames').alignment = {
      vertical: 'top',
      wrapText: true,
    };
    worksheet.getColumn('nomineeDetails').alignment = {
      vertical: 'top',
      wrapText: true,
    };

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=nominations-${Date.now()}.xlsx`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Export NOC requests to Excel
   * GET /api/admin/export/noc-requests
   */
  @Get('export/noc-requests')
  @UseGuards(JwtAuthGuard)
  async exportNocRequests(@Res() res: Response) {
    const nocRequests = await this.nocRequestService.findAll();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('NOC Requests');

    // Define columns
    worksheet.columns = [
      { header: 'Acknowledgement Number', key: 'acknowledgementNumber', width: 25 },
      { header: 'Seller Name', key: 'sellerName', width: 30 },
      { header: 'Seller Email', key: 'sellerEmail', width: 30 },
      { header: 'Seller Mobile', key: 'sellerMobileNumber', width: 15 },
      { header: 'Flat Number', key: 'flatNumber', width: 15 },
      { header: 'Wing', key: 'wing', width: 15 },
      { header: 'Buyer Name', key: 'buyerName', width: 30 },
      { header: 'Buyer Email', key: 'buyerEmail', width: 30 },
      { header: 'Buyer Mobile', key: 'buyerMobileNumber', width: 15 },
      { header: 'Reason', key: 'reason', width: 15 },
      { header: 'Expected Transfer Date', key: 'expectedTransferDate', width: 20 },
      { header: 'Payment Status', key: 'paymentStatus', width: 15 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Submitted At', key: 'createdAt', width: 20 },
      { header: 'Admin Remarks', key: 'adminRemarks', width: 30 },
    ];

    // Add rows
    nocRequests.forEach((noc) => {
      worksheet.addRow({
        acknowledgementNumber: noc.acknowledgementNumber,
        sellerName: noc.sellerName,
        sellerEmail: noc.sellerEmail,
        sellerMobileNumber: noc.sellerMobileNumber,
        flatNumber: noc.flatNumber,
        wing: noc.wing,
        buyerName: noc.buyerName,
        buyerEmail: noc.buyerEmail,
        buyerMobileNumber: noc.buyerMobileNumber,
        reason: noc.reason,
        expectedTransferDate: noc.expectedTransferDate
          ? new Date(noc.expectedTransferDate).toLocaleDateString()
          : 'N/A',
        paymentStatus: noc.paymentStatus || 'Pending',
        status: noc.status,
        createdAt: new Date(noc.createdAt).toLocaleString(),
        adminRemarks: noc.adminRemarks || '',
      });
    });

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=noc-requests-${Date.now()}.xlsx`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Get pre-signed URL for viewing a document
   * GET /api/admin/document/presigned-url?s3Key=xxxxx
   */
  @Get('document/presigned-url')
  @UseGuards(JwtAuthGuard)
  async getDocumentPresignedUrl(@Query('s3Key') s3Key: string) {
    if (!s3Key) {
      return {
        success: false,
        message: 'S3 key is required',
      };
    }

    const presignedUrl = await this.uploadService.getPresignedUrl(s3Key);

    return {
      success: true,
      data: {
        presignedUrl,
        expiresIn: 3600, // 1 hour
      },
    };
  }
}
