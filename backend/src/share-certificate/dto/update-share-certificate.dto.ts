import { IsString, IsEnum, IsOptional, IsEmail, IsMobilePhone, IsIn } from 'class-validator';
import { SubmissionStatus } from '../../common/enums/status.enum';

/**
 * DTO for updating share certificate details (Admin use)
 */
export class UpdateShareCertificateDto {
  // Status and admin fields
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
  fullName?: string;

  @IsString()
  @IsOptional()
  flatNumber?: string;

  @IsIn(['C', 'D'])
  @IsOptional()
  wing?: 'C' | 'D';

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsMobilePhone('en-IN')
  @IsOptional()
  mobileNumber?: string;

  @IsIn(['Primary', 'Spouse', 'Son', 'Daughter', 'Legal Heir'])
  @IsOptional()
  membershipType?: string;

  @IsString()
  @IsOptional()
  digitalSignature?: string;
}
