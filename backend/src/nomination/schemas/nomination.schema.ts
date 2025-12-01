import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SubmissionStatus } from '../../common/enums/status.enum';
import { UploadedDocument } from '../../common/interfaces/document.interface';

/**
 * Interface for nominee details
 */
export class Nominee {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  relationship: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true })
  aadhaarNumber: string;

  @Prop({ required: true })
  sharePercentage: number;

  @Prop()
  address: string;
}

/**
 * Interface for witness details
 */
export class Witness {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  signature: string; // Typed signature
}

/**
 * MongoDB schema for Nomination submissions
 */
@Schema({ timestamps: true })
export class Nomination extends Document {
  @Prop({ required: true, unique: true })
  acknowledgementNumber: string;

  // Primary Member Details
  @Prop({ required: true })
  primaryMemberName: string;

  @Prop({ required: true })
  primaryMemberEmail: string;

  @Prop({ required: true })
  primaryMemberMobile: string;

  @Prop({ required: true })
  flatNumber: string;

  @Prop({ required: true, enum: ['C', 'D'] })
  wing: string;

  // Joint Member Details (Optional)
  @Prop()
  jointMemberName: string;

  @Prop()
  jointMemberEmail: string;

  @Prop()
  jointMemberMobile: string;

  // Nominees (1-3 nominees)
  @Prop({ type: [Nominee], required: true })
  nominees: Nominee[];

  // Documents
  @Prop({ type: Object, required: true })
  index2Document: UploadedDocument;

  @Prop({ type: Object, required: true })
  possessionLetterDocument: UploadedDocument;

  @Prop({ type: Object, required: true })
  primaryMemberAadhaar: UploadedDocument;

  @Prop({ type: Object })
  jointMemberAadhaar: UploadedDocument;

  @Prop({ type: [Object], required: true })
  nomineeAadhaars: UploadedDocument[];

  // Witnesses (2 witnesses required)
  @Prop({ type: [Witness], required: true })
  witnesses: Witness[];

  // Declaration
  @Prop({ required: true })
  declarationAccepted: boolean;

  @Prop({ required: true })
  memberSignature: string; // Typed signature

  // Status and Admin fields
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

  // Timestamps (automatically added by Mongoose)
  createdAt?: Date;
  updatedAt?: Date;
}

export const NominationSchema = SchemaFactory.createForClass(Nomination);
