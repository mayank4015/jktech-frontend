import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive";
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  loading = false,
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-gray-600">{message}</p>

        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            isLoading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
