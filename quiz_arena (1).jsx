import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

const BANK = {
  Math: [
    { q: "5 × 3 = ?", choices: ["8", "15", "20"], answer: "15" },
    { q: "12 ÷ 4 = ?", choices: ["2", "3", "4"], answer: "3" },
    { q: "7 + 6 = ?", choices: ["12", "13", "14"], answer: "13" },
    { q: "9 − 5 = ?", choices: ["3", "4", "5"], answer: "4" },
    { q: "6 × 4 = ?", choices: ["24", "28", "16"], answer: "24" },
    { q: "√81 = ?", choices: ["9", "8", "7"], answer: "9" },
    { q: "2² + 3² = ?", choices: ["12", "13", "10"], answer: "13" },
    { q: "10% of 250 = ?", choices: ["20", "25", "30"], answer: "25" },
  ],
  Science: [
    { q: "Red Planet is…", choices: ["Mars", "Venus", "Jupiter"], answer: "Mars" },
    { q: "H₂O is…", choices: ["Oxygen", "Hydrogen", "Water"], answer: "Water" },
    { q: "Humans breathe in…", choices: ["CO₂", "O₂", "N₂"], answer: "O₂" },
    { q: "Solid → Gas is…", choices: ["Condensation", "Sublimation", "Freezing"], answer: "Sublimation" },
    { q: "Earth’s core metal?", choices: ["Iron", "Copper", "Silver"], answer: "Iron" },
    { q: "Plant food made by…", choices: ["Respiration", "Photosynthesis", "Fermentation"], answer: "Photosynthesis" },
    { q: "Speed unit?", choices: ["m/s", "kg", "N"], answer: "m/s" },
    { q: "Energy symbol?", choices: ["E", "F", "P"], answer: "E" },
  ],
};

const SUBJECTS = Object.keys(BANK);
const LM_ACCURACY = { Math: 0.78, Science: 0.82 };

