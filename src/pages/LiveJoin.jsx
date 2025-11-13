import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { joinSession, submitAnswer, subscribeToSession } from '../lib/realtimeAdapter';
import { emit, on } from '../lib/realtimeBus';
import { isValidJoinCode } from '../lib/joinCode';
import { useXP } from '../context/XPContext';

const LiveJoin = () => {
  const { addXP } = useXP();
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('😊');
  const [joinCode, setJoinCode] = useState('');
  const [step, setStep] = useState('join');
  const [session, setSession] = useState(null);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [timer, setTimer] = useState(30);
  const [wrongCount, setWrongCount] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatCooldown, setChatCooldown] = useState(0);
  const chatEndRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('liveUser');
      if (saved) {
        const userData = JSON.parse(saved);
        setUserName(userData.name || '');
        setUserAvatar(userData.avatar || '😊');
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (chatCooldown > 0) {
      const timer = setTimeout(() => setChatCooldown(chatCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [chatCooldown]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (step === 'playing' && currentActivity?.type === 'quiz' && !hasAnswered && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, currentActivity, hasAnswered, timer]);

  useEffect(() => {
    if (!session) return;
    const unsub1 = on('activity:launch', ({ activity }) => {
      setCurrentActivity(activity);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setShowCorrectAnswer(false);
    });
    const unsub2 = on('activity:reveal', ({ correctAnswer }) => {
      setShowCorrectAnswer(true);
      if (selectedAnswer === correctAnswer) {
        addXP(10);
        if (window.setLMMood) window.setLMMood('hyped');
      } else {
        const newWrongCount = wrongCount + 1;
        setWrongCount(newWrongCount);
        if (newWrongCount >= 3 && window.setLMMood) window.setLMMood('tired');
      }
    });
    const unsub3 = on('chat:message', (msg) => setChatMessages(prev => [...prev, msg]));
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [session, selectedAnswer, wrongCount, addXP]);

  const handleJoin = () => {
    if (!userName.trim() || !isValidJoinCode(joinCode)) {
      alert('Enter name and valid code!');
      return;
    }
    const player = { id: `p_${Date.now()}`, name: userName.trim(), avatar: userAvatar };
    const result = joinSession(joinCode, player);
    if (result) {
      setSession(result);
      setStep('lobby');
      try { localStorage.setItem('liveUser', JSON.stringify({ name: userName, avatar: userAvatar })); } catch (e) {}
      emit('session:join', { name: userName, avatar: userAvatar, code: joinCode });
    } else {
      alert('Session not found!');
    }
  };

  const handleAnswer = (optionId) => {
    if (hasAnswered) return;
    setSelectedAnswer(optionId);
    setHasAnswered(true);
    submitAnswer(session.code, userName, optionId);
    emit('activity:vote', { code: session.code, playerId: userName, answer: optionId });
    if (window.setLMMood) window.setLMMood('proud');
  };

  const handleSendChat = () => {
    if (!chatInput.trim() || chatCooldown > 0 || chatInput.length > 200) return;
    const msg = { id: `m_${Date.now()}`, sender: userName, avatar: userAvatar, text: chatInput.trim(), timestamp: Date.now() };
    emit('chat:message', msg);
    setChatMessages(prev => [...prev, msg]);
    setChatInput('');
    setChatCooldown(2);
  };

  const avatars = ['😊', '😎', '🤓', '😁', '🥳', '😍', '🤩', '😇'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {step === 'join' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/5 backdrop-blur-lg rounded-3xl p-12 border-2" style={{ borderColor: '#ff66cc' }}>
            <h1 className="text-5xl font-bold text-center mb-8" style={{ background: 'linear-gradient(135deg, #ff66cc, #a066ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🎮 Join Live</h1>
            <div className="mb-6">
              <label className="block text-white font-bold mb-3">Avatar:</label>
              <div className="grid grid-cols-4 gap-3">
                {avatars.map(a => (
                  <button key={a} onClick={() => setUserAvatar(a)} className={`p-4 text-3xl rounded-lg ${userAvatar === a ? 'bg-gradient-to-r from-[#ff66cc] to-[#a066ff]' : 'bg-white/10'}`}>{a}</button>
                ))}
              </div>
            </div>
            <input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Your Name" className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-lg text-white mb-4" />
            <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="Join Code (LM-XXXX)" className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-lg text-white mb-6" />
            <button onClick={handleJoin} className="w-full py-4 bg-gradient-to-r from-[#ff66cc] to-[#a066ff] text-white font-bold text-xl rounded-lg">🚀 Join</button>
          </motion.div>
        )}
        {step === 'lobby' && (
          <div className="text-center">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-8xl mb-6">⏳</motion.div>
            <h2 className="text-4xl font-bold text-white mb-4">Waiting...</h2>
          </div>
        )}
        {step === 'playing' && currentActivity && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex justify-between mb-4">
                <h3 className="text-2xl font-bold text-white">{currentActivity.question}</h3>
                {currentActivity.type === 'quiz' && <div className="text-3xl font-bold text-white">{timer}s</div>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentActivity.options.map((opt, i) => (
                  <button key={opt.id} onClick={() => handleAnswer(opt.id)} disabled={hasAnswered} className={`p-6 rounded-xl font-bold text-lg ${hasAnswered && selectedAnswer === opt.id ? 'bg-gradient-to-r from-[#ff66cc] to-[#a066ff] text-white' : showCorrectAnswer && opt.isCorrect ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                    {String.fromCharCode(65 + i)}. {opt.text}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h4 className="text-lg font-bold text-white mb-4">💬 Chat</h4>
              <div className="h-40 bg-white/5 rounded-lg p-3 mb-3 overflow-y-auto">
                {chatMessages.map(msg => (
                  <div key={msg.id} className="mb-2 text-sm">
                    <span className="mr-2">{msg.avatar}</span>
                    <span className="text-gray-400">{msg.sender}:</span>
                    <span className="text-white ml-2">{msg.text}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2">
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value.slice(0, 200))} onKeyPress={(e) => e.key === 'Enter' && handleSendChat()} placeholder="Message..." className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
                <button onClick={handleSendChat} disabled={chatCooldown > 0} className={`px-6 py-2 rounded-lg font-bold text-white ${chatCooldown > 0 ? 'bg-gray-600' : 'bg-gradient-to-r from-[#ff66cc] to-[#a066ff]'}`}>{chatCooldown > 0 ? `${chatCooldown}s` : 'Send'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveJoin;
