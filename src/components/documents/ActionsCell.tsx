"use client";

import React from "react";
import { Document } from "@/types/document";
import { Button } from "@/components/ui";

interface ActionsCellProps {
  document: Document;
  onEdit: (document: Document) => void;
  onDelete: (document: Document) => void;
  onReprocess: (document: Document) => void;
  onPreview: (document: Document) => void;
}

export function ActionsCell({
  document,
  onEdit,
  onDelete,
  onReprocess,
  onPreview,
}: ActionsCellProps) {
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
      {document.status === "failed" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onReprocess(document)}
          className="text-orange-600 hover:text-orange-700"
        >
          Retry
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
