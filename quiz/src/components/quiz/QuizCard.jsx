import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Trash2, Clock, Zap, Brain, Award } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * QuizCard Component
 * Displays a single quiz with its details and actions
 */
const QuizCard = ({ quiz, onDelete }) => {
  const { isDark, colors } = useTheme();
  
  // Get difficulty info - Black/Blue/White theme
  const getDifficultyInfo = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return { 
          label: 'Easy', 
          color: 'from-blue-500 to-blue-700',
          icon: Zap,
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          textColor: 'text-blue-700 dark:text-blue-400'
        };
      case 'hard':
        return { 
          label: 'Hard', 
          color: 'from-gray-700 to-gray-900',
          icon: Award,
          bgColor: 'bg-gray-200 dark:bg-gray-700/30',
          textColor: 'text-gray-800 dark:text-gray-300'
        };
      default:
        return { 
          label: 'Medium', 
          color: 'from-slate-500 to-slate-700',
          icon: Brain,
          bgColor: 'bg-slate-200 dark:bg-slate-700/30',
          textColor: 'text-slate-700 dark:text-slate-300'
        };
    }
  };

  const difficultyInfo = getDifficultyInfo(quiz.difficulty || 'medium');
  const DifficultyIcon = difficultyInfo.icon;
  
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

  // Determine score color based on percentage - Black/Blue theme
  const getScoreColor = (percentage) => {
    if (percentage === null) return colors.textMuted;
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 60) return 'text-slate-600';
    return 'text-gray-700';
  };

  return (
    <div className={`${colors.bgSecondary} border ${colors.border} rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group`}>
      {/* Quiz Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-linear-to-br from-blue-600 to-indigo-800`}>
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`font-semibold ${colors.text} truncate max-w-37.5 group-hover:text-blue-600 transition-colors`}>
              {quiz.documentName || 'Quiz'}
            </h3>
            <p className={`text-sm ${colors.textMuted}`}>{quiz.totalQuestions} Questions</p>
          </div>
        </div>
      </div>

      {/* Difficulty Badge - Black/Blue/White */}
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${difficultyInfo.bgColor} ${difficultyInfo.textColor}`}>
        <DifficultyIcon className="w-3 h-3" />
        {difficultyInfo.label}
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

      {/* Score Display (if completed) - Black/Blue theme */}
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
                  ? 'bg-blue-600'
                  : scorePercentage >= 60
                  ? 'bg-slate-600'
                  : 'bg-gray-700'
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
            className="flex-1 bg-linear-to-r from-blue-600 to-indigo-700 text-white text-center py-2.5 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 text-sm font-medium hover:scale-[1.02]"
          >
            View Results
          </Link>
        ) : (
          <Link
            to={`/pages/${quiz.id}`}
            className="flex-1 bg-linear-to-r from-blue-600 to-indigo-700 text-white text-center py-2.5 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 text-sm font-medium hover:scale-[1.02]"
          >
            Take Quiz
          </Link>
        )}
        <button
          onClick={() => onDelete(quiz)}
          className={`p-2.5 rounded-xl transition-colors duration-200 ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
          title="Delete Quiz"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default QuizCard;
