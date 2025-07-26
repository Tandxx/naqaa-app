class NaqaaApp {
  constructor() {
    this.clickCount = 0;
    this.clickTimes = [];
    this.isUnlocked = false;
    this.init();
  }

  init() {
    this.setupDisguiseMode();
    this.setupEmergencyModal();
    this.setupThemeToggle();
    this.setupFormValidation();
    this.checkStreakMilestone();
  }

  setupDisguiseMode() {
    const disguiseBtn = document.getElementById('disguise-unlock-btn');
    if (disguiseBtn) {
      disguiseBtn.addEventListener('click', () => this.handleDisguiseClick());
    }
  }

  handleDisguiseClick() {
    const now = Date.now();
    this.clickTimes.push(now);
    this.clickCount++;

    // Keep only recent clicks (within 5 seconds)
    this.clickTimes = this.clickTimes.filter(time => now - time < 5000);
    
    // Check for the pattern: 2 quick clicks, wait 1-3 seconds, 2 more quick clicks
    if (this.clickTimes.length >= 4) {
      const times = this.clickTimes.slice(-4);
      const firstPair = times[1] - times[0] < 500; // First two clicks within 500ms
      const secondPair = times[3] - times[2] < 500; // Last two clicks within 500ms
      const waitTime = times[2] - times[1];
      
      if (firstPair && secondPair && waitTime >= 1000 && waitTime <= 3000) {
        this.unlockDisguiseMode();
        return;
      }
    }

    // Reset if pattern is broken
    if (this.clickCount > 4) {
      this.clickCount = 0;
      this.clickTimes = [];
    }
  }

  async unlockDisguiseMode() {
    try {
      const response = await fetch('/api/unlock-disguise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Failed to unlock disguise mode:', error);
    }
  }

  setupEmergencyModal() {
    const emergencyBtn = document.getElementById('emergency-btn');
    const modal = document.getElementById('emergency-modal');
    const closeBtn = document.querySelector('.modal .close');

    if (emergencyBtn && modal) {
      emergencyBtn.addEventListener('click', () => {
        modal.classList.add('show');
        this.logEmergencyRequest();
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
      });
    }

    // Close modal when clicking outside
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('show');
        }
      });
    }
  }

  async logEmergencyRequest() {
    try {
      await fetch('/api/emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Failed to log emergency request:', error);
    }
  }

  setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        this.saveThemePreference(theme);
      });
    }
  }

  saveThemePreference(theme) {
    localStorage.setItem('theme', theme);
  }

  setupFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        if (!this.validateForm(form)) {
          e.preventDefault();
        }
      });
    });
  }

  validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        this.showFieldError(field, 'This field is required');
        isValid = false;
      } else {
        this.clearFieldError(field);
      }
    });

    return isValid;
  }

  showFieldError(field, message) {
    this.clearFieldError(field);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = 'var(--danger-color)';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = 'var(--danger-color)';
  }

  clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
    field.style.borderColor = 'var(--border-color)';
  }

  checkStreakMilestone() {
    const streakElement = document.querySelector('.streak-number');
    if (streakElement) {
      const streak = parseInt(streakElement.textContent);
      const milestones = [7, 30, 60, 90, 180, 365];
      
      if (milestones.includes(streak)) {
        this.showMilestoneModal(streak);
      }
    }
  }

  showMilestoneModal(streak) {
    const messages = {
      7: 'أسبوع كامل! أنت تتقدم بشكل رائع!',
      30: 'شهر كامل! إنجاز مذهل!',
      60: 'شهران! أنت بطل حقيقي!',
      90: 'ثلاثة أشهر! استمر في التقدم!',
      180: 'ستة أشهر! تحول حياتي حقيقي!',
      365: 'سنة كاملة! أنت ملهم للجميع!'
    };

    const message = messages[streak] || 'إنجاز رائع!';
    this.showNotification(message, 'success');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--card-bg);
      border-left: 4px solid var(--primary-color);
      padding: 1rem;
      border-radius: 8px;
      box-shadow: var(--shadow);
      z-index: 1000;
      max-width: 400px;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      notification.remove();
    });

    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  async handleRelapse() {
    if (confirm('هل أنت متأكد من تسجيل انتكاسة؟ سيتم إعادة تعيين العداد.')) {
      try {
        const response = await fetch('/api/relapse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        if (data.success) {
          location.reload();
        }
      } catch (error) {
        console.error('Failed to log relapse:', error);
      }
    }
  }
}

// CSS Animation for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.NaqaaApp = new NaqaaApp();
});

app.use(express.static(path.join(__dirname, 'public')));