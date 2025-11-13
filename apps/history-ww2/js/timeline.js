/**
 * Timeline Module - Horizontal scrolling timeline with snap points
 */

const TimelineManager = {
  container: null,
  scrollElement: null,
  
  /**
   * Initialize timeline
   */
  init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    this.container = container;
    this.renderTimeline();
    this.bindEvents();
    
    // Subscribe to filter changes
    FilterManager.subscribe((state) => this.applyFilters(state));
  },
  
  /**
   * Render timeline years and events
   */
  renderTimeline() {
    const years = DataManager.getYears();
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'timeline-scroll';
    scrollContainer.id = 'timelineScroll';
    
    years.forEach(year => {
      const yearSection = this.createYearSection(year);
      scrollContainer.appendChild(yearSection);
    });
    
    this.container.innerHTML = '';
    this.container.appendChild(scrollContainer);
    this.scrollElement = scrollContainer;
  },
  
  /**
   * Create year section with events
   */
  createYearSection(year) {
    const section = document.createElement('div');
    section.className = 'timeline-year';
    section.dataset.year = year;
    
    // Year marker
    const marker = document.createElement('div');
    marker.className = 'year-marker';
    marker.textContent = year;
    section.appendChild(marker);
    
    // Event cards container
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'event-cards';
    
    const events = DataManager.getEventsByYear(year);
    events.forEach(event => {
      const card = this.createEventCard(event);
      cardsContainer.appendChild(card);
    });
    
    section.appendChild(cardsContainer);
    return section;
  },
  
  /**
   * Create event card
   */
  createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.dataset.event = event.id;
    card.dataset.type = event.type.toLowerCase().replace(/\s+/g, '-');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${event.title}, ${event.date}`);
    
    // Format date
    const date = new Date(event.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    card.innerHTML = `
      <div class="event-date">${formattedDate}</div>
      <div class="event-title">${event.title}</div>
      <div class="event-description">${event.summary}</div>
      <span class="event-type ${event.type.toLowerCase().replace(/\s+/g, '-')}">${event.type}</span>
    `;
    
    return card;
  },
  
  /**
   * Bind event listeners
   */
  bindEvents() {
    // Event delegation for clicks
    this.scrollElement.addEventListener('click', (e) => {
      const card = e.target.closest('.event-card');
      if (card) this.handleEventClick(card);
    });
    
    // Keyboard support
    this.scrollElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.event-card');
        if (card) {
          e.preventDefault();
          this.handleEventClick(card);
        }
      }
    });
    
    // Scroll progress tracking
    this.scrollElement.addEventListener('scroll', () => {
      this.updateScrollProgress();
    });
  },
  
  /**
   * Handle event card click
   */
  handleEventClick(card) {
    const eventId = card.dataset.event;
    const event = DataManager.events.find(e => e.id === eventId);
    
    if (event) {
      // Highlight related countries on map
      MapManager.highlightCountries(event.countries);
      
      // Open modal
      window.dispatchEvent(new CustomEvent('openModal', {
        detail: { type: 'event', data: event }
      }));
    }
  },
  
  /**
   * Apply filters to timeline
   */
  applyFilters(state) {
    const cards = document.querySelectorAll('.event-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
      const eventId = card.dataset.event;
      const event = DataManager.events.find(e => e.id === eventId);
      
      if (event && FilterManager.passesEventFilters(event)) {
        card.classList.remove('filtered');
        visibleCount++;
      } else {
        card.classList.add('filtered');
      }
    });
    
    // Update assistant with filter summary
    if (window.AssistantManager) {
      AssistantManager.showMessage(FilterManager.getFilterSummary());
    }
    
    // Handle empty state
    this.handleEmptyState(visibleCount);
  },
  
  /**
   * Handle empty state
   */
  handleEmptyState(visibleCount) {
    const existing = this.container.querySelector('.timeline-empty');
    
    if (visibleCount === 0 && !existing) {
      const empty = document.createElement('div');
      empty.className = 'timeline-empty';
      empty.textContent = 'No events match your filters';
      this.container.insertBefore(empty, this.scrollElement);
    } else if (visibleCount > 0 && existing) {
      existing.remove();
    }
  },
  
  /**
   * Update scroll progress
   */
  updateScrollProgress() {
    const scrollLeft = this.scrollElement.scrollLeft;
    const scrollWidth = this.scrollElement.scrollWidth - this.scrollElement.clientWidth;
    const progress = (scrollLeft / scrollWidth) * 100;
    
    // Dispatch progress event for other modules
    window.dispatchEvent(new CustomEvent('timelineProgress', {
      detail: { progress, scrollLeft }
    }));
  },
  
  /**
   * Scroll to year
   */
  scrollToYear(year) {
    const yearSection = document.querySelector(`[data-year="${year}"]`);
    if (yearSection) {
      yearSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });
    }
  },
  
  /**
   * Scroll to next year
   */
  scrollNext() {
    const currentScroll = this.scrollElement.scrollLeft;
    const yearWidth = 350 + 32; // min-width + gap
    this.scrollElement.scrollBy({ 
      left: yearWidth, 
      behavior: 'smooth' 
    });
  },
  
  /**
   * Scroll to previous year
   */
  scrollPrev() {
    const yearWidth = 350 + 32;
    this.scrollElement.scrollBy({ 
      left: -yearWidth, 
      behavior: 'smooth' 
    });
  },
  
  /**
   * Get current visible year
   */
  getCurrentYear() {
    const scrollLeft = this.scrollElement.scrollLeft;
    const yearSections = document.querySelectorAll('.timeline-year');
    
    for (let section of yearSections) {
      const rect = section.getBoundingClientRect();
      const containerRect = this.scrollElement.getBoundingClientRect();
      
      if (rect.left >= containerRect.left && rect.left < containerRect.right) {
        return parseInt(section.dataset.year);
      }
    }
    
    return null;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TimelineManager;
}
