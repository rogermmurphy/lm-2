/**
 * Main App Module - Coordinates all other modules
 */

const App = {
  modal: null,
  modalContent: null,
  
  /**
   * Initialize the application
   */
  async init() {
    // Load data first
    const loaded = await DataManager.loadAll();
    if (!loaded) {
      console.error('Failed to load data');
      return;
    }
    
    // Initialize all modules
    this.initModal();
    this.initModeToggle();
    this.initFilters();
    MapManager.init('mapContainer');
    TimelineManager.init('timelineContainer');
    AssistantManager.init();
    
    console.log('🌍 WWII History Hub initialized');
  },
  
  /**
   * Initialize modal system
   */
  initModal() {
    this.modal = document.getElementById('modal');
    this.modalContent = document.getElementById('modalContent');
    const modalClose = document.getElementById('modalClose');
    
    if (!this.modal || !modalClose) return;
    
    // Listen for modal open requests
    window.addEventListener('openModal', (e) => {
      this.openModal(e.detail.type, e.detail.data);
    });
    
    // Close button
    modalClose.addEventListener('click', () => this.closeModal());
    
    // Click outside to close
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('show')) {
        this.closeModal();
      }
    });
    
    // Trap focus in modal
    this.setupFocusTrap();
  },
  
  /**
   * Open modal with content
   */
  openModal(type, data) {
    if (type === 'country') {
      this.renderCountryModal(data);
    } else if (type === 'event') {
      this.renderEventModal(data);
      AssistantManager.showEventFact(data);
    }
    
    this.modal.classList.add('show');
    this.modalContent.focus();
    document.body.style.overflow = 'hidden';
  },
  
  /**
   * Close modal
   */
  closeModal() {
    this.modal.classList.remove('show');
    document.body.style.overflow = '';
    MapManager.highlightCountries([]);
  },
  
  /**
   * Render country modal
   */
  renderCountryModal(country) {
    const sideClass = country.side.toLowerCase();
    const events = DataManager.getCountryEvents(country.id);
    const leaders = DataManager.getCountryLeaders(country.id);
    
    const relatedHTML = events.length > 0 ? `
      <div class="modal-related">
        <div class="related-title">Related Events:</div>
        <div class="related-links">
          ${events.map(e => `
            <button class="related-link" data-event="${e.id}">${e.title}</button>
          `).join('')}
        </div>
      </div>
    ` : '';
    
    const leadersHTML = leaders.length > 0 ? `
      <h3>Key Leaders</h3>
      <ul>
        ${leaders.map(l => `<li><strong>${l.name}</strong> - ${l.role} (${l.years})</li>`).join('')}
      </ul>
    ` : '';
    
    this.modalContent.innerHTML = `
      <button class="modal-close" id="modalClose" aria-label="Close modal">&times;</button>
      <h2 class="modal-title">${country.name}</h2>
      <div class="modal-info">
        <span class="modal-badge ${sideClass}">${country.side}</span>
        <span>Entered: ${country.joined || 'Neutral'}</span>
      </div>
      <div class="modal-body">
        <p>${country.notes}</p>
        ${leadersHTML}
        <h3>Casualties</h3>
        <p>${country.casualties}</p>
      </div>
      ${relatedHTML}
    `;
    
    // Rebind close button
    document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
    
    // Bind related event clicks
    document.querySelectorAll('.related-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const eventId = btn.dataset.event;
        const event = DataManager.events.find(e => e.id === eventId);
        if (event) this.renderEventModal(event);
      });
    });
  },
  
  /**
   * Render event modal
   */
  renderEventModal(event) {
    const typeClass = event.type.toLowerCase().replace(/\s+/g, '-');
    const countries = DataManager.getEventCountries(event.id);
    
    const factsHTML = event.facts.length > 0 ? `
      <h3>Key Facts</h3>
      <ul>
        ${event.facts.map(fact => `<li>${fact}</li>`).join('')}
      </ul>
    ` : '';
    
    const countriesHTML = countries.length > 0 ? `
      <div class="modal-related">
        <div class="related-title">Countries Involved:</div>
        <div class="related-links">
          ${countries.map(c => `
            <button class="related-link" data-country="${c.id}">${c.name}</button>
          `).join('')}
        </div>
      </div>
    ` : '';
    
    const date = new Date(event.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    this.modalContent.innerHTML = `
      <button class="modal-close" id="modalClose" aria-label="Close modal">&times;</button>
      <h2 class="modal-title">${event.title}</h2>
      <div class="modal-info">
        <span class="modal-badge ${typeClass}">${event.type}</span>
        <span>${formattedDate}</span>
      </div>
      <div class="modal-body">
        <p>${event.summary}</p>
        ${factsHTML}
      </div>
      ${countriesHTML}
    `;
    
    // Rebind close button
    document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
    
    // Bind related country clicks
    document.querySelectorAll('.related-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const countryId = btn.dataset.country;
        const country = DataManager.getCountry(countryId);
        if (country) this.renderCountryModal(country);
      });
    });
  },
  
  /**
   * Setup focus trap in modal
   */
  setupFocusTrap() {
    this.modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && this.modal.classList.contains('show')) {
        const focusable = this.modalContent.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    });
  },
  
  /**
   * Initialize mode toggle
   */
  initModeToggle() {
    const modeButtons = document.querySelectorAll('.mode-btn');
    const mapSection = document.getElementById('mapSection');
    const timelineSection = document.getElementById('timelineSection');
    
    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const mode = btn.dataset.mode;
        
        if (mode === 'both') {
          mapSection.classList.remove('hidden');
          timelineSection.classList.remove('hidden');
        } else if (mode === 'map') {
          mapSection.classList.remove('hidden');
          timelineSection.classList.add('hidden');
        } else if (mode === 'timeline') {
          mapSection.classList.add('hidden');
          timelineSection.classList.remove('hidden');
        }
        
        // Announce to screen readers
        const announcement = `Switched to ${mode} mode`;
        this.announce(announcement);
      });
    });
  },
  
  /**
   * Initialize filter chips and search
   */
  initFilters() {
    // Event type filters
    const filterChips = document.querySelectorAll('.filter-chip[data-type]');
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const type = chip.dataset.type;
        
        // Toggle active state
        if (chip.classList.contains('active')) {
          chip.classList.remove('active');
          FilterManager.setEventType('all');
        } else {
          filterChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          FilterManager.setEventType(type);
        }
      });
    });
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          FilterManager.setSearchQuery(e.target.value);
        }, 300);
      });
    }
    
    // Alliance filters
    const allianceFilters = document.querySelectorAll('.legend-item');
    allianceFilters.forEach(item => {
      item.addEventListener('click', () => {
        const alliance = item.dataset.alliance;
        if (alliance) {
          FilterManager.setAlliance(alliance);
        }
      });
    });
  },
  
  /**
   * Announce to screen readers
   */
  announce(message) {
    const announcer = document.getElementById('announcer');
    if (announcer) {
      announcer.textContent = message;
    }
  }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
}
