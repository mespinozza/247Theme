/**
 * Brand Showcase JavaScript
 * Handles alphabet filtering and smooth animations
 */
class BrandShowcase {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      enableAnimation: true,
      animationDuration: 300,
      ...options
    };
    
    this.alphabetButtons = this.container.querySelectorAll('.brand-showcase__alphabet-btn');
    this.brandCards = this.container.querySelectorAll('.brand-showcase__card');
    this.emptyState = this.container.querySelector('.brand-showcase__empty-state');
    this.brandGrid = this.container.querySelector('.brand-showcase__grid');
    this.showAllButton = this.container.querySelector('.brand-showcase__show-all-btn');
    
    this.currentFilter = 'all';
    this.isAnimating = false;
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.updateURL();
    this.handleInitialFilter();
    this.updateCounts();
  }
  
  bindEvents() {
    // Alphabet button clicks
    this.alphabetButtons.forEach(button => {
      button.addEventListener('click', this.handleAlphabetClick.bind(this));
      button.addEventListener('keydown', this.handleAlphabetKeydown.bind(this));
    });
    
    // Show all button click
    if (this.showAllButton) {
      this.showAllButton.addEventListener('click', this.handleShowAllClick.bind(this));
    }
    
    // Handle browser back/forward
    window.addEventListener('popstate', this.handlePopState.bind(this));
    
    // Handle window resize for mobile layout adjustments
    window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
  }
  
  handleAlphabetClick(event) {
    if (this.isAnimating) return;
    
    const button = event.currentTarget;
    const letter = button.dataset.letter;
    
    if (button.disabled || letter === this.currentFilter) return;
    
    this.filterByLetter(letter);
    this.updateURL(letter);
  }
  
  handleAlphabetKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleAlphabetClick(event);
    }
  }
  
  handleShowAllClick(event) {
    event.preventDefault();
    this.filterByLetter('all');
    this.updateURL('all');
  }
  
  handlePopState(event) {
    const letter = this.getLetterFromURL();
    this.filterByLetter(letter, false);
  }
  
  handleResize() {
    // Handle any responsive adjustments if needed
    this.updateLayout();
  }
  
  handleInitialFilter() {
    const letter = this.getLetterFromURL();
    if (letter && letter !== 'all') {
      this.filterByLetter(letter, false);
    }
  }
  
  filterByLetter(letter, updateHistory = true) {
    if (this.isAnimating && this.options.enableAnimation) return;
    
    this.currentFilter = letter;
    this.updateActiveButton(letter);
    
    if (this.options.enableAnimation) {
      this.animateFilter(letter);
    } else {
      this.instantFilter(letter);
    }
    
    if (updateHistory) {
      this.updateURL(letter);
    }
    
    this.announceFilterChange(letter);
  }
  
  animateFilter(letter) {
    this.isAnimating = true;
    
    // Hide cards that don't match
    const cardsToHide = Array.from(this.brandCards).filter(card => 
      !this.cardMatchesFilter(card, letter)
    );
    
    const cardsToShow = Array.from(this.brandCards).filter(card => 
      this.cardMatchesFilter(card, letter)
    );
    
    // Start hiding animation
    cardsToHide.forEach(card => {
      card.classList.add('filtering-hide');
      card.classList.remove('filtering-show');
    });
    
    // Wait for hide animation, then show matching cards
    setTimeout(() => {
      cardsToShow.forEach(card => {
        card.classList.remove('filtering-hide');
        card.classList.add('filtering-show');
      });
      
      this.updateEmptyState(cardsToShow.length === 0);
      
      // Animation complete
      setTimeout(() => {
        this.isAnimating = false;
        this.cleanupFilterClasses();
      }, this.options.animationDuration);
      
    }, this.options.animationDuration / 2);
  }
  
  instantFilter(letter) {
    this.brandCards.forEach(card => {
      const matches = this.cardMatchesFilter(card, letter);
      card.style.display = matches ? 'block' : 'none';
    });
    
    const visibleCards = Array.from(this.brandCards).filter(card => 
      this.cardMatchesFilter(card, letter)
    );
    
    this.updateEmptyState(visibleCards.length === 0);
  }
  
  cardMatchesFilter(card, letter) {
    if (letter === 'all') return true;
    const cardLetter = card.dataset.letter;
    return cardLetter === letter;
  }
  
  cleanupFilterClasses() {
    this.brandCards.forEach(card => {
      card.classList.remove('filtering-hide', 'filtering-show');
    });
  }
  
  updateActiveButton(letter) {
    this.alphabetButtons.forEach(button => {
      const isActive = button.dataset.letter === letter;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', isActive);
    });
  }
  
  updateEmptyState(isEmpty) {
    if (!this.emptyState) return;
    
    if (isEmpty) {
      this.emptyState.style.display = 'block';
      this.brandGrid.style.display = 'none';
    } else {
      this.emptyState.style.display = 'none';
      this.brandGrid.style.display = 'grid';
    }
  }
  
  updateCounts() {
    // Update button states based on available letters
    this.alphabetButtons.forEach(button => {
      const letter = button.dataset.letter;
      if (letter === 'all') return;
      
      const hasCards = Array.from(this.brandCards).some(card => 
        card.dataset.letter === letter
      );
      
      button.disabled = !hasCards;
      button.classList.toggle('brand-showcase__alphabet-btn--disabled', !hasCards);
    });
  }
  
  updateLayout() {
    // Handle any responsive layout updates
    if (window.innerWidth <= 899) {
      this.ensureScrollableAlphabet();
    }
  }
  
  ensureScrollableAlphabet() {
    const nav = this.container.querySelector('.brand-showcase__alphabet-nav');
    if (nav) {
      // Ensure smooth scrolling on mobile
      nav.style.scrollBehavior = 'smooth';
    }
  }
  
  updateURL(letter = this.currentFilter) {
    if (!letter || letter === 'all') {
      // Remove hash if showing all
      if (window.location.hash) {
        history.pushState(null, '', window.location.pathname + window.location.search);
      }
    } else {
      // Add letter hash
      history.pushState(null, '', `#letter-${letter}`);
    }
  }
  
  getLetterFromURL() {
    const hash = window.location.hash;
    if (hash.startsWith('#letter-')) {
      return hash.substring(8); // Remove '#letter-' prefix
    }
    return 'all';
  }
  
  announceFilterChange(letter) {
    // Announce filter change for screen readers
    const message = letter === 'all' 
      ? 'Showing all brands' 
      : `Showing brands starting with ${letter.toUpperCase()}`;
    
    this.announceToScreenReader(message);
  }
  
  announceToScreenReader(message) {
    // Create temporary announcement element
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.classList.add('visually-hidden');
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
  
  // Utility function for debouncing
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Public method to manually trigger filter
  setFilter(letter) {
    this.filterByLetter(letter);
  }
  
  // Public method to get current filter
  getCurrentFilter() {
    return this.currentFilter;
  }
  
  // Public method to get visible cards count
  getVisibleCardsCount() {
    return Array.from(this.brandCards).filter(card => 
      this.cardMatchesFilter(card, this.currentFilter)
    ).length;
  }
  
  // Cleanup method
  destroy() {
    this.alphabetButtons.forEach(button => {
      button.removeEventListener('click', this.handleAlphabetClick);
      button.removeEventListener('keydown', this.handleAlphabetKeydown);
    });
    
    if (this.showAllButton) {
      this.showAllButton.removeEventListener('click', this.handleShowAllClick);
    }
    
    window.removeEventListener('popstate', this.handlePopState);
    window.removeEventListener('resize', this.handleResize);
  }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const brandShowcases = document.querySelectorAll('.brand-showcase');
  
  brandShowcases.forEach(showcase => {
    // Check if already initialized
    if (!showcase.brandShowcaseInstance) {
      const options = {
        enableAnimation: showcase.dataset.enableAnimation !== 'false',
        animationDuration: parseInt(showcase.dataset.animationDuration) || 300
      };
      
      showcase.brandShowcaseInstance = new BrandShowcase(showcase, options);
    }
  });
});

// Export for manual initialization
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BrandShowcase;
} else if (typeof window !== 'undefined') {
  window.BrandShowcase = BrandShowcase;
}
