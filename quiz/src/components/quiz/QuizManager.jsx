import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Zap, Brain, Award, Sparkles, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../common/Spinner';
import Button from '../common/Button';
import Modal from '../common/Modal';
import QuizCard from './QuizCard';
import EmptyState from '../common/EmptyState';
import { getQuizzesByDocument, saveQuiz, getQuizzes } from '../../utils/localStorage';
import { generateQuizFromText } from '../../utils/geminiClient.js';
import { useTheme } from '../../context/ThemeContext';

const QuizManager = ({ document }) => {
  const { colors } = useTheme();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // Only 3 generation steps
  const generationSteps = [
    { text: "Analyzing document & generating questions..." },
    { text: "Creating answer options & explanations..." },
    { text: "Finalizing your quiz..." },
  ];

  const fetchQuizzes = () => {
    if (document?.id) {
      const docQuizzes = getQuizzesByDocument(document.id);
      setQuizzes(docQuizzes);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuizzes();
  }, [document]);

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setGenerationStep(0);
    
    try {
      setGenerationStep(1);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const questions = await generateQuizFromText(document.text, numQuestions, difficulty);
      
      setGenerationStep(2);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newQuiz = saveQuiz({
        documentId: document.id,
        documentName: document.name,
        questions,
        score: 0,
        totalQuestions: questions.length,
        difficulty: difficulty,
      });

      setGenerationStep(3);
      await new Promise(resolve => setTimeout(resolve, 400));
      
      toast.success(`Quiz generated successfully at ${difficulty} difficulty! 🎉`);
      setIsGenerateModalOpen(false);
      setNumQuestions(5);
      setDifficulty('medium');
      fetchQuizzes();
    } catch (error) {
      toast.error(error.message || "Failed to generate quiz");
    } finally {
      setGenerating(false);
      setGenerationStep(0);
    }
  };

  const handleDeleteRequest = (quiz) => {
    setSelectedQuiz(quiz);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedQuiz) return;
    setDeleting(true);
    try {
      const allQuizzes = getQuizzes().filter(q => q.id !== selectedQuiz.id);
      localStorage.setItem("studyhive_quizzes", JSON.stringify(allQuizzes));
      toast.success("Quiz deleted.");
      setIsDeleteModalOpen(false);
      setSelectedQuiz(null);
      fetchQuizzes();
    } catch (error) {
      toast.error("Failed to delete quiz.");
    } finally {
      setDeleting(false);
    }
  };

  const renderQuizContent = () => {
    if (loading) return <Spinner />;
    if (quizzes.length === 0) {
      return (
        <EmptyState
          title="No quizzes yet"
          description="Create your first quiz to test your understanding of the document content."
          action={
            <Button onClick={() => setIsGenerateModalOpen(true)} className="mt-4 bg-linear-to-r from-blue-600 to-indigo-700 text-white">
              <Plus size={18} /> Generate Quiz
            </Button>
          }
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} onDelete={handleDeleteRequest} />
        ))}
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-lg font-semibold ${colors.text}`}>Quizzes</h2>
        <Button onClick={() => setIsGenerateModalOpen(true)} className="bg-linear-to-r from-blue-600 to-indigo-700 text-white">
          <Plus size={16} /> Generate Quiz
        </Button>
      </div>

      {renderQuizContent()}

      {isGenerateModalOpen && (
        <Modal onClose={() => !generating && setIsGenerateModalOpen(false)} title="Generate Quiz">
          {generating ? (
            <div className="py-4 px-2 text-center">
              <div className="relative inline-flex mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center animate-pulse">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 rounded-full animate-bounce">
                  <Sparkles className="w-2.5 h-2.5 text-yellow-600 mx-auto mt-0.5" />
                </div>
              </div>
              <h3 className={`text-lg font-bold ${colors.text}`}>Generating Your Quiz</h3>
              <p className={`text-sm mt-1 ${colors.textMuted}`}>
                {numQuestions} {difficulty} questions
              </p>

              <div className="mt-4 space-y-2">
                {generationSteps.map((step, index) => {
                  const isActive = generationStep === index + 1;
                  const isCompleted = generationStep > index + 1;
                  
                  return (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-2 rounded-lg text-sm ${
                        isActive ? colors.bgSecondary : isCompleted ? colors.bgTertiary : colors.bgTertiary
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-emerald-500' : isActive ? 'bg-blue-500' : colors.bgSecondary
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                        ) : isActive ? (
                          <Spinner size="small" />
                        ) : (
                          <span className={`text-xs ${colors.textMuted}`}>{index + 1}</span>
                        )}
                      </div>
                      <span className={isActive || isCompleted ? colors.text : colors.textMuted}>
                        {step.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4">
                <div className={`h-1.5 rounded-full ${colors.bgTertiary} overflow-hidden`}>
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    style={{ width: `${(generationStep / 3) * 100}%` }}
                  />
                </div>
                <p className={`text-xs mt-1 ${colors.textMuted}`}>
                  {Math.round((generationStep / 3) * 100)}%
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleGenerateQuiz} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${colors.textSecondary}`}>
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDifficulty('easy')}
                    className={`flex flex-col items-center p-2 rounded-lg border ${
                      difficulty === 'easy'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : `${colors.border} ${colors.bgSecondary}`
                    }`}
                  >
                    <Zap className={`w-5 h-5 ${difficulty === 'easy' ? 'text-blue-600' : colors.textMuted}`} />
                    <span className={`text-xs mt-1 ${difficulty === 'easy' ? 'text-blue-700' : colors.text}`}>Easy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDifficulty('medium')}
                    className={`flex flex-col items-center p-2 rounded-lg border ${
                      difficulty === 'medium'
                        ? 'border-slate-600 bg-slate-50 dark:bg-slate-800/50'
                        : `${colors.border} ${colors.bgSecondary}`
                    }`}
                  >
                    <Brain className={`w-5 h-5 ${difficulty === 'medium' ? 'text-slate-700' : colors.textMuted}`} />
                    <span className={`text-xs mt-1 ${difficulty === 'medium' ? 'text-slate-800' : colors.text}`}>Medium</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDifficulty('hard')}
                    className={`flex flex-col items-center p-2 rounded-lg border ${
                      difficulty === 'hard'
                        ? 'border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                        : `${colors.border} ${colors.bgSecondary}`
                    }`}
                  >
                    <Award className={`w-5 h-5 ${difficulty === 'hard' ? 'text-gray-800' : colors.textMuted}`} />
                    <span className={`text-xs mt-1 ${difficulty === 'hard' ? 'text-gray-900' : colors.text}`}>Hard</span>
                  </button>
                </div>
              </div>

              <label className="block">
                <span className={colors.textSecondary}>Questions:</span>
                <input
                  type="number"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  min={1}
                  max={20}
                  className={`w-full border ${colors.border} ${colors.bgSecondary} p-2 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </label>
              
              <div className="flex gap-2">
                <Button type="button" onClick={() => setIsGenerateModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-linear-to-r from-blue-600 to-indigo-700 text-white">
                  Generate
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {isDeleteModalOpen && (
        <Modal onClose={() => setIsDeleteModalOpen(false)} title="Delete Quiz">
          <p className={colors.textSecondary}>Are you sure you want to delete this quiz?</p>
          <div className="flex justify-end gap-4 mt-4">
            <Button onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmDelete} disabled={deleting} className="bg-gray-700 hover:bg-gray-800 text-white">
              <Trash2 size={16} /> {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default QuizManager;
