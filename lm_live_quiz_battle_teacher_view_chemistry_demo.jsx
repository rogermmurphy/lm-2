import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * LM Live Quiz Battle – Teacher View (Chemistry Demo)
 * ---------------------------------------------------
 * Single-file React component using TailwindCSS.
 *
 * What this demo includes (Phase 1):
 *  - Lobby with join list (auto-add bots to reach 6 players)
 *  - Chemistry flashcard-based MC questions
 *  - Per-question timer, reveal state, live answer stats
 *  - Leaderboard scoring (speed + accuracy)
 *  - End-game summary
 *  - LM mascot bubble + neon LM theme (dark)
 *
 * How to use:
 *  - Click "Add Student" a few times to mimic real students
 *  - Press "Start Game"; if <=5 humans, bots fill remaining slots
 *  - Each round auto-simulates student answers (including bots)
 *  - Click "Next Question" to advance, or "End Game" to finish early
 */

const MIN_PLAYERS = 6;
const QUESTION_TIME = 12; // seconds

// Cute LM bot names for the classroom vibe
const BOT_NAMES = [
  "Quizzilla",
  "Mr. Ionic",
  "Covalent Kid",
  "pHantom",
  "Neon Nova",
  "Proton Pete",
  "Valence Vicky",
  "Catalyst Kai",
  "Halogen Holly",
  "Sigma Sam",
];

