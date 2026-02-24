import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ClipboardList, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import { useTheme } from '../../context/ThemeContext';

/**
 * DocumentCard Component
 * Displays a single document with its details and actions
 */
const DocumentCard = ({ document, onDelete }) => {
  const { isDark, colors } = useTheme();
  
  // Format the file size to a readable string
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format the date to a readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`${colors.bgSecondary} border ${colors.border} rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group`}>
      {/* Document Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${isDark ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-cyan-500'}`}>
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`font-semibold ${colors.text} truncate max-w-[180px] group-hover:text-purple-500 transition-colors`}>
              {document.name}
            </h3>
            <p className={`text-sm ${colors.textMuted}`}>{formatFileSize(document.size)}</p>
          </div>
        </div>
      </div>

      {/* Document Meta Info */}
      <div className={`flex items-center gap-4 mb-4 text-sm ${colors.textMuted}`}>
        <div className="flex items-center gap-1">
          <ClipboardList className="w-4 h-4" />
          <span>{document.quizzes || 0} Quizzes</span>
        </div>
        <div>
          <span>{formatDate(document.createdAt)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Link
          to={`/documents/${document.id}`}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2.5 px-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium hover:scale-[1.02]"
        >
          View Document
        </Link>
        <button
          onClick={onDelete}
          className={`p-2.5 rounded-xl transition-colors duration-200 ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
          title="Delete Document"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;
