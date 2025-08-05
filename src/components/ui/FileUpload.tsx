"use client";

import React, { useRef, useState } from "react";
import { Button } from "./Button";

export interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  dragAndDrop?: boolean;
  children?: React.ReactNode;
}

export function FileUpload({
  onFileSelect,
  accept,
  multiple = false,
  maxSize,
  maxFiles = 1,
  label,
  error,
  disabled = false,
  className = "",
  dragAndDrop = true,
  children,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  const validateFiles = (
    files: File[]
  ): { valid: File[]; errors: string[] } => {
    const errors: string[] = [];
    const valid: File[] = [];

    if (files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} file(s) allowed`);
      return { valid: [], errors };
    }

    files.forEach((file) => {
      if (maxSize && file.size > maxSize) {
        errors.push(
          `File "${file.name}" is too large. Maximum size is ${formatFileSize(maxSize)}`
        );
        return;
      }

      if (accept) {
        const acceptedTypes = accept.split(",").map((type) => type.trim());
        const isValidType = acceptedTypes.some((type) => {
          if (type.startsWith(".")) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          return file.type.match(type.replace("*", ".*"));
        });

        if (!isValidType) {
          errors.push(`File "${file.name}" type is not supported`);
          return;
        }
      }

      valid.push(file);
    });

    return { valid, errors };
  };

  const handleFileSelect = (files: File[]) => {
    setUploadError("");
    const { valid, errors } = validateFiles(files);

    if (errors.length > 0) {
      setUploadError(errors.join(", "));
      return;
    }

    onFileSelect(valid);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFileSelect(files);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(event.dataTransfer.files);
    handleFileSelect(files);
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const displayError = error || uploadError;

  if (children) {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div onClick={openFileDialog} className="cursor-pointer">
          {children}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        {displayError && (
          <p className="mt-2 text-sm text-red-600">{displayError}</p>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {dragAndDrop ? (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"}
            ${disabled ? "bg-gray-50 cursor-not-allowed" : "hover:border-gray-400 cursor-pointer"}
            ${displayError ? "border-red-500" : ""}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <div className="space-y-2">
            <svg
              className={`mx-auto h-12 w-12 ${
                disabled ? "text-gray-300" : "text-gray-400"
              }`}
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Click to upload
              </span>{" "}
              or drag and drop
            </div>
            {accept && (
              <p className="text-xs text-gray-500">
                Supported formats: {accept}
              </p>
            )}
            {maxSize && (
              <p className="text-xs text-gray-500">
                Maximum file size: {formatFileSize(maxSize)}
              </p>
            )}
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={openFileDialog}
          disabled={disabled}
          className="w-full"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          Choose File{multiple ? "s" : ""}
        </Button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {displayError && (
        <p className="mt-2 text-sm text-red-600">{displayError}</p>
      )}
    </div>
  );
}
