import React from 'react';
import { FileText } from 'lucide-react';

/**
 * EmptyState Component
 * Displays a placeholder when there's no content
 */
const EmptyState = ({ title, description, action, buttonText, onActionClick }) => {
  const handleAction = action || (onActionClick ? (
    <button 
      onClick={onActionClick}
      className="group relative inline-flex items-center gap-2 px-6 h-11 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/25 active:scale-95 focus:outline-none"
    >
      {buttonText || 'Add'}
    </button>
  ) : null);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-linear-to-br from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-gray-100 to-gray-200/50 dark:from-gray-700 dark:to-gray-600/50 mb-5 rounded-2xl">
        <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" strokeWidth={2} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-sm leading-relaxed">{description}</p>
      {handleAction}
    </div>
  );
};

export default EmptyState;
