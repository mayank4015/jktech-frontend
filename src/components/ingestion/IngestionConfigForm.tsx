"use client";

import { useState } from "react";
import { z } from "zod";
import { IngestionConfiguration, CreateIngestionData } from "@/types/ingestion";
import { Button, Input, Select, Loading } from "@/components/ui";

// Form validation schema
const configSchema = z.object({
  documentId: z.string().min(1, "Please select a document"),
  chunkSize: z
    .number()
    .min(100, "Chunk size must be at least 100")
    .max(5000, "Chunk size cannot exceed 5000"),
  chunkOverlap: z
    .number()
    .min(0, "Overlap cannot be negative")
    .max(1000, "Overlap cannot exceed 1000"),
  extractImages: z.boolean(),
  extractTables: z.boolean(),
  language: z.string().min(1, "Please select a language"),
  processingMode: z.enum(["standard", "enhanced", "custom"], {
    errorMap: () => ({ message: "Please select a processing mode" }),
  }),
});

type ConfigFormData = z.infer<typeof configSchema>;

interface IngestionConfigFormProps {
  onSubmit: (data: CreateIngestionData) => Promise<void>;
  onCancel?: () => void;
  defaultConfig?: Partial<IngestionConfiguration>;
  availableDocuments?: Array<{ id: string; title: string; status: string }>;
  isLoading?: boolean;
}

const processingModeOptions = [
  {
    value: "standard",
    label: "Standard",
    description: "Basic text extraction and chunking",
  },
  {
    value: "enhanced",
    label: "Enhanced",
    description: "Advanced processing with image and table extraction",
  },
  {
    value: "custom",
    label: "Custom",
    description: "Custom configuration with advanced options",
  },
];

const languageOptions = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "auto", label: "Auto-detect" },
];

export function IngestionConfigForm({
  onSubmit,
  onCancel,
  defaultConfig,
  availableDocuments = [],
  isLoading = false,
}: IngestionConfigFormProps) {
  const [formData, setFormData] = useState<ConfigFormData>({
    documentId: "",
    chunkSize: defaultConfig?.chunkSize || 1000,
    chunkOverlap: defaultConfig?.chunkOverlap || 200,
    extractImages: defaultConfig?.extractImages ?? true,
    extractTables: defaultConfig?.extractTables ?? true,
    language: defaultConfig?.language || "en",
    processingMode: defaultConfig?.processingMode || "standard",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ConfigFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof ConfigFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user makes changes
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const result = configSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ConfigFormData, string>> = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0] as keyof ConfigFormData;
        fieldErrors[field] = error.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Validate chunk overlap
    if (formData.chunkOverlap >= formData.chunkSize) {
      setErrors({ chunkOverlap: "Overlap must be less than chunk size" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { documentId, ...configuration } = formData;
      await onSubmit({
        documentId,
        configuration,
      });
    } catch (error) {
      // Error handling is managed by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const processableDocuments = availableDocuments.filter(
    (doc) => doc.status === "processed"
  );

  // Add error boundary
  if (!onSubmit) {
    return (
      <div className="p-4 text-red-600">
        Error: onSubmit function is required
      </div>
    );
  }

  // Test render
  if (!availableDocuments || availableDocuments.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500 mb-2">No documents available</p>
        <p className="text-sm text-gray-400">
          Please upload and process documents first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-800">
              {processableDocuments.length} document
              {processableDocuments.length !== 1 ? "s" : ""} available for
              processing
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Only processed documents can be used for ingestion
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document to Process
          </label>
          <Select
            options={[
              { value: "", label: "Select a document..." },
              ...processableDocuments.map((doc) => ({
                value: doc.id,
                label: doc.title,
              })),
            ]}
            value={formData.documentId}
            onChange={(e) => handleChange("documentId", e.target.value)}
            error={errors.documentId}
            disabled={isLoading || isSubmitting}
          />
          {processableDocuments.length === 0 && (
            <p className="text-sm text-yellow-600 mt-1">
              No processed documents available. Please upload and process
              documents first.
            </p>
          )}
        </div>

        {/* Processing Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Processing Mode
          </label>
          <div className="space-y-3">
            {processingModeOptions.map((option) => (
              <label key={option.value} className="flex items-start">
                <input
                  type="radio"
                  name="processingMode"
                  value={option.value}
                  checked={formData.processingMode === option.value}
                  onChange={(e) =>
                    handleChange("processingMode", e.target.value)
                  }
                  className="mt-1 mr-3"
                  disabled={isLoading || isSubmitting}
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {option.label}
                  </div>
                  <div className="text-sm text-gray-500">
                    {option.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
          {errors.processingMode && (
            <p className="text-sm text-red-600 mt-1">{errors.processingMode}</p>
          )}
        </div>

        {/* Chunking Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chunk Size (characters)
            </label>
            <Input
              type="number"
              value={formData.chunkSize}
              onChange={(e) =>
                handleChange("chunkSize", parseInt(e.target.value) || 0)
              }
              error={errors.chunkSize}
              disabled={isLoading || isSubmitting}
              min={100}
              max={5000}
              step={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended: 800-1200 for general documents
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chunk Overlap (characters)
            </label>
            <Input
              type="number"
              value={formData.chunkOverlap}
              onChange={(e) =>
                handleChange("chunkOverlap", parseInt(e.target.value) || 0)
              }
              error={errors.chunkOverlap}
              disabled={isLoading || isSubmitting}
              min={0}
              max={1000}
              step={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended: 10-20% of chunk size
            </p>
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Language
          </label>
          <Select
            options={languageOptions}
            value={formData.language}
            onChange={(e) => handleChange("language", e.target.value)}
            error={errors.language}
            disabled={isLoading || isSubmitting}
          />
        </div>

        {/* Extraction Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Content Extraction
          </label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.extractImages}
                onChange={(e) =>
                  handleChange("extractImages", e.target.checked)
                }
                className="mr-3"
                disabled={isLoading || isSubmitting}
              />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Extract Images
                </div>
                <div className="text-sm text-gray-500">
                  Process and extract text from images using OCR
                </div>
              </div>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.extractTables}
                onChange={(e) =>
                  handleChange("extractTables", e.target.checked)
                }
                className="mr-3"
                disabled={isLoading || isSubmitting}
              />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Extract Tables
                </div>
                <div className="text-sm text-gray-500">
                  Parse and structure tabular data
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Configuration Preview */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Configuration Summary
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>Chunk Size: {formData.chunkSize} chars</div>
            <div>Overlap: {formData.chunkOverlap} chars</div>
            <div>
              Language:{" "}
              {
                languageOptions.find((l) => l.value === formData.language)
                  ?.label
              }
            </div>
            <div>
              Mode:{" "}
              {
                processingModeOptions.find(
                  (m) => m.value === formData.processingMode
                )?.label
              }
            </div>
            <div>Images: {formData.extractImages ? "Yes" : "No"}</div>
            <div>Tables: {formData.extractTables ? "Yes" : "No"}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              size="lg"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={
              isSubmitting || isLoading || processableDocuments.length === 0
            }
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loading size="sm" className="mr-2" />
                Creating Ingestion...
              </>
            ) : (
              "Start Ingestion"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
