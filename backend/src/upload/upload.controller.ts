import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

/**
 * Controller for handling file upload requests
 */
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Upload a single file
   * POST /api/upload
   */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('flatNumber') flatNumber: string,
    @Body('documentType') documentType: string,
    @Body('fullName') fullName: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!flatNumber || !documentType || !fullName) {
      throw new BadRequestException(
        'Missing required parameters: flatNumber, documentType, fullName',
      );
    }

    const uploadedDocument = await this.uploadService.uploadFile(
      file,
      flatNumber,
      documentType,
      fullName,
    );

    return {
      success: true,
      message: 'File uploaded successfully',
      data: uploadedDocument,
    };
  }
}
