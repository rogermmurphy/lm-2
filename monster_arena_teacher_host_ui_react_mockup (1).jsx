import React, { useEffect, useMemo, useRef, useState } from "react";
import { Play, Users, Upload, Trophy, Settings, Rocket, Zap, TimerReset, Copy, ClipboardCheck, Eye, EyeOff, Skull, RefreshCcw, Save, Plus, Minus, BarChart3, BookOpen, UserPlus, Loader2 } from "lucide-react";

/**
 * Monster Arena: Classroom Battle Royale (Teacher Host Mockup)
 * ------------------------------------------------------------
 * - Single-file React mockup for the Teacher View hosting experience
 * - Uses Tailwind classes; no backend required
 * - Simulates players (bots) so you can demo end-to-end
 * - Screens: Setup -> Lobby -> Question -> Leaderboard -> Summary
 * - Includes a “Student Preview” panel so you can see the learner UI
 *
 * Notes:
 * - This is a UI/logic mock; sockets & database hooks are abstracted.
 * - Upload accepts JSON of the form: [{ id, question, choices:[..], correctIndex, topic }]
 * - Minimum 6 players enforced by Add Bots control
 */

// ----- Helpers -----
const COLORS = [
  "#F472B6", // pink
  "#60A5FA", // blue
  "#34D399", // green
  "#A78BFA", // purple
  "#F59E0B", // amber
  "#F87171", // red
  "#22D3EE", // cyan
  "#C084FC", // violet
];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function id() { return Math.random().toString(36).slice(2, 8); }
const NAMES = [
  "Ava", "Liam", "Mia", "Noah", "Zoe", "Elijah", "Ivy", "Lucas",
  "Leo", "Emma", "Olivia", "Sophia", "Ethan", "Mason", "Isla", "Ezra"
];

// Default CHEM demo set
const DEMO_SET = [
  { id: id(), question: "Which subatomic particle has a positive charge?", choices: ["Electron", "Proton", "Neutron", "Positron"], correctIndex: 1, topic: "Chemistry" },
  { id: id(), question: "What is the chemical formula for water?", choices: ["H2O", "HO2", "OH2", "H3O"], correctIndex: 0, topic: "Chemistry" },
  { id: id(), question: "pH < 7 indicates…", choices: ["Neutral", "Acidic", "Basic", "Buffer"], correctIndex: 1, topic: "Chemistry" },
  { id: id(), question: "Avogadro's number is…", choices: ["6.02×10^23", "3.14", "9.81 m/s^2", "0.082 L·atm/mol·K"], correctIndex: 0, topic: "Chemistry" },
  { id: id(), question: "Which bond is strongest?", choices: ["Ionic", "Hydrogen", "Covalent", "Metallic"], correctIndex: 2, topic: "Chemistry" },
];

// ----- Monster Avatar -----
function MonsterAvatar({ name, color, size = 44, mood = "idle" }: { name: string; color: string; size?: number; mood?: "idle"|"happy"|"hurt"|"ko"|"charge" }) {
  const initials = name.slice(0,2).toUpperCase();
  const pulse = mood === "charge" ? "animate-pulse" : "";
  const ring = mood === "hurt" ? "ring-2 ring-red-400" : mood === "happy" ? "ring-2 ring-green-400" : mood === "ko" ? "grayscale" : "";
  return (
    <div
      className={`relative flex items-center justify-center rounded-full shadow-lg ${pulse} ${ring}`}
      style={{ width: size, height: size, background: color }}
      title={name}
    >
      <span className="text-xs font-bold text-white drop-shadow-sm">{initials}</span>
      {mood === "ko" && (
        <Skull className="absolute -bottom-2 -right-2 h-4 w-4 text-white/80" />
      )}
    </div>
  );
}

// ----- Types -----
interface Player {
  id: string;
  name: string;
  color: string;
  score: number;
  streak: number;
  alive: boolean;
  answered?: number; // index chosen for current question
  timeMs?: number;
}

