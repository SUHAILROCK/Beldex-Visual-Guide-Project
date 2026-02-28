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
  const CORE_TECH_STACK_GROUPS = [
    {
      label: 'Privacy Layer',
      dotClass: 'ts-dot-privacy',
      accentClass: 'tsc-privacy',
      items: [
        { href: 'TEST/tech/privacy/tech-cryptonote.html', emojiHtml: '&#x1F510;', title: 'CryptoNote Protocol', desc: 'Privacy-by-default blockchain foundation', statusLabel: 'Live', statusClass: 'tsc-live' },
        { href: 'TEST/tech/privacy/tech-ring-signatures.html', emojiHtml: '&#x1F48D;', title: 'Ring Signatures', desc: 'Untraceable sender identity', statusLabel: 'Live', statusClass: 'tsc-live' },
        { href: 'TEST/tech/privacy/tech-stealth-addresses.html', emojiHtml: '&#x1F464;', title: 'Stealth Addresses', desc: 'One-time receiver addresses', statusLabel: 'Live', statusClass: 'tsc-live' },
        { href: 'TEST/tech/privacy/tech-ringct.html', emojiHtml: '&#x1F48E;', title: 'RingCT', desc: 'Hidden transaction amounts', statusLabel: 'Live', statusClass: 'tsc-live' },
        { href: 'TEST/tech/privacy/tech-privacy-map.html', emojiHtml: '&#x1F5FA;&#xFE0F;', title: 'Privacy Technology Map', desc: 'Combined privacy evolution flowchart', statusLabel: 'Live', statusClass: 'tsc-live' },
        { href: 'TEST/tech/privacy/tech-cryptonote-flowchart.html', emojiHtml: '&#x1F517;', title: 'CryptoNote Protocol Flowchart', desc: 'Visual lineage from CryptoNote to Beldex', statusLabel: 'Live', statusClass: 'tsc-live' }
      ]
    },
    {
      label: 'Consensus & Core',
      dotClass: 'ts-dot-consensus',
      accentClass: 'tsc-consensus',
      items: [
        { href: 'TEST/tech/consensus/tech-utxo.html', emojiHtml: '&#x1F9E9;', title: 'UTXO Model', desc: 'Coin-based transaction architecture', statusLabel: 'Live', statusClass: 'tsc-live' },
        { href: 'TEST/tech/consensus/tech-proof-of-stake.html', emojiHtml: '&#x26A1;', title: 'Proof of Stake', desc: 'Energy-efficient consensus since 2021', statusLabel: 'Live', statusClass: 'tsc-live' },
        { href: 'TEST/tech/privacy/tech-bulletproof.html', emojiHtml: '&#x1F6E1;&#xFE0F;', title: 'Bulletproof++', desc: 'Compact zero-knowledge range proofs', statusLabel: 'Live', statusClass: 'tsc-live' }
      ]
    },
    {
      label: 'Network & Infrastructure',
      dotClass: 'ts-dot-network',
      accentClass: 'tsc-network',
      items: [
        { href: 'TEST/tech/network/tech-masternode.html', emojiHtml: '&#x1F5A5;&#xFE0F;', title: 'Masternode Network', desc: 'Decentralized infrastructure backbone', statusLabel: 'Live', statusClass: 'tsc-live' },
        { href: 'TEST/tech/network/tech-belnet.html', emojiHtml: '&#x1F9C5;', title: 'BelNet', desc: 'Onion-routed VPN via masternodes', statusLabel: 'In Dev', statusClass: 'tsc-dev' },
        { href: 'TEST/tech/network/tech-layerzero.html', emojiHtml: '&#x1F309;', title: 'LayerZero Bridge', desc: 'Cross-chain via Stargate', statusLabel: 'Live', statusClass: 'tsc-live' }
      ]
    },
    {
      label: 'Future & Research',
      dotClass: 'ts-dot-research',
      accentClass: 'tsc-research',
      items: [
        { href: 'TEST/tech/research/tech-evm.html', emojiHtml: '&#x2699;&#xFE0F;', title: 'EVM Integration', desc: 'Smart contracts on CryptoNote', statusLabel: 'In Dev', statusClass: 'tsc-dev' },
        { href: 'TEST/tech/research/tech-zk-snarks.html', emojiHtml: '&#x1F9EA;', title: 'zk-SNARKs', desc: 'Private smart contract proofs', statusLabel: 'Planned', statusClass: 'tsc-planned' },
        { href: 'TEST/tech/research/tech-vrf.html', emojiHtml: '&#x1F3B2;', title: 'VRF Consensus', desc: 'Random fair validator selection', statusLabel: 'Planned', statusClass: 'tsc-planned' }
      ]
    }
  ];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
    ));
  }

  function renderCoreTechStack() {
    const mount = document.getElementById('coreTechStack');
    if (!mount) return;

    mount.innerHTML = CORE_TECH_STACK_GROUPS.map((group) => (
      `<div class="ts-group">
        <div class="ts-group-label"><span class="ts-dot ${escapeHtml(group.dotClass)}"></span>${escapeHtml(group.label)}</div>
        <div class="ts-row">
          ${group.items.map((item) => (
            `<a href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer" class="tsc ${escapeHtml(group.accentClass)}">
              <span class="tsc-emoji">${item.emojiHtml}</span>
              <div class="tsc-body">
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.desc)}</p>
              </div>
              <span class="tsc-tag ${escapeHtml(item.statusClass)}">${escapeHtml(item.statusLabel)}</span>
            </a>`
          )).join('')}
        </div>
      </div>`
    )).join('');
  }

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

  renderCoreTechStack();

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

