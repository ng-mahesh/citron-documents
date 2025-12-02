import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ShareCertificateService } from './share-certificate.service';
import { ShareCertificatePdfService } from './share-certificate-pdf.service';
import { CreateShareCertificateDto } from './dto/create-share-certificate.dto';
import { UpdateShareCertificateDto } from './dto/update-share-certificate.dto';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';

/**
 * Controller handling Share Certificate HTTP endpoints
 */
@Controller('share-certificate')
export class ShareCertificateController {
  constructor(
    private readonly shareCertificateService: ShareCertificateService,
    private readonly pdfService: ShareCertificatePdfService,
  ) {}

  /**
   * Create new share certificate submission
   * POST /api/share-certificate
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateShareCertificateDto) {
    const certificate = await this.shareCertificateService.create(createDto);
    return {
      success: true,
      message: 'Share certificate submitted successfully',
      data: {
        acknowledgementNumber: certificate.acknowledgementNumber,
        email: certificate.email,
      },
    };
  }

  /**
   * Get all share certificates (Admin only)
   * GET /api/share-certificate
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const certificates = await this.shareCertificateService.findAll();
    return {
      success: true,
      data: certificates,
    };
  }

  /**
   * Check duplicate flat and wing (Public)
   * GET /api/share-certificate/check-duplicate?flatNumber=302&wing=D
   */
  @Get('check-duplicate')
  async checkDuplicate(@Query('flatNumber') flatNumber: string, @Query('wing') wing: string) {
    const result = await this.shareCertificateService.checkDuplicate(flatNumber, wing);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get statistics (Admin only)
   * GET /api/share-certificate/statistics
   */
  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  async getStatistics() {
    const stats = await this.shareCertificateService.getStatistics();
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Check status by acknowledgement number (Public)
   * GET /api/share-certificate/status/:acknowledgementNumber
   */
  @Get('status/:acknowledgementNumber')
  async getStatus(@Param('acknowledgementNumber') acknowledgementNumber: string) {
    const certificate =
      await this.shareCertificateService.findByAcknowledgementNumber(acknowledgementNumber);
    return {
      success: true,
      data: {
        type: 'share-certificate',
        acknowledgementNumber: certificate.acknowledgementNumber,
        fullName: certificate.fullName,
        flatNumber: certificate.flatNumber,
        wing: certificate.wing,
        email: certificate.email,
        status: certificate.status,
        submittedAt: certificate.createdAt,
        updatedAt: certificate.updatedAt,
        adminNotes: certificate.adminRemarks,
      },
    };
  }

  /**
   * Get full share certificate details by acknowledgement number (Admin only)
   * GET /api/share-certificate/details/:acknowledgementNumber
   */
  @Get('details/:acknowledgementNumber')
  @UseGuards(JwtAuthGuard)
  async getDetailsByAckNumber(@Param('acknowledgementNumber') acknowledgementNumber: string) {
    const certificate =
      await this.shareCertificateService.findByAcknowledgementNumber(acknowledgementNumber);
    return {
      success: true,
      data: certificate,
    };
  }

  /**
   * Get share certificate details by ID (Admin only)
   * GET /api/share-certificate/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const certificate = await this.shareCertificateService.findById(id);
    return {
      success: true,
      data: certificate,
    };
  }

  /**
   * Update share certificate status (Admin only)
   * PUT /api/share-certificate/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateDto: UpdateShareCertificateDto) {
    const certificate = await this.shareCertificateService.update(id, updateDto);
    return {
      success: true,
      message: 'Share certificate updated successfully',
      data: certificate,
    };
  }

  /**
   * Delete share certificate (Admin only)
   * DELETE /api/share-certificate/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.shareCertificateService.delete(id);
  }

  /**
   * Download share certificate PDF by acknowledgement number (Public)
   * GET /api/share-certificate/download-pdf/:acknowledgementNumber
   */
  @Get('download-pdf/:acknowledgementNumber')
  async downloadPdf(
    @Param('acknowledgementNumber') acknowledgementNumber: string,
    @Res() res: Response,
  ) {
    const certificate =
      await this.shareCertificateService.findByAcknowledgementNumber(acknowledgementNumber);
    const pdfBuffer = await this.pdfService.generatePdf(certificate);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ShareCertificate_${acknowledgementNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }
}
