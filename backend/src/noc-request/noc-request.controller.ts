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
import { NocRequestService } from './noc-request.service';
import { NocRequestPdfService } from './noc-request-pdf.service';
import { CreateNocRequestDto } from './dto/create-noc-request.dto';
import { UpdateNocRequestDto } from './dto/update-noc-request.dto';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';

/**
 * Controller handling NOC Request HTTP endpoints
 */
@Controller('noc-request')
export class NocRequestController {
  constructor(
    private readonly nocRequestService: NocRequestService,
    private readonly pdfService: NocRequestPdfService,
  ) {}

  /**
   * Create new NOC request submission
   * POST /api/noc-request
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateNocRequestDto) {
    const request = await this.nocRequestService.create(createDto);
    return {
      success: true,
      message: 'NOC request submitted successfully',
      data: {
        acknowledgementNumber: request.acknowledgementNumber,
        email: request.sellerEmail,
        trackingId: request.acknowledgementNumber,
        paymentDetails: {
          nocFees: request.nocFees,
          transferFees: request.transferFees,
          totalAmount: request.totalAmount,
          paymentStatus: request.paymentStatus,
        },
      },
    };
  }

  /**
   * Get all NOC requests (Admin only)
   * GET /api/noc-request
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const requests = await this.nocRequestService.findAll();
    return {
      success: true,
      data: requests,
    };
  }

  /**
   * Check pending request for flat (Public)
   * GET /api/noc-request/check-pending?flatNumber=302&wing=D
   */
  @Get('check-pending')
  async checkPending(@Query('flatNumber') flatNumber: string, @Query('wing') wing: string) {
    const result = await this.nocRequestService.checkPendingRequest(flatNumber, wing);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get statistics (Admin only)
   * GET /api/noc-request/statistics
   */
  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  async getStatistics() {
    const stats = await this.nocRequestService.getStatistics();
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Check status by acknowledgement number (Public)
   * GET /api/noc-request/status/:acknowledgementNumber
   */
  @Get('status/:acknowledgementNumber')
  async getStatus(@Param('acknowledgementNumber') acknowledgementNumber: string) {
    const request = await this.nocRequestService.findByAcknowledgementNumber(acknowledgementNumber);
    return {
      success: true,
      data: {
        type: 'noc-request',
        acknowledgementNumber: request.acknowledgementNumber,
        sellerName: request.sellerName,
        buyerName: request.buyerName,
        flatNumber: request.flatNumber,
        wing: request.wing,
        email: request.sellerEmail,
        status: request.status,
        paymentStatus: request.paymentStatus,
        paymentAmount: request.totalAmount,
        submittedAt: request.createdAt,
        updatedAt: request.updatedAt,
        adminNotes: request.adminRemarks,
        nocIssuedDate: request.nocIssuedDate,
      },
    };
  }

  /**
   * Get full NOC request details by acknowledgement number (Admin only)
   * GET /api/noc-request/details/:acknowledgementNumber
   */
  @Get('details/:acknowledgementNumber')
  @UseGuards(JwtAuthGuard)
  async getDetailsByAckNumber(@Param('acknowledgementNumber') acknowledgementNumber: string) {
    const request = await this.nocRequestService.findByAcknowledgementNumber(acknowledgementNumber);
    return {
      success: true,
      data: request,
    };
  }

  /**
   * Verify maintenance dues (Admin only)
   * GET /api/noc-request/verify-dues/:flatNumber/:wing
   */
  @Get('verify-dues/:flatNumber/:wing')
  @UseGuards(JwtAuthGuard)
  async verifyDues(@Param('flatNumber') flatNumber: string, @Param('wing') wing: string) {
    const result = await this.nocRequestService.verifyMaintenanceDues(flatNumber, wing);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get NOC request details by ID (Admin only)
   * GET /api/noc-request/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const request = await this.nocRequestService.findById(id);
    return {
      success: true,
      data: request,
    };
  }

  /**
   * Update NOC request details (Admin only)
   * PUT /api/noc-request/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateDto: UpdateNocRequestDto) {
    const request = await this.nocRequestService.update(id, updateDto);
    return {
      success: true,
      message: 'NOC request updated successfully',
      data: request,
    };
  }

  /**
   * Add document to NOC request (Admin only)
   * POST /api/noc-request/:id/documents
   */
  @Post(':id/documents')
  @UseGuards(JwtAuthGuard)
  async addDocument(
    @Param('id') id: string,
    @Body()
    body: {
      documentType: string;
      s3Key: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      uploadedAt: string;
    },
  ) {
    const request = await this.nocRequestService.addDocument(id, body);
    return {
      success: true,
      message: 'Document added successfully',
      data: request,
    };
  }

  /**
   * Remove document from NOC request (Admin only)
   * DELETE /api/noc-request/:id/documents/:documentType
   */
  @Delete(':id/documents/:documentType')
  @UseGuards(JwtAuthGuard)
  async removeDocument(@Param('id') id: string, @Param('documentType') documentType: string) {
    const request = await this.nocRequestService.removeDocument(id, documentType);
    return {
      success: true,
      message: 'Document removed successfully',
      data: request,
    };
  }

  /**
   * Update payment status (for payment gateway webhook)
   * PUT /api/noc-request/payment/:acknowledgementNumber
   */
  @Put('payment/:acknowledgementNumber')
  async updatePayment(
    @Param('acknowledgementNumber') acknowledgementNumber: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Body() paymentData: Record<string, any>,
  ) {
    const request = await this.nocRequestService.updatePaymentStatus(
      acknowledgementNumber,
      paymentData,
    );
    return {
      success: true,
      message: 'Payment status updated successfully',
      data: request,
    };
  }

  /**
   * Delete NOC request (Admin only)
   * DELETE /api/noc-request/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.nocRequestService.delete(id);
  }

  /**
   * Download NOC request PDF by acknowledgement number (Public)
   * GET /api/noc-request/download-pdf/:acknowledgementNumber
   */
  @Get('download-pdf/:acknowledgementNumber')
  async downloadPdf(
    @Param('acknowledgementNumber') acknowledgementNumber: string,
    @Res() res: Response,
  ) {
    const request = await this.nocRequestService.findByAcknowledgementNumber(acknowledgementNumber);
    const pdfBuffer = await this.pdfService.generatePdf(request);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="NOC_Request_${acknowledgementNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }
}
