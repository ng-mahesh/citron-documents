import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsNumber,
  Matches,
  MaxLength,
  MinLength,
  IsObject,
  IsIn,
  IsNumberString,
  IsArray,
} from 'class-validator';
import { UploadedDocument } from '../../common/interfaces/document.interface';

/**
 * DTO for creating a share certificate submission
 * Includes validation rules for all required fields
 */
export class CreateShareCertificateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  index2ApplicantNames?: string[];

  @IsNumberString()
  @IsNotEmpty()
  @MaxLength(10)
  flatNumber: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['C', 'D'], { message: 'Wing must be either C or D' })
  wing: string;

  @IsEmail({}, { message: 'Please enter a valid email to receive updates' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Please enter a valid 10-digit mobile number with WhatsApp',
  })
  mobileNumber: string;

  @IsString()
  @IsOptional()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Alternate mobile number must be a valid 10-digit Indian phone number',
  })
  alternateMobileNumber?: string;

  @IsNumber()
  @IsOptional()
  carpetArea?: number;

  @IsNumber()
  @IsOptional()
  builtUpArea?: number;

  @IsString()
  @IsNotEmpty()
  membershipType: string; // Primary/Joint

  @IsString()
  @IsOptional()
  @MaxLength(100)
  jointMemberName?: string;

  @IsEmail()
  @IsOptional()
  jointMemberEmail?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[6-9]\d{9}$/)
  jointMemberMobile?: string;

  @IsObject()
  @IsNotEmpty()
  index2Document: UploadedDocument;

  @IsObject()
  @IsNotEmpty()
  possessionLetterDocument: UploadedDocument;

  @IsObject()
  @IsNotEmpty()
  aadhaarCardDocument: UploadedDocument;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  digitalSignature: string;

  @IsBoolean()
  @IsNotEmpty()
  declarationAccepted: boolean;
}
