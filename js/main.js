import { initTheme } from './theme.js';
import { initTabs } from './tabs.js';
import { initAnimations } from './animations.js';
import { initUIEffects } from './ui-effects.js';
import { initTimeline } from './timeline.js';

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

function setupPriceWidgetLazyLoad() {
  var marketTabButton = document.querySelector('.nav-tab[data-tab="market"]');

  if (marketTabButton) {
    marketTabButton.addEventListener('click', initPriceWidgetOnDemand, { once: true });
  }

  window.addEventListener('beldex:tabchange', function (event) {
    if (event && event.detail && event.detail.tab === 'market') {
      initPriceWidgetOnDemand();
    }
  });

  window.addEventListener('hashchange', function () {
    if (location.hash === '#market') {
      initPriceWidgetOnDemand();
    }
  });

  if (location.hash === '#market') {
    initPriceWidgetOnDemand();
  }
}

function initApp() {
  initTheme();
  initTabs();
  initAnimations();
  initUIEffects();
  initTimeline();
  setupPriceWidgetLazyLoad();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
