import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Moon, Sun } from "lucide-react";
import { saveDocument } from "../utils/localStorage";
import { extractTextFromPdf } from "../utils/pdfParser";
import Button from "../components/common/Button";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

const DocumentUploadPage = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme, colors } = useTheme();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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
    if (!file) {
      toast.error("Please select a PDF");
      return;
    }
    setUploading(true);
    try {
      // Convert file to base64 for PDF viewing
      const pdfData = await fileToBase64(file);
      const text = await extractTextFromPdf(file);
      const newDoc = saveDocument({
        name: file.name,
        size: file.size,
        text,
        pdfData
      });
      toast.success(`Document "${newDoc.name}" saved!`);
      navigate(`/documents/${newDoc.id}`);
    } catch (err) {
      toast.error("Failed to parse PDF");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`min-h-screen ${colors.bg} transition-colors duration-500`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 ${isDark ? 'bg-purple-500/10' : 'bg-purple-300/30'} rounded-full blur-3xl animate-pulse`} style={{ animationDuration: '4s' }} />
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 ${isDark ? 'bg-pink-500/10' : 'bg-pink-300/30'} rounded-full blur-3xl animate-pulse`} style={{ animationDuration: '6s' }} />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-2xl font-bold ${colors.text}`}>Upload Document</h1>
          <Button onClick={toggleTheme} className="rounded-full p-3">
            {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-purple-600" />}
          </Button>
        </div>

        {/* Upload Form */}
        <div className={`${colors.bgSecondary} border ${colors.border} rounded-2xl p-8 shadow-xl`}>
          <form onSubmit={handleUpload} className="space-y-6">
            {/* File Input */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.textSecondary}`}>PDF File</label>
              <div className={`border-2 border-dashed ${colors.border} rounded-xl p-8 text-center hover:border-purple-500 transition-colors`}>
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-full ${colors.bgTertiary} flex items-center justify-center mb-4`}>
                      <FileText size={32} className={colors.textMuted} />
                    </div>
                    <p className={`${colors.textSecondary} mb-2`}>
                      {file ? file.name : "Click to select a PDF file"}
                    </p>
                    {file && (
                      <p className={`text-sm ${colors.textMuted}`}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Upload Button */}
            <Button 
              type="submit" 
              disabled={uploading || !file}
              className="w-full bg-linear-to-r from-purple-500 to-pink-500 text-white py-3"
            >
              {uploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload size={18} /> Upload Document
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadPage;
