import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

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
    try {
      const questions = await generateQuizFromText(document.text, numQuestions);

      const newQuiz = saveQuiz({
        documentId: document.id,
        documentName: document.name,
        questions,
        score: 0,
        totalQuestions: questions.length,
      });

      toast.success("Quiz generated successfully! 🎉");
      setIsGenerateModalOpen(false);
      setNumQuestions(5);
      fetchQuizzes();
    } catch (error) {
      toast.error(error.message || "Failed to generate quiz");
    } finally {
      setGenerating(false);
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
            <Button onClick={() => setIsGenerateModalOpen(true)} className="mt-4 bg-linear-to-r from-purple-500 to-pink-500 text-white">
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
        <Button onClick={() => setIsGenerateModalOpen(true)} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <Plus size={16} /> Generate Quiz
        </Button>
      </div>

      {renderQuizContent()}

      {/* Generate Quiz Modal */}
      {isGenerateModalOpen && (
        <Modal onClose={() => setIsGenerateModalOpen(false)} title="Generate Quiz">
          <form onSubmit={handleGenerateQuiz} className="space-y-4">
            <label className="block">
              <span className={colors.textSecondary}>Number of Questions:</span>
              <input
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                min={1}
                max={20}
                className={`w-full border ${colors.border} ${colors.bgSecondary} p-2 rounded-xl mt-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
            </label>
            <div className="flex gap-3">
              <Button type="button" onClick={() => setIsGenerateModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={generating} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {generating ? "Generating..." : "Generate"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Quiz Modal */}
      {isDeleteModalOpen && (
        <Modal onClose={() => setIsDeleteModalOpen(false)} title="Delete Quiz">
          <p className={colors.textSecondary}>Are you sure you want to delete this quiz?</p>
          <div className="flex justify-end gap-4 mt-4">
            <Button onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmDelete} disabled={deleting} className="bg-red-500 text-white hover:bg-red-600">
              <Trash2 size={16} /> {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default QuizManager;
