import React from 'react';
import { motion } from 'framer-motion';
import { useAnalytics } from '../context/AnalyticsContext';
import { useXP } from '../context/XPContext';
import { useClass } from '../context/ClassContext';

/**
 * Analytics Dashboard - Performance Insights
 * 
 * Features:
 * - Weekly study time charts
 * - Subject performance breakdown
 * - Recent scores
 * - Strengths and weaknesses
 * - XP growth tracking
 * - LM insights and recommendations
 */

const Analytics = () => {
  const { weeklyData, subjectPerformance, recentScores, strengths, weaknesses, getInsights } = useAnalytics();
  const { xp, level } = useXP();
  const { assignments } = useClass();
  
  const insights = getInsights();

  // Calculate max for chart scaling
  const maxStudyMinutes = Math.max(...weeklyData.map(d => d.studyMinutes));
  const maxXP = Math.max(...weeklyData.map(d => d.xpEarned));

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
            📊 Analytics
          </h1>
          <p className="text-gray-300 text-xl">
            Track your progress and see how you're improving!
          </p>
        </motion.div>

        {/* LM Insights */}
        {insights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">💡 LM's Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    backdrop-blur-lg rounded-xl p-4 border-2
                    ${insight.type === 'positive' ? 'bg-green-500/10 border-green-400/50' :
                      insight.type === 'warning' ? 'bg-yellow-500/10 border-yellow-400/50' :
                      'bg-blue-500/10 border-blue-400/50'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{insight.icon}</div>
                    <p className="text-white">{insight.message}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-lg 
                       rounded-xl p-6 border" style={{ borderColor: '#ff66cc' }}>
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-3xl font-bold text-white mb-1">{level}</div>
            <div className="text-pink-300 text-sm">Current Level</div>
            <div className="text-xs text-gray-400 mt-1">{xp.toLocaleString()} XP</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg 
                       rounded-xl p-6 border border-blue-400/30">
            <div className="text-4xl mb-2">📚</div>
            <div className="text-3xl font-bold text-white mb-1">87%</div>
            <div className="text-blue-300 text-sm">Average Score</div>
            <div className="text-xs text-gray-400 mt-1">Across all classes</div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg 
                       rounded-xl p-6 border border-green-400/30">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-3xl font-bold text-white mb-1">85%</div>
            <div className="text-green-300 text-sm">Completion Rate</div>
            <div className="text-xs text-gray-400 mt-1">
              {assignments.filter(a => a.submitted).length}/{assignments.length} done
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-lg 
                       rounded-xl p-6 border border-orange-400/30">
            <div className="text-4xl mb-2">⏱️</div>
            <div className="text-3xl font-bold text-white mb-1">1,847</div>
            <div className="text-orange-300 text-sm">Study Minutes</div>
            <div className="text-xs text-gray-400 mt-1">~30 hrs total</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Study Time */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-6">📈 Weekly Study Time</h3>
            <div className="space-y-3">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-16 text-gray-400 text-sm">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-700/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: 'linear-gradient(90deg, #ff66cc, #a066ff)',
                          width: `${(day.studyMinutes / maxStudyMinutes) * 100}%`
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(day.studyMinutes / maxStudyMinutes) * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right text-white font-bold text-sm">
                    {day.studyMinutes}m
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* XP Growth */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-6">⚡ XP Earned This Week</h3>
            <div className="space-y-3">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-16 text-gray-400 text-sm">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-700/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                        style={{ width: `${(day.xpEarned / maxXP) * 100}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(day.xpEarned / maxXP) * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right text-yellow-400 font-bold text-sm">
                    +{day.xpEarned}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subject Performance */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">📚 Subject Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(subjectPerformance).map(([subject, data]) => (
              <div key={subject} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xl font-bold text-white capitalize">{subject}</h4>
                  <span className={`text-2xl ${
                    data.trend === 'up' ? '📈' : data.trend === 'down' ? '📉' : '➡️'
                  }`}>
                    {data.trend === 'up' ? '📈' : data.trend === 'down' ? '📉' : '➡️'}
                  </span>
                </div>
                
                <div className="text-4xl font-bold text-white mb-2">{data.avg}%</div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Completed:</span>
                    <span className="text-white">{data.completed}/{data.assignments}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#ff66cc] to-[#a066ff] rounded-full"
                      style={{ width: `${(data.completed / data.assignments) * 100}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(data.completed / data.assignments) * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Scores & Strengths/Weaknesses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Scores */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-6">🎯 Recent Scores</h3>
            <div className="space-y-3">
              {recentScores.map((score, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div>
                    <div className="text-white font-bold">{score.assignment}</div>
                    <div className="text-gray-400 text-sm">{score.subject} • {score.date}</div>
                  </div>
                  <div className={`text-2xl font-bold ${
                    score.score >= 90 ? 'text-green-400' :
                    score.score >= 80 ? 'text-blue-400' :
                    score.score >= 70 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {score.score}%
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="space-y-6">
            {/* Strengths */}
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-lg 
                         rounded-2xl p-6 border border-green-400/30">
              <h3 className="text-2xl font-bold text-white mb-4">💪 Your Strengths</h3>
              <div className="space-y-2">
                {strengths.map((strength, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 text-green-300"
                  >
                    <span className="text-xl">✨</span>
                    <span>{strength}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Weaknesses (Improvement Areas) */}
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-lg 
                         rounded-2xl p-6 border border-orange-400/30">
              <h3 className="text-2xl font-bold text-white mb-4">🎯 Room for Growth</h3>
              <div className="space-y-2">
                {weaknesses.map((weakness, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 text-orange-300"
                  >
                    <span className="text-xl">📚</span>
                    <span>{weakness}</span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-400">
                💡 Spend extra study time on these areas to improve!
              </div>
            </div>
          </div>
        </div>

        {/* LM Motivation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-[#ff66cc]/10 to-[#a066ff]/10 backdrop-blur-lg 
                   rounded-xl p-8 border" style={{ borderColor: '#ff66cc' }}
        >
          <div className="flex items-center gap-6">
            <div className="text-6xl">💜</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">
                Keep up the amazing work!
              </h3>
              <p className="text-gray-300">
                You're making great progress! Your dedication shows in your {level >= 10 ? 'impressive' : 'growing'} Level {level} status. 
                {insights.find(i => i.type === 'positive') 
                  ? ' LM is so proud of your consistency! 🔥'
                  : ' Stay focused and keep building those study habits! 💪'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
