import {
  Controller,
  Post,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import multer from 'multer';

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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'), false);
        }
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('flatNumber') flatNumber: string,
    @Body('documentType') documentType: string,
    @Body('fullName') fullName: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!file.buffer) {
      throw new BadRequestException('File buffer not available');
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

  /**
   * Delete a file from S3
   * DELETE /api/upload
   */
  @Delete()
  async deleteFile(@Body('key') key: string) {
    if (!key) {
      throw new BadRequestException('No file key provided');
    }

    await this.uploadService.deleteFile(key);

    return {
      success: true,
      message: 'File deleted successfully',
    };
  }
}
