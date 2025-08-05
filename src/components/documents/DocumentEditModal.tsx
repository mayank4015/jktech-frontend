"use client";

import React, { useState, useEffect } from "react";
import { Document } from "@/types/document";
import { Input, Textarea, Select, Button, Modal } from "@/components/ui";
import {
  documentCategories,
  commonTags,
} from "@/lib/mockServices/documentService";

export interface DocumentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: Partial<Pick<Document, "title" | "description" | "tags" | "category">>
  ) => Promise<void>;
  document: Document | null;
  loading?: boolean;
}

interface FormData {
  title: string;
  description: string;
  tags: string[];
  category: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  tags?: string;
  category?: string;
}

export function DocumentEditModal({
  isOpen,
  onClose,
  onSubmit,
  document,
  loading = false,
}: DocumentEditModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    tags: [],
    category: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customTag, setCustomTag] = useState("");

  // Reset form when modal opens/closes or document changes
  useEffect(() => {
    if (isOpen && document) {
      setFormData({
        title: document.title,
        description: document.description || "",
        tags: [...document.tags],
        category: document.category || "",
      });
      setErrors({});
      setCustomTag("");
    }
  }, [isOpen, document]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        title: formData.title,
        description: formData.description || undefined,
        tags: formData.tags,
        category: formData.category || undefined,
      };

      await onSubmit(updateData);
      onClose();
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
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

  if (!document) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Document"
      size="lg"
      footer={
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting || loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-form"
            isLoading={isSubmitting || loading}
            disabled={isSubmitting || loading}
          >
            Update Document
          </Button>
        </div>
      }
    >
      <form id="edit-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Document Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
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
                {document.fileName}
              </p>
              <p className="text-sm text-gray-500">
                {(document.fileSize / 1024 / 1024).toFixed(2)} MB • Uploaded by{" "}
                {document.uploadedByName}
              </p>
            </div>
            <div className="flex-shrink-0">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  document.status === "processed"
                    ? "bg-green-100 text-green-800"
                    : document.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {document.status === "processed"
                  ? "Processed"
                  : document.status === "pending"
                    ? "Processing"
                    : "Failed"}
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        <Input
          label="Document Title"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          error={errors.title}
          placeholder="Enter document title"
          disabled={isSubmitting || loading}
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
          disabled={isSubmitting || loading}
        />

        {/* Category */}
        <Select
          label="Category (Optional)"
          value={formData.category}
          onChange={(e) => handleInputChange("category", e.target.value)}
          error={errors.category}
          fullWidth
          disabled={isSubmitting || loading}
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
                    disabled={isSubmitting || loading}
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
                    disabled={isSubmitting || loading}
                    className={`px-2 py-1 text-xs font-medium rounded border transition-colors ${
                      isSelected
                        ? "bg-blue-100 text-blue-800 border-blue-300"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    } ${
                      isSubmitting || loading
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
              disabled={isSubmitting || loading}
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
              disabled={!customTag.trim() || isSubmitting || loading}
            >
              Add
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
