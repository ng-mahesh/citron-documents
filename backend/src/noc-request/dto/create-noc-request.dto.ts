import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  Matches,
  MaxLength,
  IsObject,
  IsIn,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { UploadedDocument } from '../../common/interfaces/document.interface';
import { NocReason } from '../schemas/noc-request.schema';

/**
 * DTO for creating a NOC request submission
 * Includes validation rules for all required fields
 */
export class CreateNocRequestDto {
  // Seller/Owner Information
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  sellerName: string;

  @IsEmail({}, { message: 'Please enter a valid seller email' })
  @IsNotEmpty()
  sellerEmail: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Please enter a valid 10-digit mobile number',
  })
  sellerMobileNumber: string;

  @IsString()
  @IsOptional()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Alternate mobile number must be a valid 10-digit Indian phone number',
  })
  sellerAlternateMobile?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  flatNumber: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['C', 'D'], { message: 'Wing must be either C or D' })
  wing: string;

  // Buyer Information
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  buyerName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Please enter a valid 10-digit buyer mobile number',
  })
  buyerMobileNumber: string;

  @IsEmail({}, { message: 'Please enter a valid buyer email' })
  @IsNotEmpty()
  buyerEmail: string;

  // NOC Details
  @IsEnum(NocReason, { message: 'Reason must be either Sale or Mortgage' })
  @IsNotEmpty()
  reason: NocReason;

  @IsDateString()
  @IsNotEmpty()
  expectedTransferDate: string;

  // Document Uploads
  @IsObject()
  @IsNotEmpty()
  agreementDocument: UploadedDocument;

  @IsObject()
  @IsOptional()
  shareCertificateDocument?: UploadedDocument;

  @IsObject()
  @IsNotEmpty()
  maintenanceReceiptDocument: UploadedDocument;

  @IsObject()
  @IsNotEmpty()
  buyerAadhaarDocument: UploadedDocument;

  @IsObject()
  @IsOptional()
  buyerPanDocument?: UploadedDocument;

  // Digital Signature & Declaration
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  digitalSignature: string;

  @IsBoolean()
  @IsNotEmpty()
  declarationAccepted: boolean;
}
