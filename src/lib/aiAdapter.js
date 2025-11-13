/**
 * AI Service Adapter
 * 
 * Mock AI API calls until real backend/AI endpoints exist
 * Simulates latency and returns mock responses
 */

/**
 * Make AI request
 * @param {string} type - Type of AI task
 * @param {object} payload - Request data
 * @returns {Promise<any>} AI response
 */
export async function aiRequest(type, payload) {
  // Simulate API latency (800ms)
  await new Promise(resolve => setTimeout(resolve, 800));

  switch (type) {
    case 'summarize':
      return {
        summary: `This is a concise summary of: ${payload.text.slice(0, 120)}...`,
        keyPoints: [
          'Main concept extracted',
          'Important detail identified',
          'Core argument summarized'
        ],
        wordCount: payload.text.split(' ').length,
        readingTime: Math.ceil(payload.text.split(' ').length / 200)
      };

    case 'quiz':
      return [
        {
          id: 'q1',
          question: 'Sample question 1 based on your content?',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correct: 'A',
          explanation: 'This is the correct answer because...'
        },
        {
          id: 'q2',
          question: 'Another generated question?',
          options: ['True', 'False'],
          correct: 'True',
          explanation: 'Explanation here...'
        }
      ];

    case 'flashcards':
      const sentences = payload.text.split('.').filter(s => s.trim());
      return sentences.slice(0, 10).map((sentence, i) => ({
        id: `card_${i}`,
        front: sentence.trim(),
        back: `Answer ${i + 1} - Key concept from the text`
      }));

    case 'essayReview':
      return {
        score: 90,
        feedback: 'Strong thesis statement. Watch for comma splices in paragraph 3.',
        strengths: [
          'Clear introduction',
          'Good use of evidence',
          'Strong conclusion'
        ],
        improvements: [
          'Add transition between paragraphs 2-3',
          'Cite sources more explicitly',
          'Vary sentence structure'
        ],
        grammarIssues: 2,
        spellingIssues: 0
      };

    case 'simplify':
      return {
        simplified: `Simplified: ${payload.text.slice(0, 100)}...`,
        originalComplexity: 'College level',
        newComplexity: 'Middle school level',
        readabilityScore: 85
      };

    default:
      return { error: 'Unknown AI task type' };
  }
}

/**
 * Check if AI is available (mock always returns true)
 * @returns {Promise<boolean>}
 */
export async function checkAIAvailability() {
  await new Promise(resolve => setTimeout(resolve, 200));
  return true;
}

/**
 * Get AI usage stats (mock data)
 * @returns {Promise<object>}
 */
export async function getAIUsageStats() {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    requestsToday: 12,
    requestsThisWeek: 47,
    remainingQuota: 953,
    favoriteTools: ['Quiz Generator', 'Summarizer']
  };
}

export default {
  aiRequest,
  checkAIAvailability,
  getAIUsageStats
};
