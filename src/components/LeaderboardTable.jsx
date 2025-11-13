import React, { useState } from 'react';
import { motion } from 'framer-motion';

const LeaderboardTable = ({ leaders, sortBy, onSort }) => {
  const [hoveredPlayer, setHoveredPlayer] = useState(null);

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-500 to-amber-500';
    if (rank === 2) return 'from-gray-400 to-gray-500';
    if (rank === 3) return 'from-orange-600 to-orange-700';
    return 'from-gray-600 to-gray-700';
  };

  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[80px_minmax(150px,1fr)_100px_120px_100px_minmax(120px,1fr)] gap-4 p-4 bg-white/5 border-b border-white/10">
        <div className="text-gray-400 font-bold text-sm">Rank</div>
        <div className="text-gray-400 font-bold text-sm">Player</div>
        <button onClick={() => onSort('level')} className="text-gray-400 font-bold text-sm text-left hover:text-white">
          Level {sortBy === 'level' && '▼'}
        </button>
        <button onClick={() => onSort('xp')} className="text-gray-400 font-bold text-sm text-left hover:text-white">
          XP {sortBy === 'xp' && '▼'}
        </button>
        <button onClick={() => onSort('streak')} className="text-gray-400 font-bold text-sm text-left hover:text-white">
          Streak {sortBy === 'streak' && '▼'}
        </button>
        <div className="text-gray-400 font-bold text-sm">Badges</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/5">
        {leaders.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onMouseEnter={() => setHoveredPlayer(player)}
            onMouseLeave={() => setHoveredPlayer(null)}
            className="grid grid-cols-[80px_minmax(150px,1fr)_100px_120px_100px_minmax(120px,1fr)] gap-4 p-4 hover:bg-white/5 transition-all cursor-pointer relative"
          >
            {/* Rank */}
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-r ${getRankColor(index + 1)}`}>
                {getRankEmoji(index + 1)}
              </div>
            </div>

            {/* Name */}
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#ff66cc] to-[#a066ff] flex items-center justify-center text-white font-bold mr-3">
                {player.name.charAt(0)}
              </div>
              <div>
                <div className="text-white font-bold">{player.name}</div>
                <div className="text-gray-400 text-xs">{player.class}</div>
              </div>
            </div>

            {/* Level */}
            <div className="flex items-center text-white font-bold">
              Lv. {player.level}
            </div>

            {/* XP */}
            <div className="flex items-center text-white font-bold">
              {player.xp.toLocaleString()}
            </div>

            {/* Streak */}
            <div className="flex items-center">
              <span className="text-orange-400 font-bold">🔥 {player.streak}</span>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2">
              {player.badges.map(badge => (
                <div
                  key={badge.id}
                  className="text-2xl"
                  title={badge.name}
                  style={{ filter: `drop-shadow(0 0 4px ${badge.color})` }}
                >
                  {badge.icon}
                </div>
              ))}
            </div>

            {/* LM Tooltip on Hover */}
            {hoveredPlayer?.id === player.id && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-1/2 transform -translate-x-1/2 -top-24 z-50 pointer-events-none"
              >
                <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl p-4 border-2" style={{ borderColor: '#ff66cc' }}>
                  <div className="text-xs text-gray-400 mb-1">LM says:</div>
                  <div className="text-white font-bold mb-2">
                    {player.badges.length > 0 
                      ? `${player.name} is crushing it! ${player.badges[0].icon}`
                      : `Keep going, ${player.name}! 💪`}
                  </div>
                  <div className="text-xs text-gray-300">
                    Quiz Avg: {player.quizAverage}% • {player.badges.length} badges
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardTable;
