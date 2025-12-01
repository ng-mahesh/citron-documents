import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
  IsDateString,
  IsNumber,
  Min,
  Max,
  Matches,
  MaxLength,
  MinLength,
  IsObject,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UploadedDocument } from '../../common/interfaces/document.interface';

/**
 * DTO for nominee details
 */
export class NomineeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  relationship: string;

  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{12}$/, { message: 'Aadhaar number must be 12 digits' })
  aadhaarNumber: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  sharePercentage: number;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  address?: string;
}

/**
 * DTO for witness details
 */
export class WitnessDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  address: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  signature: string;
}

/**
 * DTO for creating a nomination submission
 */
export class CreateNominationDto {
  // Primary Member
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  primaryMemberName: string;

  @IsEmail()
  @IsNotEmpty()
  primaryMemberEmail: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Mobile number must be a valid 10-digit Indian phone number',
  })
  primaryMemberMobile: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  flatNumber: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['C', 'D'], { message: 'Wing must be either C or D' })
  wing: string;

  // Joint Member (Optional)
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

  // Nominees
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => NomineeDto)
  nominees: NomineeDto[];

  // Documents
  @IsObject()
  @IsNotEmpty()
  index2Document: UploadedDocument;

  @IsObject()
  @IsNotEmpty()
  possessionLetterDocument: UploadedDocument;

  @IsObject()
  @IsNotEmpty()
  primaryMemberAadhaar: UploadedDocument;

  @IsObject()
  @IsOptional()
  jointMemberAadhaar?: UploadedDocument;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  nomineeAadhaars: UploadedDocument[];

  // Witnesses
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => WitnessDto)
  witnesses: WitnessDto[];

  // Declaration
  @IsBoolean()
  @IsNotEmpty()
  declarationAccepted: boolean;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  memberSignature: string;
}
