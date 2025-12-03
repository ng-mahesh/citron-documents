import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SubmissionStatus } from '../../common/enums/status.enum';
import { UploadedDocument } from '../../common/interfaces/document.interface';

/**
 * NOC Request Reason Enum
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

  // Buyer Information
  @Prop({ required: true })
  buyerName: string;

  @Prop({ required: true })
  buyerMobileNumber: string;

  @Prop({ required: true })
  buyerEmail: string;

  // NOC Details
  @Prop({ required: true, type: String, enum: Object.values(NocReason) })
  reason: NocReason;

  @Prop({ required: true })
  expectedTransferDate: Date;

  // Document Uploads
  @Prop({ type: Object, required: true })
  agreementDocument: UploadedDocument;

  @Prop({ type: Object })
  shareCertificateDocument: UploadedDocument;

  @Prop({ type: Object, required: true })
  maintenanceReceiptDocument: UploadedDocument;

  @Prop({ type: Object, required: true })
  buyerAadhaarDocument: UploadedDocument;

  @Prop({ type: Object })
  buyerPanDocument: UploadedDocument;

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
