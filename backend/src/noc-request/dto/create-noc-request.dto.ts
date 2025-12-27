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
  ValidateIf,
} from 'class-validator';
import { UploadedDocument } from '../../common/interfaces/document.interface';
import { NocType } from '../schemas/noc-request.schema';

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
  @ValidateIf((o) => o.sellerAlternateMobile && o.sellerAlternateMobile.trim() !== '')
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

  // Buyer Information (conditional - only required for Flat Transfer)
  @ValidateIf((o) => o.nocType === NocType.FLAT_TRANSFER)
  @IsString()
  @IsNotEmpty({ message: 'Buyer name is required for flat transfer' })
  @MaxLength(100)
  buyerName?: string;

  @ValidateIf((o) => o.nocType === NocType.FLAT_TRANSFER)
  @IsString()
  @IsNotEmpty({ message: 'Buyer mobile number is required for flat transfer' })
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Please enter a valid 10-digit buyer mobile number',
  })
  buyerMobileNumber?: string;

  @ValidateIf((o) => o.nocType === NocType.FLAT_TRANSFER)
  @IsEmail({}, { message: 'Please enter a valid buyer email' })
  @IsNotEmpty({ message: 'Buyer email is required for flat transfer' })
  buyerEmail?: string;

  // NOC Details
  @IsEnum(NocType, { message: 'Invalid NOC type' })
  @IsNotEmpty()
  nocType: NocType;

  @ValidateIf((o) => o.nocType === NocType.OTHER)
  @IsString()
  @IsNotEmpty({ message: 'Purpose description is required for Other type' })
  @MaxLength(500)
  purposeDescription?: string;

  @ValidateIf((o) => o.nocType === NocType.FLAT_TRANSFER)
  @IsDateString()
  @IsNotEmpty({ message: 'Expected transfer date is required for flat transfer' })
  expectedTransferDate?: string;

  // Document Uploads (type-specific validation)

  // Flat Transfer documents
  @ValidateIf((o) => o.nocType === NocType.FLAT_TRANSFER)
  @IsObject()
  @IsNotEmpty({ message: 'Agreement document is required for flat transfer' })
  agreementDocument?: UploadedDocument;

  @ValidateIf((o) =>
    [NocType.BANK_ACCOUNT_TRANSFER, NocType.MSEB_BILL_CHANGE, NocType.OTHER].includes(o.nocType),
  )
  @IsObject()
  @IsNotEmpty({ message: 'Share certificate is required' })
  shareCertificateDocument?: UploadedDocument;

  @ValidateIf((o) => [NocType.FLAT_TRANSFER, NocType.OTHER].includes(o.nocType))
  @IsObject()
  @IsNotEmpty({ message: 'Maintenance receipt is required' })
  maintenanceReceiptDocument?: UploadedDocument;

  @ValidateIf((o) => o.nocType === NocType.FLAT_TRANSFER)
  @IsObject()
  @IsNotEmpty({ message: 'Buyer Aadhaar is required for flat transfer' })
  buyerAadhaarDocument?: UploadedDocument;

  @ValidateIf((o) => o.nocType === NocType.FLAT_TRANSFER)
  @IsObject()
  @IsOptional()
  buyerPanDocument?: UploadedDocument;

  // Documents for non-transfer types
  @ValidateIf((o) =>
    [NocType.BANK_ACCOUNT_TRANSFER, NocType.MSEB_BILL_CHANGE, NocType.OTHER].includes(o.nocType),
  )
  @IsObject()
  @IsNotEmpty({ message: 'Identity proof (Aadhaar) is required' })
  identityProofDocument?: UploadedDocument;

  @ValidateIf((o) => o.nocType === NocType.MSEB_BILL_CHANGE)
  @IsObject()
  @IsNotEmpty({ message: 'Current electricity bill is required for MSEB type' })
  currentElectricityBillDocument?: UploadedDocument;

  @ValidateIf((o) => o.nocType === NocType.OTHER)
  @IsObject()
  @IsNotEmpty({ message: 'Supporting documents are required for Other type' })
  supportingDocuments?: UploadedDocument;

  // Digital Signature & Declaration
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  digitalSignature: string;

  @IsBoolean()
  @IsNotEmpty()
  declarationAccepted: boolean;
}
