import React, { useMemo, useState } from "react";

// --- Subject decks (starter data; extend anytime) ---
const SUBJECT_DECKS = {
  Math: [
    { id: "m1", front: "What is 2 + 2?", back: "4" },
    { id: "m2", front: "Derivative of x^2?", back: "2x" },
    { id: "m3", front: "Solve: 3x = 12", back: "x = 4" },
  ],
  Science: [
    { id: "s1", front: "H2O is known as…", back: "Water" },
    { id: "s2", front: "Unit of force?", back: "Newton (N)" },
    { id: "s3", front: "Gas responsible for photosynthesis input?", back: "CO₂" },
  ],
  History: [
    { id: "h1", front: "Capital of France?", back: "Paris" },
    { id: "h2", front: "Year the U.S. declared independence?", back: "1776" },
    { id: "h3", front: "Renaissance city famous for art & banking?", back: "Florence" },
  ],
  English: [
    { id: "e1", front: "Define simile.", back: "A comparison using 'like' or 'as'." },
    { id: "e2", front: "Opposite of a protagonist?", back: "Antagonist" },
    { id: "e3", front: "What is a thesis?", back: "A paper's main claim/argument." },
  ],
};

// --- LM Avatar (inline SVG, happy & supportive) ---
function LMCoach({ mood = "neutral", message }) {
  const eyeY = mood === "happy" ? 0 : mood === "thinking" ? 2 : 1;
  const mouth = mood === "happy" ? "M10 22 Q16 28 22 22" : mood === "thinking" ? "M10 24 L22 24" : "M10 24 Q16 20 22 24";
  return (
    <div className="fixed bottom-4 right-4 flex items-end gap-3 select-none">
      <div className="max-w-xs bg-white border border-pink-300 shadow-lg rounded-2xl p-3 text-sm text-gray-700">
        {message}
      </div>
      <div className="w-20 h-20 bg-pink-200 border border-pink-300 rounded-full grid place-items-center shadow-md">
        <svg viewBox="0 0 32 32" className="w-14 h-14">
          <defs>
            <linearGradient id="lg" x1="0" x2="1">
              <stop offset="0%" stopColor="#ffb3d6" />
              <stop offset="100%" stopColor="#ffd8e9" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="15" fill="url(#lg)" stroke="#f472b6"/>
          <circle cx="11" cy={12 + eyeY} r="2" fill="#1f2937"/>
          <circle cx="21" cy={12 + eyeY} r="2" fill="#1f2937"/>
          <path d={mouth} stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M6 8 Q8 4 12 6" stroke="#f472b6" fill="none"/>
          <path d="M20 6 Q24 4 26 8" stroke="#f472b6" fill="none"/>
        </svg>
      </div>
    </div>
  );
}

