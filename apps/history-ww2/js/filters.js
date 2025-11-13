/**
 * Filters Module - Central filter state management
 */

const FilterManager = {
  state: {
    eventType: 'all',
    searchQuery: '',
    selectedYear: null,
    alliance: 'all'
  },
  
  listeners: [],
  
  /**
   * Subscribe to filter changes
   */
  subscribe(callback) {
    this.listeners.push(callback);
  },
  
  /**
   * Notify all listeners of state change
   */
  notify() {
    this.listeners.forEach(callback => callback(this.state));
  },
  
  /**
   * Set event type filter
   */
  setEventType(type) {
    this.state.eventType = type;
    this.notify();
  },
  
  /**
   * Set search query
   */
  setSearchQuery(query) {
    this.state.searchQuery = query.toLowerCase();
    this.notify();
  },
  
  /**
   * Set selected year
   */
  setYear(year) {
    this.state.selectedYear = year;
    this.notify();
  },
  
  /**
   * Set alliance filter
   */
  setAlliance(alliance) {
    this.state.alliance = alliance;
    this.notify();
  },
  
  /**
   * Reset all filters
   */
  reset() {
    this.state = {
      eventType: 'all',
      searchQuery: '',
      selectedYear: null,
      alliance: 'all'
    };
    this.notify();
  },
  
  /**
   * Check if event passes current filters
   */
  passesEventFilters(event) {
    // Type filter
    if (this.state.eventType !== 'all') {
      const normalizedType = event.type.toLowerCase().replace(/\s+/g, '-');
      if (normalizedType !== this.state.eventType) return false;
    }
    
    // Year filter
    if (this.state.selectedYear && event.year !== this.state.selectedYear) {
      return false;
    }
    
    // Search filter
    if (this.state.searchQuery) {
      const searchable = `${event.title} ${event.summary}`.toLowerCase();
      if (!searchable.includes(this.state.searchQuery)) return false;
    }
    
    return true;
  },
  
  /**
   * Check if country passes current filters
   */
  passesCountryFilters(country) {
    // Alliance filter
    if (this.state.alliance !== 'all') {
      const countrySide = country.side.toLowerCase();
      if (this.state.alliance === 'allies' && countrySide !== 'allies') return false;
      if (this.state.alliance === 'axis' && countrySide !== 'axis') return false;
      if (this.state.alliance === 'neutral' && countrySide !== 'neutral') return false;
    }
    
    // Search filter
    if (this.state.searchQuery) {
      const searchable = `${country.name} ${country.id} ${country.notes}`.toLowerCase();
      if (!searchable.includes(this.state.searchQuery)) return false;
    }
    
    return true;
  },
  
  /**
   * Get active filter count
   */
  getActiveFilterCount() {
    let count = 0;
    if (this.state.eventType !== 'all') count++;
    if (this.state.searchQuery) count++;
    if (this.state.selectedYear) count++;
    if (this.state.alliance !== 'all') count++;
    return count;
  },
  
  /**
   * Get filter summary for LM assistant
   */
  getFilterSummary() {
    const parts = [];
    
    if (this.state.eventType !== 'all') {
      parts.push(this.state.eventType.replace(/-/g, ' '));
    }
    
    if (this.state.selectedYear) {
      parts.push(`in ${this.state.selectedYear}`);
    }
    
    if (this.state.alliance !== 'all') {
      parts.push(`${this.state.alliance} nations`);
    }
    
    if (this.state.searchQuery) {
      parts.push(`matching "${this.state.searchQuery}"`);
    }
    
    if (parts.length === 0) return 'Showing all events';
    
    return `Showing: ${parts.join(', ')}`;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FilterManager;
}
