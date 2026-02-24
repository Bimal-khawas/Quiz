import React from "react";
import { X } from "lucide-react";

/**
 * Modal Component
 * A reusable modal dialog with overlay
 */
const Modal = ({ onClose, title, children, isOpen }) => {
  if (isOpen === false) return null;

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal container */}
        <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl transform transition-all animate-scaleIn">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" strokeWidth={2} />
          </button>

          {/* Title */}
          <div className="mb-6 pr-8 p-6 pb-0">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>

          {/* Content */}
          <div className="p-6 pt-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
