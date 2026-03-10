/**
 * Search / filter functionality for Exchanges and Official Links tabs
 */
import { debounce } from './utils.js';

/**
 * Generic card‐filter that hides non‐matching cards and collapses
 * section‐headers whose entire section has zero visible cards.
 *
 * @param {string} containerId  – the tab wrapper id, e.g. "exchanges"
 * @param {string} cardSelector – CSS selector for the filterable cards
 * @param {string} query        – search string (case‐insensitive)
 * @param {string} noResultsId  – id of the "no results" element
 */
function filterCards(containerId, cardSelector, query, noResultsId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var q = query.trim().toLowerCase();
  var cards = container.querySelectorAll(cardSelector);
  var anyVisible = false;

  cards.forEach(function (card) {
    var text = (card.textContent || '').toLowerCase();
    var match = !q || text.indexOf(q) !== -1;
    card.style.display = match ? '' : 'none';
    if (match) anyVisible = true;
  });

  // Hide / show section headers whose section is entirely hidden
  var grids = container.querySelectorAll('.exchanges-grid, .exchanges-grid-dex, .official-links-grid');
  grids.forEach(function (grid) {
    var visibleInGrid = grid.querySelectorAll(cardSelector + ':not([style*="display: none"])');
    var hasVisible = visibleInGrid.length > 0;

    // Walk backwards to find the closest preceding section‐header
    var prev = grid.previousElementSibling;
    while (prev) {
      if (prev.classList.contains('section-header') || prev.classList.contains('india-exchanges-note')) {
        prev.style.display = hasVisible ? '' : 'none';
        break;
      }
      // Also hide the contract-addresses block in DEX section if no DEX cards match
      if (prev.classList.contains('contract-addresses')) {
        prev.style.display = hasVisible ? '' : 'none';
      }
      prev = prev.previousElementSibling;
    }
  });

  // "No results" message
  var noResults = document.getElementById(noResultsId);
  if (noResults) {
    noResults.style.display = (q && !anyVisible) ? 'block' : 'none';
  }
}

/**
 * Wire up the Exchanges search box
 */
function initExchangeSearch() {
  var input = document.getElementById('exchange-search');
  if (!input) return;
  input.addEventListener('input', debounce(function () {
    filterCards('exchanges', '.exchange-card', input.value, 'exchange-no-results');
  }, 300));
}

/**
 * Wire up the Official Links search box
 */
function initLinksSearch() {
  var input = document.getElementById('links-search');
  if (!input) return;
  input.addEventListener('input', debounce(function () {
    filterCards('links', '.official-link-card', input.value, 'links-no-results');
  }, 300));
}

/**
 * Initialise all search boxes
 */
export function initSearch() {
  initExchangeSearch();
  initLinksSearch();
}