function Pill({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full border transition ${
        active
          ? "bg-pink-500 text-white border-pink-500 shadow"
          : "bg-white text-gray-700 border-gray-300 hover:border-pink-400"
      }`}
    >
      {children}
    </button>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className="h-2 bg-pink-500 rounded-full transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}

export default function LMFlashcardsHub() {
  const subjects = Object.keys(SUBJECT_DECKS);
  const [subject, setSubject] = useState(subjects[0]);
  const [showBack, setShowBack] = useState(false);
  const [index, setIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [lastRating, setLastRating] = useState(null); // "got" | "not" | null

  // knowledge: { [cardId]: "got" | "not" }
  const [knowledge, setKnowledge] = useState({});

  // Build current deck with optional review filter
  const fullDeck = SUBJECT_DECKS[subject];
  const reviewIds = useMemo(
    () => fullDeck.map(c => c.id).filter(id => knowledge[id] === "not"),
    [fullDeck, knowledge]
  );

  const workingDeck = reviewMode ? fullDeck.filter(c => reviewIds.includes(c.id)) : fullDeck;
  const emptyReview = reviewMode && workingDeck.length === 0;

  // Clamp index safely when deck changes
  const safeIndex = workingDeck.length === 0 ? 0 : Math.min(index, workingDeck.length - 1);
  const current = workingDeck[safeIndex];

  const progress = workingDeck.length
    ? ((safeIndex + 1) / workingDeck.length) * 100
    : 0;

  const resetDeck = () => {
    setShowBack(false);
    setIndex(0);
    setLastRating(null);
  };

  const changeSubject = (s) => {
    setSubject(s);
    setReviewMode(false);
    resetDeck();
  };

  const nextCard = () => {
    if (!workingDeck.length) return;
    setShowBack(false);
    setIndex((i) => (i + 1) % workingDeck.length);
  };

  const rate = (val) => {
    if (!current) return;
    setKnowledge((k) => ({ ...k, [current.id]: val }));
    setLastRating(val);
    nextCard();
  };

  const resetProgress = () => setKnowledge({});

  const lmMessage = (() => {
    if (emptyReview) return "No cards to review — nice! Switch off Review to study the full deck.";
    if (lastRating === "not") return "It’s okay if you don’t know it yet. We’ll get it together — I’m proud of you for trying. 💪";
    if (lastRating === "got") return "Nice! Locked in. Keep the streak going, Ella ✨";
    return "Tap the card to flip. Then tell me if you ‘Got it’ or ‘Not yet’. I’ve got you.";
  })();

  const lmMood = lastRating === "not" ? "happy" : lastRating === "got" ? "thinking" : "neutral";

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-pink-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-pink-200 border border-pink-300 grid place-items-center">
              <span className="text-pink-600 font-bold">LM</span>
            </div>
            <h1 className="text-xl font-semibold">Flashcards Hub</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReviewMode(v => !v)}
              className={`px-3 py-2 rounded-lg border transition ${reviewMode ? "bg-pink-500 text-white border-pink-500" : "bg-white border-gray-300 hover:border-pink-400"}`}
            >
              {reviewMode ? "Review: ON" : "Review: OFF"}
            </button>
            <button onClick={resetProgress} className="px-3 py-2 rounded-lg border bg-white hover:border-pink-400">
              Reset Progress
            </button>
          </div>
        </div>
      </header>

      {/* Subject pills */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <Pill key={s} active={s === subject} onClick={() => changeSubject(s)}>
              {s}
            </Pill>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-8 grid gap-6 md:grid-cols-[1fr_340px]">
        {/* Study Card */}
        <section className="bg-white border border-pink-100 rounded-2xl shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">Subject: <span className="font-medium text-gray-700">{subject}</span></div>
            <div className="w-48"><ProgressBar value={progress} /></div>
          </div>

          {emptyReview ? (
            <div className="flex-1 grid place-items-center text-center p-8">
              <div>
                <p className="text-lg font-medium mb-2">Nothing to review 🎉</p>
                <p className="text-gray-600">You’ve marked everything as known. Switch off Review to keep practicing or change subjects.</p>
              </div>
            </div>
          ) : (
            <>
              <div
                className={`flex-1 grid place-items-center mb-6`}
              >
                {current && (
                  <div
                    onClick={() => setShowBack((v) => !v)}
                    className="w-full max-w-xl bg-white border border-pink-200 rounded-2xl shadow-md p-10 text-center cursor-pointer transition-transform hover:scale-[1.01]"
                  >
                    <h3 className="text-2xl font-semibold">
                      {showBack ? current.back : current.front}
                    </h3>
                    <p className="text-sm mt-3 text-gray-500">
                      {showBack ? "Tap to view question" : "Tap to view answer"}
                    </p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => rate("not")}
                  className="px-4 py-3 rounded-xl border bg-white hover:border-pink-400"
                >
                  Not yet 😕
                </button>
                <button
                  onClick={() => rate("got")}
                  className="px-4 py-3 rounded-xl bg-pink-500 text-white shadow hover:bg-pink-600"
                >
                  Got it 👍
                </button>
                <button
                  onClick={() => setShowBack((v) => !v)}
                  className="px-4 py-3 rounded-xl border bg-white hover:border-pink-400"
                >
                  Flip
                </button>
                <button onClick={() => nextCard()} className="px-4 py-3 rounded-xl border bg-white hover:border-pink-400">
                  Next →
                </button>
              </div>
            </>
          )}
        </section>

        {/* Sidebar: Stats + Queue */}
        <aside className="bg-white border border-pink-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Progress</h2>
          <ul className="text-sm space-y-1 mb-4">
            {(() => {
              const ids = fullDeck.map(c => c.id);
              const got = ids.filter(id => knowledge[id] === "got").length;
              const noty = ids.filter(id => knowledge[id] === "not").length;
              const unk = ids.length - got - noty;
              return (
                <>
                  <li><span className="font-medium">Known:</span> {got}</li>
                  <li><span className="font-medium">Not yet:</span> {noty}</li>
                  <li><span className="font-medium">Unseen:</span> {unk}</li>
                </>
              );
            })()}
          </ul>

          <h3 className="text-sm font-medium text-gray-600 mb-2">{reviewMode ? "Review Queue" : "Deck Order"}</h3>
          <div className="max-h-56 overflow-auto rounded-lg border">
            {(reviewMode ? workingDeck : fullDeck).map((c, i) => (
              <div
                key={c.id}
                className={`px-3 py-2 text-sm flex items-center justify-between border-b last:border-b-0 ${i === safeIndex && reviewMode ? "bg-pink-50" : ""}`}
              >
                <span className="truncate">{c.front}</span>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full border ${
                  knowledge[c.id] === "got"
                    ? "bg-green-50 border-green-300 text-green-700"
                    : knowledge[c.id] === "not"
                    ? "bg-amber-50 border-amber-300 text-amber-700"
                    : "bg-gray-50 border-gray-300 text-gray-600"
                }`}>
                  {knowledge[c.id] ?? "new"}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </main>

      <LMCoach mood={lmMood} message={lmMessage} />
    </div>
  );
}
