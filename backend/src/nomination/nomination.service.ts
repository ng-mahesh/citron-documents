import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Nomination } from './schemas/nomination.schema';
import { CreateNominationDto } from './dto/create-nomination.dto';
import { UpdateNominationDto } from './dto/update-nomination.dto';
import { EmailService } from '../email/email.service';

/**
 * Service handling business logic for Nomination operations
 */
@Injectable()
export class NominationService {
  constructor(
    @InjectModel(Nomination.name)
    private nominationModel: Model<Nomination>,
    private emailService: EmailService,
  ) {}

  /**
   * Generate unique acknowledgement number
   * Format: NOM-YYYYMMDD-XXXXX
   */
  private async generateAcknowledgementNumber(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');

    // Count today's submissions
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const count = await this.nominationModel.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const sequenceNumber = String(count + 1).padStart(5, '0');
    return `NOM-${dateStr}-${sequenceNumber}`;
  }

  /**
   * Validate nominee share percentages (must total 100%)
   */
  private validateSharePercentages(nominees: any[]): void {
    const total = nominees.reduce((sum, nominee) => sum + nominee.sharePercentage, 0);
    if (total !== 100) {
      throw new BadRequestException('Total share percentage of all nominees must equal 100%');
    }
  }

  /**
   * Create a new nomination submission
   */
  async create(createDto: CreateNominationDto): Promise<Nomination> {
    try {
      // Validate share percentages
      this.validateSharePercentages(createDto.nominees);

      // Check for duplicate flat number and wing combination
      const existingNomination = await this.nominationModel
        .findOne({
          flatNumber: createDto.flatNumber,
          wing: createDto.wing,
        })
        .exec();

      if (existingNomination) {
        const statusMessage =
          existingNomination.status === 'Approved' ? 'completed' : 'already requested';
        throw new BadRequestException(
          `Flat ${createDto.flatNumber} Wing ${createDto.wing} has ${statusMessage} for nomination.`,
        );
      }

      const acknowledgementNumber = await this.generateAcknowledgementNumber();

      const nomination = new this.nominationModel({
        ...createDto,
        acknowledgementNumber,
      });

      const saved = await nomination.save();

      // Send acknowledgement email
      await this.emailService.sendAcknowledgementEmail({
        email: saved.primaryMemberEmail,
        name: saved.primaryMemberName,
        acknowledgementNumber: saved.acknowledgementNumber,
        type: 'Nomination',
      });

      return saved;
    } catch (error) {
      throw new BadRequestException(`Failed to create nomination: ${error.message}`);
    }
  }

  /**
   * Get all nominations (Admin)
   */
  async findAll(): Promise<Nomination[]> {
    return this.nominationModel.find().sort({ createdAt: -1 }).exec();
  }

  /**
   * Get nomination by acknowledgement number
   */
  async findByAcknowledgementNumber(acknowledgementNumber: string): Promise<Nomination> {
    const nomination = await this.nominationModel.findOne({ acknowledgementNumber }).exec();

    if (!nomination) {
      throw new NotFoundException(
        `Nomination with acknowledgement number ${acknowledgementNumber} not found`,
      );
    }

    return nomination;
  }

  /**
   * Get nomination by ID (Admin)
   */
  async findById(id: string): Promise<Nomination> {
    const nomination = await this.nominationModel.findById(id).exec();

    if (!nomination) {
      throw new NotFoundException(`Nomination with ID ${id} not found`);
    }

    return nomination;
  }

  /**
   * Update nomination status and remarks (Admin)
   */
  async update(id: string, updateDto: UpdateNominationDto): Promise<Nomination> {
    const nomination = await this.nominationModel
      .findByIdAndUpdate(
        id,
        {
          ...updateDto,
          reviewedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!nomination) {
      throw new NotFoundException(`Nomination with ID ${id} not found`);
    }

    // Send status update email if status has changed
    if (updateDto.status) {
      try {
        await this.emailService.sendStatusUpdateEmail({
          email: nomination.primaryMemberEmail,
          name: nomination.primaryMemberName,
          acknowledgementNumber: nomination.acknowledgementNumber,
          status: nomination.status,
          remarks: nomination.adminRemarks,
          type: 'Nomination',
        });
      } catch (error) {
        console.error('Error sending status update email:', error);
        // Don't throw error - we don't want email failure to fail the update
      }
    }

    return nomination;
  }

  /**
   * Delete nomination (Admin)
   */
  async delete(id: string): Promise<void> {
    const result = await this.nominationModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Nomination with ID ${id} not found`);
    }
  }

  /**
   * Get statistics for dashboard
   */
  async getStatistics(): Promise<any> {
    const total = await this.nominationModel.countDocuments().exec();
    const pending = await this.nominationModel.countDocuments({ status: 'Pending' }).exec();
    const underReview = await this.nominationModel
      .countDocuments({ status: 'Under Review' })
      .exec();
    const approved = await this.nominationModel.countDocuments({ status: 'Approved' }).exec();
    const rejected = await this.nominationModel.countDocuments({ status: 'Rejected' }).exec();
    const documentRequired = await this.nominationModel
      .countDocuments({ status: 'Document Required' })
      .exec();

    return {
      total,
      pending,
      underReview,
      approved,
      rejected,
      documentRequired,
    };
  }

  /**
   * Check if flat number and wing combination already exists
   */
  async checkDuplicate(
    flatNumber: string,
    wing: string,
  ): Promise<{ exists: boolean; status?: string; message?: string }> {
    const existing = await this.nominationModel
      .findOne({
        flatNumber,
        wing,
      })
      .exec();

    if (existing) {
      const statusMessage = existing.status === 'Approved' ? 'completed' : 'already requested';
      return {
        exists: true,
        status: existing.status,
        message: `Flat ${flatNumber} Wing ${wing} has ${statusMessage} for nomination.`,
      };
    }

    return { exists: false };
  }
}
