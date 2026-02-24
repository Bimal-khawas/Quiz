import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Trash2, X, Moon, Sun, FileText } from 'lucide-react';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import { useTheme } from '../context/ThemeContext';
import { getDocuments, saveDocument, deleteDocument } from '../utils/localStorage';
import { extractTextFromPdf } from '../utils/pdfParser';
import toast from 'react-hot-toast';

const DocumentListPage = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme, colors } = useTheme();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocuments = () => {
    const docs = getDocuments();
    setDocuments(docs);
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) {
      toast.error('Please provide a title and select a file.');
      return;
    }
    setUploading(true);
    try {
      // Parse PDF into text
      const text = await extractTextFromPdf(uploadFile);
      
      // Convert file to base64 for PDF viewing
      const pdfData = await fileToBase64(uploadFile);

      // Save to localStorage
      const newDoc = saveDocument({
        name: uploadTitle,
        size: uploadFile.size,
        text,
        pdfData
      });

      toast.success(`Document "${newDoc.name}" uploaded successfully`);
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to upload document');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRequest = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;
    setDeleting(true);
    try {
      deleteDocument(selectedDoc.id);
      toast.success('Document deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${colors.bg} flex items-center justify-center`}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${colors.bg} transition-colors duration-500`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 ${isDark ? 'bg-purple-500/10' : 'bg-purple-300/30'} rounded-full blur-3xl animate-pulse`} style={{ animationDuration: '4s' }} />
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 ${isDark ? 'bg-pink-500/10' : 'bg-pink-300/30'} rounded-full blur-3xl animate-pulse`} style={{ animationDuration: '6s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${colors.text}`}>My Documents</h1>
          <div className="flex items-center gap-3">
            <Button onClick={toggleTheme} className="rounded-full p-3">
              {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-purple-600" />}
            </Button>
            <Button onClick={() => setIsUploadModalOpen(true)} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Plus size={18} /> Upload Document
            </Button>
          </div>
        </div>

        {/* Documents Grid or Empty State */}
        {documents.length === 0 ? (
          <EmptyState
            title="No documents yet"
            description="Upload your first PDF document to get started. You can then generate quizzes to test your understanding."
            action={
              <Button onClick={() => setIsUploadModalOpen(true)} className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <Upload size={18} /> Upload Document
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div 
                key={doc.id}
                className={`${colors.bgSecondary} border ${colors.border} rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group cursor-pointer`}
                onClick={() => navigate(`/documents/${doc.id}`)}
              >
                {/* Document Card Content */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${isDark ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-cyan-500'}`}>
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${colors.text} truncate max-w-[180px] group-hover:text-purple-500 transition-colors`}>
                        {doc.name}
                      </h3>
                      <p className={`text-sm ${colors.textMuted}`}>{formatFileSize(doc.size)}</p>
                    </div>
                  </div>
                </div>

                {/* Document Meta Info */}
                <div className={`flex items-center gap-4 mb-4 text-sm ${colors.textMuted}`}>
                  <div className="flex items-center gap-1">
                    <span>{doc.quizzes || 0} Quizzes</span>
                  </div>
                  <div>
                    <span>{formatDate(doc.createdAt)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleDeleteRequest(doc)}
                    className={`p-2.5 rounded-xl transition-colors duration-200 ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${colors.bgSecondary} p-6 rounded-2xl w-full max-w-md shadow-2xl`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-semibold ${colors.text}`}>Upload Document</h2>
                <button onClick={() => setIsUploadModalOpen(false)} className={colors.textMuted}>
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.textSecondary}`}>Document Title</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Enter document title"
                    className={`w-full border ${colors.border} ${colors.bgSecondary} p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.textSecondary}`}>PDF File</label>
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    onChange={handleFileChange}
                    className={`w-full border ${colors.border} ${colors.bgSecondary} p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                </div>
                <Button type="submit" disabled={uploading} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3">
                  {uploading ? 'Uploading...' : <>Upload <Upload size={18} /></>}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${colors.bgSecondary} p-6 rounded-2xl w-full max-w-md shadow-2xl`}>
              <h2 className={`text-xl font-semibold mb-4 ${colors.text}`}>Delete Document</h2>
              <p className={colors.textSecondary}>Are you sure you want to delete "{selectedDoc?.name}"? This action cannot be undone.</p>
              <div className="flex justify-end gap-4 mt-6">
                <Button onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                <Button onClick={handleConfirmDelete} disabled={deleting} className="bg-red-500 text-white hover:bg-red-600">
                  <Trash2 size={18} /> {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default DocumentListPage;
