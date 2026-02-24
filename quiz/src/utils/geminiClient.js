// Gemini API client for quiz generation

/**
 * Generate quiz questions from text using Gemini API
 * @param {string} text - The text content to generate quiz from
 * @param {number} numQuestions - Number of questions to generate
 * @returns {Promise<Array>} - Array of quiz questions with explanations
 */
export async function generateQuizFromText(text, numQuestions = 5) {
  // Get API key from environment variable
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    // Return mock questions for demo purposes when no API key is provided
    return generateSmartMockQuestions(text, numQuestions);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate ${numQuestions} high-quality multiple-choice quiz questions from the following text.
                  
                  Requirements:
                  1. Focus on IMPORTANT TOPICS and KEY CONCEPTS from the text
                  2. Create questions that test understanding, not just memorization
                  3. Each question should have exactly 4 options (A, B, C, D)
                  4. Each question MUST have an explanation of why the answer is correct
                  
                  Format each question as follows:
                  Q1: [Question about an important topic]
                  A) [Option A]
                  B) [Option B]
                  C) [Option C]
                  D) [Option D]
                  Correct Answer: [A/B/C/D]
                  Explanation: [Why this answer is correct based on the text]
                  
                  Text: ${text.slice(0, 8000)}`
                }
              ]
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Parse Gemini response into quiz format
    const quizText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return parseQuizText(quizText, numQuestions);
  } catch (error) {
    console.error("Gemini API error:", error);
    // Fall back to mock questions on error
    return generateSmartMockQuestions(text, numQuestions);
  }
}

/**
 * Parse the quiz text from Gemini API into structured questions with explanations
 */
function parseQuizText(quizText, maxQuestions) {
  const lines = quizText.split("\n").filter(l => l.trim() !== "");
  const questions = [];
  let currentQuestion = null;

  lines.forEach(line => {
    // Match question lines like "Q1:" or "1."
    const questionMatch = line.match(/^(?:Q\d+:|(\d+)\.)\s*(.+)/i);
    if (questionMatch) {
      if (currentQuestion) questions.push(currentQuestion);
      currentQuestion = { 
        question: questionMatch[2] || questionMatch[1], 
        options: [], 
        answer: null,
        correctAnswer: null,
        explanation: null
      };
    } 
    // Match option lines like "A)" or "A."
    else if (/^[A-D][\)\.]\s*/i.test(line) && currentQuestion) {
      const option = line.replace(/^[A-D][\)\.]\s*/i, "").trim();
      currentQuestion.options.push(option);
    }
    // Match answer lines - support both "Answer:" and "Correct Answer:"
    else if (/^(?:Correct )?Answer:\s*/i.test(line) && currentQuestion) {
      const answer = line.replace(/^(?:Correct )?Answer:\s*/i, "").trim();
      currentQuestion.correctAnswer = answer;
      // Store the correct option letter
      const correctIndex = answer.charAt(0).toUpperCase().charCodeAt(0) - 65;
      if (correctIndex >= 0 && correctIndex < currentQuestion.options.length) {
        currentQuestion.answer = currentQuestion.options[correctIndex];
      }
    }
    // Match explanation lines
    else if (/^Explanation:/i.test(line) && currentQuestion) {
      const explanation = line.replace(/^Explanation:\s*/i, "").trim();
      currentQuestion.explanation = explanation;
    }
  });

  if (currentQuestion) questions.push(currentQuestion);

  // If parsing failed, generate smart mock questions
  if (questions.length === 0) {
    return generateSmartMockQuestions("", maxQuestions);
  }

  return questions.slice(0, maxQuestions);
}

/**
 * Generate smart mock questions based on text content when no API key is available
 */
function generateSmartMockQuestions(text, numQuestions) {
  // Extract potential topics from text (simple keyword extraction)
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 5);
  const wordFreq = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  const smartQuestions = [
    {
      question: `What is the main topic discussed in the document${topWords.length > 0 ? ` related to "${topWords[0]}"` : ''}?`,
      options: [
        `The document primarily discusses ${topWords[0] || 'the main subject'}`,
        `A completely unrelated topic`,
        `Something about cooking recipes`,
        `Entertainment and sports`
      ],
      answer: `The document primarily discusses ${topWords[0] || 'the main subject'}`,
      correctAnswer: "A",
      explanation: "The document's content clearly focuses on the main subject matter, which is the central theme throughout the text."
    },
    {
      question: "Based on the important concepts in the text, what can be inferred?",
      options: [
        "The text presents key information and concepts",
        "The content is purely fictional",
        "There are no important points in the text",
        "The document is about random topics"
      ],
      answer: "The text presents key information and concepts",
      correctAnswer: "A",
      explanation: "The document contains substantial information with important concepts that are worth understanding and remembering."
    },
    {
      question: "What type of questions would best test understanding of this document?",
      options: [
        "Questions about the main ideas and key details",
        "Questions about unrelated topics",
        "Questions with no correct answers",
        "Random trivia questions"
      ],
      answer: "Questions about the main ideas and key details",
      correctAnswer: "A",
      explanation: "Effective quiz questions should focus on the main ideas, key details, and important concepts presented in the document."
    },
    {
      question: "What is essential for understanding this document's message?",
      options: [
        "Reading and comprehending the key points",
        "Ignoring the content entirely",
        "Skipping the introduction",
        "Only looking at pictures"
      ],
      answer: "Reading and comprehending the key points",
      correctAnswer: "A",
      explanation: "Understanding any document requires careful reading and comprehension of its key points and main ideas."
    },
    {
      question: "How should one approach learning from this document?",
      options: [
        "Focus on understanding the important concepts",
        "Memorize everything without understanding",
        "Read only the first sentence",
        "Skim without attention"
      ],
      answer: "Focus on understanding the important concepts",
      correctAnswer: "A",
      explanation: "True learning comes from understanding and internalizing the important concepts, not just superficial reading."
    }
  ];

  return smartQuestions.slice(0, numQuestions);
}
