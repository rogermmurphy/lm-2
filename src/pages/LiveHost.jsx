import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClass } from '../context/ClassContext';
import { createSession, startGame, broadcastQuestion, endGame, subscribeToSession } from '../lib/realtimeAdapter';
import { emit } from '../lib/realtimeBus';
import { onQuizStart, onHighScore, resetMood } from '../utils/lmMoodTriggers';

/**
 * Live Host - Teacher Control Panel
 * 
 * Features:
 * - Create live sessions with join codes
 * - Monitor student roster
 * - Launch polls and quizzes
 * - Quick reactions (celebrate, hype, break)
 * - Real-time results
 * - Reveal answers
 */

const LiveHost = () => {
  const { classes } = useClass();
  const [selectedClass, setSelectedClass] = useState(null);
  const [session, setSession] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [responses, setResponses] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Load saved session from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('liveSession');
      if (saved) {
        const sessionData = JSON.parse(saved);
        setSession(sessionData);
        setJoinCode(sessionData.code);
        setIsActive(sessionData.active);
      }
    } catch (e) {
      console.warn('Failed to load session:', e);
    }
  }, []);

  // Subscribe to session events
  useEffect(() => {
    if (!joinCode) return;

    const unsubscribe = subscribeToSession(joinCode, {
      onPlayerJoined: ({ player, playerCount }) => {
        setPlayers(prev => [...prev, player]);
        console.log(`✅ ${player.name} joined!`);
      },
      onPlayerLeft: ({ playerId, playerCount }) => {
        setPlayers(prev => prev.filter(p => p.id !== playerId));
        console.log(`👋 Player left`);
      },
      onAnswerSubmitted: (data) => {
        setResponses(prev => [...prev, data]);
        console.log(`✍️ Answer received from ${data.playerId}`);
      }
    });

    return () => unsubscribe();
  }, [joinCode]);

  // Create new session
  const handleCreateSession = () => {
    if (!selectedClass) {
      alert('Please select a class first!');
      return;
    }

    const { code, session: newSession } = createSession({
      hostId: 'teacher',
      classId: selectedClass.id
    });

    const sessionData = {
      id: `session_${Date.now()}`,
      code,
      classId: selectedClass.id,
      className: selectedClass.name,
      startedAt: new Date().toISOString(),
      active: true
    };

    setSession(sessionData);
    setJoinCode(code);
    setIsActive(true);

    // Save to localStorage
    try {
      localStorage.setItem('liveSession', JSON.stringify(sessionData));
    } catch (e) {
      console.error('Failed to save session:', e);
    }

    // Emit session start
    emit('session:start', { code, className: selectedClass.name });

    // LM hyped mood
    onQuizStart();

    console.log(`🎮 Session created: ${code}`);
  };

  // Launch Poll
  const handleLaunchPoll = () => {
    const poll = {
      id: `poll_${Date.now()}`,
      type: 'poll',
      question: 'How confident do you feel about today\'s topic?',
      options: [
        { id: 'opt_1', text: 'Very Confident 😊', votes: 0 },
        { id: 'opt_2', text: 'Somewhat Confident 🤔', votes: 0 },
        { id: 'opt_3', text: 'Need More Help 😕', votes: 0 }
      ],
      launchedAt: Date.now()
    };

    setCurrentActivity(poll);
    setResponses([]);
    setShowResults(false);

    emit('activity:launch', { code: joinCode, activity: poll });
    console.log('📊 Poll launched');
  };

  // Launch Quiz Question
  const handleLaunchQuiz = () => {
    const quiz = {
      id: `quiz_${Date.now()}`,
      type: 'quiz',
      question: 'What is the atomic number of Carbon?',
      options: [
        { id: 'opt_1', text: '6', isCorrect: true },
        { id: 'opt_2', text: '12', isCorrect: false },
        { id: 'opt_3', text: '14', isCorrect: false },
        { id: 'opt_4', text: '8', isCorrect: false }
      ],
      correctAnswer: 'opt_1',
      points: 10,
      launchedAt: Date.now()
    };

    setCurrentActivity(quiz);
    setResponses([]);
    setShowResults(false);

    broadcastQuestion(joinCode, quiz);
    console.log('❓ Quiz question launched');
  };

  // Send Quick Reaction
  const handleQuickReaction = (reaction) => {
    emit('reaction:send', {
      code: joinCode,
      reaction,
      timestamp: Date.now()
    });

    const moodMap = {
      '🎉': 'proud',
      '🔥': 'hyped',
      '💤': 'tired'
    };

    if (window.setLMMood && moodMap[reaction]) {
      window.setLMMood(moodMap[reaction]);
    }

    console.log(`${reaction} sent to all students!`);
  };

  // Reveal Answer
  const handleRevealAnswer = () => {
    if (!currentActivity || currentActivity.type !== 'quiz') return;

    setShowResults(true);
    
    emit('activity:reveal', {
      code: joinCode,
      correctAnswer: currentActivity.correctAnswer
    });

    // LM proud mood
    if (window.setLMMood) {
      window.setLMMood('proud');
    }

    console.log('✅ Answer revealed');
  };

  // End Session
  const handleEndSession = () => {
    if (!joinCode) return;

    endGame(joinCode);
    
    setIsActive(false);
    setSession(null);
    setPlayers([]);
    setCurrentActivity(null);
    setResponses([]);

    // Clear localStorage
    try {
      localStorage.removeItem('liveSession');
    } catch (e) {
      console.error('Failed to clear session:', e);
    }

    emit('session:end', { code: joinCode });

    // LM happy mood
    resetMood();

    console.log('🏁 Session ended');
  };

  // Calculate response stats
  const getResponseStats = () => {
    if (!currentActivity) return null;

    const totalResponses = responses.length;
    const optionCounts = {};
    
    currentActivity.options.forEach(opt => {
      optionCounts[opt.id] = responses.filter(r => r.answer === opt.id).length;
    });

    return {
      total: totalResponses,
      byOption: optionCounts,
      responseRate: totalResponses > 0 ? Math.round((totalResponses / players.length) * 100) : 0
    };
  };

  const stats = getResponseStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1
            className="text-5xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #ff66cc, #a066ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            🎮 Live Control Panel
          </h1>
          <p className="text-gray-300 text-xl">
            Host interactive sessions with your class!
          </p>
        </motion.div>

        {/* Class Selector (if no active session) */}
        {!isActive && (
          <div className="mb-8">
            <label className="block text-white font-bold mb-3">Select Class:</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {classes.map(cls => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className={`
                    p-6 rounded-xl transition-all transform hover:scale-105
                    ${selectedClass?.id === cls.id
                      ? 'bg-gradient-to-r from-[#ff66cc] to-[#a066ff] text-white shadow-lg'
                      : 'bg-white/10 text-white border border-white/20'}
                  `}
                >
                  <div className="text-3xl mb-2">📚</div>
                  <div className="font-bold">{cls.name}</div>
                  <div className="text-sm opacity-75">Period {cls.period}</div>
                </button>
              ))}
            </div>

            {selectedClass && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={handleCreateSession}
                className="mt-6 w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 
                         hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xl
                         rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                🚀 Create Live Session
              </motion.button>
            )}
          </div>
        )}

        {/* Active Session Layout */}
        {isActive && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: Session Info + Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* Session Header */}
              <div className="bg-gradient-to-br from-[#ff66cc]/20 to-[#a066ff]/20 backdrop-blur-lg 
                           rounded-2xl p-6 border-2" style={{ borderColor: '#ff66cc' }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">
                      {session?.className}
                    </h2>
                    <p className="text-gray-300">Live Session Active</p>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-bold text-white mb-1">{joinCode}</div>
                    <div className="text-sm text-gray-400">Join Code</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleEndSession}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold 
                             rounded-lg transition-all"
                  >
                    🛑 End Session
                  </button>
                  <div className="px-6 py-3 bg-green-900/50 text-green-300 font-bold rounded-lg 
                              border-2 border-green-500 flex items-center gap-2">
                    <span className="animate-pulse">●</span>
                    LIVE
                  </div>
                </div>
              </div>

              {/* Quick Reactions */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">⚡ Quick Reactions</h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleQuickReaction('🎉')}
                    className="py-4 bg-gradient-to-r from-yellow-500 to-orange-500 
                             hover:from-yellow-600 hover:to-orange-600 text-white font-bold
                             rounded-lg transition-all transform hover:scale-105 text-3xl"
                  >
                    🎉 Celebrate
                  </button>
                  <button
                    onClick={() => handleQuickReaction('🔥')}
                    className="py-4 bg-gradient-to-r from-orange-500 to-red-500 
                             hover:from-orange-600 hover:to-red-600 text-white font-bold
                             rounded-lg transition-all transform hover:scale-105 text-3xl"
                  >
                    🔥 Hype Up
                  </button>
                  <button
                    onClick={() => handleQuickReaction('💤')}
                    className="py-4 bg-gradient-to-r from-purple-500 to-indigo-500 
                             hover:from-purple-600 hover:to-indigo-600 text-white font-bold
                             rounded-lg transition-all transform hover:scale-105 text-3xl"
                  >
                    💤 Break Time
                  </button>
                </div>
              </div>

              {/* Activity Controls */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">🎯 Launch Activity</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleLaunchPoll}
                    className="py-6 bg-gradient-to-r from-blue-500 to-cyan-500 
                             hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-lg
                             rounded-lg transition-all transform hover:scale-105"
                  >
                    📊 Launch Poll
                  </button>
                  <button
                    onClick={handleLaunchQuiz}
                    className="py-6 bg-gradient-to-r from-[#ff66cc] to-[#a066ff] 
                             hover:shadow-xl text-white font-bold text-lg
                             rounded-lg transition-all transform hover:scale-105"
                  >
                    ❓ Launch Quiz
                  </button>
                </div>
              </div>

              {/* Current Activity / Results */}
              {currentActivity && (
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white">
                      {currentActivity.type === 'poll' ? '📊 Active Poll' : '❓ Active Quiz'}
                    </h3>
                    {currentActivity.type === 'quiz' && !showResults && (
                      <button
                        onClick={handleRevealAnswer}
                        className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold 
                                 rounded-lg transition-all transform hover:scale-105"
                      >
                        ✅ Reveal Answer
                      </button>
                    )}
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 mb-4">
                    <p className="text-xl text-white font-semibold">
                      {currentActivity.question}
                    </p>
                  </div>

                  {/* Options with Response Bars */}
                  <div className="space-y-3">
                    {currentActivity.options.map((option, index) => {
                      const votes = stats?.byOption[option.id] || 0;
                      const percentage = stats?.total > 0 ? (votes / stats.total) * 100 : 0;
                      const isCorrect = currentActivity.type === 'quiz' && option.isCorrect;

                      return (
                        <div
                          key={option.id}
                          className={`
                            relative bg-white/5 rounded-lg p-4 border-2 transition-all
                            ${showResults && isCorrect ? 'border-green-500' : 'border-white/10'}
                          `}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-semibold">
                              {String.fromCharCode(65 + index)}. {option.text}
                            </span>
                            <span className="text-white font-bold">
                              {votes} ({Math.round(percentage)}%)
                            </span>
                          </div>

                          {/* Response Bar */}
                          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${
                                showResults && isCorrect 
                                  ? 'bg-green-500' 
                                  : 'bg-gradient-to-r from-[#ff66cc] to-[#a066ff]'
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>

                          {showResults && isCorrect && (
                            <div className="absolute top-2 right-2 text-2xl">
                              ✅
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Response Count */}
                  <div className="mt-4 text-center text-gray-400">
                    {stats?.total || 0} / {players.length} responses 
                    ({stats?.responseRate || 0}%)
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Player Roster */}
            <div className="space-y-6">
              {/* Player Count */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">👥 Connected Players</h3>
                <div className="text-5xl font-bold text-white text-center mb-2">
                  {players.length}
                </div>
                <div className="text-center text-gray-400">
                  {players.length === 0 ? 'Waiting for players...' : 
                   players.length === 1 ? '1 player connected' :
                   `${players.length} players connected`}
                </div>
              </div>

              {/* Player List */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 max-h-[600px] overflow-y-auto">
                <h3 className="text-lg font-bold text-white mb-4 sticky top-0 bg-gray-900/80 pb-2">
                  📋 Roster
                </h3>

                {players.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">👻</div>
                    <p className="text-gray-400">
                      No players yet.<br/>Share the join code!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {players.map((player, index) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#ff66cc] to-[#a066ff] 
                                      flex items-center justify-center text-white font-bold">
                          {player.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-semibold">{player.name}</div>
                          <div className="text-gray-400 text-xs">Active</div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              {currentActivity && stats && (
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">📊 Live Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Responses:</span>
                      <span className="text-white font-bold">{stats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Response Rate:</span>
                      <span className="text-white font-bold">{stats.responseRate}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State (no session) */}
        {!isActive && !selectedClass && (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🎮</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Go Live?
            </h2>
            <p className="text-gray-300 text-lg">
              Select a class above to create an interactive session!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveHost;
