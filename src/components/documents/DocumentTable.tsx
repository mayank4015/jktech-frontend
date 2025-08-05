"use client";

import React from "react";
import { Document } from "@/types/document";
import { Table, TableColumn } from "@/components/ui";
import { DocumentCell } from "./DocumentCell";
import { StatusCell } from "./StatusCell";
import { ActionsCell } from "./ActionsCell";

export interface DocumentTableProps {
  documents: Document[];
  loading?: boolean;
  onEdit: (document: Document) => void;
  onDelete: (document: Document) => void;
  onReprocess: (document: Document) => void;
  onPreview: (document: Document) => void;
  onSort?: (key: string, order: "asc" | "desc") => void;
  sortKey?: string;
  sortOrder?: "asc" | "desc";
}

export function DocumentTable({
  documents,
  loading = false,
  onEdit,
  onDelete,
  onReprocess,
  onPreview,
  onSort,
  sortKey,
  sortOrder,
}: DocumentTableProps) {
  const columns: TableColumn<Document>[] = [
    {
      key: "fileName",
      title: "Document",
      sortable: true,
      render: (_, document) => <DocumentCell document={document} />,
    },
    {
      key: "category",
      title: "Category",
      formatter: "badge",
      badgeConfig: {
        default: { color: "blue", text: "Uncategorized" },
      },
    },
    {
      key: "status",
      title: "Status",
      render: (_, document) => <StatusCell document={document} />,
    },
    {
      key: "fileSize",
      title: "Size",
      sortable: true,
      formatter: "fileSize",
    },
    {
      key: "uploadedByName",
      title: "Uploaded By",
      formatter: "text",
    },
    {
      key: "createdAt",
      title: "Upload Date",
      sortable: true,
      formatter: "date",
    },
    {
      key: "tags",
      title: "Tags",
      formatter: "tags",
      maxTags: 2,
    },
    {
      key: "actions",
      title: "Actions",
      width: "200px",
      render: (_, document) => (
        <ActionsCell
          document={document}
          onEdit={onEdit}
          onDelete={onDelete}
          onReprocess={onReprocess}
          onPreview={onPreview}
        />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={documents}
      loading={loading}
      onSort={onSort}
      sortKey={sortKey}
      sortOrder={sortOrder}
      emptyText="No documents found"
    />
  );
}
