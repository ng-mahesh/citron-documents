import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NominationService } from './nomination.service';
import { CreateNominationDto } from './dto/create-nomination.dto';
import { UpdateNominationDto } from './dto/update-nomination.dto';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';

/**
 * Controller handling Nomination HTTP endpoints
 */
@Controller('nomination')
export class NominationController {
  constructor(private readonly nominationService: NominationService) {}

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
   * Update nomination status (Admin only)
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
   * Delete nomination (Admin only)
   * DELETE /api/nomination/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.nominationService.delete(id);
  }
}
