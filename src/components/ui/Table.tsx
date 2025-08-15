"use client";

import React from "react";

export type ColumnFormatter =
  | "text"
  | "date"
  | "fileSize"
  | "badge"
  | "tags"
  | "progress"
  | "actions";

export interface BadgeConfig {
  [key: string]: {
    color: "green" | "yellow" | "red" | "blue" | "gray";
    text?: string;
  };
}

export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  formatter?: ColumnFormatter;
  badgeConfig?: BadgeConfig;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  maxTags?: number;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  onSort?: (key: string, order: "asc" | "desc") => void;
  sortKey?: string;
  sortOrder?: "asc" | "desc";
  className?: string;
  emptyText?: string;
}

const formatters = {
  date: (value: unknown) => {
    if (!value || typeof value !== "string") return "-";
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  fileSize: (value: unknown) => {
    const bytes = typeof value === "number" ? value : 0;
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  badge: (value: unknown, badgeConfig?: BadgeConfig) => {
    const stringValue = typeof value === "string" ? value : "";

    if (!stringValue) {
      const defaultConfig = badgeConfig?.default;
      if (defaultConfig) {
        const colorClasses = {
          green: "bg-green-100 text-green-800",
          yellow: "bg-yellow-100 text-yellow-800",
          red: "bg-red-100 text-red-800",
          blue: "bg-blue-100 text-blue-800",
          gray: "bg-gray-100 text-gray-800",
        };
        return (
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${colorClasses[defaultConfig.color]}`}
          >
            {defaultConfig.text || "Uncategorized"}
          </span>
        );
      }
      return <span className="text-gray-500">-</span>;
    }

    const config = badgeConfig?.[stringValue] || { color: "gray" as const };
    const colorClasses = {
      green: "bg-green-100 text-green-800",
      yellow: "bg-yellow-100 text-yellow-800",
      red: "bg-red-100 text-red-800",
      blue: "bg-blue-100 text-blue-800",
      gray: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${colorClasses[config.color]}`}
      >
        {config.text || stringValue}
      </span>
    );
  },

  tags: (value: unknown, maxTags = 2) => {
    const tags = Array.isArray(value)
      ? value.filter((tag): tag is string => typeof tag === "string")
      : [];

    if (!tags || tags.length === 0)
      return <span className="text-gray-500">-</span>;

    return (
      <div className="flex flex-wrap gap-1">
        {tags.slice(0, maxTags).map((tag, index) => (
          <span
            key={index}
            className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800"
          >
            {tag}
          </span>
        ))}
        {tags.length > maxTags && (
          <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
            +{tags.length - maxTags}
          </span>
        )}
      </div>
    );
  },

  text: (value: unknown) => {
    const displayValue = value == null ? "-" : String(value);
    return <span className="text-sm text-gray-900">{displayValue}</span>;
  },
};

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  onSort,
  sortKey,
  sortOrder,
  className = "",
  emptyText = "No data available",
}: TableProps<T>) {
  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable || !onSort) return;

    const key = column.key as string;
    const newOrder = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
    onSort(key, newOrder);
  };

  const getSortIcon = (column: TableColumn<T>) => {
    if (!column.sortable) return null;

    const key = column.key as string;
    if (sortKey !== key) {
      return (
        <svg
          className="w-4 h-4 ml-1 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    return sortOrder === "asc" ? (
      <svg
        className="w-4 h-4 ml-1 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 ml-1 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  const getCellValue = (record: T, column: TableColumn<T>): unknown => {
    const key = column.key as string;
    if (key.includes(".")) {
      return key.split(".").reduce((obj: unknown, k: string): unknown => {
        return obj && typeof obj === "object" && k in obj
          ? (obj as Record<string, unknown>)[k]
          : undefined;
      }, record);
    }
    return record[key];
  };

  const renderCellValue = (value: unknown): React.ReactNode => {
    if (value == null) return "-";
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
    }
    if (React.isValidElement(value)) {
      return value;
    }
    return String(value);
  };

  if (loading) {
    return (
      <div
        className={`bg-white rounded-lg shadow overflow-hidden ${className}`}
      >
        <div className="animate-pulse">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="flex space-x-4">
              {columns.map((_, index) => (
                <div
                  key={index}
                  className="h-4 bg-gray-300 rounded flex-1"
                ></div>
              ))}
            </div>
          </div>
          {[...Array(5)].map((_, index) => (
            <div key={index} className="px-6 py-4 border-b border-gray-200">
              <div className="flex space-x-4">
                {columns.map((_, colIndex) => (
                  <div
                    key={colIndex}
                    className="h-4 bg-gray-200 rounded flex-1"
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.align === "center"
                      ? "text-center"
                      : column.align === "right"
                        ? "text-right"
                        : "text-left"
                  } ${column.sortable ? "cursor-pointer hover:bg-gray-100" : ""}`}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center">
                    {column.title}
                    {getSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((record, recordIndex) => (
                <tr
                  key={recordIndex}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {columns.map((column, columnIndex) => (
                    <td
                      key={columnIndex}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        column.align === "center"
                          ? "text-center"
                          : column.align === "right"
                            ? "text-right"
                            : "text-left"
                      }`}
                    >
                      {column.render
                        ? column.render(
                            getCellValue(record, column),
                            record,
                            recordIndex
                          )
                        : column.formatter
                          ? (() => {
                              const value = getCellValue(record, column);
                              switch (column.formatter) {
                                case "date":
                                  return formatters.date(value);
                                case "fileSize":
                                  return formatters.fileSize(value);
                                case "badge":
                                  return formatters.badge(
                                    value,
                                    column.badgeConfig
                                  );
                                case "tags":
                                  return formatters.tags(value, column.maxTags);
                                case "text":
                                  return formatters.text(value);
                                default:
                                  return renderCellValue(value);
                              }
                            })()
                          : renderCellValue(getCellValue(record, column))}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