interface Q {
  id: string;
  question: string;
  choices: string[];
  correctIndex: number;
  topic?: string;
}

// ----- Root Component (default export) -----
export default function MonsterArenaHost() {
  const [stage, setStage] = useState<"setup"|"lobby"|"question"|"leaderboard"|"summary">("setup");
  const [visibleJoinCode, setVisibleJoinCode] = useState(false);
  const [code] = useState(() => id().toUpperCase());
  const [players, setPlayers] = useState<Player[]>([]);
  const [questionSet, setQuestionSet] = useState<Q[]>(DEMO_SET);
  const [current, setCurrent] = useState<number>(0);
  const [duration, setDuration] = useState(18); // seconds per question
  const [autoSimBots, setAutoSimBots] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);

  // Derived
  const q = questionSet[current];
  const minPlayers = 6;
  const ready = players.length >= minPlayers && questionSet.length > 0;

  // ----- Upload handler -----
  const onUpload = async (file?: File|null) => {
    if (!file) return;
    setLoadingUpload(true);
    try {
      const text = await file.text();
      const json: Q[] = JSON.parse(text);
      if (!Array.isArray(json) || !json.length) throw new Error("Invalid JSON");
      const normalized = json.map((o, i) => ({
        id: o.id || id()+i,
        question: o.question,
        choices: o.choices,
        correctIndex: o.correctIndex,
        topic: o.topic || "Custom",
      }));
      setQuestionSet(normalized);
      setCurrent(0);
    } catch (e) {
      alert("Upload failed. Expected an array of questions with {question, choices[], correctIndex}.");
    } finally {
      setLoadingUpload(false);
    }
  };

  // ----- Lobby: add bots until >=6 -----
  const addBot = () => {
    setPlayers(p => [
      ...p,
      {
        id: id(),
        name: uniqueName(p.map(x => x.name)),
        color: rand(COLORS),
        score: 0,
        streak: 0,
        alive: true,
      },
    ]);
  };
  const removeLast = () => setPlayers(p => p.slice(0, -1));
  const uniqueName = (taken: string[]) => {
    let candidate = rand(NAMES);
    let i = 1;
    while (taken.includes(candidate)) { candidate = `${candidate}${++i}`; }
    return candidate;
  };

  // ----- Question run-loop (sim bots) -----
  const [secsLeft, setSecsLeft] = useState(duration);
  const timerRef = useRef<NodeJS.Timeout|null>(null);

  const resetAnswers = () => setPlayers(p => p.map(pl => ({ ...pl, answered: undefined, timeMs: undefined })));

  useEffect(() => { setSecsLeft(duration); }, [current, duration]);

  useEffect(() => {
    if (stage !== "question") return;
    resetAnswers();
    const start = performance.now();

    // simple timer
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Auto grade when timer ends
          finalizeQuestion(performance.now() - start);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // bot answering behavior
    if (autoSimBots) {
      const subs = players.map((pl, idx) => setTimeout(() => {
        // 70% chance to answer; 65% of those correct
        const will = Math.random() < 0.7;
        if (!will) return;
        const correct = Math.random() < 0.65;
        const choice = correct ? q.correctIndex : Math.floor(Math.random() * q.choices.length);
        setPlayers(p => p.map(u => u.id === pl.id ? { ...u, answered: choice, timeMs: Math.floor(performance.now() - start) } : u));
      }, 600 + Math.random() * (duration * 600)));
      return () => subs.forEach(clearTimeout);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, current, autoSimBots]);

  const finalizeQuestion = (elapsedMs?: number) => {
    setPlayers(p => p.map(pl => {
      if (pl.answered == null) return { ...pl, alive: pl.alive, streak: 0 }; // no answer
      const correct = pl.answered === q.correctIndex;
      const speedBonus = pl.timeMs ? Math.max(0, (duration*1000 - pl.timeMs) / 1000) : 0; // up to duration sec
      const delta = correct ? Math.floor(100 + speedBonus * 5 + pl.streak * 10) : -10;
      return {
        ...pl,
        score: Math.max(0, pl.score + Math.max(-5, delta)),
        streak: correct ? pl.streak + 1 : 0,
        alive: correct ? pl.alive : pl.alive, // could add elimination rules later
      };
    }));

    setTimeout(() => setStage("leaderboard"), 600); // brief pause/flash
  };

  const nextQuestion = () => {
    if (current < questionSet.length - 1) {
      setCurrent(c => c + 1);
      setStage("question");
    } else {
      setStage("summary");
    }
  };

  // ----- Student Preview (shows focused player) -----
  const focusPlayer = useMemo(() => players[0], [players]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Host main stage */}
        <div className="xl:col-span-2">
          <Header code={code} visible={visibleJoinCode} onToggle={() => setVisibleJoinCode(v => !v)} isLive={isLive} setIsLive={setIsLive} />
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-4 md:p-6">
            {stage === "setup" && (
              <Setup
                questionSet={questionSet}
                onUpload={onUpload}
                loadingUpload={loadingUpload}
                duration={duration}
                setDuration={setDuration}
                players={players}
                addBot={addBot}
                removeLast={removeLast}
                minPlayers={minPlayers}
                onStart={() => { if (ready) { setStage("lobby"); } }}
              />
            )}
            {stage === "lobby" && (
              <Lobby
                code={code}
                players={players}
                addBot={addBot}
                minPlayers={minPlayers}
                onBegin={() => setStage("question")}
              />
            )}
            {stage === "question" && (
              <QuestionStage
                q={q}
                idx={current}
                total={questionSet.length}
                secsLeft={secsLeft}
                duration={duration}
                players={players}
                setPlayers={setPlayers}
                onTimeUp={() => finalizeQuestion()}
              />
            )}
            {stage === "leaderboard" && (
              <Leaderboard players={players} q={q} onNext={nextQuestion} idx={current} total={questionSet.length} />
            )}
            {stage === "summary" && (
              <Summary players={players} questionSet={questionSet} onReplay={() => { setCurrent(0); setPlayers(p => p.map(pl => ({...pl, score:0, streak:0, alive:true }))); setStage("setup"); }} />
            )}
          </div>
        </div>

        {/* Right: Student preview & class analytics */}
        <div className="space-y-6">
          <StudentPreview player={focusPlayer} stage={stage} q={q} secsLeft={secsLeft} />
          <ClassStats players={players} />
        </div>
      </div>

      <footer className="mt-8 text-center text-xs text-slate-400">
        Monster Arena · LM Teacher View Mockup · React + Tailwind
      </footer>
    </div>
  );
}

