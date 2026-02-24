// localStorage utility for StudyHive

const STORAGE_KEYS = {
  DOCUMENTS: 'studyhive_documents',
  QUIZZES: 'studyhive_quizzes',
};

// Get all documents from localStorage
export function getDocuments() {
  const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
  return data ? JSON.parse(data) : [];
}

// Save a document to localStorage
export function saveDocument(document) {
  const documents = getDocuments();
  const newDocument = {
    id: Date.now(),
    name: document.name,
    size: document.size,
    text: document.text,
    pdfData: document.pdfData || null, // Base64 encoded PDF for viewing
    quizzes: 0,
    createdAt: new Date().toISOString(),
  };
  documents.push(newDocument);
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  return newDocument;
}

// Delete a document from localStorage
export function deleteDocument(id) {
  const documents = getDocuments().filter(doc => doc.id !== id);
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  
  // Also delete associated quizzes
  const quizzes = getQuizzes().filter(quiz => quiz.documentId !== id);
  localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
}

// Get all quizzes from localStorage
export function getQuizzes() {
  const data = localStorage.getItem(STORAGE_KEYS.QUIZZES);
  return data ? JSON.parse(data) : [];
}

// Save a quiz to localStorage
export function saveQuiz(quiz) {
  const quizzes = getQuizzes();
  const newQuiz = {
    id: Date.now(),
    documentId: quiz.documentId,
    documentName: quiz.documentName,
    questions: quiz.questions,
    score: quiz.score,
    totalQuestions: quiz.totalQuestions,
    completedAt: new Date().toISOString(),
  };
  quizzes.push(newQuiz);
  localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
  
  // Update document quiz count
  const documents = getDocuments();
  const docIndex = documents.findIndex(d => d.id === quiz.documentId);
  if (docIndex !== -1) {
    documents[docIndex].quizzes = (documents[docIndex].quizzes || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }
  
  return newQuiz;
}

// Get quizzes for a specific document
export function getQuizzesByDocument(documentId) {
  return getQuizzes().filter(quiz => quiz.documentId === documentId);
}

// Clear all data
export function clearAllData() {
  localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
  localStorage.removeItem(STORAGE_KEYS.QUIZZES);
}
