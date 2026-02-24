import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, FileText, ClipboardList, Moon, Sun } from 'lucide-react';
import QuizManager from '../components/quiz/QuizManager';
import Button from '../components/common/Button';
import { getDocuments } from '../utils/localStorage';
import { useTheme } from '../context/ThemeContext';
import Spinner from '../components/common/Spinner';

const DocumentDetailsPage = () => {
  const { id } = useParams();
  const { isDark, toggleTheme, colors } = useTheme();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    const docs = getDocuments();
    const doc = docs.find(d => String(d.id) === String(id));
    if (doc) {
      setDocument(doc);
    } else {
      toast.error("Document not found in local storage");
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className={`min-h-screen ${colors.bg} flex items-center justify-center`}>
        <Spinner />
      </div>
    );
  }

  if (!document) {
    return (
      <div className={`min-h-screen ${colors.bg} flex items-center justify-center`}>
        <div className={`text-center ${colors.text}`}>Document not found.</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${colors.bg} transition-colors duration-500`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className={`absolute top-0 left-1/4 w-96 h-96 ${isDark ? 'bg-purple-500/10' : 'bg-purple-300/30'} rounded-full blur-3xl animate-pulse`} 
          style={{ animationDuration: '4s' }} 
        />
        <div 
          className={`absolute bottom-0 right-1/4 w-96 h-96 ${isDark ? 'bg-pink-500/10' : 'bg-pink-300/30'} rounded-full blur-3xl animate-pulse`} 
          style={{ animationDuration: '6s' }} 
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Link to="/documents" className={`inline-flex items-center gap-2 text-sm ${colors.textSecondary} hover:text-purple-500 transition-colors`}>
            <ArrowLeft size={16} /> Back to Documents
          </Link>
        </div>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${colors.text} mb-2`}>{document.name}</h1>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${colors.bgSecondary} border ${colors.border}`}>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className={`text-sm font-medium ${colors.text}`}>Ready</span>
              </div>
              <span className={`text-sm ${colors.textMuted}`}>
                {document.quizzes || 0} Quizzes
              </span>
            </div>
          </div>
          <Button onClick={toggleTheme} className="rounded-full p-3">
            {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-purple-600" />}
          </Button>
        </div>

        <div className={`${colors.bgSecondary} border ${colors.border} rounded-2xl overflow-hidden`}>
          <div className={`flex overflow-x-auto border-b ${colors.border}`}>
            <button
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                activeTab === 'content'
                  ? `${colors.text} border-purple-500 ${colors.bgTertiary}`
                  : `${colors.textSecondary} border-transparent hover:${colors.text}`
              }`}
            >
              <FileText size={18} />
              PDF Viewer
            </button>
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                activeTab === 'quizzes'
                  ? `${colors.text} border-purple-500 ${colors.bgTertiary}`
                  : `${colors.textSecondary} border-transparent hover:${colors.text}`
              }`}
            >
              <ClipboardList size={18} />
              Quizzes
            </button>
          </div>
          
          <div className="p-6">
            {activeTab === 'content' ? (
              document.pdfData ? (
                <div className="h-[75vh] border rounded-lg overflow-hidden">
                  <iframe 
                    src={document.pdfData} 
                    className="w-full h-full" 
                    title="PDF Viewer"
                  />
                </div>
              ) : (
                <div className={`text-center py-12 ${colors.text}`}>
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No PDF available.</p>
                  <p className={`text-sm mt-2 ${colors.textMuted}`}>
                    Please upload a PDF document to view it here.
                  </p>
                </div>
              )
            ) : (
              <QuizManager document={document} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailsPage;
