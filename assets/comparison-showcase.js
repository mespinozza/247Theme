/**
 * Comparison Showcase Mobile Toggle Functionality
 * Handles tap-to-toggle behavior for mobile stacked layout
 */

class ComparisonShowcase extends HTMLElement {
  constructor() {
    super();
    
    // Property Initializations
    this.mobileOnly = true;
    this.breakpoint = 900;
    this.mobileBlocks = null;
    this.toggleButtons = null;
    
    // Bind methods
    this.handleToggle = this.handleToggle.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  connectedCallback() {
    this.init();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  init() {
    // Initialize element references
    this.mobileBlocks = this.querySelectorAll('.comparison-showcase__mobile-block');
    this.toggleButtons = this.querySelectorAll('[data-mobile-toggle]');
    
    // Initialize based on viewport
    if (this.isMobileView()) {
      this.enableMobileToggle();
    } else {
      this.disableMobileToggle();
    }
    
    // Listen for resize events
    window.addEventListener('resize', this.handleResize);
  }

  isMobileView() {
    return window.innerWidth < this.breakpoint;
  }

  handleResize() {
    if (this.isMobileView()) {
      this.enableMobileToggle();
    } else {
      this.disableMobileToggle();
    }
  }

  enableMobileToggle() {
    this.bindEvents();
    this.setInitialState();
  }

  disableMobileToggle() {
    this.removeEvents();
  }

  bindEvents() {
    if (!this.toggleButtons || this.toggleButtons.length === 0) return;
    
    this.toggleButtons.forEach(button => {
      button.addEventListener('click', this.handleToggle);
      
      // Add keyboard support
      button.addEventListener('keydown', this.handleKeydown);
      
      // Ensure proper accessibility attributes
      button.setAttribute('role', 'button');
      button.setAttribute('tabindex', '0');
    });
  }

  removeEvents() {
    if (!this.toggleButtons || this.toggleButtons.length === 0) return;
    
    this.toggleButtons.forEach(button => {
      button.removeEventListener('click', this.handleToggle);
      button.removeEventListener('keydown', this.handleKeydown);
    });
  }

  handleKeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.handleToggle(e);
    }
  }

  setInitialState() {
    if (!this.mobileBlocks || this.mobileBlocks.length === 0) return;
    
    // Set initial states based on data attributes from Liquid
    this.mobileBlocks.forEach(block => {
      const state = block.getAttribute('data-mobile-state');
      if (state === 'expanded') {
        this.expandBlock(block);
      } else {
        this.collapseBlock(block);
      }
    });

    // Ensure proper ARIA attributes are set
    this.updateAriaAttributes();
  }

  updateAriaAttributes() {
    this.mobileBlocks.forEach(block => {
      const toggle = block.querySelector('[data-mobile-toggle]');
      const content = block.querySelector('.comparison-showcase__mobile-content');
      const state = block.getAttribute('data-mobile-state');
      
      if (toggle) {
        toggle.setAttribute('aria-expanded', state === 'expanded' ? 'true' : 'false');
        toggle.setAttribute('role', 'button');
        toggle.setAttribute('tabindex', '0');
      }
      
      if (content) {
        content.setAttribute('aria-hidden', state === 'expanded' ? 'false' : 'true');
      }
    });
  }

  handleToggle(event) {
    if (!this.isMobileView()) return;
    
    const button = event.currentTarget;
    const block = button.closest('.comparison-showcase__mobile-block');
    
    if (!block) return;
    
    // Always toggle - collapse all others and expand clicked one
    this.mobileBlocks.forEach(otherBlock => {
      if (otherBlock === block) {
        this.expandBlock(block);
      } else {
        this.collapseBlock(otherBlock);
      }
    });
  }

  expandBlock(block) {
    block.setAttribute('data-mobile-state', 'expanded');
    this.updateAriaAttributes();
    // Trigger custom event
    this.dispatchCustomEvent(block, 'comparison:expanded');
  }

  collapseBlock(block) {
    block.setAttribute('data-mobile-state', 'collapsed');
    this.updateAriaAttributes();
    // Trigger custom event
    this.dispatchCustomEvent(block, 'comparison:collapsed');
  }

  dispatchCustomEvent(block, eventName) {
    const event = new CustomEvent(eventName, {
      bubbles: true,
      detail: {
        block: block,
        side: block.getAttribute('data-mobile-side')
      }
    });
    
    this.dispatchEvent(event);
  }



  // Cleanup method
  cleanup() {
    this.removeEvents();
    window.removeEventListener('resize', this.handleResize);
  }

  // Public API methods for external control
  toggleBlock(side) {
    if (!this.isMobileView()) return;
    
    const block = this.querySelector(`[data-mobile-side="${side}"]`);
    if (block) {
      const toggle = block.querySelector('[data-mobile-toggle]');
      if (toggle) {
        toggle.click();
      }
    }
  }

  getExpandedBlock() {
    return this.querySelector('[data-mobile-state="expanded"]');
  }
}

// Register the custom element
customElements.define('comparison-showcase', ComparisonShowcase);