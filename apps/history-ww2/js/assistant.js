/**
 * Assistant Module - LM mascot with speech bubble and fun facts
 */

const AssistantManager = {
  bubble: null,
  bubbleText: null,
  avatar: null,
  currentFactIndex: 0,
  autoShowTimer: null,
  
  funFacts: [
    "Did you know? The shortest serving soldier in WWII was just 12 years old!",
    "WWII tanks could go up to 30 mph. Today's tanks can reach 45 mph!",
    "The code-breakers at Bletchley Park shortened the war by an estimated 2 years!",
    "Carrier pigeons delivered 95% of their messages successfully during WWII!",
    "The Battle of Stalingrad involved more participants than any other battle in history!",
    "WWII was the deadliest conflict in human history with 70-85 million casualties.",
    "The US built a Liberty ship every 42 days on average during WWII!",
    "Women played crucial roles: pilots, code-breakers, factory workers, and more!",
    "The Enigma machine had 159 quintillion possible settings!",
    "D-Day required 5,000 ships and 11,000 aircraft!",
    "The Battle of Midway turned the tide in the Pacific after just 3 days!",
    "The Manhattan Project cost $2 billion (equivalent to $30 billion today)!",
    "Over 16 million Americans served in WWII out of a population of 130 million.",
    "The Soviet Union lost more people in WWII than any other nation - 27 million!",
    "Rosie the Riveter became an icon representing women in the workforce!",
    "The longest battle of WWII was the Battle of the Atlantic (1939-1945).",
    "Tokyo Rose and Axis Sally broadcast propaganda to Allied troops.",
    "The cost of WWII was over $1 trillion (in 1940s dollars)!",
    "Penicillin mass production during WWII saved countless lives.",
    "RADAR technology was crucial in detecting enemy aircraft!"
  ],
  
  /**
   * Initialize assistant
   */
  init() {
    this.bubble = document.getElementById('assistantBubble');
    this.bubbleText = document.getElementById('bubbleText');
    this.avatar = document.getElementById('assistantAvatar');
    
    if (!this.bubble || !this.avatar) return;
    
    this.bindEvents();
    this.showWelcomeMessage();
    this.setupAutoShow();
  },
  
  /**
   * Bind event listeners
   */
  bindEvents() {
    // Click avatar to show random fact
    this.avatar.addEventListener('click', () => {
      this.showRandomFact();
    });
    
    // Keyboard support
    this.avatar.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.showRandomFact();
      }
    });
    
    // Listen to timeline scroll for auto-facts
    window.addEventListener('timelineProgress', (e) => {
      this.handleTimelineScroll(e.detail);
    });
  },
  
  /**
   * Show welcome message
   */
  showWelcomeMessage() {
    setTimeout(() => {
      this.showMessage("Welcome to WWII History! Click countries and events to learn more! 🌍", 4000);
    }, 1000);
  },
  
  /**
   * Show random fun fact
   */
  showRandomFact() {
    const fact = this.funFacts[this.currentFactIndex];
    this.showMessage(fact, 6000);
    this.currentFactIndex = (this.currentFactIndex + 1) % this.funFacts.length;
  },
  
  /**
   * Show custom message
   */
  showMessage(message, duration = 5000) {
    if (!this.bubble || !this.bubbleText) return;
    
    this.bubbleText.textContent = message;
    this.bubble.classList.add('show');
    
    // Clear existing timer
    if (this.autoShowTimer) {
      clearTimeout(this.autoShowTimer);
    }
    
    // Auto-hide after duration
    this.autoShowTimer = setTimeout(() => {
      this.bubble.classList.remove('show');
    }, duration);
  },
  
  /**
   * Hide bubble
   */
  hideBubble() {
    if (this.bubble) {
      this.bubble.classList.remove('show');
    }
    if (this.autoShowTimer) {
      clearTimeout(this.autoShowTimer);
    }
  },
  
  /**
   * Setup auto-show on scroll
   */
  setupAutoShow() {
    let lastScrollTime = Date.now();
    let lastProgress = 0;
    
    window.addEventListener('timelineProgress', (e) => {
      const now = Date.now();
      const { progress } = e.detail;
      
      // Show fact every 10 seconds of scrolling or every 25% progress
      const timeDiff = now - lastScrollTime;
      const progressDiff = Math.abs(progress - lastProgress);
      
      if (timeDiff > 10000 || progressDiff > 25) {
        this.showRandomFact();
        lastScrollTime = now;
        lastProgress = progress;
      }
    });
  },
  
  /**
   * Handle timeline scroll
   */
  handleTimelineScroll(detail) {
    // Could add year-specific facts here
    // For now, handled by setupAutoShow
  },
  
  /**
   * React to filter changes
   */
  reactToFilters(filterSummary) {
    // Show filter summary when filters change
    if (filterSummary !== 'Showing all events') {
      this.showMessage(filterSummary, 3000);
    }
  },
  
  /**
   * Show event-related fact
   */
  showEventFact(event) {
    if (event.facts && event.facts.length > 0) {
      const randomFact = event.facts[Math.floor(Math.random() * event.facts.length)];
      this.showMessage(`💡 ${event.title}: ${randomFact}`, 5000);
    }
  },
  
  /**
   * Speak message (Web Speech API if available)
   */
  speak(message) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AssistantManager;
}
