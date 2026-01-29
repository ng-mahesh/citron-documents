import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShareCertificate } from './schemas/share-certificate.schema';
import { CreateShareCertificateDto } from './dto/create-share-certificate.dto';
import { UpdateShareCertificateDto } from './dto/update-share-certificate.dto';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

/**
 * Service handling business logic for Share Certificate operations
 */
@Injectable()
export class ShareCertificateService {
  constructor(
    @InjectModel(ShareCertificate.name)
    private shareCertificateModel: Model<ShareCertificate>,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  /**
   * Generate unique acknowledgement number
   * Format: SC-YYYYMMDD-XXXXX
   * Uses the last sequence number from the database to avoid race conditions
   */
  private async generateAcknowledgementNumber(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const prefix = `SC-${dateStr}-`;

    // Find the last acknowledgement number for today to get the sequence
    const lastCertificate = await this.shareCertificateModel
      .findOne({
        acknowledgementNumber: { $regex: `^${prefix}` },
      })
      .sort({ acknowledgementNumber: -1 })
      .select('acknowledgementNumber')
      .exec();

    let nextSequence = 1;
    if (lastCertificate) {
      // Extract the sequence number from the last acknowledgement number
      const lastSequence = parseInt(
        lastCertificate.acknowledgementNumber.replace(prefix, ''),
        10,
      );
      nextSequence = lastSequence + 1;
    }

    const sequenceNumber = String(nextSequence).padStart(5, '0');
    return `${prefix}${sequenceNumber}`;
  }

  /**
   * Create a new share certificate submission
   * Includes retry logic to handle race conditions with acknowledgement number generation
   */
  async create(createDto: CreateShareCertificateDto): Promise<ShareCertificate> {
    const maxRetries = 3;
    let lastError: Error;

    // Check for duplicate flat number and wing combination first
    const existingCertificate = await this.shareCertificateModel
      .findOne({
        flatNumber: createDto.flatNumber,
        wing: createDto.wing,
      })
      .exec();

    if (existingCertificate) {
      const statusMessage =
        existingCertificate.status === 'Approved' ? 'completed' : 'already requested';
      throw new BadRequestException(
        `Flat ${createDto.flatNumber} Wing ${createDto.wing} has ${statusMessage} for share certificate.`,
      );
    }

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const acknowledgementNumber = await this.generateAcknowledgementNumber();

        const shareCertificate = new this.shareCertificateModel({
          ...createDto,
          acknowledgementNumber,
        });

        const saved = await shareCertificate.save();

        // Send acknowledgement email to requestor and CC to chairman, secretary, and treasurer
        const ccEmails = [
          this.configService.get<string>('CC_CHAIRMAN_EMAIL'),
          this.configService.get<string>('CC_SECRETARY_EMAIL'),
          this.configService.get<string>('CC_TREASURER_EMAIL'),
        ].filter((email) => email); // Filter out any undefined emails

        await this.emailService.sendAcknowledgementEmail({
          email: saved.email,
          name: saved.fullName,
          acknowledgementNumber: saved.acknowledgementNumber,
          type: 'Share Certificate',
          ccEmails,
        });

        return saved;
      } catch (error) {
        lastError = error;
        // Check if this is a duplicate key error (MongoDB error code 11000)
        if (error.code === 11000 && error.message?.includes('acknowledgementNumber')) {
          // Retry with a new acknowledgement number
          continue;
        }
        // For other errors, throw immediately
        throw new BadRequestException(`Failed to create share certificate: ${error.message}`);
      }
    }

    throw new BadRequestException(
      `Failed to create share certificate after ${maxRetries} attempts: ${lastError.message}`,
    );
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

    // Send status update email if status has changed
    if (updateDto.status) {
      try {
        await this.emailService.sendStatusUpdateEmail({
          email: certificate.email,
          name: certificate.fullName,
          acknowledgementNumber: certificate.acknowledgementNumber,
          status: certificate.status,
          remarks: certificate.adminRemarks,
          type: 'Share Certificate',
        });
      } catch (error) {
        console.error('Error sending status update email:', error);
        // Don't throw error - we don't want email failure to fail the update
      }
    }

    return certificate;
  }

  /**
   * Add document to share certificate (Admin)
   */
  async addDocument(
    id: string,
    documentData: {
      documentType: string;
      s3Key: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      uploadedAt: string;
    },
  ): Promise<ShareCertificate> {
    const certificate = await this.shareCertificateModel.findById(id).exec();

    if (!certificate) {
      throw new NotFoundException(`Share certificate with ID ${id} not found`);
    }

    const { documentType, ...documentInfo } = documentData;

    // Update the appropriate document field based on documentType
    if (documentType === 'index2') {
      certificate.index2Document = {
        fileName: documentInfo.fileName,
        fileUrl: '', // Will be set when generating presigned URL
        fileSize: documentInfo.fileSize,
        fileType: documentInfo.fileType,
        uploadedAt: new Date(documentInfo.uploadedAt),
        s3Key: documentInfo.s3Key,
      };
    } else if (documentType === 'possessionLetter') {
      certificate.possessionLetterDocument = {
        fileName: documentInfo.fileName,
        fileUrl: '', // Will be set when generating presigned URL
        fileSize: documentInfo.fileSize,
        fileType: documentInfo.fileType,
        uploadedAt: new Date(documentInfo.uploadedAt),
        s3Key: documentInfo.s3Key,
      };
    } else if (documentType === 'aadhaarCard') {
      certificate.aadhaarCardDocument = {
        fileName: documentInfo.fileName,
        fileUrl: '', // Will be set when generating presigned URL
        fileSize: documentInfo.fileSize,
        fileType: documentInfo.fileType,
        uploadedAt: new Date(documentInfo.uploadedAt),
        s3Key: documentInfo.s3Key,
      };
    }

    certificate.updatedAt = new Date();
    await certificate.save();

    return certificate;
  }

  /**
   * Remove document from share certificate (Admin)
   */
  async removeDocument(id: string, documentType: string): Promise<ShareCertificate> {
    const certificate = await this.shareCertificateModel.findById(id).exec();

    if (!certificate) {
      throw new NotFoundException(`Share certificate with ID ${id} not found`);
    }

    // Clear the appropriate document field based on documentType
    if (documentType === 'index2') {
      certificate.index2Document = undefined;
    } else if (documentType === 'possessionLetter') {
      certificate.possessionLetterDocument = undefined;
    } else if (documentType === 'aadhaarCard') {
      certificate.aadhaarCardDocument = undefined;
    }

    certificate.updatedAt = new Date();
    await certificate.save();

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getStatistics(): Promise<Record<string, any>> {
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

  /**
   * Check if flat number and wing combination already exists
   */
  async checkDuplicate(
    flatNumber: string,
    wing: string,
  ): Promise<{ exists: boolean; status?: string; message?: string }> {
    const existing = await this.shareCertificateModel
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
        message: `Flat ${flatNumber} Wing ${wing} has ${statusMessage} for share certificate.`,
      };
    }

    return { exists: false };
  }
}
