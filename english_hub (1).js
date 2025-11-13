import React, { useState, useEffect } from "react";

/**
 * LM English Hub
 *
 * This React component renders a simple hub for English learning tools. It is
 * designed with dark mode aesthetics inspired by the LM project. The layout
 * features a header, a vertical navigation bar for switching between tools,
 * and a main content area. Notes persist to localStorage so they survive
 * across sessions. Other tools display placeholder content to be filled in
 * once back‑end APIs are available.
 */
export default function EnglishHub() {
  // Track which tab is active. Default to the Notes tab on initial load.
  const [activeTab, setActiveTab] = useState("notes");

  // Notes state is persisted to localStorage. When the component mounts,
  // hydrate the state from localStorage if a value exists. Whenever the
  // notes change, update localStorage accordingly.
  const [notes, setNotes] = useState("");
  useEffect(() => {
    const saved = localStorage.getItem("englishHubNotes");
    if (saved !== null) setNotes(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("englishHubNotes", notes);
  }, [notes]);

  // Define the available tabs for the navigation. Each tab has a key used for
  // state and a human‑readable label. This makes it easy to map over the
  // array when rendering the buttons.
  const tabs = [
    { key: "notes", label: "Notes" },
    { key: "grammar", label: "Grammar" },
    { key: "essay", label: "Essay Prompter" },
    { key: "dictionary", label: "Dictionary" },
    { key: "synonyms", label: "Synonyms / Antonyms" },
    { key: "vocab", label: "Vocab Maker" },
  ];

  /**
   * Render content specific to the currently active tab. For all tools
   * except notes, we display informational placeholders explaining what
   * functionality will eventually live in that area. The notes section
   * renders a textarea bound to state for user input.
   */
  const renderContent = () => {
    switch (activeTab) {
      case "notes":
        return (
          <textarea
            className="w-full h-full bg-gray-800 text-gray-200 p-4 rounded-lg border border-gray-700 resize-none focus:outline-none focus:ring focus:ring-purple-500"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type your notes here..."
          />
        );
      case "grammar":
        return (
          <div className="text-gray-300 space-y-2 p-4">
            <h2 className="text-2xl font-semibold">Grammar Checker</h2>
            <p>
              Paste your text here to check for grammar errors. This feature
              will allow you to identify and correct grammar, punctuation,
              and spelling mistakes. Integration with a grammar API is
              coming soon!
            </p>
          </div>
        );
      case "essay":
        return (
          <div className="text-gray-300 space-y-2 p-4">
            <h2 className="text-2xl font-semibold">Essay Prompter</h2>
            <p>
              Generate creative essay prompts and outlines to inspire your
              writing. You will be able to specify genres, topics, and
              difficulty levels. Coming soon!
            </p>
          </div>
        );
      case "dictionary":
        return (
          <div className="text-gray-300 space-y-2 p-4">
            <h2 className="text-2xl font-semibold">Dictionary</h2>
            <p>
              Look up definitions, pronunciations, and usage examples for
              English words. A dictionary API will power this feature in a
              future update.
            </p>
          </div>
        );
      case "synonyms":
        return (
          <div className="text-gray-300 space-y-2 p-4">
            <h2 className="text-2xl font-semibold">Synonyms & Antonyms</h2>
            <p>
              Discover synonyms and antonyms to expand your vocabulary. This
              tool will help you find alternative words for improved
              expression. Coming soon!
            </p>
          </div>
        );
      case "vocab":
        return (
          <div className="text-gray-300 space-y-2 p-4">
            <h2 className="text-2xl font-semibold">Vocabulary Builder</h2>
            <p>
              Create and study custom vocabulary lists. You’ll be able to
              add words, definitions, and practice with flashcards. This
              feature will be available in a future release.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 p-6 shadow-md">
        <h1 className="text-3xl font-bold text-white">LM English Hub</h1>
        <p className="text-sm text-purple-100 mt-1">Your all‑in‑one English study companion</p>
      </header>

      {/* Main layout: sidebar + content */}
      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar navigation */}
        <nav className="w-64 bg-gray-800 p-4 space-y-2 overflow-y-auto border-r border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors focus:outline-none ${
                activeTab === tab.key
                  ? "bg-gray-700 text-white font-semibold shadow-inner"
                  : "hover:bg-gray-700 hover:text-white"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content area */}
        <main className="flex-grow p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Assistant bubble */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6">
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-xl shadow-xl text-sm text-gray-300 max-w-xs animate-bounce">
          <p>Hi! Need help? I'm your LM assistant 😊</p>
        </div>
      </div>
    </div>
  );
}