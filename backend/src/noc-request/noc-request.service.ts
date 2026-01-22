import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NocRequest, PaymentStatus, NocType } from './schemas/noc-request.schema';
import { CreateNocRequestDto } from './dto/create-noc-request.dto';
import { UpdateNocRequestDto } from './dto/update-noc-request.dto';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { NOC_TYPE_CONFIGS } from './config/noc-type.config';

/**
 * Service handling business logic for NOC Request operations
 */
@Injectable()
export class NocRequestService {
  constructor(
    @InjectModel(NocRequest.name)
    private nocRequestModel: Model<NocRequest>,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  /**
   * Generate unique acknowledgement number
   * Format: NOC-YYYYMMDD-XXXXX
   */
  private async generateAcknowledgementNumber(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');

    // Count today's submissions
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const count = await this.nocRequestModel.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const sequenceNumber = String(count + 1).padStart(5, '0');
    return `NOC-${dateStr}-${sequenceNumber}`;
  }

  /**
   * Create a new NOC request submission
   */
  async create(createDto: CreateNocRequestDto): Promise<NocRequest> {
    try {
      const acknowledgementNumber = await this.generateAcknowledgementNumber();

      // Get fees based on NOC type
      const typeConfig = NOC_TYPE_CONFIGS[createDto.nocType];
      const nocFees = typeConfig.nocFees;
      const transferFees = typeConfig.transferFees;
      const totalAmount = nocFees + transferFees;

      const nocRequest = new this.nocRequestModel({
        ...createDto,
        acknowledgementNumber,
        nocFees,
        transferFees,
        totalAmount,
        paymentStatus: totalAmount > 0 ? PaymentStatus.PENDING : PaymentStatus.PAID,
      });

      const saved = await nocRequest.save();

      // Send acknowledgement email - conditional based on NOC type
      const ccEmails = [
        this.configService.get<string>('CC_CHAIRMAN_EMAIL'),
        this.configService.get<string>('CC_SECRETARY_EMAIL'),
        this.configService.get<string>('CC_TREASURER_EMAIL'),
      ].filter((email) => email); // Filter out any undefined emails

      // For Flat Transfer, send to both seller and buyer
      if (createDto.nocType === NocType.FLAT_TRANSFER) {
        await this.emailService.sendAcknowledgementEmail({
          email: [saved.sellerEmail, saved.buyerEmail], // Send to both seller and buyer
          name: `${saved.sellerName} and ${saved.buyerName}`,
          acknowledgementNumber: saved.acknowledgementNumber,
          type: 'NOC Request - Flat Transfer',
          ccEmails,
        });
      } else {
        // For other types, send only to seller
        await this.emailService.sendAcknowledgementEmail({
          email: [saved.sellerEmail],
          name: saved.sellerName,
          acknowledgementNumber: saved.acknowledgementNumber,
          type: `NOC Request - ${saved.nocType}`,
          ccEmails,
        });
      }

      return saved;
    } catch (error) {
      throw new BadRequestException(`Failed to create NOC request: ${error.message}`);
    }
  }

  /**
   * Get all NOC request submissions (Admin)
   */
  async findAll(): Promise<NocRequest[]> {
    return this.nocRequestModel.find().sort({ createdAt: -1 }).exec();
  }

  /**
   * Get NOC request by acknowledgement number
   */
  async findByAcknowledgementNumber(acknowledgementNumber: string): Promise<NocRequest> {
    const request = await this.nocRequestModel.findOne({ acknowledgementNumber }).exec();

    if (!request) {
      throw new NotFoundException(
        `NOC request with acknowledgement number ${acknowledgementNumber} not found`,
      );
    }

    return request;
  }

  /**
   * Get NOC request by ID (Admin)
   */
  async findById(id: string): Promise<NocRequest> {
    const request = await this.nocRequestModel.findById(id).exec();

    if (!request) {
      throw new NotFoundException(`NOC request with ID ${id} not found`);
    }

    return request;
  }

  /**
   * Update NOC request status, payment, and remarks (Admin)
   */
  async update(id: string, updateDto: UpdateNocRequestDto): Promise<NocRequest> {
    const request = await this.nocRequestModel
      .findByIdAndUpdate(
        id,
        {
          ...updateDto,
          reviewedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!request) {
      throw new NotFoundException(`NOC request with ID ${id} not found`);
    }

    // Send status update email if status has changed
    if (updateDto.status) {
      try {
        await this.emailService.sendStatusUpdateEmail({
          email: request.sellerEmail,
          name: request.sellerName,
          acknowledgementNumber: request.acknowledgementNumber,
          status: request.status,
          remarks: request.adminRemarks,
          type: 'NOC Request',
        });

        // Also notify buyer if approved (only for Flat Transfer)
        if (
          updateDto.status === 'Approved' &&
          request.nocType === NocType.FLAT_TRANSFER &&
          request.buyerEmail
        ) {
          await this.emailService.sendStatusUpdateEmail({
            email: request.buyerEmail,
            name: request.buyerName,
            acknowledgementNumber: request.acknowledgementNumber,
            status: request.status,
            remarks: `NOC has been approved for Flat ${request.flatNumber} Wing ${request.wing}. Please coordinate with ${request.sellerName} for the transfer process.`,
            type: 'NOC Request - Buyer Notification',
          });
        }
      } catch (error) {
        console.error('Error sending status update email:', error);
        // Don't throw error - we don't want email failure to fail the update
      }
    }

    return request;
  }

  /**
   * Add document to NOC request (Admin)
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
  ): Promise<NocRequest> {
    const request = await this.nocRequestModel.findById(id).exec();

    if (!request) {
      throw new NotFoundException(`NOC request with ID ${id} not found`);
    }

    const { documentType, ...documentInfo } = documentData;

    // Update the appropriate document field based on documentType
    if (documentType === 'agreement') {
      request.agreementDocument = {
        fileName: documentInfo.fileName,
        fileUrl: '', // Will be set when generating presigned URL
        fileSize: documentInfo.fileSize,
        fileType: documentInfo.fileType,
        uploadedAt: new Date(documentInfo.uploadedAt),
        s3Key: documentInfo.s3Key,
      };
    } else if (documentType === 'shareCertificate') {
      request.shareCertificateDocument = {
        fileName: documentInfo.fileName,
        fileUrl: '', // Will be set when generating presigned URL
        fileSize: documentInfo.fileSize,
        fileType: documentInfo.fileType,
        uploadedAt: new Date(documentInfo.uploadedAt),
        s3Key: documentInfo.s3Key,
      };
    } else if (documentType === 'buyerAadhaar') {
      request.buyerAadhaarDocument = {
        fileName: documentInfo.fileName,
        fileUrl: '', // Will be set when generating presigned URL
        fileSize: documentInfo.fileSize,
        fileType: documentInfo.fileType,
        uploadedAt: new Date(documentInfo.uploadedAt),
        s3Key: documentInfo.s3Key,
      };
    } else if (documentType === 'buyerPan') {
      request.buyerPanDocument = {
        fileName: documentInfo.fileName,
        fileUrl: '', // Will be set when generating presigned URL
        fileSize: documentInfo.fileSize,
        fileType: documentInfo.fileType,
        uploadedAt: new Date(documentInfo.uploadedAt),
        s3Key: documentInfo.s3Key,
      };
    }

    request.updatedAt = new Date();
    await request.save();

    return request;
  }

  /**
   * Remove document from NOC request (Admin)
   */
  async removeDocument(id: string, documentType: string): Promise<NocRequest> {
    const request = await this.nocRequestModel.findById(id).exec();

    if (!request) {
      throw new NotFoundException(`NOC request with ID ${id} not found`);
    }

    // Clear the appropriate document field based on documentType
    if (documentType === 'agreement') {
      request.agreementDocument = undefined;
    } else if (documentType === 'shareCertificate') {
      request.shareCertificateDocument = undefined;
    } else if (documentType === 'buyerAadhaar') {
      request.buyerAadhaarDocument = undefined;
    } else if (documentType === 'buyerPan') {
      request.buyerPanDocument = undefined;
    }

    request.updatedAt = new Date();
    await request.save();

    return request;
  }

  /**
   * Update payment status (for payment integration)
   */
  async updatePaymentStatus(
    acknowledgementNumber: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paymentData: Record<string, any>,
  ): Promise<NocRequest> {
    const request = await this.nocRequestModel
      .findOneAndUpdate(
        { acknowledgementNumber },
        {
          ...paymentData,
          paymentDate: paymentData.paymentDate || new Date(),
        },
        { new: true },
      )
      .exec();

    if (!request) {
      throw new NotFoundException(
        `NOC request with acknowledgement number ${acknowledgementNumber} not found`,
      );
    }

    // Send payment confirmation email
    if (paymentData.paymentStatus === PaymentStatus.PAID) {
      try {
        await this.emailService.sendStatusUpdateEmail({
          email: request.sellerEmail,
          name: request.sellerName,
          acknowledgementNumber: request.acknowledgementNumber,
          status: request.status,
          remarks: `Payment of ₹${request.totalAmount} has been received successfully. Transaction ID: ${paymentData.paymentTransactionId}. Your request will be processed within 7 working days.`,
          type: 'NOC Request - Payment Confirmation',
        });
      } catch (error) {
        console.error('Error sending payment confirmation email:', error);
      }
    }

    return request;
  }

  /**
   * Delete NOC request (Admin)
   */
  async delete(id: string): Promise<void> {
    const result = await this.nocRequestModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`NOC request with ID ${id} not found`);
    }
  }

