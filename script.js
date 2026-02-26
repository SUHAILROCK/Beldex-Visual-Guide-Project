document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('js-loaded');

  // ── Theme Toggle ──
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('beldex-theme');
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeToggle) themeToggle.textContent = '🌙';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isCurrentlyLight = document.documentElement.getAttribute('data-theme') === 'light';
      const newTheme = isCurrentlyLight ? 'dark' : 'light';

      // Add transition class for smooth switching
      document.documentElement.classList.add('theme-transitioning');

      if (newTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.textContent = '🌙';
        localStorage.setItem('beldex-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.textContent = '☀️';
        localStorage.setItem('beldex-theme', 'dark');
      }

      // Remove transition class after animation completes
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, 500);
    });
  }

  const VALID_TABS = [
    'overview',
    'team',
    'links',
    'exchanges',
    'research',
    'evm',
    'architecture',
    'challenges',
    'timeline',
    'ecosystem'
  ];

  const tabButtons = Array.from(document.querySelectorAll('.nav-tab[data-tab]'));
  const tabPanels = Array.from(document.querySelectorAll('.tab-content[role="tabpanel"]'));
  const pageHeader = document.getElementById('pageHeader');

  function activateTab(tabName, options = {}) {
    const { updateHash = true, focusTab = false } = options;
    const safeTab = VALID_TABS.includes(tabName) ? tabName : 'overview';
    const isOverview = safeTab === 'overview';

    if (pageHeader) {
      pageHeader.classList.toggle('header-hidden', !isOverview);
      pageHeader.setAttribute('aria-hidden', isOverview ? 'false' : 'true');
    }

    tabPanels.forEach((panel) => {
      const isActive = panel.id === safeTab;
      panel.classList.toggle('active', isActive);
      panel.hidden = !isActive;
      panel.style.opacity = isActive ? '1' : '0';
    });

    tabButtons.forEach((button) => {
      const isActive = button.dataset.tab === safeTab;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
      button.setAttribute('tabindex', isActive ? '0' : '-1');
      if (isActive && focusTab) {
        button.focus();
      }
    });

    // Do not force reload ecosystem iframe on tab switches.
    // Only set src if missing as a safe fallback.
    if (safeTab === 'ecosystem') {
      const iframe = document.getElementById('eco-tree-frame');
      if (iframe && !iframe.getAttribute('src')) {
        iframe.setAttribute('src', 'beldex-tree.html?embed=1');
      }
    }

    if (updateHash && location.hash !== `#${safeTab}`) {
      history.pushState(null, '', `#${safeTab}`);
    }

    // Make animated elements visible immediately in the active tab
    // (the IntersectionObserver may not trigger for off-screen elements in hidden tabs)
    const activePanel = document.getElementById(safeTab);
    if (activePanel) {
      activePanel.querySelectorAll('.card, .diagram, .flow-box, .stat-box, .ecosystem-item').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    }
  }

  function getCurrentTab() {
    return (location.hash || '').replace('#', '');
  }

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activateTab(button.dataset.tab, { updateHash: true, focusTab: false });
    });

    button.addEventListener('keydown', (event) => {
      const index = tabButtons.indexOf(button);
      let nextIndex = null;

      if (event.key === 'ArrowRight') {
        nextIndex = (index + 1) % tabButtons.length;
      } else if (event.key === 'ArrowLeft') {
        nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = tabButtons.length - 1;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        activateTab(tabButtons[nextIndex].dataset.tab, { updateHash: true, focusTab: true });
      }
    });
  });

  const hashTab = getCurrentTab();
  activateTab(VALID_TABS.includes(hashTab) ? hashTab : 'overview', { updateHash: false, focusTab: false });

  window.addEventListener('hashchange', () => {
    const tab = getCurrentTab();
    activateTab(VALID_TABS.includes(tab) ? tab : 'overview', { updateHash: false, focusTab: false });
  });

  // Backward compatibility for legacy callers.
  window.showTab = function showTab(tabName) {
    activateTab(tabName, { updateHash: true, focusTab: false });
  };

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll('.card, .diagram, .flow-box, .stat-box, .ecosystem-item');
  animatedElements.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
    observer.observe(el);
  });

  const statBoxes = document.querySelectorAll('.stat-box h3');

  function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const val = Math.floor(progress * (end - start) + start);

      const suffix = obj.dataset.suffix || '';
      const prefix = obj.dataset.prefix || '';
      obj.innerHTML = prefix + val + suffix;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const originalText = el.innerText;
        const numberMatch = originalText.match(/(\d+)/);

        if (numberMatch) {
          const number = parseInt(numberMatch[0], 10);
          const parts = originalText.split(number);
          el.dataset.prefix = parts[0];
          el.dataset.suffix = parts[1];
          animateValue(el, 0, number, 1500);
        }

        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statBoxes.forEach((box) => statObserver.observe(box));

  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('nav-tab')) {
      const circle = document.createElement('div');
      const diameter = Math.max(event.target.clientWidth, event.target.clientHeight);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      const rect = event.target.getBoundingClientRect();
      circle.style.left = `${event.clientX - rect.left - radius}px`;
      circle.style.top = `${event.clientY - rect.top - radius}px`;
      circle.classList.add('ripple');

      const existingRipple = event.target.getElementsByClassName('ripple')[0];
      if (existingRipple) {
        existingRipple.remove();
      }

      event.target.appendChild(circle);
    }
  });

  document.querySelectorAll('.ca-copy-btn[data-copy-address]').forEach((button) => {
    button.addEventListener('click', () => {
      copyAddress(button, button.dataset.copyAddress);
    });
  });
});

function legacyCopyFallback(address) {
  const textArea = document.createElement('textarea');
  textArea.value = address;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'absolute';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.select();

  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch (error) {
    copied = false;
  }

  document.body.removeChild(textArea);
  if (!copied) {
    throw new Error('Clipboard copy command not supported');
  }
}

window.copyAddress = function copyAddress(btn, address) {
  const onSuccess = () => {
    btn.classList.add('copied');
    setTimeout(() => {
      btn.classList.remove('copied');
    }, 2000);
  };

  const onFailure = () => {
    console.warn('Clipboard write failed; please copy manually.');
  };

  if (!address) {
    onFailure();
    return;
  }

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(address)
      .then(onSuccess)
      .catch(() => {
        try {
          legacyCopyFallback(address);
          onSuccess();
        } catch (error) {
          onFailure();
        }
      });
    return;
  }

  try {
    legacyCopyFallback(address);
    onSuccess();
  } catch (error) {
    onFailure();
  }
};
