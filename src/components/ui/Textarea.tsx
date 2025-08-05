"use client";

import React, { forwardRef } from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  resize?: "none" | "vertical" | "horizontal" | "both";
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      fullWidth = false,
      resize = "vertical",
      className = "",
      ...props
    },
    ref
  ) => {
    const resizeClasses = {
      none: "resize-none",
      vertical: "resize-y",
      horizontal: "resize-x",
      both: "resize",
    };

    const baseClasses = `
      block px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      transition-colors
      ${resizeClasses[resize]}
      ${fullWidth ? "w-full" : ""}
      ${error ? "border-red-500 focus:ring-red-500" : ""}
      ${className}
    `;

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <textarea ref={ref} className={baseClasses} {...props} />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);
