import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Award, Moon, Sun, FileText, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import { getQuizzes } from '../utils/localStorage';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const QuizResultPage = () => {
  const { quizId } = useParams();
  const { isDark, toggleTheme, colors } = useTheme();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    const quizzes = getQuizzes();
    const foundQuiz = quizzes.find(q => String(q.id) === String(quizId));
    if (foundQuiz) {
      setQuiz(foundQuiz);
    } else {
      toast.error("Quiz results not found.");
    }
    setLoading(false);
  }, [quizId]);

  useEffect(() => {
    if (quiz?.score !== undefined) {
      const targetScore = Math.round((quiz.score / quiz.totalQuestions) * 100);
      const duration = 1500;
      const steps = 60;
      const increment = targetScore / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= targetScore) {
          setAnimatedScore(targetScore);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [quiz]);

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const expandAll = () => {
    const allExpanded = {};
    userAnswers.forEach((_, index) => {
      allExpanded[index] = true;
    });
    setExpandedQuestions(allExpanded);
  };

  const collapseAll = () => {
    setExpandedQuestions({});
  };

  const getScoreMessage = (score) => {
    if (score >= 80) return "Excellent! You've mastered this material!";
    if (score >= 60) return "Good job! Keep practicing!";
    return "Keep learning! You'll get better!";
  };

  const getBadge = (score) => {
    if (score >= 80) return { label: "Expert", color: "from-blue-600 to-indigo-700", icon: Trophy };
    if (score >= 60) return { label: "Intermediate", color: "from-gray-600 to-gray-700", icon: Award };
    return { label: "Beginner", color: "from-slate-600 to-slate-700", icon: Award };
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return { label: "Easy", color: "from-blue-500 to-blue-700" };
      case 'hard':
        return { label: "Hard", color: "from-gray-700 to-gray-900" };
      default:
        return { label: "Medium", color: "from-slate-500 to-slate-700" };
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${colors.bg} flex items-center justify-center`}>
        <Spinner />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className={`min-h-screen ${colors.bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${colors.bgTertiary}`}>
            <FileText className={`w-10 h-10 ${colors.textMuted}`} />
          </div>
          <p className={`${colors.textSecondary} text-lg`}>No results found.</p>
          <Link to="/documents" className="text-blue-600 hover:underline mt-4 inline-block font-medium">Go back to documents</Link>
        </div>
      </div>
    );
  }

  const scorePercent = Math.round((quiz.score / quiz.totalQuestions) * 100);
  const badge = getBadge(scorePercent);
  const BadgeIcon = badge.icon;
  const userAnswers = quiz.userAnswers || [];
  const difficultyBadge = getDifficultyBadge(quiz.difficulty || 'medium');

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-blue-500 via-indigo-500 to-blue-600';
    if (score >= 60) return 'from-gray-500 via-slate-500 to-gray-600';
    return 'from-slate-500 via-gray-500 to-slate-600';
  };

  return (
    <div className={`min-h-screen ${colors.bg} transition-colors duration-500`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 ${isDark ? 'bg-blue-500/10' : 'bg-blue-300/30'} rounded-full blur-3xl animate-pulse`} style={{ animationDuration: '4s' }} />
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-300/30'} rounded-full blur-3xl animate-pulse`} style={{ animationDuration: '6s' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to={quiz.documentId ? `/documents/${quiz.documentId}` : '/documents'}
            className={`inline-flex items-center gap-2 text-sm ${colors.textSecondary} hover:text-blue-600 transition-all duration-200 font-medium`}
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            Back to Document
          </Link>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <PageHeader title={`${quiz.documentName || 'Quiz'} Results`} />
          <Button onClick={toggleTheme} className="rounded-full p-3">
            {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-600" />}
          </Button>
        </div>

        {/* Score Card */}
        <div className={`relative overflow-hidden ${colors.bgSecondary} backdrop-blur-xl rounded-3xl shadow-2xl border mb-8`}>
          <div className="relative p-8 md:p-12">
            <div className="text-center space-y-8">
              {/* Trophy Icon */}
              <div className="relative inline-flex">
                <div className={`absolute inset-0 bg-linear-to-r ${getScoreColor(scorePercent)} opacity-30 blur-2xl rounded-full`} />
                <div className={`relative w-24 h-24 rounded-2xl bg-linear-to-br ${getScoreColor(scorePercent)} flex items-center justify-center shadow-2xl`}>
                  <Trophy className="w-12 h-12 text-white" strokeWidth={2} />
                </div>
              </div>

              {/* Score Display */}
              <div>
                <p className={`text-sm font-bold uppercase tracking-widest mb-3 ${colors.textMuted}`}>Your Score</p>
                <span className={`text-7xl md:text-8xl font-black bg-linear-to-r ${getScoreColor(scorePercent)} bg-clip-text text-transparent`}>
                  {animatedScore}%
                </span>
                <p className={`text-xl font-semibold ${colors.text} mt-3`}>
                  {getScoreMessage(scorePercent)}
                </p>
              </div>

              {/* Score Details */}
              <div className={`inline-flex items-center gap-4 px-6 py-3 rounded-2xl ${colors.bgTertiary}`}>
                <span className={`text-lg ${colors.textSecondary}`}>
                  {quiz.score} / {quiz.totalQuestions} correct
                </span>
              </div>

              {/* Badges Row */}
              <div className="flex justify-center gap-3 flex-wrap">
                {/* Difficulty Badge */}
                <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-semibold text-sm shadow-lg bg-linear-to-r ${difficultyBadge.color}`}>
                  {difficultyBadge.label} Level
                </div>
                {/* Score Badge */}
                <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-semibold text-sm shadow-lg bg-linear-to-r ${badge.color}`}>
                  <BadgeIcon className="w-4 h-4" />
                  {badge.label}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 pt-4">
                <Link
                  to={quiz.documentId ? `/documents/${quiz.documentId}` : '/documents'}
                  className="px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-medium hover:scale-105 transition-transform shadow-lg"
                >
                  Back to Document
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Question History */}
        {userAnswers.length > 0 && (
          <div className={`${colors.bgSecondary} border ${colors.border} rounded-2xl p-6`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-bold ${colors.text}`}>Question Review</h2>
              <div className="flex gap-2">
                <Button 
                  onClick={expandAll} 
                  className="text-sm px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium"
                >
                  Expand All
                </Button>
                <Button 
                  onClick={collapseAll} 
                  className="text-sm px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
                >
                  Collapse All
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              {userAnswers.map((answer, index) => (
                <div 
                  key={index} 
                  className={`${colors.bgTertiary} rounded-xl overflow-hidden border ${colors.border}`}
                >
                  <button
                    onClick={() => toggleQuestion(index)}
                    className={`w-full flex items-center justify-between p-4 text-left hover:bg-opacity-50 transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      {answer.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-700 dark:text-gray-300 shrink-0" />
                      )}
                      <span className={`font-medium ${colors.text}`}>
                        Question {index + 1}: {answer.question.slice(0, 60)}...
                      </span>
                    </div>
                    {expandedQuestions[index] ? (
                      <ChevronUp className={`w-5 h-5 ${colors.textMuted}`} />
                    ) : (
                      <ChevronDown className={`w-5 h-5 ${colors.textMuted}`} />
                    )}
                  </button>
                  
                  {expandedQuestions[index] && (
                    <div className={`px-4 pb-4 pt-0 border-t ${colors.border}`}>
                      <div className="pt-4 space-y-4">
                        {/* Question */}
                        <div>
                          <p className={`text-sm font-medium ${colors.textMuted} mb-2`}>Question:</p>
                          <p className={`${colors.text} font-medium`}>{answer.question}</p>
                        </div>

                        {/* Options with highlighting - Black/Blue/White theme */}
                        <div>
                          <p className={`text-sm font-medium ${colors.textMuted} mb-2`}>Options:</p>
                          <div className="space-y-2">
                            {answer.options && answer.options.map((option, optIndex) => {
                              // Determine if this option is the correct answer
                              const isCorrectOption = option === answer.correctAnswer || 
                                (answer.correctAnswerLetter && answer.correctAnswerLetter.charAt(0) === String.fromCharCode(65 + optIndex));
                              
                              // Determine if this is the user's selected answer
                              const isSelectedOption = option === answer.selectedAnswer;
                              
                              // Calculate the letter for this option
                              const optionLetter = String.fromCharCode(65 + optIndex);
                              
                              let optionClass = "p-3 rounded-lg border ";
                              if (isCorrectOption) {
                                optionClass += "bg-blue-50 dark:bg-blue-900/30 border-blue-600";
                              } else if (isSelectedOption && !answer.isCorrect) {
                                optionClass += "bg-gray-100 dark:bg-gray-800 border-gray-600";
                              } else {
                                optionClass += `${colors.bgSecondary} ${colors.border}`;
                              }
                              
                              return (
                                <div 
                                  key={optIndex} 
                                  className={optionClass}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                      isCorrectOption 
                                        ? "bg-blue-600 text-white" 
                                        : isSelectedOption 
                                          ? "bg-gray-700 text-white" 
                                          : `${colors.bgTertiary} ${colors.textMuted}`
                                    }`}>
                                      {optionLetter}
                                    </span>
                                    <span className={`${
                                      isCorrectOption 
                                        ? "text-blue-800 dark:text-blue-300 font-medium" 
                                        : isSelectedOption 
                                          ? "text-gray-800 dark:text-gray-200 font-medium" 
                                          : colors.text
                                    }`}>
                                      {option}
                                    </span>
                                    {isCorrectOption && (
                                      <CheckCircle className="w-4 h-4 text-blue-600 ml-auto shrink-0" />
                                    )}
                                    {isSelectedOption && !answer.isCorrect && (
                                      <XCircle className="w-4 h-4 text-gray-700 dark:text-gray-300 ml-auto shrink-0" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* Your Answer */}
                        <div>
                          <p className={`text-sm font-medium ${colors.textMuted} mb-2`}>Your Answer:</p>
                          <p className={`${
                            answer.isCorrect 
                              ? 'text-blue-700 dark:text-blue-400 font-semibold' 
                              : 'text-gray-800 dark:text-gray-200 font-medium'
                          }`}>
                            {answer.selectedAnswer || "No answer selected"}
                          </p>
                        </div>
                        
                        {!answer.isCorrect && (
                          <div>
                            <p className={`text-sm font-medium ${colors.textMuted} mb-2`}>Correct Answer:</p>
                            <p className="text-blue-700 dark:text-blue-400 font-semibold">{answer.correctAnswer}</p>
                          </div>
                        )}
                        
                        {/* Explanation */}
                        <div>
                          <p className={`text-sm font-medium ${colors.textMuted} mb-2`}>Explanation:</p>
                          <p className={`${colors.textSecondary} text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg`}>
                            {answer.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResultPage;
