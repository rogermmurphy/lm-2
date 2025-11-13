import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * AI Tools Hub - Central menu for LM-powered study tools
 * 
 * Features:
 * - 5 AI tool cards
 * - Navigation to each tool
 * - LM hover interactions
 * - Glassmorphic design
 */

const AIToolsHub = () => {
  const [hoveredTool, setHoveredTool] = useState(null);

  const tools = [
    {
      id: 'quiz_generator',
      title: 'Quiz Generator',
      description: 'Turn your notes into practice quizzes instantly',
      icon: '❓',
      route: '/ai-hub/quiz-generator',
      color: 'from-blue-500 to-cyan-500',
      lmQuote: 'Let me help you create some practice questions! 📝'
    },
    {
      id: 'summarizer',
      title: 'Summarizer',
      description: 'Get key points from long texts and articles',
      icon: '📄',
      route: '/ai-hub/summarizer',
      color: 'from-purple-500 to-pink-500',
      lmQuote: 'I\'ll help you extract the important stuff! ✨'
    },
    {
      id: 'flashcard_builder',
      title: 'Flashcard Builder',
      description: 'Auto-generate flashcards from your study materials',
      icon: '🎴',
      route: '/ai-hub/flashcard-builder',
      color: 'from-green-500 to-emerald-500',
      lmQuote: 'Flashcards make memorizing so much easier! 🧠'
    },
    {
      id: 'essay_reviewer',
      title: 'Essay Reviewer',
      description: 'Get feedback on grammar, structure, and clarity',
      icon: '✍️',
      route: '/ai-hub/essay-reviewer',
      color: 'from-orange-500 to-red-500',
      lmQuote: 'I\'ll help polish your writing! ✨'
    },
    {
      id: 'explain_simply',
      title: 'Explain It Simply',
      description: 'Break down complex topics into simple language',
      icon: '💡',
      route: '/ai-hub/explain-simply',
      color: 'from-yellow-500 to-amber-500',
      lmQuote: 'Let me make this super clear for you! 🎯'
    }
  ];

  const handleToolHover = (tool) => {
    setHoveredTool(tool);
    // LM could show the quote in speech bubble
    if (window.setLMMood) {
      window.setLMMood('happy');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1
            className="text-7xl font-bold mb-6"
            style={{
              background: 'linear-gradient(135deg, #ff66cc, #a066ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            🧠 Learning Monster AI Tools
          </h1>
          <p className="text-gray-300 text-2xl mb-4">
            Supercharge your learning with AI-powered study helpers!
          </p>
          <p className="text-gray-400 text-lg">
            Your friendly LM is here to make studying smarter and faster.
          </p>
        </motion.div>

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onMouseEnter={() => handleToolHover(tool)}
              onMouseLeave={() => setHoveredTool(null)}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative bg-white/5 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/10
                       hover:border-white/30 transition-all cursor-pointer group"
            >
              {/* Icon */}
              <motion.div
                animate={hoveredTool?.id === tool.id ? { rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5 }}
                className="text-8xl mb-6 text-center"
              >
                {tool.icon}
              </motion.div>

              {/* Title & Description */}
              <h3 className="text-2xl font-bold text-white mb-3 text-center">
                {tool.title}
              </h3>
              <p className="text-gray-300 text-center mb-6">
                {tool.description}
              </p>

              {/* Button */}
              <button
                onClick={() => window.location.href = tool.route}
                className={`
                  w-full py-3 rounded-lg font-bold text-white transition-all
                  bg-gradient-to-r ${tool.color}
                  group-hover:shadow-lg group-hover:scale-105
                `}
              >
                Try It Out →
              </button>

              {/* Glow effect on hover */}
              {hoveredTool?.id === tool.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, rgba(255, 102, 204, 0.1), transparent 70%)`,
                    boxShadow: '0 0 40px rgba(255, 102, 204, 0.3)'
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* LM Quote Display (when hovering) */}
        {hoveredTool && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 right-32 bg-gradient-to-br from-gray-900/95 to-gray-800/95 
                     backdrop-blur-xl rounded-2xl p-6 border-2 shadow-2xl max-w-md"
            style={{ borderColor: '#ff66cc' }}
          >
            <div className="flex items-start gap-4">
              <div className="text-5xl">💜</div>
              <div>
                <div className="text-sm text-gray-400 mb-1">LM says:</div>
                <div className="text-white font-semibold">
                  {hoveredTool.lmQuote}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Info Section */}
        <div className="bg-gradient-to-r from-[#ff66cc]/10 to-[#a066ff]/10 backdrop-blur-lg 
                     rounded-2xl p-8 border" style={{ borderColor: '#ff66cc' }}>
          <h2 className="text-3xl font-bold text-white mb-4">
            ✨ How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">🎯 Smart & Fast</h3>
              <p>AI analyzes your content and generates helpful study materials in seconds.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">📚 Personalized</h3>
              <p>Tools adapt to your learning style and the topics you're studying.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">💡 Always Learning</h3>
              <p>The more you use the tools, the better they get at helping you!</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">🔒 Private & Safe</h3>
              <p>Your study materials are private and secure.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIToolsHub;
