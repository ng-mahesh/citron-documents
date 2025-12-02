import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SubmissionStatus } from '../../common/enums/status.enum';
import { UploadedDocument } from '../../common/interfaces/document.interface';

/**
 * MongoDB schema for Share Certificate submissions
 */
@Schema({ timestamps: true })
export class ShareCertificate extends Document {
  @Prop({ required: true, unique: true })
  acknowledgementNumber: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ type: [String], default: [] })
  index2ApplicantNames: string[];

  @Prop({ required: true })
  flatNumber: string;

  @Prop({ required: true, enum: ['C', 'D'] })
  wing: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  mobileNumber: string;

  @Prop()
  alternateMobileNumber: string;

  @Prop()
  carpetArea: number;

  @Prop()
  builtUpArea: number;

  @Prop({ required: true })
  membershipType: string; // Primary/Joint

  @Prop()
  jointMemberName: string;

  @Prop()
  jointMemberEmail: string;

  @Prop()
  jointMemberMobile: string;

  @Prop({ type: Object, required: true })
  index2Document: UploadedDocument;

  @Prop({ type: Object, required: true })
  possessionLetterDocument: UploadedDocument;

  @Prop({ type: Object, required: true })
  aadhaarCardDocument: UploadedDocument;

  @Prop({ required: true })
  digitalSignature: string;

  @Prop({ required: true })
  declarationAccepted: boolean;

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

export const ShareCertificateSchema = SchemaFactory.createForClass(ShareCertificate);
