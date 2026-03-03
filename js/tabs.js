/* Tab navigation module */
var VALID_TABS = [
  'overview', 'team', 'links', 'exchanges', 'research',
  'evm', 'architecture', 'challenges', 'timeline', 'ecosystem', 'market'
];

var CORE_TECH_STACK_GROUPS = [
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
  return String(value).replace(/[&<>"']/g, function (char) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
  });
}

function renderCoreTechStack() {
  var mount = document.getElementById('coreTechStack');
  if (!mount) return;

  mount.innerHTML = CORE_TECH_STACK_GROUPS.map(function (group) {
    return '<div class="ts-group">' +
      '<div class="ts-group-label"><span class="ts-dot ' + escapeHtml(group.dotClass) + '"></span>' + escapeHtml(group.label) + '</div>' +
      '<div class="ts-row">' +
        group.items.map(function (item) {
          return '<a href="' + escapeHtml(item.href) + '" target="_blank" rel="noopener noreferrer" class="tsc ' + escapeHtml(group.accentClass) + '">' +
            '<span class="tsc-emoji">' + item.emojiHtml + '</span>' +
            '<div class="tsc-body"><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.desc) + '</p></div>' +
            '<span class="tsc-tag ' + escapeHtml(item.statusClass) + '">' + escapeHtml(item.statusLabel) + '</span>' +
          '</a>';
        }).join('') +
      '</div></div>';
  }).join('');
}

export function initTabs() {
  document.body.classList.add('js-loaded');

  var tabButtons = Array.from(document.querySelectorAll('.nav-tab[data-tab]'));
  var tabPanels = Array.from(document.querySelectorAll('.tab-content[role="tabpanel"]'));
  var pageHeader = document.getElementById('pageHeader');

  if (!tabButtons.length || !tabPanels.length) return;

  function activateTab(tabName, options) {
    options = options || {};
    var updateHash = options.updateHash !== false;
    var focusTab = options.focusTab || false;
    var safeTab = VALID_TABS.indexOf(tabName) !== -1 ? tabName : 'overview';
    var isOverview = safeTab === 'overview';

    if (pageHeader) {
      pageHeader.classList.toggle('header-hidden', !isOverview);
      pageHeader.setAttribute('aria-hidden', isOverview ? 'false' : 'true');
    }

    tabPanels.forEach(function (panel) {
      var isActive = panel.id === safeTab;
      panel.classList.toggle('active', isActive);
      panel.hidden = !isActive;
      panel.style.opacity = isActive ? '1' : '0';
    });

    tabButtons.forEach(function (button) {
      var isActive = button.dataset.tab === safeTab;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
      button.setAttribute('tabindex', isActive ? '0' : '-1');
      if (isActive && focusTab) button.focus();
    });

    if (safeTab === 'ecosystem') {
      var iframe = document.getElementById('eco-tree-frame');
      if (iframe && !iframe.getAttribute('src')) {
        iframe.setAttribute('src', 'beldex-tree.html?embed=1');
      }
    }

    if (updateHash && location.hash !== '#' + safeTab) {
      history.pushState(null, '', '#' + safeTab);
    }

    window.dispatchEvent(new CustomEvent('beldex:tabchange', {
      detail: { tab: safeTab }
    }));

    var activePanel = document.getElementById(safeTab);
    if (activePanel) {
      activePanel.querySelectorAll('.card, .diagram, .flow-box, .stat-box, .ecosystem-item').forEach(function (el) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    }
  }

  function getCurrentTab() {
    return (location.hash || '').replace('#', '');
  }

  renderCoreTechStack();

  tabButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activateTab(button.dataset.tab, { updateHash: true, focusTab: false });
    });

    button.addEventListener('keydown', function (event) {
      var index = tabButtons.indexOf(button);
      var nextIndex = null;

      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabButtons.length;
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabButtons.length - 1;

      if (nextIndex !== null) {
        event.preventDefault();
        activateTab(tabButtons[nextIndex].dataset.tab, { updateHash: true, focusTab: true });
      }
    });
  });

  var hashTab = getCurrentTab();
  activateTab(VALID_TABS.indexOf(hashTab) !== -1 ? hashTab : 'overview', { updateHash: false, focusTab: false });

  window.addEventListener('hashchange', function () {
    var tab = getCurrentTab();
    activateTab(VALID_TABS.indexOf(tab) !== -1 ? tab : 'overview', { updateHash: false, focusTab: false });
  });

  window.showTab = function showTab(tabName) {
    activateTab(tabName, { updateHash: true, focusTab: false });
  };
}
