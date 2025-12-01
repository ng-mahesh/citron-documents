/**
 * Interface for uploaded document metadata
 */
export interface UploadedDocument {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType?: string;
  uploadedAt: Date;
  s3Key: string; // S3 key for deletion (same as fileName)
}