/* ═══════════════════════════════════════════════
   TIMELINE TAB — Filter functionality
   ═══════════════════════════════════════════════ */
(function () {
  function initTimelineFilters() {
    const filterRow = document.getElementById('tl-filters');
    if (!filterRow) return;

    const grid         = document.getElementById('tl-grid');
    const futureHeader = document.getElementById('tl-future-header');
    const events       = Array.from(grid.querySelectorAll('.timeline-event[data-status]'));
    const yearGroups   = Array.from(grid.querySelectorAll('.tl-year-group'));

    filterRow.addEventListener('click', function (e) {
      const btn = e.target.closest('.tl-filter-btn');
      if (!btn) return;

      // Toggle active button
      filterRow.querySelectorAll('.tl-filter-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      const filter = btn.dataset.tlFilter;

      // Show / hide events
      events.forEach(function (ev) {
        const match = filter === 'all' || ev.dataset.status === filter;
        ev.style.display = match ? '' : 'none';
      });

      // Show / hide year-group dividers: visible if any following event (before the next group) is visible
      yearGroups.forEach(function (yg) {
        if (filter === 'all') { yg.style.display = ''; return; }
        let sibling = yg.nextElementSibling;
        let hasVisible = false;
        while (sibling && !sibling.classList.contains('tl-year-group') && !sibling.classList.contains('tl-future-header')) {
          if (sibling.classList.contains('timeline-event') && sibling.style.display !== 'none') {
            hasVisible = true;
            break;
          }
          sibling = sibling.nextElementSibling;
        }
        yg.style.display = hasVisible ? '' : 'none';
      });

      // Show / hide future roadmap header
      if (futureHeader) {
        futureHeader.style.display =
          (filter === 'all' || filter === 'research' || filter === 'future') ? '' : 'none';
      }
    });
  }

  // Run after DOM is ready (script.js already wraps in DOMContentLoaded, but guard for safety)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTimelineFilters);
  } else {
    initTimelineFilters();
  }
})();

/* ═══════════════════════════════════════════════
   TIMELINE TAB — Scroll Reveal (IntersectionObserver)
   ═══════════════════════════════════════════════ */
(function () {
  var tlObserver = null;

  function revealEvents() {
    var grid = document.getElementById('tl-grid');
    if (!grid) return;

    var events = Array.from(grid.querySelectorAll('.timeline-event'));
    if (!events.length) return;

    // Disconnect any previous observer
    if (tlObserver) { tlObserver.disconnect(); tlObserver = null; }

    tlObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          // Small delay so CSS transition fires after element becomes visible
          requestAnimationFrame(function () {
            el.classList.add('tl-visible');
          });
          tlObserver.unobserve(el);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    events.forEach(function (el, i) {
      // Stagger delay capped at 250ms so page doesn't feel slow
      el.style.transitionDelay = Math.min(i * 40, 250) + 'ms';
      tlObserver.observe(el);
    });
  }

  // Re-run reveal each time the Timeline tab is activated
  function watchTabActivation() {
    var tabBtn = document.getElementById('tab-timeline');
    if (!tabBtn) return;
    tabBtn.addEventListener('click', function () {
      // Wait one frame for the tab content to be shown (hidden attr removed)
      requestAnimationFrame(function () {
        requestAnimationFrame(revealEvents);
      });
    });
  }

  function init() {
    watchTabActivation();
    // Also reveal on initial load if timeline tab happens to be active
    var timelinePanel = document.getElementById('timeline');
    if (timelinePanel && !timelinePanel.hidden) {
      revealEvents();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
