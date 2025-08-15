"use client";

import React, { useState, useRef } from "react";
import { Input, Textarea, Select, Button, FileUpload } from "@/components/ui";

// Document categories - these could come from an API in the future
const documentCategories = [
  "Technical Documentation",
  "User Manual",
  "Policy Document",
  "Report",
  "Presentation",
  "Contract",
  "Invoice",
  "Other",
];

const commonTags = [
  "important",
  "draft",
  "review",
  "approved",
  "confidential",
  "public",
  "internal",
  "external",
  "archived",
  "active",
];

export interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  loading?: boolean;
}

interface DocumentDocumentFormData {
  file: File | null;
  title: string;
  description: string;
  tags: string[];
  category: string;
}

interface FormErrors {
  file?: string;
  title?: string;
  description?: string;
  tags?: string;
  category?: string;
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: DocumentUploadModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState<DocumentDocumentFormData>({
    file: null,
    title: "",
    description: "",
    tags: [],
    category: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [customTag, setCustomTag] = useState("");

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        file: null,
        title: "",
        description: "",
        tags: [],
        category: "",
      });
      setErrors({});
      setCustomTag("");
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.file) {
      newErrors.file = "Please select a file to upload";
    } else {
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (formData.file.size > maxSize) {
        newErrors.file = "File size must be less than 10MB";
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain",
        "text/csv",
        "image/jpeg",
        "image/png",
        "image/gif",
      ];

      if (!allowedTypes.includes(formData.file.type)) {
        newErrors.file =
          "File type not supported. Please upload PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, or image files (JPEG, PNG, GIF).";
      }
    }

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted!", { formData });

    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    // Create FormData for server action
    const serverFormData = new FormData();
    serverFormData.append("file", formData.file!);
    serverFormData.append("title", formData.title);
    if (formData.description) {
      serverFormData.append("description", formData.description);
    }
    if (formData.category) {
      serverFormData.append("category", formData.category);
    }
    if (formData.tags.length > 0) {
      serverFormData.append("tags", JSON.stringify(formData.tags));
    }

    console.log("Calling onSubmit with FormData");
    try {
      await onSubmit(serverFormData);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const handleInputChange = (
    field: keyof DocumentDocumentFormData,
    value: File | string | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      handleInputChange("file", file);

      // Auto-generate title from filename if title is empty
      if (!formData.title) {
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
        const formattedTitle = nameWithoutExtension
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
        handleInputChange("title", formattedTitle);
      }
    }
  };

  const handleTagToggle = (tag: string) => {
    const newTags = formData.tags.includes(tag)
      ? formData.tags.filter((t) => t !== tag)
      : [...formData.tags, tag];
    handleInputChange("tags", newTags);
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !formData.tags.includes(customTag.trim())) {
      handleInputChange("tags", [...formData.tags, customTag.trim()]);
      setCustomTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col border border-gray-200">
        {/* Modal Header - Fixed */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-xl">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Upload Document
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Upload and configure your document for AI processing
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Status Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-blue-500 mr-2"
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
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Upload your document to get started
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT,
                  CSV, Images (Max: 10MB)
                </p>
              </div>
            </div>
          </div>

          <form
            ref={formRef}
            id="upload-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* File Upload */}
            <FileUpload
              label="Select Document"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif"
              maxSize={10 * 1024 * 1024} // 10MB
              onFileSelect={handleFileSelect}
              error={errors.file}
              disabled={loading}
            />

            {formData.file && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-8 h-8 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {formData.file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Title */}
            <Input
              label="Document Title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              error={errors.title}
              placeholder="Enter document title"
              disabled={loading}
              required
            />

            {/* Description */}
            <Textarea
              label="Description (Optional)"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              error={errors.description}
              placeholder="Enter document description"
              rows={3}
              fullWidth
              disabled={loading}
            />

            {/* Category */}
            <Select
              label="Category (Optional)"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              error={errors.category}
              fullWidth
              disabled={loading}
              options={[
                { value: "", label: "Select a category" },
                ...documentCategories.map((category) => ({
                  value: category,
                  label: category,
                })),
              ]}
            />

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>

              {/* Selected Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                        disabled={loading}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Common Tags */}
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Common tags:</p>
                <div className="flex flex-wrap gap-2">
                  {commonTags.slice(0, 12).map((tag) => {
                    const isSelected = formData.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        disabled={loading}
                        className={`px-2 py-1 text-xs font-medium rounded border transition-colors ${
                          isSelected
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        } ${
                          loading
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Tag Input */}
              <div className="flex space-x-2">
                <Input
                  placeholder="Add custom tag"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  disabled={loading}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCustomTag}
                  disabled={!customTag.trim() || loading}
                >
                  Add
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer - Fixed */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            size="lg"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="upload-form"
            isLoading={loading}
            disabled={loading || !formData.file || !formData.title}
            size="lg"
          >
            Upload Document
          </Button>
        </div>
      </div>
    </div>
  );
}