  /**
   * Get statistics for dashboard
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getStatistics(): Promise<Record<string, any>> {
    const total = await this.nocRequestModel.countDocuments().exec();
    const pending = await this.nocRequestModel.countDocuments({ status: 'Pending' }).exec();
    const underReview = await this.nocRequestModel
      .countDocuments({ status: 'Under Review' })
      .exec();
    const approved = await this.nocRequestModel.countDocuments({ status: 'Approved' }).exec();
    const rejected = await this.nocRequestModel.countDocuments({ status: 'Rejected' }).exec();
    const documentRequired = await this.nocRequestModel
      .countDocuments({ status: 'Document Required' })
      .exec();

    // Payment statistics
    const paymentPending = await this.nocRequestModel
      .countDocuments({ paymentStatus: PaymentStatus.PENDING })
      .exec();
    const paymentPaid = await this.nocRequestModel
      .countDocuments({ paymentStatus: PaymentStatus.PAID })
      .exec();
    const paymentFailed = await this.nocRequestModel
      .countDocuments({ paymentStatus: PaymentStatus.FAILED })
      .exec();

    // Revenue calculation
    const paidRequests = await this.nocRequestModel
      .find({ paymentStatus: PaymentStatus.PAID })
      .select('totalAmount')
      .exec();
    const totalRevenue = paidRequests.reduce((sum, req) => sum + (req.totalAmount || 0), 0);

    return {
      total,
      pending,
      underReview,
      approved,
      rejected,
      documentRequired,
      payment: {
        pending: paymentPending,
        paid: paymentPaid,
        failed: paymentFailed,
        totalRevenue,
      },
    };
  }

  /**
   * Check if there's a pending NOC request for a flat
   * Updated to allow multiple NOC requests per flat
   */
  async checkPendingRequest(
    _flatNumber: string,
    _wing: string,
  ): Promise<{ exists: boolean; status?: string; message?: string }> {
    // Allow multiple NOC requests - always return exists: false
    return { exists: false };
  }

  /**
   * Verify maintenance dues (to be integrated with maintenance module)
   */
  async verifyMaintenanceDues(
    _flatNumber: string,
    _wing: string,
  ): Promise<{ hasDues: boolean; amount?: number }> {
    // TODO: Integrate with maintenance module
    // For now, return no dues
    return { hasDues: false, amount: 0 };
  }

  /**
   * Map old reason to new nocType for backward compatibility
   */
  private mapReasonToNocType(reason?: string): NocType {
    if (reason === 'Sale' || reason === 'Mortgage') {
      return NocType.FLAT_TRANSFER;
    }
    return NocType.FLAT_TRANSFER; // Default
  }
}
