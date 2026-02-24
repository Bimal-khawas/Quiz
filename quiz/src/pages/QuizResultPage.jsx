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

  const getScoreMessage = (score) => {
    if (score >= 80) return "Excellent! You've mastered this material!";
    if (score >= 60) return "Good job! Keep practicing!";
    return "Keep learning! You'll get better!";
  };

  const getBadge = (score) => {
    if (score >= 80) return { label: "Expert", color: "from-emerald-500 to-teal-500", icon: Trophy };
    if (score >= 60) return { label: "Intermediate", color: "from-amber-500 to-orange-500", icon: Award };
    return { label: "Beginner", color: "from-rose-500 to-red-500", icon: Award };
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
          <Link to="/documents" className="text-purple-500 hover:underline mt-4 inline-block">Go back to documents</Link>
        </div>
      </div>
    );
  }

  const scorePercent = Math.round((quiz.score / quiz.totalQuestions) * 100);
  const badge = getBadge(scorePercent);
  const BadgeIcon = badge.icon;
  const userAnswers = quiz.userAnswers || [];

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-emerald-400 via-teal-400 to-cyan-400';
    if (score >= 60) return 'from-amber-400 via-orange-400 to-red-400';
    return 'from-rose-400 via-red-400 to-pink-400';
  };

  return (
    <div className={`min-h-screen ${colors.bg} transition-colors duration-500`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 ${isDark ? 'bg-purple-500/10' : 'bg-purple-300/30'} rounded-full blur-3xl animate-pulse`} style={{ animationDuration: '4s' }} />
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 ${isDark ? 'bg-pink-500/10' : 'bg-pink-300/30'} rounded-full blur-3xl animate-pulse`} style={{ animationDuration: '6s' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to={`/documents/${quiz.documentId}`}
            className={`inline-flex items-center gap-2 text-sm ${colors.textSecondary} hover:text-purple-500 transition-all duration-200`}
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            Back to Document
          </Link>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <PageHeader title={`${quiz.documentName || 'Quiz'} Results`} />
          <Button onClick={toggleTheme} className="rounded-full p-3">
            {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-purple-600" />}
          </Button>
        </div>

        {/* Score Card */}
        <div className={`relative overflow-hidden ${colors.bgSecondary} backdrop-blur-xl rounded-3xl shadow-2xl border mb-8`}>
          <div className="relative p-8 md:p-12">
            <div className="text-center space-y-8">
              {/* Trophy Icon */}
              <div className="relative inline-flex">
                <div className={`absolute inset-0 bg-gradient-to-r ${getScoreColor(scorePercent)} opacity-30 blur-2xl rounded-full`} />
                <div className={`relative w-24 h-24 rounded-2xl bg-gradient-to-br ${getScoreColor(scorePercent)} flex items-center justify-center shadow-2xl`}>
                  <Trophy className="w-12 h-12 text-white" strokeWidth={2} />
                </div>
              </div>

              {/* Score Display */}
              <div>
                <p className={`text-sm font-bold uppercase tracking-widest mb-3 ${colors.textMuted}`}>Your Score</p>
                <span className={`text-7xl md:text-8xl font-black bg-gradient-to-r ${getScoreColor(scorePercent)} bg-clip-text text-transparent`}>
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

              {/* Badge */}
              <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-semibold text-sm shadow-lg bg-gradient-to-r ${badge.color}`}>
                <BadgeIcon className="w-4 h-4" />
                {badge.label}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 pt-4">
                <Link
                  to={`/documents/${quiz.documentId}`}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:scale-105 transition-transform"
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
            <h2 className={`text-xl font-bold ${colors.text} mb-6`}>Question Review</h2>
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
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
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
                      <div className="pt-4 space-y-3">
                        <div>
                          <p className={`text-sm font-medium ${colors.textMuted} mb-2`}>Your Answer:</p>
                          <p className={`${answer.isCorrect ? 'text-emerald-600' : 'text-red-600'} font-medium`}>
                            {answer.selectedAnswer || "No answer selected"}
                          </p>
                        </div>
                        
                        {!answer.isCorrect && (
                          <div>
                            <p className={`text-sm font-medium ${colors.textMuted} mb-2`}>Correct Answer:</p>
                            <p className="text-emerald-600 font-medium">{answer.correctAnswer}</p>
                          </div>
                        )}
                        
                        <div>
                          <p className={`text-sm font-medium ${colors.textMuted} mb-2`}>Explanation:</p>
                          <p className={`${colors.textSecondary} text-sm`}>
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
