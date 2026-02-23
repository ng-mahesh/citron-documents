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
import { NominationService } from './nomination.service';
import { NominationPdfService } from './nomination-pdf.service';
import { CreateNominationDto } from './dto/create-nomination.dto';
import { UpdateNominationDto } from './dto/update-nomination.dto';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';

/**
 * Controller handling Nomination HTTP endpoints
 */
@Controller('nomination')
export class NominationController {
  constructor(
    private readonly nominationService: NominationService,
    private readonly pdfService: NominationPdfService,
  ) {}

  /**
   * Create new nomination submission
   * POST /api/nomination
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateNominationDto) {
    const nomination = await this.nominationService.create(createDto);
    return {
      success: true,
      message: 'Nomination submitted successfully',
      data: {
        acknowledgementNumber: nomination.acknowledgementNumber,
        email: nomination.primaryMemberEmail,
      },
    };
  }

  /**
   * Get all nominations (Admin only)
   * GET /api/nomination
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const nominations = await this.nominationService.findAll();
    return {
      success: true,
      data: nominations,
    };
  }

  /**
   * Check duplicate flat and wing (Public)
   * GET /api/nomination/check-duplicate?flatNumber=302&wing=D
   */
  @Get('check-duplicate')
  async checkDuplicate(@Query('flatNumber') flatNumber: string, @Query('wing') wing: string) {
    const result = await this.nominationService.checkDuplicate(flatNumber, wing);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get statistics (Admin only)
   * GET /api/nomination/statistics
   */
  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  async getStatistics() {
    const stats = await this.nominationService.getStatistics();
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Check status by acknowledgement number (Public)
   * GET /api/nomination/status/:acknowledgementNumber
   */
  @Get('status/:acknowledgementNumber')
  async getStatus(@Param('acknowledgementNumber') acknowledgementNumber: string) {
    const nomination =
      await this.nominationService.findByAcknowledgementNumber(acknowledgementNumber);
    return {
      success: true,
      data: {
        type: 'nomination',
        acknowledgementNumber: nomination.acknowledgementNumber,
        memberFullName: nomination.primaryMemberName,
        flatNumber: nomination.flatNumber,
        wing: nomination.wing,
        email: nomination.primaryMemberEmail,
        status: nomination.status,
        submittedAt: nomination.createdAt,
        updatedAt: nomination.updatedAt,
        adminNotes: nomination.adminRemarks,
      },
    };
  }

  /**
   * Get full nomination details by acknowledgement number (Admin only)
   * GET /api/nomination/details/:acknowledgementNumber
   */
  @Get('details/:acknowledgementNumber')
  @UseGuards(JwtAuthGuard)
  async getDetailsByAckNumber(@Param('acknowledgementNumber') acknowledgementNumber: string) {
    const nomination =
      await this.nominationService.findByAcknowledgementNumber(acknowledgementNumber);
    return {
      success: true,
      data: nomination,
    };
  }

  /**
   * Get nomination details by ID (Admin only)
   * GET /api/nomination/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const nomination = await this.nominationService.findById(id);
    return {
      success: true,
      data: nomination,
    };
  }

  /**
   * Update nomination details (Admin only)
   * PUT /api/nomination/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateDto: UpdateNominationDto) {
    const nomination = await this.nominationService.update(id, updateDto);
    return {
      success: true,
      message: 'Nomination updated successfully',
      data: nomination,
    };
  }

  /**
   * Add document to nomination (Admin only)
   * POST /api/nomination/:id/documents
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
    const nomination = await this.nominationService.addDocument(id, body);
    return {
      success: true,
      message: 'Document added successfully',
      data: nomination,
    };
  }

  /**
   * Remove document from nomination (Admin only)
   * DELETE /api/nomination/:id/documents/:documentType
   */
  @Delete(':id/documents/:documentType')
  @UseGuards(JwtAuthGuard)
  async removeDocument(@Param('id') id: string, @Param('documentType') documentType: string) {
    const nomination = await this.nominationService.removeDocument(id, documentType);
    return {
      success: true,
      message: 'Document removed successfully',
      data: nomination,
    };
  }

  /**
   * Delete nomination (Admin only)
   * DELETE /api/nomination/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.nominationService.delete(id);
  }

  /**
   * Download nomination acknowledgement receipt PDF (Public)
   * GET /api/nomination/download-pdf/:acknowledgementNumber
   */
  @Get('download-pdf/:acknowledgementNumber')
  async downloadPdf(
    @Param('acknowledgementNumber') acknowledgementNumber: string,
    @Res() res: Response,
  ) {
    const nomination =
      await this.nominationService.findByAcknowledgementNumber(acknowledgementNumber);
    const pdfBuffer = await this.pdfService.generatePdf(nomination);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Nomination_Acknowledgement_${acknowledgementNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }

  /**
   * Print official Form No. 14 in triplicate (Admin only)
   * GET /api/nomination/print-form/:acknowledgementNumber
   */
  @Get('print-form/:acknowledgementNumber')
  @UseGuards(JwtAuthGuard)
  async printOfficialForm(
    @Param('acknowledgementNumber') acknowledgementNumber: string,
    @Res() res: Response,
  ) {
    const nomination =
      await this.nominationService.findByAcknowledgementNumber(acknowledgementNumber);
    const pdfBuffer = await this.pdfService.generateOfficialFormPdf(nomination);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="NominationForm14_${acknowledgementNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }
}
