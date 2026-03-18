import { initTheme } from './theme.js';
import { initTabs } from './tabs.js';
import { initAnimations } from './animations.js';
import { initUIEffects } from './ui-effects.js';
import { initTimeline } from './timeline.js';
import { initSearch } from './search.js';

var priceWidgetModulePromise = null;
var priceWidgetInitialized = false;

function initPriceWidgetOnDemand() {
  if (priceWidgetInitialized) return;

  if (!priceWidgetModulePromise) {
    priceWidgetModulePromise = import('./price-widget.js');
  }

  priceWidgetModulePromise
    .then(function (module) {
      if (priceWidgetInitialized) return;
      module.initPriceWidget();
      priceWidgetInitialized = true;
    })
    .catch(function (error) {
      console.error('Failed to load price widget module:', error);
    });
}

function toggleWidgetVisibility(tab) {
  var widget = document.getElementById('bdx-widget');
  if (!widget) return;
  var show = (tab === 'market' || tab === 'exchanges');
  widget.style.display = show ? '' : 'none';
}

function setupPriceWidgetLazyLoad() {
  var widget = document.getElementById('bdx-widget');
  if (widget) widget.style.display = 'none';

  var marketTabButton = document.querySelector('.nav-tab[data-tab="market"]');

  if (marketTabButton) {
    marketTabButton.addEventListener('click', initPriceWidgetOnDemand, { once: true });
  }

  var exchangesTabButton = document.querySelector('.nav-tab[data-tab="exchanges"]');
  if (exchangesTabButton) {
    exchangesTabButton.addEventListener('click', initPriceWidgetOnDemand, { once: true });
  }

  window.addEventListener('beldex:tabchange', function (event) {
    var tab = event && event.detail && event.detail.tab;
    if (tab === 'market' || tab === 'exchanges') {
      initPriceWidgetOnDemand();
    }
    toggleWidgetVisibility(tab);
  });

  window.addEventListener('hashchange', function () {
    var hash = (location.hash || '').replace('#', '');
    if (hash === 'market' || hash === 'exchanges') {
      initPriceWidgetOnDemand();
    }
    toggleWidgetVisibility(hash);
  });

  var initialHash = (location.hash || '').replace('#', '');
  if (initialHash === 'market' || initialHash === 'exchanges') {
    initPriceWidgetOnDemand();
    toggleWidgetVisibility(initialHash);
  }
}

function initApp() {
  initTheme();
  initTabs();
  initAnimations();
  initUIEffects();
  initTimeline();
  initSearch();
  setupPriceWidgetLazyLoad();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
