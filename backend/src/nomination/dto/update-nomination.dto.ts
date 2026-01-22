import {
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
  IsMobilePhone,
  IsIn,
  IsArray,
  IsObject,
  IsDateString,
  IsNumber,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SubmissionStatus } from '../../common/enums/status.enum';

class UpdateNomineeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  relationship?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  aadhaarNumber?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  sharePercentage?: number;

  @IsString()
  @IsOptional()
  address?: string;
}

class UpdateWitnessDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  signature?: string;
}

/**
 * DTO for updating nomination details (Admin use)
 */
export class UpdateNominationDto {
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
  primaryMemberName?: string;

  @IsString()
  @IsOptional()
  flatNumber?: string;

  @IsIn(['A', 'B', 'C', 'D'])
  @IsOptional()
  wing?: string;

  @IsEmail()
  @IsOptional()
  primaryMemberEmail?: string;

  @IsMobilePhone('en-IN')
  @IsOptional()
  primaryMemberMobile?: string;

  @IsString()
  @IsOptional()
  memberSignature?: string;

  // Nominees
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateNomineeDto)
  @IsOptional()
  nominees?: UpdateNomineeDto[];

  // Witnesses
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateWitnessDto)
  @IsOptional()
  witnesses?: UpdateWitnessDto[];
}
