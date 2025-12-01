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
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ShareCertificateService } from '../share-certificate/share-certificate.service';
import { NominationService } from '../nomination/nomination.service';
import { EmailService } from '../email/email.service';
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
    private readonly emailService: EmailService,
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
      { header: 'Full Name', key: 'fullName', width: 30 },
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

    // Add rows
    certificates.forEach((cert) => {
      worksheet.addRow({
        acknowledgementNumber: cert.acknowledgementNumber,
        fullName: cert.fullName,
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
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Submitted At', key: 'createdAt', width: 20 },
      { header: 'Admin Remarks', key: 'adminRemarks', width: 30 },
    ];

    // Add rows
    nominations.forEach((nom) => {
      worksheet.addRow({
        acknowledgementNumber: nom.acknowledgementNumber,
        primaryMemberName: nom.primaryMemberName,
        flatNumber: nom.flatNumber,
        wing: nom.wing,
        primaryMemberEmail: nom.primaryMemberEmail,
        primaryMemberMobile: nom.primaryMemberMobile,
        jointMemberName: nom.jointMemberName || 'N/A',
        nomineeCount: nom.nominees.length,
        status: nom.status,
        createdAt: new Date(nom.createdAt).toLocaleString(),
        adminRemarks: nom.adminRemarks || '',
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
    res.setHeader('Content-Disposition', `attachment; filename=nominations-${Date.now()}.xlsx`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  }
}
