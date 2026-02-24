import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Trash2, Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * QuizCard Component
 * Displays a single quiz with its details and actions
 */
const QuizCard = ({ quiz, onDelete }) => {
  const { isDark, colors } = useTheme();
  
  // Format the date to a readable string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate score percentage if quiz is completed
  const getScorePercentage = () => {
    if (quiz.score === undefined || quiz.score === null) return null;
    return Math.round((quiz.score / quiz.totalQuestions) * 100);
  };

  const scorePercentage = getScorePercentage();

  // Determine score color based on percentage
  const getScoreColor = (percentage) => {
    if (percentage === null) return colors.textMuted;
    if (percentage >= 80) return 'text-emerald-500';
    if (percentage >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className={`${colors.bgSecondary} border ${colors.border} rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group`}>
      {/* Quiz Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${isDark ? 'from-pink-500 to-rose-500' : 'from-purple-500 to-pink-500'}`}>
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`font-semibold ${colors.text} truncate max-w-[150px] group-hover:text-purple-500 transition-colors`}>
              {quiz.documentName || 'Quiz'}
            </h3>
            <p className={`text-sm ${colors.textMuted}`}>{quiz.totalQuestions} Questions</p>
          </div>
        </div>
      </div>

      {/* Quiz Meta Info */}
      <div className={`flex items-center gap-4 mb-4 text-sm ${colors.textMuted}`}>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{formatDate(quiz.completedAt)}</span>
        </div>
        {scorePercentage !== null && (
          <div className={`font-semibold ${getScoreColor(scorePercentage)}`}>
            {scorePercentage}%
          </div>
        )}
      </div>

      {/* Score Display (if completed) */}
      {scorePercentage !== null && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className={colors.textMuted}>Score</span>
            <span className={`font-medium ${getScoreColor(scorePercentage)}`}>
              {quiz.score}/{quiz.totalQuestions}
            </span>
          </div>
          <div className={`w-full ${colors.bgTertiary} rounded-full h-2`}>
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                scorePercentage >= 80
                  ? 'bg-emerald-500'
                  : scorePercentage >= 60
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {quiz.completed ? (
          <Link
            to={`/pages/${quiz.id}/results`}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2.5 px-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium hover:scale-[1.02]"
          >
            View Results
          </Link>
        ) : (
          <Link
            to={`/pages/${quiz.id}`}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2.5 px-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium hover:scale-[1.02]"
          >
            Take Quiz
          </Link>
        )}
        <button
          onClick={() => onDelete(quiz)}
          className={`p-2.5 rounded-xl transition-colors duration-200 ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
          title="Delete Quiz"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default QuizCard;
