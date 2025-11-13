import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// === LM Sparkle Snake — Dark Mode, Dyslexia-friendly ===
// - LM mascot bounces at top center with soft glow and sparkle effect

const CELL = 20;
const COLS = 20;
const ROWS = 20;
const WIDTH = COLS * CELL;
const HEIGHT = ROWS * CELL;
const START_SPEED_MS = 220;
const MIN_SPEED_MS = 90;
const SPEED_STEP = 6;
const DIRS = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
  w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
};
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function useInterval(callback, delay) {
  const savedRef = useRef();
  useEffect(() => { savedRef.current = callback; }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedRef.current && savedRef.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
function nextFood(snake) {
  while (true) {
    const fx = randInt(0, COLS - 1), fy = randInt(0, ROWS - 1);
    if (!snake.some(([x, y]) => x === fx && y === fy)) return [fx, fy];
  }
}
function outOfBounds(x, y) { return x < 0 || x >= COLS || y < 0 || y >= ROWS; }
function drawGrid(ctx) {
  ctx.save();
  const grd = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  grd.addColorStop(0, "#0b0f17"); grd.addColorStop(1, "#0e1220");
  ctx.fillStyle = grd; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = "rgba(120,130,180,0.15)";
  for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL + 0.5, 0); ctx.lineTo(x * CELL + 0.5, HEIGHT); ctx.stroke(); }
  for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL + 0.5); ctx.lineTo(WIDTH, y * CELL + 0.5); ctx.stroke(); }
  ctx.strokeStyle = "#6d9cff"; ctx.lineWidth = 4; ctx.shadowBlur = 10; ctx.shadowColor = "#6d9cff"; ctx.strokeRect(2, 2, WIDTH - 4, HEIGHT - 4);
  ctx.restore();
}
function drawCell(ctx, x, y, color, glow = color) {
  const px = x * CELL, py = y * CELL; ctx.save(); ctx.fillStyle = color; ctx.shadowColor = glow; ctx.shadowBlur = 12; ctx.fillRect(px + 2, py + 2, CELL - 4, CELL - 4); ctx.restore();
}
function drawFood(ctx, x, y) {
  const px = x * CELL + CELL / 2, py = y * CELL + CELL / 2;
  ctx.save(); ctx.beginPath(); ctx.fillStyle = "#89f7a1"; ctx.shadowColor = "#89f7a1"; ctx.shadowBlur = 16; ctx.arc(px, py, CELL * 0.33, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

export default function LMSparkleSnake() {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([[5, 5]]);
  const [dir, setDir] = useState([1, 0]);
  const [nextDir, setNextDir] = useState([1, 0]);
  const [food, setFood] = useState(nextFood([[5, 5]]));
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(START_SPEED_MS);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [bubbleMsg, setBubbleMsg] = useState("Let’s roll!");
  const MONSTER_IMG = "https://cdn.jsdelivr.net/gh/enchanted-blue/assets/lm_pink_monster.png";

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key;
      if (k === " " || k === "Spacebar") {
        e.preventDefault();
        setRunning(r => !r);
        setBubbleMsg(m => (m === "Paused" ? "Let’s roll!" : "Paused"));
        return;
      }
      if (k in DIRS) {
        const [dx, dy] = DIRS[k];
        const [cx, cy] = dir;
        if (dx !== -cx || dy !== -cy) setNextDir([dx, dy]);
      }
      if (k === "Enter" && gameOver) restart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dir, gameOver]);

  useInterval(() => {
    if (!running || gameOver) return;
    setSnake(prev => {
      const [dx, dy] = nextDir; setDir([dx, dy]);
      const head = prev[prev.length - 1]; const nx = head[0] + dx, ny = head[1] + dy;
      if (outOfBounds(nx, ny)) { setGameOver(true); setRunning(false); setBest(b => Math.max(b, score)); setBubbleMsg("Ouch! Wall!"); return prev; }
      if (prev.some(([x, y]) => x === nx && y === ny)) { setGameOver(true); setRunning(false); setBest(b => Math.max(b, score)); setBubbleMsg("Ouch! Try again?"); return prev; }
      const grown = [...prev, [nx, ny]];
      if (nx === food[0] && ny === food[1]) { setFood(nextFood(grown)); setScore(s => s + 1); setSpeed(ms => Math.max(MIN_SPEED_MS, ms - SPEED_STEP)); setBubbleMsg("Yum! +1"); return grown; }
      grown.shift(); return grown;
    });
  }, speed);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    drawGrid(ctx); drawFood(ctx, food[0], food[1]); snake.forEach(([x, y], i) => drawCell(ctx, x, y, i === snake.length - 1 ? "#f5c6ff" : "#a78bfa", "#a78bfa"));
  }, [snake, food, gameOver]);

  const restart = () => { setSnake([[5, 5]]); setDir([1, 0]); setNextDir([1, 0]); setFood(nextFood([[5, 5]])); setRunning(true); setSpeed(START_SPEED_MS); setScore(0); setGameOver(false); setBubbleMsg("Let’s roll!"); };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b12] text-white relative p-4 overflow-hidden" style={{ fontFamily: 'OpenDyslexic, Verdana, Trebuchet MS, Helvetica, Arial, sans-serif' }}>
      {/* Floating LM mascot with glow + bounce */}
      <motion.div initial={{ y: -10 }} animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 select-none">
        <div className="max-w-[200px] bg-slate-900/80 border border-fuchsia-400/30 rounded-2xl px-3 py-2 shadow-[0_0_20px_rgba(236,72,153,0.4)] text-sm leading-5 text-center">
          {bubbleMsg}
        </div>
        <div className="relative w-20 h-20 rounded-full overflow-hidden border border-fuchsia-500 shadow-[0_0_40px_rgba(236,72,153,0.6)] bg-slate-800/60 grid place-items-center">
          <motion.img src={MONSTER_IMG} alt="Little Monster" className="object-contain w-full h-full" animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} />
          <div className="absolute inset-0 rounded-full bg-fuchsia-500/10 blur-xl" />
        </div>
      </motion.div>

      <div className="w-full max-w-[900px] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-wide">LM Sparkle Snake</h1>
          <div className="flex items-center gap-3 text-sm">
            <div className="px-3 py-1 rounded-xl bg-slate-800/70 border border-slate-700">Score: <b>{score}</b></div>
            <div className="px-3 py-1 rounded-xl bg-slate-800/70 border border-slate-700">Best: <b>{Math.max(best, score)}</b></div>
            <button onClick={() => setRunning(r => !r)} className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500">{running ? "Pause" : "Resume"}</button>
            <button onClick={restart} className="px-3 py-1 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500">Restart</button>
          </div>
        </div>
        <div className="relative mx-auto">
          <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="rounded-3xl border-2 border-slate-700 shadow-[0_0_40px_rgba(109,156,255,0.2)]" />
        </div>
      </div>
    </div>
  );
}
