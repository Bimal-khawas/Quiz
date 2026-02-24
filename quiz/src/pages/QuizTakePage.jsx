import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, Moon, Sun } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import Spinner from "../components/common/Spinner";
import Button from "../components/common/Button";
import { getQuizzes } from "../utils/localStorage";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

const QuizTakePage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { isDark, toggleTheme, colors } = useTheme();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const quizzes = getQuizzes();
    const foundQuiz = quizzes.find(q => String(q.id) === String(quizId));
    if (foundQuiz) {
      setQuiz(foundQuiz);
      // Initialize time
      setTimeLeft(foundQuiz.questions.length * 60);
    } else {
      toast.error("Quiz not found.");
    }
    setLoading(false);
  }, [quizId]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && quiz) {
      handleSubmitQuiz();
    }
  }, [timeLeft, quiz]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionChange = (questionIndex, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      let score = 0;
      const userAnswers = [];

      quiz.questions.forEach((q, idx) => {
        const selectedIndex = selectedAnswers[idx];
        const selectedOption = selectedIndex !== undefined && q.options[selectedIndex] ? q.options[selectedIndex] : null;
        
        let isCorrect = false;
        if (selectedOption) {
          // Check if the selected option contains the correct answer
          if (q.correctAnswer && selectedOption.includes(q.correctAnswer.replace('Answer:', '').trim())) {
            score++;
            isCorrect = true;
          } else if (q.answer && selectedOption.includes(q.answer.trim())) {
            score++;
            isCorrect = true;
          }
        }

        userAnswers.push({
          question: q.question,
          options: q.options,
          selectedAnswer: selectedOption,
          correctAnswer: q.answer,
          correctAnswerLetter: q.correctAnswer,
          isCorrect: isCorrect,
          explanation: q.explanation || "The correct answer is based on the content of the document."
        });
      });

      // Save the quiz result with user answers for history
      const quizzes = getQuizzes();
      const quizIndex = quizzes.findIndex(q => String(q.id) === String(quizId));
      if (quizIndex !== -1) {
        quizzes[quizIndex].score = score;
        quizzes[quizIndex].completed = true;
        quizzes[quizIndex].completedAt = new Date().toISOString();
        quizzes[quizIndex].userAnswers = userAnswers; // Store user answers for history
        localStorage.setItem('studyhive_quizzes', JSON.stringify(quizzes));
      }

      toast.success("Quiz submitted successfully!");
      navigate(`/pages/${quizId}/results`);
    } catch (error) {
      toast.error("Failed to submit quiz");
    } finally {
      setSubmitting(false);
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
        <div className={`text-center ${colors.text}`}>
          <p className="text-xl mb-4">Quiz not found</p>
          <Link to="/documents" className="text-purple-500 hover:underline">Go back to documents</Link>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className={`min-h-screen ${colors.bg} transition-colors duration-500`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 ${isDark ? 'bg-purple-500/10' : 'bg-purple-300/30'} rounded-full blur-3xl animate-pulse`} style={{ animationDuration: '4s' }} />
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 ${isDark ? 'bg-pink-500/10' : 'bg-pink-300/30'} rounded-full blur-3xl animate-pulse`} style={{ animationDuration: '6s' }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link to={`/documents/${quiz.documentId}`} className={`inline-flex items-center gap-2 text-sm ${colors.textSecondary} hover:text-purple-500 transition-colors`}>
              <ChevronLeft size={16} /> Back to Document
            </Link>
            <h1 className={`text-2xl font-bold ${colors.text} mt-2`}>{quiz.documentName || 'Quiz'}</h1>
          </div>
          <Button onClick={toggleTheme} className="rounded-full p-3">
            {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-purple-600" />}
          </Button>
        </div>

        {/* Progress & Timer */}
        <div className={`${colors.bgSecondary} border ${colors.border} rounded-2xl p-4 mb-6`}>
          <div className="flex justify-between items-center mb-3">
            <span className={`text-sm font-medium ${colors.text}`}>
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${timeLeft < 60 ? 'bg-red-100 text-red-600' : colors.bgTertiary}`}>
              <Clock className={`w-4 h-4 ${timeLeft < 60 ? 'text-red-500' : colors.textMuted}`} strokeWidth={2} />
              <span className={`text-sm font-bold ${timeLeft < 60 ? 'text-red-500' : colors.text}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className={`relative h-3 ${colors.bgTertiary} rounded-full overflow-hidden`}>
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600">{Math.round(progress)}% Complete</span>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className={`${colors.bgSecondary} border ${colors.border} rounded-2xl p-6 shadow-xl mb-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${colors.text}`}>{currentQuestion.question}</h3>
          <ul className="space-y-3">
            {currentQuestion.options && currentQuestion.options.map((opt, idx) => (
              <li key={idx}>
                <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all ${selectedAnswers[currentQuestionIndex] === idx ? `${colors.bgTertiary} border-purple-500` : `${colors.bgTertiary}/50 border-transparent hover:border-purple-300`} border`}>
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    checked={selectedAnswers[currentQuestionIndex] === idx}
                    onChange={() => handleOptionChange(currentQuestionIndex, idx)}
                    className="w-4 h-4 text-purple-500"
                  />
                  <span className={colors.text}>{opt}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            onClick={handlePreviousQuestion} 
            disabled={currentQuestionIndex === 0}
            className={currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}
          >
            <ChevronLeft size={18} /> Previous
          </Button>
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <Button onClick={handleNextQuestion}>
              Next <ChevronRight size={18} />
            </Button>
          ) : (
            <Button onClick={handleSubmitQuiz} disabled={submitting} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CheckCircle2 size={18} /> {submitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTakePage;
