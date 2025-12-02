import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UploadedDocument } from '../common/interfaces/document.interface';

/**
 * Service for handling file uploads to AWS S3
 */
@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
  }

  /**
   * Validate file before upload
   * - Max size: 2MB
   * - Allowed types: PDF, JPEG
   */
  private validateFile(file: Express.Multer.File): void {
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];

    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 2MB limit');
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only PDF and JPEG files are allowed');
    }
  }

  /**
   * Generate file name with naming convention
   * Format: FLATNO_DOCUMENTTYPE_FULLNAME_TIMESTAMP.ext
   */
  private generateFileName(
    flatNumber: string,
    documentType: string,
    fullName: string,
    originalFileName: string,
  ): string {
    const timestamp = Date.now();
    const extension = originalFileName.split('.').pop();

    // Sanitize inputs
    const sanitizedFlatNo = flatNumber.replace(/[^a-zA-Z0-9]/g, '');
    const sanitizedDocType = documentType.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
    const sanitizedName = fullName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();

    return `${sanitizedFlatNo}_${sanitizedDocType}_${sanitizedName}_${timestamp}.${extension}`;
  }

  /**
   * Upload file to S3
   */
  async uploadFile(
    file: Express.Multer.File,
    flatNumber: string,
    documentType: string,
    fullName: string,
  ): Promise<UploadedDocument> {
    try {
      // Validate file
      this.validateFile(file);

      // Generate file name
      const fileName = this.generateFileName(flatNumber, documentType, fullName, file.originalname);

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: `documents/${fileName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      // Generate file URL
      const fileUrl = `https://${this.bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/documents/${fileName}`;

      return {
        fileName,
        fileUrl,
        fileSize: file.size,
        fileType: file.mimetype,
        uploadedAt: new Date(),
        s3Key: fileName, // S3 key is the same as fileName for deletion
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(fileName: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: `documents/${fileName}`,
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Generate a pre-signed URL for secure document viewing
   * URL expires in 1 hour by default
   */
  async getPresignedUrl(s3Key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key.startsWith('documents/') ? s3Key : `documents/${s3Key}`,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      throw new BadRequestException(`Failed to generate presigned URL: ${error.message}`);
    }
  }
}