export default function QuizBattleArena() {
  const [subject, setSubject] = useState(null);
  const [round, setRound] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [lmScore, setLmScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [finished, setFinished] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const [lmAnswer, setLmAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [history, setHistory] = useState([]);

  const totalRounds = 8;

  const questions = useMemo(() => {
    if (!subject) return [];
    return BANK[subject].slice(0, totalRounds);
  }, [subject]);

  const current = subject ? questions[round] : null;
  const hasBothAnswered = userAnswer !== null && lmAnswer !== null;

  useEffect(() => {
    if (!subject || finished) return;
    if (timeLeft === 0) {
      setFeedback("⏳ Time!");
      setTimeout(() => advanceRound(), 700);
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => Math.max(t - 1, 0)), 1000);
    return () => clearInterval(id);
  }, [timeLeft, subject, finished]);

  const lmTimerRef = useRef(null);
  useEffect(() => {
    if (!subject || finished || !current) return;
    if (lmTimerRef.current) clearTimeout(lmTimerRef.current);

    const delay = 400 + Math.random() * 1000;
    lmTimerRef.current = setTimeout(() => {
      const acc = LM_ACCURACY[subject] ?? 0.78;
      const willBeCorrect = Math.random() < acc;
      if (willBeCorrect) setLmAnswer(current.answer);
      else {
        const wrongs = current.choices.filter((c) => c !== current.answer);
        setLmAnswer(wrongs[Math.floor(Math.random() * wrongs.length)]);
      }
    }, delay);

    return () => clearTimeout(lmTimerRef.current);
  }, [round, subject, finished, current]);

  useEffect(() => {
    if (!subject || finished || !current) return;
    if (hasBothAnswered) {
      const correctUser = userAnswer === current.answer;
      const correctLm = lmAnswer === current.answer;
      if (correctUser) setUserScore((s) => s + 1);
      if (correctLm) setLmScore((s) => s + 1);

      setHistory((h) => [
        ...h,
        {
          q: current.q,
          choices: current.choices,
          correct: current.answer,
          you: userAnswer,
          lm: lmAnswer,
        },
      ]);

      setFeedback(correctUser ? "🎉 LM: Nice hit!" : "😈 LM: I’ll get you next one…");
      const t = setTimeout(() => advanceRound(), 700);
      return () => clearTimeout(t);
    }
  }, [hasBothAnswered]);

  const advanceRound = () => {
    if (round < totalRounds - 1) {
      setRound((r) => r + 1);
      setTimeLeft(15);
      setUserAnswer(null);
      setLmAnswer(null);
      setFeedback("");
    } else {
      setFinished(true);
    }
  };

  const startSubject = (s) => {
    setSubject(s);
    setRound(0);
    setUserScore(0);
    setLmScore(0);
    setTimeLeft(15);
    setUserAnswer(null);
    setLmAnswer(null);
    setFinished(false);
    setFeedback("");
    setHistory([]);
  };

  const resetAll = () => {
    setSubject(null);
    setRound(0);
    setUserScore(0);
    setLmScore(0);
    setTimeLeft(15);
    setUserAnswer(null);
    setLmAnswer(null);
    setFinished(false);
    setFeedback("");
    setHistory([]);
  };

  const regenerateSimilar = () => {
    const wrongQs = history.filter((h) => h.you !== h.correct).map((h) => h.q);
    console.log("Would send to backend:", wrongQs);
    alert("LM will generate more questions like the ones you missed!");
  };

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-white to-rose-100">
        <div className="w-full max-w-3xl p-8 bg-white rounded-2xl shadow-lg">
          <h1 className="text-3xl font-extrabold text-center mb-6">LM Quiz Battle Arena</h1>
          <p className="text-center text-sm mb-6">Choose your battleground. You vs <span className="font-semibold text-pink-600">LM</span>.</p>
          <div className="grid grid-cols-2 gap-4">
            {SUBJECTS.map((s) => (
              <motion.button key={s} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => startSubject(s)} className="rounded-2xl border border-pink-200 bg-pink-50 px-4 py-6 text-center font-semibold hover:shadow">
                {s}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    const youWin = userScore > lmScore;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-200 to-rose-100">
        <div className="w-full max-w-2xl p-8 bg-white rounded-2xl shadow-xl text-center">
          <h2 className="text-3xl font-extrabold mb-4">Battle Over</h2>
          <p className="mb-2 text-lg">You scored {userScore} vs LM {lmScore}</p>
          <p className="text-xl font-semibold mb-6">{youWin ? "You win! 🎉" : "LM wins 😈"}</p>

          <div className="text-left mb-6">
            <h3 className="font-bold mb-2">Round Summary</h3>
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className={`border rounded-xl p-3 ${h.you === h.correct ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}>
                  <p className="font-semibold">{h.q}</p>
                  <p className="text-sm">✅ Correct: {h.correct}</p>
                  <p className="text-sm">🧍 You: {h.you}</p>
                  <p className="text-sm">🤖 LM: {h.lm}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={() => startSubject(subject)} className="px-5 py-3 rounded-xl bg-pink-500 text-white font-semibold hover:brightness-110">Replay</button>
            <button onClick={resetAll} className="px-5 py-3 rounded-xl border border-pink-300 font-semibold hover:bg-pink-50">Change Subject</button>
            <button onClick={regenerateSimilar} className="px-5 py-3 rounded-xl bg-purple-500 text-white font-semibold hover:brightness-110">Train Me Again</button>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((round) / totalRounds) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-100 via-white to-rose-100">
      <div className="w-full py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/lm-head.png" alt="LM" className="w-10 h-10 rounded-full border-2 border-pink-400" />
          <div>
            <div className="text-xs uppercase tracking-wide text-pink-600">Quiz Arena</div>
            <div className="text-lg font-bold">{subject} Battle</div>
          </div>
        </div>
        <button onClick={resetAll} className="text-sm px-3 py-1.5 rounded-lg border border-pink-300 hover:bg-white">Subjects</button>
      </div>

      {/* Progress Bar */}
      <div className="w-full px-6">
        <div className="h-3 bg-pink-200 rounded-full overflow-hidden">
          <div className="h-full bg-pink-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-xs text-pink-700 mt-1 text-right pr-1">{round + 1} / {totalRounds} Questions</p>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        <div className="md:col-span-1 bg-white rounded-2xl shadow p-4 border border-pink-100">
          <h3 className="font-semibold mb-2">You</h3>
          <AnswerBoard disabled={userAnswer !== null} choices={current?.choices || []} onChoose={(c) => setUserAnswer(c)} picked={userAnswer} />
        </div>

        <div className="md:col-span-1 bg-white rounded-2xl shadow p-6 border border-pink-100 flex flex-col items-center justify-center text-center">
          <div className="text-sm font-semibold text-pink-600 mb-2">Time Left</div>
          <div className="text-3xl font-extrabold text-pink-700 mb-4">{timeLeft}s</div>
          <div className="text-lg font-semibold mb-1">Question {round + 1}</div>
          <div className="text-base">{current?.q}</div>
          {feedback && <div className="mt-4 text-pink-600 font-medium">{feedback}</div>}
        </div>

        <div className="md:col-span-1 bg-white rounded-2xl shadow p-4 border border-pink-100 relative">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">LM</h3>
            <img src="/lm-head.png" alt="LM" className="w-10 h-10 rounded-full border-2 border-pink-400" />
          </div>
          <AnswerBoard disabled choices={current?.choices || []} picked={lmAnswer} />
          <div className="absolute -top-3 right-3 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">AI</div>
        </div>
      </div>
    </div>
  );
}

function AnswerBoard({ choices, onChoose, picked, disabled = false }) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {choices.map((c) => (
        <motion.button key={c} disabled={disabled} onClick={() => onChoose && onChoose(c)} whileHover={!disabled ? { scale: 1.02 } : undefined} whileTap={!disabled ? { scale: 0.97 } : undefined} className={`px-4 py-3 rounded-xl border text-left transition shadow-sm ${picked === c ? 'border-pink-500 bg-pink-50' : 'border-pink-100 bg-white hover:bg-pink-50'} ${disabled ? 'opacity-70 cursor-default' : 'cursor-pointer'}`}>
          {c}
        </motion.button>
      ))}
    </div>
  );
}
