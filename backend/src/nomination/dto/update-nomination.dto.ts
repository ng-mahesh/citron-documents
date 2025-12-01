import { IsString, IsEnum, IsOptional } from 'class-validator';
import { SubmissionStatus } from '../../common/enums/status.enum';

/**
 * DTO for updating nomination status and remarks (Admin use)
 */
export class UpdateNominationDto {
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
