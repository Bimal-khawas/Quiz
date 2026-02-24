// Gemini API client for quiz generation

/**
 * Generate quiz questions from text using Gemini API
 * @param {string} text - The text content to generate quiz from
 * @param {number} numQuestions - Number of questions to generate
 * @param {string} difficulty - Difficulty level: 'easy', 'medium', 'hard'
 * @returns {Promise<Array>} - Array of quiz questions with explanations
 */
export async function generateQuizFromText(text, numQuestions = 5, difficulty = 'medium') {
  // Get API key from environment variable
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  // Build difficulty-specific prompt
  const difficultyPrompt = getDifficultyPrompt(difficulty);

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
                  
                  ${difficultyPrompt}
                  
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
    const questions = parseQuizText(quizText, numQuestions);
    
    if (questions.length === 0) {
      throw new Error("Failed to generate questions. Please try again.");
    }
    
    return questions;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(error.message || "Failed to generate quiz questions. Please check your API key and try again.");
  }
}

/**
 * Get difficulty-specific prompt based on difficulty level
 */
function getDifficultyPrompt(difficulty) {
  switch (difficulty) {
    case 'easy':
      return `DIFFICULTY: EASY
      - Create straightforward questions that test basic recall and understanding
      - Questions should focus on facts, definitions, and straightforward concepts
      - Options should be clearly distinguishable
      - Explanations should be simple and direct`;
    case 'hard':
      return `DIFFICULTY: HARD
      - Create complex questions that test analysis, synthesis, and critical thinking
      - Questions should require deeper understanding and application of concepts
      - Include questions that compare/contrast, analyze cause-effect, or evaluate scenarios
      - Options may be similar and require careful analysis
      - Explanations should be detailed and show the reasoning process`;
    case 'medium':
    default:
      return `DIFFICULTY: MEDIUM
      - Create questions that test understanding and application of concepts
      - Questions should go beyond basic recall to test comprehension
      - Include some application-based and scenario-based questions
      - Explanations should clarify the reasoning behind the answer`;
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

  return questions.slice(0, maxQuestions);
}
