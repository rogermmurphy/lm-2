/**
 * Map Module - Interactive world map with country interactions
 */

const MapManager = {
  svgElement: null,
  tooltip: null,
  countries: [],
  
  /**
   * Initialize the map
   */
  init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    this.renderMap(container);
    this.setupTooltip();
    this.bindEvents();
    
    // Subscribe to filter changes
    FilterManager.subscribe((state) => this.applyFilters(state));
  },
  
  /**
   * Render SVG world map
   */
  renderMap(container) {
    // Create SVG with major WWII nations
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1000 500');
    svg.setAttribute('aria-label', 'Interactive World War II map');
    
    // Add countries as SVG paths
    this.addCountry(svg, 'US', 'M 50 150 L 200 150 L 200 280 L 50 280 Z', 125, 215);
    this.addCountry(svg, 'CA', 'M 80 40 L 250 40 L 250 120 L 80 120 Z', 165, 80);
    this.addCountry(svg, 'UK', 'M 420 100 L 470 100 L 470 150 L 420 150 Z', 445, 125);
    this.addCountry(svg, 'FR', 'M 440 160 L 490 160 L 490 210 L 440 210 Z', 465, 185);
    this.addCountry(svg, 'DE', 'M 500 120 L 570 120 L 570 180 L 500 180 Z', 535, 150);
    this.addCountry(svg, 'PL', 'M 550 110 L 590 110 L 590 140 L 550 140 Z', 570, 125);
    this.addCountry(svg, 'IT', 'M 520 200 L 560 200 L 560 260 L 520 260 Z', 540, 230);
    this.addCountry(svg, 'ES', 'M 400 190 L 450 190 L 450 230 L 400 230 Z', 425, 210);
    this.addCountry(svg, 'SE', 'M 510 60 L 540 60 L 540 100 L 510 100 Z', 525, 80);
    this.addCountry(svg, 'SU', 'M 580 80 L 850 80 L 850 250 L 580 250 Z', 715, 165);
    this.addCountry(svg, 'CN', 'M 750 180 L 850 180 L 850 280 L 750 280 Z', 800, 230);
    this.addCountry(svg, 'JP', 'M 880 150 L 950 150 L 950 220 L 880 220 Z', 915, 185);
    this.addCountry(svg, 'AU', 'M 800 350 L 900 350 L 900 430 L 800 430 Z', 850, 390);
    this.addCountry(svg, 'BR', 'M 250 300 L 350 300 L 350 420 L 250 420 Z', 300, 360);
    
    container.innerHTML = '';
    container.appendChild(svg);
    this.svgElement = svg;
  },
  
  /**
   * Add country path to SVG
   */
  addCountry(svg, id, pathData, labelX, labelY) {
    const country = DataManager.getCountry(id);
    if (!country) return;
    
    // Create path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('class', `country ${country.side.toLowerCase()}`);
    path.setAttribute('data-country', id);
    path.setAttribute('role', 'button');
    path.setAttribute('tabindex', '0');
    path.setAttribute('aria-label', `${country.name}, ${country.side}`);
    
    // Create label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', labelX);
    label.setAttribute('y', labelY);
    label.setAttribute('class', 'country-label');
    label.setAttribute('aria-hidden', 'true');
    label.textContent = id;
    
    svg.appendChild(path);
    svg.appendChild(label);
    
    this.countries.push({ id, element: path });
  },
  
  /**
   * Setup tooltip
   */
  setupTooltip() {
    const tooltip = document.createElement('div');
    tooltip.className = 'map-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('aria-live', 'polite');
    document.body.appendChild(tooltip);
    this.tooltip = tooltip;
  },
  
  /**
   * Bind event listeners
   */
  bindEvents() {
    // Use event delegation on SVG
    this.svgElement.addEventListener('click', (e) => {
      const path = e.target.closest('.country');
      if (path) this.handleCountryClick(path);
    });
    
    this.svgElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const path = e.target.closest('.country');
        if (path) {
          e.preventDefault();
          this.handleCountryClick(path);
        }
      }
    });
    
    this.svgElement.addEventListener('mousemove', (e) => {
      const path = e.target.closest('.country');
      if (path) {
        this.showTooltip(path, e);
      } else {
        this.hideTooltip();
      }
    });
    
    this.svgElement.addEventListener('mouseleave', () => {
      this.hideTooltip();
    });
  },
  
  /**
   * Handle country click
   */
  handleCountryClick(path) {
    const countryId = path.dataset.country;
    const country = DataManager.getCountry(countryId);
    
    if (country) {
      // Open modal with country details
      window.dispatchEvent(new CustomEvent('openModal', {
        detail: { type: 'country', data: country }
      }));
    }
  },
  
  /**
   * Show tooltip
   */
  showTooltip(path, event) {
    const countryId = path.dataset.country;
    const country = DataManager.getCountry(countryId);
    
    if (!country) return;
    
    const sideClass = country.side.toLowerCase();
    const sideBadge = `<span class="tooltip-side ${sideClass}">${country.side}</span>`;
    
    this.tooltip.innerHTML = `
      <div class="tooltip-title">${country.name}</div>
      ${sideBadge}
      <div class="tooltip-info">Entered: ${country.joined || 'Neutral'}</div>
    `;
    
    this.tooltip.classList.add('show');
    this.updateTooltipPosition(event);
  },
  
  /**
   * Update tooltip position
   */
  updateTooltipPosition(event) {
    const offset = 15;
    let x = event.clientX + offset;
    let y = event.clientY + offset;
    
    // Keep tooltip in viewport
    const rect = this.tooltip.getBoundingClientRect();
    if (x + rect.width > window.innerWidth) {
      x = event.clientX - rect.width - offset;
    }
    if (y + rect.height > window.innerHeight) {
      y = event.clientY - rect.height - offset;
    }
    
    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top = `${y}px`;
  },
  
  /**
   * Hide tooltip
   */
  hideTooltip() {
    this.tooltip.classList.remove('show');
  },
  
  /**
   * Highlight countries
   */
  highlightCountries(countryIds) {
    // Remove all highlights
    document.querySelectorAll('.country').forEach(el => {
      el.classList.remove('highlighted');
    });
    
    // Add highlights
    countryIds.forEach(id => {
      const el = document.querySelector(`[data-country="${id}"]`);
      if (el) el.classList.add('highlighted');
    });
  },
  
  /**
   * Apply filters to map
   */
  applyFilters(state) {
    this.countries.forEach(({ id, element }) => {
      const country = DataManager.getCountry(id);
      const passes = FilterManager.passesCountryFilters(country);
      
      if (passes) {
        element.style.opacity = '1';
        element.style.pointerEvents = 'all';
      } else {
        element.style.opacity = '0.2';
        element.style.pointerEvents = 'none';
      }
    });
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapManager;
}
