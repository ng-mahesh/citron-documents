import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsObject,
  IsNumber,
  IsEmail,
  IsMobilePhone,
} from 'class-validator';
import { SubmissionStatus } from '../../common/enums/status.enum';
import { PaymentStatus } from '../schemas/noc-request.schema';
import { UploadedDocument } from '../../common/interfaces/document.interface';

/**
 * DTO for updating a NOC request
 * All fields are optional - used primarily for admin updates
 */
export class UpdateNocRequestDto {
  @IsEnum(SubmissionStatus)
  @IsOptional()
  status?: SubmissionStatus;

  @IsString()
  @IsOptional()
  adminRemarks?: string;

  @IsString()
  @IsOptional()
  reviewedBy?: string;

  // Basic information fields
  @IsString()
  @IsOptional()
  sellerName?: string;

  @IsEmail()
  @IsOptional()
  sellerEmail?: string;

  @IsMobilePhone('en-IN')
  @IsOptional()
  sellerMobileNumber?: string;

  @IsString()
  @IsOptional()
  flatNumber?: string;

  @IsString()
  @IsOptional()
  wing?: string;

  @IsString()
  @IsOptional()
  buyerName?: string;

  @IsEmail()
  @IsOptional()
  buyerEmail?: string;

  @IsMobilePhone('en-IN')
  @IsOptional()
  buyerMobileNumber?: string;

  @IsDateString()
  @IsOptional()
  reviewedAt?: string;

  // Payment fields (updated by admin or payment gateway)
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsNumber()
  @IsOptional()
  nocFees?: number;

  @IsNumber()
  @IsOptional()
  transferFees?: number;

  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @IsString()
  @IsOptional()
  paymentTransactionId?: string;

  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsObject()
  @IsOptional()
  paymentReceiptDocument?: UploadedDocument;

  // NOC Document (uploaded after approval)
  @IsObject()
  @IsOptional()
  nocDocument?: UploadedDocument;

  @IsDateString()
  @IsOptional()
  nocIssuedDate?: string;
}