// Chemistry flashcards -> converted to MC for the game
const CHEM_QUESTIONS = [
  {
    id: 1,
    front: "What is Avogadro's number?",
    correct: "6.022 × 10^23",
    options: ["6.022 × 10^23", "3.14 × 10^8", "1.602 × 10^-19", "9.81 m/s^2"],
  },
  {
    id: 2,
    front: "Which molecular geometry does CO₂ have?",
    correct: "Linear",
    options: ["Linear", "Bent", "Trigonal pyramidal", "Tetrahedral"],
  },
  {
    id: 3,
    front: "Which bond is the most polar?",
    correct: "H–F",
    options: ["H–H", "C–H", "H–F", "C–C"],
  },
  {
    id: 4,
    front: "What is the pH of a 1.0×10^-3 M strong acid?",
    correct: "pH = 3",
    options: ["pH = 11", "pH = 3", "pH = 7", "pH = 1"],
  },
  {
    id: 5,
    front: "Which intermolecular force is strongest?",
    correct: "Hydrogen bonding",
    options: ["London dispersion", "Dipole–dipole", "Hydrogen bonding", "Ion–induced dipole"],
  },
  {
    id: 6,
    front: "Which species is the oxidizing agent? (Zn + Cu²⁺ → Zn²⁺ + Cu)",
    correct: "Cu²⁺",
    options: ["Zn", "Cu²⁺", "Zn²⁺", "Cu"],
  },
  {
    id: 7,
    front: "For NH₃, what is the electron geometry?",
    correct: "Tetrahedral (electron); trigonal pyramidal (molecular)",
    options: [
      "Tetrahedral (electron); trigonal pyramidal (molecular)",
      "Trigonal planar (both)",
      "Bent (both)",
      "Linear (both)",
    ],
  },
  {
    id: 8,
    front: "What is the strongest acid?",
    correct: "HClO₄",
    options: ["HCl", "HF", "HClO₄", "CH₃COOH"],
  },
];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function useInterval(callback, delay) {
  const savedRef = useRef(callback);
  useEffect(() => {
    savedRef.current = callback;
  }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedRef.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

export default function TeacherLiveQuizBattle() {
  const [phase, setPhase] = useState("lobby"); // lobby | playing | reveal | leaderboard | summary
  const [players, setPlayers] = useState([]); // {id, name, score, isBot}
  const [gameDeck, setGameDeck] = useState(shuffle(CHEM_QUESTIONS));
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [answers, setAnswers] = useState({}); // playerId -> { option, timeTaken }
  const [roundResults, setRoundResults] = useState(null);

  const currentQ = gameDeck[qIndex];

  // Add a human student (demo button)
  const addStudent = () => {
    const id = crypto.randomUUID();
    const num = players.filter(p => !p.isBot).length + 1;
    const student = { id, name: `Student ${num}`, score: 0, isBot: false };
    setPlayers(prev => [...prev, student]);
  };

  // Fill with bots up to MIN_PLAYERS when starting
  const fillBotsIfNeeded = () => {
    const need = Math.max(0, MIN_PLAYERS - players.length);
    if (need === 0) return [];
    const freeNames = shuffle(BOT_NAMES);
    const bots = Array.from({ length: need }, (_, i) => ({
      id: crypto.randomUUID(),
      name: freeNames[i % freeNames.length] || `Bot ${i + 1}`,
      score: 0,
      isBot: true,
    }));
    setPlayers(prev => [...prev, ...bots]);
    return bots;
  };

  const startGame = () => {
    fillBotsIfNeeded();
    setPhase("playing");
    setQIndex(0);
    setTimeLeft(QUESTION_TIME);
    setAnswers({});
    setRoundResults(null);
  };

  const endGame = () => {
    setPhase("summary");
  };

  // Simulate answers for all players (bots + humans for demo)
  const simulateAnswers = (elapsed) => {
    // Probability of answering correctly ~60% for humans, ~55% for bots
    // Time to answer: random between 1s and QUESTION_TIME-1
    const newAnswers = {};
    for (const p of players) {
      const correctProb = p.isBot ? 0.55 : 0.6;
      const willAnswer = Math.random() < 0.95; // small chance to skip
      const timeTaken = Math.max(1, Math.min(QUESTION_TIME - 1, Math.floor(1 + Math.random() * (QUESTION_TIME - 2))));
      if (!willAnswer) continue;
      const pickCorrect = Math.random() < correctProb;
      const pick = pickCorrect ? currentQ.correct : randomChoice(currentQ.options.filter(o => o !== currentQ.correct));
      newAnswers[p.id] = { option: pick, timeTaken };
    }
    setAnswers(newAnswers);
  };

  // Countdown timer during playing phase
  useInterval(() => {
    if (phase !== "playing") return;
    setTimeLeft((t) => {
      if (t <= 1) {
        // time's up -> reveal
        handleReveal();
        return QUESTION_TIME;
      }
      return t - 1;
    });
  }, 1000);

  // On entering a new question, auto-simulate answers once
  useEffect(() => {
    if (phase === "playing") {
      // Delay slightly so UI shows the new question first
      const id = setTimeout(() => simulateAnswers(QUESTION_TIME - timeLeft), 300);
      return () => clearTimeout(id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIndex]);

  const handleReveal = () => {
    // Compute per-round results & update scores
    const counts = {};
    for (const opt of currentQ.options) counts[opt] = 0;
    let correctCount = 0;

    // Score: base 1000 for correct, + up to 400 bonus (faster = more)
    // bonus = Math.max(0, 400 - (timeTaken * (400/QUESTION_TIME)))
    const updated = players.map((p) => ({ ...p }));
    for (const p of updated) {
      const a = answers[p.id];
      if (!a) continue;
      counts[a.option] = (counts[a.option] || 0) + 1;
      const isCorrect = a.option === currentQ.correct;
      if (isCorrect) {
        const bonus = Math.max(0, Math.floor(400 - (a.timeTaken * (400 / QUESTION_TIME))));
        p.score += 1000 + bonus;
        correctCount++;
      }
    }

    setPlayers(updated);
    setRoundResults({ counts, correct: currentQ.correct, correctCount });
    setPhase("reveal");
  };

  const nextQuestion = () => {
    if (qIndex + 1 < gameDeck.length) {
      setQIndex(qIndex + 1);
      setTimeLeft(QUESTION_TIME);
      setAnswers({});
      setRoundResults(null);
      setPhase("playing");
    } else {
      setPhase("leaderboard");
    }
  };

  const sortedLeaders = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);

  return (
    <div className="min-h-screen w-full bg-[#0b0b12] text-gray-100">
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0b12]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 shadow-inner" />
            <h1 className="text-xl font-semibold tracking-wide">LM Live Quiz Battle · Chemistry</h1>
          </div>
          <div className="flex items-center gap-2">
            {phase === "lobby" && (
              <button onClick={startGame} className="rounded-xl bg-fuchsia-600 px-4 py-2 text-sm font-semibold hover:bg-fuchsia-500">Start Game</button>
            )}
            {(phase === "playing" || phase === "reveal") && (
              <button onClick={endGame} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold hover:bg-rose-500">End Game</button>
            )}
            {(phase === "leaderboard") && (
              <button onClick={() => setPhase("summary")} className="rounded-xl bg-fuchsia-600 px-4 py-2 text-sm font-semibold hover:bg-fuchsia-500">Finish</button>
            )}
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 p-4 md:grid-cols-12">
        {/* Left: Question / Editor */}
        <div className="md:col-span-7">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl">
            {phase === "lobby" && (
              <Lobby players={players} addStudent={addStudent} />
            )}

            {phase === "playing" && currentQ && (
              <PlayingView q={currentQ} timeLeft={timeLeft} total={QUESTION_TIME} />
            )}

            {phase === "reveal" && currentQ && roundResults && (
              <RevealView q={currentQ} results={roundResults} />
            )}

            {phase === "leaderboard" && (
              <FinalLeaderboard leaders={sortedLeaders} next={setPhase} />
            )}

            {phase === "summary" && (
              <Summary leaders={sortedLeaders} deck={gameDeck} />
            )}
          </div>

          {/* Controls under question card */}
          <div className="mt-4 flex items-center gap-3">
            {phase === "playing" && (
              <button onClick={handleReveal} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500">Reveal Answer</button>
            )}
            {phase === "reveal" && (
              <button onClick={nextQuestion} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold hover:bg-indigo-500">Next Question</button>
            )}
          </div>
        </div>

        {/* Right: Leaderboard + LM assistant */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl">
            <h3 className="mb-3 text-lg font-semibold">Leaderboard</h3>
            <Leaderboard players={sortedLeaders} />
          </div>

          <LMMascot phase={phase} players={players} />
        </div>
      </div>
    </div>
  );
}

function Lobby({ players, addStudent }) {
  const need = Math.max(0, MIN_PLAYERS - players.length);
  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold">Lobby</h2>
      <p className="mb-4 text-sm text-gray-300">Waiting for students to join… {need > 0 ? `(Need ${need} more or bots will join)` : `(Ready!)`}</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {players.map((p) => (
          <span key={p.id} className="rounded-xl border border-white/10 bg-white/10 px-3 py-1 text-sm">
            {p.name}{p.isBot ? " 🤖" : ""}
          </span>
        ))}
      </div>
      <button onClick={addStudent} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold hover:bg-indigo-500">Add Student</button>
    </div>
  );
}

function PlayingView({ q, timeLeft, total }) {
  const pct = Math.max(0, Math.min(100, Math.round((timeLeft / total) * 100)));
  return (
    <div>
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Question</h2>
          <span className="text-sm text-gray-300">Time left: <strong className="text-white">{timeLeft}s</strong></span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-600" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="rounded-xl bg-[#0f0f19] p-4 ring-1 ring-white/10">
        <p className="mb-4 text-lg">{q.front}</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {q.options.map((opt) => (
            <div key={opt} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">{opt}</div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-400">Answers are hidden during the timer. Reveal when ready.</p>
    </div>
  );
}

function RevealView({ q, results }) {
  const totalVotes = Object.values(results.counts).reduce((a, b) => a + b, 0);
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Reveal</h2>
      <div className="rounded-xl bg-[#0f0f19] p-4 ring-1 ring-white/10">
        <p className="mb-4 text-lg">{q.front}</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {q.options.map((opt) => {
            const count = results.counts[opt] || 0;
            const pct = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
            const correct = opt === results.correct;
            return (
              <div key={opt} className={`rounded-xl border p-3 text-sm ${correct ? "border-emerald-500 bg-emerald-500/10" : "border-white/10 bg-white/5"}`}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium">{opt}</span>
                  <span className="text-xs text-gray-300">{count} votes</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full ${correct ? "bg-emerald-500" : "bg-white/20"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-3 text-sm text-emerald-400">Correct answer: <strong>{results.correct}</strong> · {results.correctCount} correct</p>
    </div>
  );
}

function Leaderboard({ players }) {
  return (
    <div className="space-y-2">
      {players.slice(0, 10).map((p, i) => (
        <div key={p.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <div className="flex items-center gap-3">
            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? "bg-yellow-400 text-black" : i === 1 ? "bg-gray-300 text-black" : i === 2 ? "bg-amber-600 text-black" : "bg-white/10 text-white"}`}>{i + 1}</span>
            <span className="text-sm">{p.name}{p.isBot ? " 🤖" : ""}</span>
          </div>
          <span className="text-sm font-semibold tabular-nums">{p.score}</span>
        </div>
      ))}
    </div>
  );
}

function FinalLeaderboard({ leaders }) {
  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold">Final Leaderboard</h2>
      <p className="mb-4 text-sm text-gray-300">Great job! 🎉</p>
      <Leaderboard players={leaders} />
      <p className="mt-4 text-xs text-gray-400">Click Finish to view the summary.</p>
    </div>
  );
}

function Summary({ leaders, deck }) {
  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold">Game Summary</h2>
      <p className="mb-4 text-sm text-gray-300">Export to Planner coming next. For now, here's a snapshot:</p>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 font-semibold">Top Performers</h3>
          <Leaderboard players={leaders} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 font-semibold">Question Set</h3>
          <ol className="list-inside list-decimal space-y-1 text-sm">
            {deck.map((q) => (
              <li key={q.id}><span className="text-gray-200">{q.front}</span> <span className="text-gray-400">(Answer: {q.correct})</span></li>
            ))}
          </ol>
        </div>
      </div>
      <p className="text-xs text-gray-400">Tip: We can connect this to real student accounts + sockets in Phase 2.</p>
    </div>
  );
}

function LMMascot({ phase, players }) {
  const mood = useMemo(() => {
    if (phase === "lobby") return { line: "Waiting room open. I can spawn bots if needed!", tone: "" };
    if (phase === "playing") return { line: "Timer is ticking… stay focused!", tone: "" };
    if (phase === "reveal") return { line: "Nice reveal! Who guessed right?", tone: "" };
    if (phase === "leaderboard") return { line: "Podium time!", tone: "" };
    if (phase === "summary") return { line: "Summary ready. Want to save to Planner?", tone: "" };
    return { line: "Let's go!", tone: "" };
  }, [phase]);

  const total = players.length;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 to-purple-700/10 p-4 shadow-xl">
      <div className="flex items-start gap-3">
        {/* LM Avatar */}
        <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 shadow-inner ring-1 ring-white/20" />
        <div className="flex-1">
          <p className="text-sm text-gray-200">{mood.line}</p>
          <p className="mt-1 text-xs text-gray-400">Players: <span className="tabular-nums">{total}</span> (min {MIN_PLAYERS})</p>
        </div>
      </div>
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-fuchsia-500/20 blur-2xl" />
    </div>
  );
}