// ----- Header -----
function Header({ code, visible, onToggle, isLive, setIsLive }: { code: string; visible: boolean; onToggle: () => void; isLive: boolean; setIsLive: (b:boolean)=>void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex items-center gap-3">
        <Rocket className="h-5 w-5 text-fuchsia-300" />
        <h1 className="text-lg font-semibold tracking-wide">Monster Arena: Host</h1>
        <span className="ml-2 text-xs text-slate-400">Live classroom battle</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-1.5 text-sm">
          <span className="text-slate-400">Join code:</span>
          <code className={`font-mono ${visible ? "text-white" : "blur-sm"}`}>{code}</code>
          <button onClick={onToggle} className="rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/15">
            {visible ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
          </button>
          <button onClick={() => navigator.clipboard.writeText(code)} className="rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/15">
            <Copy className="h-4 w-4"/>
          </button>
        </div>
        <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm ${isLive ? "bg-emerald-400/10 text-emerald-300" : "bg-white/5 text-slate-300"}`}>
          <span className="hidden sm:block">Go Live</span>
          <button onClick={()=>setIsLive(!isLive)} className={`h-6 w-10 rounded-full ${isLive?"bg-emerald-500":"bg-slate-600"} relative`}>
            <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${isLive?"right-1":"left-1"}`}></span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ----- Setup Screen -----
function Setup({ questionSet, onUpload, loadingUpload, duration, setDuration, players, addBot, removeLast, minPlayers, onStart }: any) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Settings className="h-5 w-5 text-fuchsia-300"/> Game Setup</h2>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-4">
          <div>
            <label className="text-sm text-slate-300">Question set</label>
            <div className="mt-2 flex items-center gap-3">
              <span className="rounded-lg bg-white/10 px-3 py-2 text-sm">Loaded: <strong>{questionSet.length}</strong> questions</span>
              <label className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm cursor-pointer hover:bg-white/15">
                <Upload className="h-4 w-4"/>
                <span>Upload JSON</span>
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e)=> onUpload(e.target.files?.[0])}
                />
              </label>
              {loadingUpload && <Loader2 className="h-4 w-4 animate-spin text-slate-300"/>}
            </div>
            <p className="mt-2 text-xs text-slate-400">Format: <code>[{`{question, choices:[..], correctIndex}`}]</code></p>
          </div>
          <div>
            <label className="text-sm text-slate-300">Time per question</label>
            <div className="mt-2 flex items-center gap-3">
              <button onClick={()=> setDuration((d:number)=> Math.max(8, d-2))} className="rounded-lg bg-white/10 p-2 hover:bg-white/15"><Minus className="h-4 w-4"/></button>
              <span className="w-16 text-center rounded-lg bg-white/10 py-2 text-sm">{duration}s</span>
              <button onClick={()=> setDuration((d:number)=> Math.min(45, d+2))} className="rounded-lg bg-white/10 p-2 hover:bg-white/15"><Plus className="h-4 w-4"/></button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Users className="h-5 w-5 text-fuchsia-300"/> Players</h2>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">Minimum required: <strong>{minPlayers}</strong></p>
            <div className="flex items-center gap-2">
              <button onClick={addBot} className="rounded-xl bg-emerald-500/20 px-3 py-1.5 text-sm hover:bg-emerald-500/30"><UserPlus className="h-4 w-4 inline mr-1"/>Add Bot</button>
              <button onClick={removeLast} disabled={!players.length} className="rounded-xl bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15 disabled:opacity-40">Remove</button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {players.map((p: Player) => (
              <div key={p.id} className="rounded-xl bg-white/5 p-3 flex items-center gap-2">
                <MonsterAvatar name={p.name} color={p.color} />
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-slate-400">Score {p.score}</p>
                </div>
              </div>
            ))}
            {players.length < minPlayers && (
              <div className="col-span-full text-xs text-amber-300/90 bg-amber-500/10 rounded-xl p-2">
                Need {minPlayers - players.length} more to start. Use <em>Add Bot</em> to demo.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onStart}
            disabled={players.length < minPlayers}
            className="inline-flex items-center gap-2 rounded-2xl bg-fuchsia-600 px-5 py-2.5 font-semibold shadow-lg hover:bg-fuchsia-500 disabled:opacity-40"
          >
            <Play className="h-5 w-5"/> Host Lobby
          </button>
        </div>
      </div>
    </div>
  );
}

