import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShareCertificate } from './schemas/share-certificate.schema';
import { CreateShareCertificateDto } from './dto/create-share-certificate.dto';
import { UpdateShareCertificateDto } from './dto/update-share-certificate.dto';
import { EmailService } from '../email/email.service';

/**
 * Service handling business logic for Share Certificate operations
 */
@Injectable()
export class ShareCertificateService {
  constructor(
    @InjectModel(ShareCertificate.name)
    private shareCertificateModel: Model<ShareCertificate>,
    private emailService: EmailService,
  ) {}

  /**
   * Generate unique acknowledgement number
   * Format: SC-YYYYMMDD-XXXXX
   */
  private async generateAcknowledgementNumber(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');

    // Count today's submissions
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const count = await this.shareCertificateModel.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const sequenceNumber = String(count + 1).padStart(5, '0');
    return `SC-${dateStr}-${sequenceNumber}`;
  }

  /**
   * Create a new share certificate submission
   */
  async create(createDto: CreateShareCertificateDto): Promise<ShareCertificate> {
    try {
      const acknowledgementNumber = await this.generateAcknowledgementNumber();

      const shareCertificate = new this.shareCertificateModel({
        ...createDto,
        acknowledgementNumber,
      });

      const saved = await shareCertificate.save();

      // Send acknowledgement email
      await this.emailService.sendAcknowledgementEmail({
        email: saved.email,
        name: saved.fullName,
        acknowledgementNumber: saved.acknowledgementNumber,
        type: 'Share Certificate',
      });

      return saved;
    } catch (error) {
      throw new BadRequestException(`Failed to create share certificate: ${error.message}`);
    }
  }

  /**
   * Get all share certificate submissions (Admin)
   */
  async findAll(): Promise<ShareCertificate[]> {
    return this.shareCertificateModel.find().sort({ createdAt: -1 }).exec();
  }

  /**
   * Get share certificate by acknowledgement number
   */
  async findByAcknowledgementNumber(acknowledgementNumber: string): Promise<ShareCertificate> {
    const certificate = await this.shareCertificateModel.findOne({ acknowledgementNumber }).exec();

    if (!certificate) {
      throw new NotFoundException(
        `Share certificate with acknowledgement number ${acknowledgementNumber} not found`,
      );
    }

    return certificate;
  }

  /**
   * Get share certificate by ID (Admin)
   */
  async findById(id: string): Promise<ShareCertificate> {
    const certificate = await this.shareCertificateModel.findById(id).exec();

    if (!certificate) {
      throw new NotFoundException(`Share certificate with ID ${id} not found`);
    }

    return certificate;
  }

  /**
   * Update share certificate status and remarks (Admin)
   */
  async update(id: string, updateDto: UpdateShareCertificateDto): Promise<ShareCertificate> {
    const certificate = await this.shareCertificateModel
      .findByIdAndUpdate(
        id,
        {
          ...updateDto,
          reviewedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!certificate) {
      throw new NotFoundException(`Share certificate with ID ${id} not found`);
    }

    return certificate;
  }

  /**
   * Delete share certificate (Admin)
   */
  async delete(id: string): Promise<void> {
    const result = await this.shareCertificateModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Share certificate with ID ${id} not found`);
    }
  }

  /**
   * Get statistics for dashboard
   */
  async getStatistics(): Promise<any> {
    const total = await this.shareCertificateModel.countDocuments().exec();
    const pending = await this.shareCertificateModel.countDocuments({ status: 'Pending' }).exec();
    const underReview = await this.shareCertificateModel
      .countDocuments({ status: 'Under Review' })
      .exec();
    const approved = await this.shareCertificateModel.countDocuments({ status: 'Approved' }).exec();
    const rejected = await this.shareCertificateModel.countDocuments({ status: 'Rejected' }).exec();
    const documentRequired = await this.shareCertificateModel
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
}
