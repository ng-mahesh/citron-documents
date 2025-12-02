'use client';

import React, { useState } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { uploadAPI } from '@/lib/api';
import { DocumentMetadata } from '@/lib/types';
import { Button } from '@/components/ui/Button';

interface FileUploadProps {
  label: string;
  required?: boolean;
  flatNumber: string;
  documentType: string;
  fullName: string;
  onUploadSuccess: (metadata: DocumentMetadata) => void;
  value?: DocumentMetadata;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  required = false,
  flatNumber,
  documentType,
  fullName,
  onUploadSuccess,
  value,
  error,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File size must be less than 2MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only PDF and JPEG files are allowed');
      return;
    }

    setUploadError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('flatNumber', flatNumber);
      formData.append('documentType', documentType);
      formData.append('fullName', fullName);

      const response = await uploadAPI.upload(formData);
      // Backend returns { success, message, data }, we need the nested data object
      const uploadedFile = response.data.data || response.data;
      onUploadSuccess(uploadedFile);
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!value?.s3Key) return;

    try {
      await uploadAPI.delete(value.s3Key);
      onUploadSuccess({} as DocumentMetadata);
    } catch (err) {
      console.error('Failed to delete file:', err);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {!value?.fileName ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg"
            className="hidden"
            id={`file-upload-${documentType}`}
            disabled={uploading || !flatNumber || !fullName}
          />
          <label
            htmlFor={`file-upload-${documentType}`}
            className={`cursor-pointer ${uploading || !flatNumber || !fullName ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
            </p>
            <p className="mt-1 text-xs text-gray-500">PDF or JPEG (max 2MB)</p>
          </label>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <File className="h-8 w-8 text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate" title={value.fileName}>
                {value.fileName}
              </p>
              <p className="text-xs text-gray-500">
                {(value.fileSize / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-red-600 hover:text-red-800 flex-shrink-0 ml-3"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {(uploadError || error) && (
        <div className="mt-2 flex items-center text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          {uploadError || error}
        </div>
      )}

      {!flatNumber || !fullName ? (
        <p className="mt-2 text-xs text-gray-500">
          Please fill in Flat Number and Full Name before uploading files
        </p>
      ) : null}
    </div>
  );
};