// ----- Lobby -----
function Lobby({ code, players, addBot, minPlayers, onBegin }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Users className="h-5 w-5 text-fuchsia-300"/> Lobby</h2>
        <div className="text-sm text-slate-300">Join at <span className="font-mono bg-white/10 px-2 py-1 rounded">LM.app</span> with code <span className="font-mono bg-white/10 px-2 py-1 rounded">{code}</span></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {players.map((p: Player) => (
          <div key={p.id} className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-4 flex flex-col items-center">
            <MonsterAvatar name={p.name} color={p.color} size={56} mood="happy" />
            <p className="mt-2 text-sm font-medium">{p.name}</p>
          </div>
        ))}
        {players.length < minPlayers && (
          <button onClick={addBot} className="rounded-2xl border border-dashed border-white/20 p-4 text-slate-400 hover:bg-white/5">+ Add Bot</button>
        )}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">Tip: Start when everyone’s in. You can still add bots.</p>
        <button onClick={onBegin} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-2 font-semibold hover:bg-emerald-400"><Zap className="h-4 w-4"/> Start Round</button>
      </div>
    </div>
  );
}

// ----- Question Stage -----
function QuestionStage({ q, idx, total, secsLeft, duration, players, setPlayers, onTimeUp }: any) {
  const percent = Math.max(0, Math.min(100, (secsLeft / duration) * 100));
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-300"><BookOpen className="h-4 w-4"/> Question {idx+1}/{total}</div>
        <div className="flex items-center gap-2 text-sm">
          <TimerReset className="h-4 w-4 text-fuchsia-300"/>
          <div className="w-56 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-2 bg-fuchsia-500" style={{ width: `${percent}%` }} />
          </div>
          <span className="w-10 text-right">{secsLeft}s</span>
        </div>
      </div>
      <h3 className="text-2xl md:text-3xl font-bold leading-snug">{q.question}</h3>
      <div className="grid md:grid-cols-2 gap-3 mt-2">
        {q.choices.map((c: string, i: number) => (
          <button
            key={i}
            onClick={() => {/* Teacher can click to preview; host doesn’t answer */}}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left hover:bg-white/10"
          >
            <span className="font-semibold mr-2">{String.fromCharCode(65+i)}.</span> {c}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-white/5 p-3">
        <p className="text-xs text-slate-400 mb-2">Live answers</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {players.map((p: Player) => (
            <div key={p.id} className="flex items-center gap-2 rounded-xl bg-white/5 px-2 py-1">
              <MonsterAvatar name={p.name} color={p.color} size={28} mood={p.answered==null?"idle": (p.answered===q.correctIndex?"happy":"hurt")} />
              <div className="text-xs">
                <p className="font-medium leading-4">{p.name}</p>
                <p className="text-slate-400">{p.answered==null?"…": `→ ${String.fromCharCode(65+(p.answered||0))}`}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onTimeUp} className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15"><RefreshCcw className="h-4 w-4 inline mr-1"/> End Now</button>
      </div>
    </div>
  );
}

// ----- Leaderboard -----
function Leaderboard({ players, q, onNext, idx, total }: any) {
  const sorted = [...players].sort((a,b)=> b.score - a.score).slice(0, 8);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2"><BarChart3 className="h-5 w-5 text-fuchsia-300"/> Leaderboard</h2>
        <span className="text-xs text-slate-400">Correct answer: <span className="font-mono bg-white/10 px-2 py-1 rounded">{String.fromCharCode(65 + q.correctIndex)}</span></span>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {sorted.map((p: Player, i: number) => (
          <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
            <div className="w-6 text-right text-slate-400">{i+1}</div>
            <MonsterAvatar name={p.name} color={p.color} />
            <div className="flex-1">
              <p className="font-medium">{p.name}</p>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-2 bg-fuchsia-500" style={{ width: `${Math.min(100, p.score/2)}%` }} />
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono">{p.score}</p>
              <p className="text-xs text-slate-400">streak {p.streak}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <button onClick={onNext} className="inline-flex items-center gap-2 rounded-2xl bg-fuchsia-600 px-5 py-2.5 font-semibold shadow-lg hover:bg-fuchsia-500">
          {idx < total-1 ? (<><Play className="h-4 w-4"/> Next Question</>) : (<><Trophy className="h-4 w-4"/> View Summary</>)}
        </button>
      </div>
    </div>
  );
}

// ----- Summary -----
function Summary({ players, questionSet, onReplay }: any) {
  const winners = [...players].sort((a,b)=> b.score - a.score).slice(0,3);
  const totalScore = players.reduce((s:number,p:Player)=> s + p.score, 0);
  const avg = Math.round(totalScore / Math.max(1, players.length));
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-300"/> Round Summary</h2>
      <div className="grid lg:grid-cols-3 gap-4">
        {winners.map((w: Player, i: number) => (
          <div key={w.id} className="rounded-2xl bg-gradient-to-br from-yellow-400/10 to-white/5 p-4 border border-yellow-400/20">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{i===0?"🥇":i===1?"🥈":"🥉"}</div>
              <MonsterAvatar name={w.name} color={w.color} size={56} mood="happy"/>
              <div>
                <p className="font-semibold text-lg">{w.name}</p>
                <p className="text-slate-300">Score {w.score} · Streak {w.streak}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white/5 p-4">
        <p className="text-sm text-slate-300 mb-2">Class stats</p>
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <Stat label="Players" value={players.length} />
          <Stat label="Questions" value={questionSet.length} />
          <Stat label="Avg Score" value={avg} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15"><Save className="h-4 w-4 inline mr-1"/> Export to Planner</button>
        <button onClick={onReplay} className="rounded-2xl bg-fuchsia-600 px-5 py-2.5 font-semibold shadow-lg hover:bg-fuchsia-500"><RefreshCcw className="h-4 w-4 inline mr-1"/> Replay</button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number|string }) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <p className="text-slate-400 text-xs">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

// ----- Student Preview -----
function StudentPreview({ player, stage, q, secsLeft }: any) {
  if (!player) return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-300">Student Preview</p>
      <p className="text-xs text-slate-400">Add at least one player to see the student UI.</p>
    </div>
  );
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-300">Student Preview</p>
        <span className="text-xs text-slate-400">{stage}</span>
      </div>
      <div className="mt-3 rounded-2xl bg-black/30 p-4">
        <div className="flex items-center gap-3">
          <MonsterAvatar name={player.name} color={player.color} size={52} mood={stage==="question"?"charge":"happy"} />
          <div>
            <p className="font-semibold">{player.name}</p>
            <p className="text-xs text-slate-400">Your LM is ready!</p>
          </div>
        </div>
        {stage === "question" && q && (
          <div className="mt-3">
            <p className="text-sm text-slate-300">{q.question}</p>
            <ul className="mt-2 space-y-2">
              {q.choices.map((c: string, i: number) => (
                <li key={i} className="rounded-xl bg-white/10 px-3 py-2 text-sm">{String.fromCharCode(65+i)}. {c}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-slate-400">Time left: {secsLeft}s</p>
          </div>
        )}
        {stage !== "question" && (
          <p className="mt-3 text-xs text-slate-400">Waiting for host…</p>
        )}
      </div>
    </div>
  );
}

// ----- Class Stats -----
function ClassStats({ players }: { players: Player[] }) {
  const top3 = [...players].sort((a,b)=>b.score-a.score).slice(0,3);
  const avg = players.length ? Math.round(players.reduce((s,p)=>s+p.score,0)/players.length) : 0;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-fuchsia-300"/><p className="font-semibold">Class Analytics</p></div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs text-slate-400">Players</p>
          <p className="text-lg font-semibold">{players.length}</p>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs text-slate-400">Avg Score</p>
          <p className="text-lg font-semibold">{avg}</p>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs text-slate-400">Top Streak</p>
          <p className="text-lg font-semibold">{Math.max(0, ...players.map(p=>p.streak))}</p>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {top3.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2 rounded-xl bg-white/5 p-2">
            <div className="w-6 text-right text-slate-400">{i+1}</div>
            <MonsterAvatar name={p.name} color={p.color} />
            <div className="flex-1 text-sm">{p.name}</div>
            <div className="font-mono">{p.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
