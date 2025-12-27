import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SubmissionStatus } from '../../common/enums/status.enum';
import { UploadedDocument } from '../../common/interfaces/document.interface';

/**
 * NOC Request Type Enum (New - supports 4 types)
 */
export enum NocType {
  FLAT_TRANSFER = 'Flat Transfer/Sale/Purchase',
  BANK_ACCOUNT_TRANSFER = 'Bank Account Transfer',
  MSEB_BILL_CHANGE = 'MSEB Electricity Bill Name Change',
  OTHER = 'Other Purpose',
}

/**
 * NOC Request Reason Enum (Legacy - for backward compatibility)
 */
export enum NocReason {
  SALE = 'Sale',
  MORTGAGE = 'Mortgage',
}

/**
 * Payment Status Enum
 */
export enum PaymentStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  FAILED = 'Failed',
}

/**
 * MongoDB schema for NOC (No Objection Certificate) Request submissions
 */
@Schema({ timestamps: true })
export class NocRequest extends Document {
  @Prop({ required: true, unique: true })
  acknowledgementNumber: string;

  // Seller/Owner Information
  @Prop({ required: true })
  sellerName: string;

  @Prop({ required: true })
  sellerEmail: string;

  @Prop({ required: true })
  sellerMobileNumber: string;

  @Prop()
  sellerAlternateMobile: string;

  @Prop({ required: true })
  flatNumber: string;

  @Prop({ required: true, enum: ['C', 'D'] })
  wing: string;

  // Buyer Information (optional - only required for Flat Transfer)
  @Prop()
  buyerName: string;

  @Prop()
  buyerMobileNumber: string;

  @Prop()
  buyerEmail: string;

  // NOC Details
  @Prop({ required: true, type: String, enum: Object.values(NocType) })
  nocType: NocType;

  @Prop()
  purposeDescription: string; // Required for "Other Purpose" type

  @Prop({ type: String, enum: Object.values(NocReason) })
  reason: NocReason; // Legacy field for backward compatibility

  @Prop()
  expectedTransferDate: Date; // Optional - mainly for Flat Transfer

  // Document Uploads (type-specific - validation handled in DTO)
  // Flat Transfer documents
  @Prop({ type: Object })
  agreementDocument: UploadedDocument;

  @Prop({ type: Object })
  shareCertificateDocument: UploadedDocument;

  @Prop({ type: Object })
  maintenanceReceiptDocument: UploadedDocument;

  @Prop({ type: Object })
  buyerAadhaarDocument: UploadedDocument;

  @Prop({ type: Object })
  buyerPanDocument: UploadedDocument;

  // Additional documents for other NOC types
  @Prop({ type: Object })
  identityProofDocument: UploadedDocument; // For Bank Account, MSEB, Other

  @Prop({ type: Object })
  currentElectricityBillDocument: UploadedDocument; // For MSEB

  @Prop({ type: Object })
  supportingDocuments: UploadedDocument; // For Other Purpose

  // Payment Information
  @Prop({
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Prop({ default: 0 })
  nocFees: number; // ₹1,000

  @Prop({ default: 0 })
  transferFees: number; // ₹25,000

  @Prop({ default: 0 })
  totalAmount: number; // ₹26,000

  @Prop()
  paymentTransactionId: string;

  @Prop({ type: Date })
  paymentDate: Date;

  @Prop()
  paymentMethod: string; // UPI/Net Banking

  @Prop({ type: Object })
  paymentReceiptDocument: UploadedDocument;

  // Digital Signature & Declaration
  @Prop({ required: true })
  digitalSignature: string;

  @Prop({ required: true })
  declarationAccepted: boolean;

  // Status & Review Information
  @Prop({
    type: String,
    enum: Object.values(SubmissionStatus),
    default: SubmissionStatus.PENDING,
  })
  status: SubmissionStatus;

  @Prop()
  adminRemarks: string;

  @Prop({ type: Date })
  reviewedAt: Date;

  @Prop()
  reviewedBy: string;

  // NOC Document (Generated after approval)
  @Prop({ type: Object })
  nocDocument: UploadedDocument;

  @Prop({ type: Date })
  nocIssuedDate: Date;

  // Timestamps (automatically added by Mongoose)
  createdAt?: Date;
  updatedAt?: Date;
}

export const NocRequestSchema = SchemaFactory.createForClass(NocRequest);
