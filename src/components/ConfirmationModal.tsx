import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  isDestructive?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm Delete',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
  isDestructive = true,
}: ConfirmationModalProps) {
  // Close on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="confirmation-modal-portal">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            id="confirmation-modal-backdrop"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 z-10 p-6 flex flex-col gap-4 text-xs"
            id="confirmation-modal-panel"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label="Close modal"
              id="confirmation-modal-close-btn"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="flex gap-4 items-start pt-2" id="confirmation-modal-content-wrapper">
              <div
                className={`p-3 rounded-xl flex-shrink-0 ${
                  isDestructive ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                }`}
                id="confirmation-modal-icon-container"
              >
                {isDestructive ? (
                  <Trash2 className="w-6 h-6 animate-pulse" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-indigo-600" />
                )}
              </div>

              <div className="flex-1 space-y-2" id="confirmation-modal-text-container">
                <h3 className="text-base font-bold text-slate-800" id="confirmation-modal-title">
                  {title}
                </h3>
                <p className="text-slate-500 leading-relaxed font-sans text-xs" id="confirmation-modal-message">
                  {message}
                </p>
              </div>
            </div>

            {/* Warning Note */}
            {isDestructive && (
              <div
                className="bg-rose-50/50 border border-rose-100 rounded-xl p-3.5 text-[11px] text-rose-700 font-medium flex items-start gap-2 leading-relaxed"
                id="confirmation-modal-warning-panel"
              >
                <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Crucial Warning:</span> This operation is irreversible. The targeted item will be deleted permanently from the database and Google Sheets.
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100" id="confirmation-modal-actions">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer transition-colors"
                id="confirmation-modal-cancel-btn"
              >
                {cancelText}
              </button>
              <button
                onClick={async () => {
                  await onConfirm();
                  onClose();
                }}
                className={`px-4 py-2 font-bold text-white rounded-xl cursor-pointer transition-colors ${
                  isDestructive
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-600/10'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/10'
                }`}
                id="confirmation-modal-confirm-btn"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
