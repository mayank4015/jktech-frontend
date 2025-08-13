"use client";

import React, { useState } from "react";
import { Document } from "@/types/document";
import { Button } from "@/components/ui";
import { Play, RotateCcw } from "lucide-react";

interface ActionsCellProps {
  document: Document;
  onEdit: (document: Document) => void;
  onDelete: (document: Document) => void;
  onReprocess: (document: Document) => void;
  onPreview: (document: Document) => void;
  onProcess?: (document: Document) => void;
}

export function ActionsCell({
  document,
  onEdit,
  onDelete,
  onReprocess,
  onPreview,
  onProcess,
}: ActionsCellProps) {
  const [processing, setProcessing] = useState(false);

  const handleProcess = async () => {
    if (!onProcess) return;
    setProcessing(true);
    try {
      await onProcess(document);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPreview(document)}
        className="text-blue-600 hover:text-blue-700"
      >
        Preview
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(document)}
        className="text-green-600 hover:text-green-700"
      >
        Edit
      </Button>

      {/* Process button for pending documents */}
      {document.status === "pending" && onProcess && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleProcess}
          disabled={processing}
          className="text-purple-600 hover:text-purple-700"
        >
          {processing ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600" />
          ) : (
            <Play className="h-3 w-3" />
          )}
          <span className="ml-1">Process</span>
        </Button>
      )}

      {/* Retry button for failed documents */}
      {document.status === "failed" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onReprocess(document)}
          className="text-orange-600 hover:text-orange-700"
        >
          <RotateCcw className="h-3 w-3" />
          <span className="ml-1">Retry</span>
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onDelete(document)}
        className="text-red-600 hover:text-red-700"
      >
        Delete
      </Button>
    </div>
  );
}
