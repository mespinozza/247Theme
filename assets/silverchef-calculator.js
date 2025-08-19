/**
 * Silverchef Calculator Modal
 * Handles modal display and calculator functionality for product financing
 */

class SilverchefCalculator {
  constructor() {
    this.modal = null;
    this.calculateButton = null;
    this.amountInput = null;
    this.resultsContainer = null;
    this.loadingContainer = null;
    this.breakdownContainer = null;
    this.errorContainer = null;
    
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Bind calculator trigger buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-silverchef-calculator]')) {
        e.preventDefault();
        this.openModal(e.target);
      }
    });

    // Modal close events
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-modal-close]') || e.target.closest('[data-modal-close]')) {
        this.closeModal();
      }
    });

    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });

    // Calculate button event
    document.addEventListener('click', (e) => {
      if (e.target.matches('.silverchef-calculator__calculate')) {
        this.calculatePayments();
      }
    });

    // Enter key in amount input
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.matches('#finance-amount')) {
        this.calculatePayments();
      }
    });
  }

  openModal(triggerElement) {
    this.modal = document.getElementById('silverchef-modal');
    if (!this.modal) return;

    // Get product price from trigger element
    const productPrice = triggerElement.getAttribute('data-product-price');
    const productAmount = Math.round(productPrice / 100); // Convert cents to dollars

    // Initialize modal elements
    this.amountInput = this.modal.querySelector('#finance-amount');
    this.calculateButton = this.modal.querySelector('.silverchef-calculator__calculate');
    this.resultsContainer = this.modal.querySelector('#calculator-results');
    this.loadingContainer = this.modal.querySelector('#calculator-loading');
    this.breakdownContainer = this.modal.querySelector('#calculator-breakdown');
    this.errorContainer = this.modal.querySelector('#calculator-error');

    // Pre-fill the amount
    if (this.amountInput && productAmount >= 500) {
      this.amountInput.value = productAmount;
    }

    // Show modal
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    
    // Focus on amount input
    setTimeout(() => {
      if (this.amountInput) {
        this.amountInput.focus();
        this.amountInput.select();
      }
    }, 100);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    if (!this.modal) return;

    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    
    // Reset results
    this.hideAllResults();
    
    // Restore body scroll
    document.body.style.overflow = '';
  }

  hideAllResults() {
    if (this.resultsContainer) this.resultsContainer.style.display = 'none';
    if (this.loadingContainer) this.loadingContainer.style.display = 'none';
    if (this.breakdownContainer) this.breakdownContainer.style.display = 'none';
    if (this.errorContainer) this.errorContainer.style.display = 'none';
  }

  async calculatePayments() {
    if (!this.amountInput) return;

    const amount = parseFloat(this.amountInput.value);
    
    // Validation
    if (!amount || amount < 500) {
      this.showError('Please enter an amount of $500 or more.');
      return;
    }

    // Show loading state
    this.showLoading();

    try {
      // For now, use static calculation
      // TODO: Replace with actual Silverchef API call
      const results = this.calculateStaticPayments(amount);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.showResults(results);
      
    } catch (error) {
      console.error('Calculator error:', error);
      this.showError('Unable to calculate payments. Please try again.');
    }
  }

  calculateStaticPayments(amount) {
    // Static calculation based on typical Silverchef rates
    // TODO: Replace with actual API integration
    
    const weeklyPayment = Math.round(amount * 0.019 * 100) / 100;
    const advancePayment = weeklyPayment;
    const securityBond = Math.round(amount * 0.1 * 100) / 100;
    const totalUpfront = advancePayment + securityBond;
    const totalRent12Months = weeklyPayment * 52;
    const outOfPocket = totalRent12Months; // Simplified calculation

    return {
      finance_amount: this.formatCurrency(amount),
      weekly_amount: this.formatCurrency(weeklyPayment),
      upfront_costs: {
        total: this.formatCurrency(totalUpfront),
        breakdown: {
          advance_payment: this.formatCurrency(advancePayment),
          bond: this.formatCurrency(securityBond)
        }
      },
      totals: {
        rent_after_12_months: this.formatCurrency(totalRent12Months),
        out_of_pocket: this.formatCurrency(outOfPocket)
      }
    };
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  }

  showLoading() {
    this.hideAllResults();
    if (this.resultsContainer) this.resultsContainer.style.display = 'block';
    if (this.loadingContainer) this.loadingContainer.style.display = 'block';
  }

  showResults(results) {
    this.hideAllResults();
    
    if (!this.resultsContainer || !this.breakdownContainer) return;

    // Update result values
    this.updateElement('#weekly-payment', results.weekly_amount);
    this.updateElement('#advance-payment', results.upfront_costs.breakdown.advance_payment);
    this.updateElement('#security-bond', results.upfront_costs.breakdown.bond);
    this.updateElement('#total-upfront', results.upfront_costs.total);
    this.updateElement('#total-rent', results.totals.rent_after_12_months);
    this.updateElement('#out-of-pocket', results.totals.out_of_pocket);

    // Show results
    this.resultsContainer.style.display = 'block';
    this.breakdownContainer.style.display = 'block';
  }

  showError(message) {
    this.hideAllResults();
    
    if (this.resultsContainer && this.errorContainer) {
      this.errorContainer.querySelector('p').textContent = message;
      this.resultsContainer.style.display = 'block';
      this.errorContainer.style.display = 'block';
    }
  }

  updateElement(selector, value) {
    const element = this.modal.querySelector(selector);
    if (element) {
      element.textContent = value;
    }
  }
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SilverchefCalculator();
});

// Reinitialize on theme editor changes
document.addEventListener('shopify:section:load', () => {
  new SilverchefCalculator();
});
