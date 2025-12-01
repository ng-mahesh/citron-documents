import { IsString, IsEnum, IsOptional } from 'class-validator';
import { SubmissionStatus } from '../../common/enums/status.enum';

/**
 * DTO for updating share certificate status and remarks (Admin use)
 */
export class UpdateShareCertificateDto {
  @IsEnum(SubmissionStatus)
  @IsOptional()
  status?: SubmissionStatus;

  @IsString()
  @IsOptional()
  adminRemarks?: string;

  @IsString()
  @IsOptional()
  reviewedBy?: string;
}
