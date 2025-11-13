import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useXP } from '../context/XPContext';
import { useClass } from '../context/ClassContext';
import LeaderboardTable from '../components/LeaderboardTable';
import { globalLeaders, sortLeaderboard, filterByClass } from '../data/globalLeaders';

/**
 * Leaderboards - Competitive Rankings
 * 
 * Features:
 * - Class and Global leaderboards
 * - Sortable columns
 * - Badge system
 * - LM tooltips
 * - Your rank highlighting
 */

const Leaderboards = () => {
  const { xp, level } = useXP();
  const { classes } = useClass();
  const [tab, setTab] = useState('global'); // global or class
  const [sortBy, setSortBy] = useState('xp');
  const [classFilter, setClassFilter] = useState('all');

  // Get current user's data (mock - in real app would come from auth)
  const currentUser = {
    id: 'current',
    name: 'You',
    level: level,
    xp: xp,
    streak: 7,
    quizAverage: 87,
    avgAnswerTime: 5.5,
    dailySessionAvg: 2.8,
    class: 'Chemistry'
  };

  // Merge current user with global leaders
  const allLeaders = [currentUser, ...globalLeaders];
  
  // Apply filters and sorting
  const filteredLeaders = tab === 'class' 
    ? filterByClass(allLeaders, classFilter)
    : allLeaders;
  
  const sortedLeaders = sortLeaderboard(filteredLeaders, sortBy);
  
  // Find current user's rank
  const yourRank = sortedLeaders.findIndex(p => p.id === 'current') + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1
            className="text-6xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #ff66cc, #a066ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            🏆 Leaderboards
          </h1>
          <p className="text-gray-300 text-xl">
            See how you stack up against other learners!
          </p>
        </motion.div>

        {/* Your Rank Card */}
        <div className="bg-gradient-to-r from-[#ff66cc]/20 to-[#a066ff]/20 backdrop-blur-lg 
                     rounded-2xl p-6 mb-8 border-2" style={{ borderColor: '#ff66cc' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-300 text-sm mb-1">Your Rank</div>
              <div className="text-5xl font-bold text-white">#{yourRank}</div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold text-xl">Level {level}</div>
              <div className="text-pink-300">{xp.toLocaleString()} XP</div>
              <div className="text-orange-400 mt-1">🔥 {currentUser.streak} day streak</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab('global')}
            className={`px-8 py-3 rounded-lg font-bold transition-all ${
              tab === 'global'
                ? 'bg-gradient-to-r from-[#ff66cc] to-[#a066ff] text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            🌍 Global
          </button>
          <button
            onClick={() => setTab('class')}
            className={`px-8 py-3 rounded-lg font-bold transition-all ${
              tab === 'class'
                ? 'bg-gradient-to-r from-[#ff66cc] to-[#a066ff] text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            📚 Class
          </button>
        </div>

        {/* Class Filter (if class tab active) */}
        {tab === 'class' && (
          <div className="mb-6">
            <label className="block text-white font-bold mb-3">Filter by Class:</label>
            <div className="flex gap-3">
              <button
                onClick={() => setClassFilter('all')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  classFilter === 'all'
                    ? 'bg-gradient-to-r from-[#ff66cc] to-[#a066ff] text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                All Classes
              </button>
              {classes.map(cls => (
                <button
                  key={cls.id}
                  onClick={() => setClassFilter(cls.name)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    classFilter === cls.name
                      ? 'bg-gradient-to-r from-[#ff66cc] to-[#a066ff] text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {cls.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Badge Legend */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 mb-6 border border-white/10">
          <h3 className="text-white font-bold mb-3">🏅 Badge Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <div>
                <div className="text-white font-bold">Quiz Ace</div>
                <div className="text-gray-400 text-xs">90%+ average</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              <div>
                <div className="text-white font-bold">Speedster</div>
                <div className="text-gray-400 text-xs">Fast answers</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <div>
                <div className="text-white font-bold">Streak Legend</div>
                <div className="text-gray-400 text-xs">7+ day streak</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              <div>
                <div className="text-white font-bold">Study Beast</div>
                <div className="text-gray-400 text-xs">3+ sessions/day</div>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <LeaderboardTable 
          leaders={sortedLeaders}
          sortBy={sortBy}
          onSort={setSortBy}
        />

        {/* Motivation Message */}
        <div className="mt-8 bg-gradient-to-r from-[#ff66cc]/10 to-[#a066ff]/10 backdrop-blur-lg 
                     rounded-xl p-6 border" style={{ borderColor: '#ff66cc' }}>
          <div className="flex items-center gap-4">
            <div className="text-5xl">💪</div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                {yourRank <= 3 ? 'Amazing work! You\'re in the top 3!' :
                 yourRank <= 10 ? 'Great job! You\'re in the top 10!' :
                 'Keep pushing! Every study session counts!'}
              </h3>
              <p className="text-gray-300 text-sm">
                Earn more XP to climb the rankings! Study, complete assignments, and win games.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboards;
