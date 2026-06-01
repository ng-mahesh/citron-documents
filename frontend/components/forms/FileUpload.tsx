"use client";

import React, { useRef, useState } from "react";
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from "lucide-react";

interface FileUploadProps {
  label: string;
  required?: boolean;
  documentType: string;
  onFileSelected: (file: File | null) => void;
  selectedFile?: File | null;
  error?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  required = false,
  documentType,
  onFileSelected,
  selectedFile,
  error,
  disabled = false,
}) => {
  const [localError, setLocalError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      setLocalError("File size must be less than 2MB");
      return;
    }
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setLocalError("Only PDF and JPEG files are allowed");
      return;
    }
    setLocalError("");
    onFileSelected(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSelect(file);
  };

  const handleRemove = () => {
    setLocalError("");
    if (inputRef.current) inputRef.current.value = "";
    onFileSelected(null);
  };

  const displayError = localError || error;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        accept=".pdf,.jpg,.jpeg"
        className="hidden"
        id={`file-upload-${documentType}`}
        disabled={disabled}
      />

      {!selectedFile ? (
        <label
          htmlFor={`file-upload-${documentType}`}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center w-full min-h-[130px] rounded-xl border-2 border-dashed transition-all cursor-pointer ${
            disabled
              ? "border-slate-200 bg-slate-50 cursor-not-allowed opacity-60"
              : isDragging
                ? "border-green-500 bg-green-50"
                : displayError
                  ? "border-red-300 bg-red-50/30 hover:border-red-400"
                  : "border-slate-300 bg-white hover:border-green-400 hover:bg-green-50/30"
          }`}
        >
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center mb-2 transition-colors ${
              disabled
                ? "bg-slate-100"
                : isDragging
                  ? "bg-green-100"
                  : "bg-slate-100 group-hover:bg-green-100"
            }`}
          >
            <Upload
              className={`h-5 w-5 ${disabled ? "text-slate-400" : isDragging ? "text-green-600" : "text-slate-500"}`}
            />
          </div>
          <p
            className={`text-xs font-medium ${disabled ? "text-slate-400" : "text-slate-600"}`}
          >
            {disabled
              ? "Fill required fields first"
              : "Click to upload or drag & drop"}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">PDF or JPEG · max 2MB</p>
        </label>
      ) : (
        <div
          className={`flex items-center gap-3 w-full rounded-xl border px-4 py-3 bg-green-50 border-green-200`}
        >
          <div className="h-9 w-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-green-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold text-slate-900 truncate"
              title={selectedFile.name}
            >
              {selectedFile.name}
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              {(selectedFile.size / 1024).toFixed(0)} KB · Ready to upload
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {displayError && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {displayError}
        </p>
      )}
    </div>
  );
};
