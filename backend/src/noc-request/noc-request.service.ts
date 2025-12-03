import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NocRequest, PaymentStatus } from './schemas/noc-request.schema';
import { CreateNocRequestDto } from './dto/create-noc-request.dto';
import { UpdateNocRequestDto } from './dto/update-noc-request.dto';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

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
      // Check for pending NOC requests for the same flat
      const existingRequest = await this.nocRequestModel
        .findOne({
          flatNumber: createDto.flatNumber,
          wing: createDto.wing,
          status: { $nin: ['Approved', 'Rejected'] },
        })
        .exec();

      if (existingRequest) {
        throw new BadRequestException(
          `A NOC request is already pending for Flat ${createDto.flatNumber} Wing ${createDto.wing}. Please wait for the current request to be processed.`,
        );
      }

      const acknowledgementNumber = await this.generateAcknowledgementNumber();

      const nocRequest = new this.nocRequestModel({
        ...createDto,
        acknowledgementNumber,
        nocFees: 1000, // ₹1,000
        transferFees: 25000, // ₹25,000
        totalAmount: 26000, // ₹26,000
        paymentStatus: PaymentStatus.PENDING,
      });

      const saved = await nocRequest.save();

      // Send acknowledgement email to both seller and buyer, CC to chairman, secretary, and treasurer
      const ccEmails = [
        this.configService.get<string>('CC_CHAIRMAN_EMAIL'),
        this.configService.get<string>('CC_SECRETARY_EMAIL'),
        this.configService.get<string>('CC_TREASURER_EMAIL'),
      ].filter((email) => email); // Filter out any undefined emails

      await this.emailService.sendAcknowledgementEmail({
        email: [saved.sellerEmail, saved.buyerEmail], // Send to both seller and buyer
        name: `${saved.sellerName} and ${saved.buyerName}`,
        acknowledgementNumber: saved.acknowledgementNumber,
        type: 'NOC Request',
        ccEmails,
      });

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

        // Also notify buyer if approved
        if (updateDto.status === 'Approved') {
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
   * Update payment status (for payment integration)
   */
  async updatePaymentStatus(
    acknowledgementNumber: string,
    paymentData: {
      paymentStatus: PaymentStatus;
      paymentTransactionId?: string;
      paymentMethod?: string;
      paymentDate?: Date;
    },
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
  async getStatistics(): Promise<any> {
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
   */
  async checkPendingRequest(
    flatNumber: string,
    wing: string,
  ): Promise<{ exists: boolean; status?: string; message?: string }> {
    const existing = await this.nocRequestModel
      .findOne({
        flatNumber,
        wing,
        status: { $nin: ['Approved', 'Rejected'] },
      })
      .exec();

    if (existing) {
      return {
        exists: true,
        status: existing.status,
        message: `A NOC request is already ${existing.status.toLowerCase()} for Flat ${flatNumber} Wing ${wing}.`,
      };
    }

    return { exists: false };
  }

  /**
   * Verify maintenance dues (to be integrated with maintenance module)
   */
  async verifyMaintenanceDues(
    flatNumber: string,
    wing: string,
  ): Promise<{ hasDues: boolean; amount?: number }> {
    // TODO: Integrate with maintenance module
    // For now, return no dues
    return { hasDues: false, amount: 0 };
  }
}
