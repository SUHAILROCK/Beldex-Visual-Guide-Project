/* Price widget module */
var API_BASE = 'https://api.coingecko.com/api/v3/coins/markets?ids=beldex&vs_currency=';
var REFRESH_MS = 60000;
var cache = { usd: null, inr: null };
var currentCurrency = 'usd';
var symbols = { usd: '$', inr: '\u20b9' };
var refreshTimer = null;
var initialized = false;

function fmtPrice(n, cur) {
  if (n == null || isNaN(n)) return '\u2014';
  var symbol = symbols[cur] || '$';
  if (n >= 1) {
    return symbol + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }
  return symbol + n.toFixed(6);
}

function fmtBig(n, symbol) {
  if (n == null || isNaN(n)) return '\u2014';
  symbol = symbol || '$';
  if (n >= 1e12) return symbol + (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return symbol + (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return symbol + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return symbol + (n / 1e3).toFixed(1) + 'K';
  return symbol + n.toFixed(2);
}

function fmtSupply(n) {
  if (n == null || isNaN(n)) return '\u2014';
  if (n >= 1e9) return (n / 1e9).toFixed(3) + 'B BDX';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M BDX';
  return n.toLocaleString() + ' BDX';
}

function fmtChange(c) {
  if (c == null || isNaN(c)) return '\u2014';
  return (c >= 0 ? '\u25b2 +' : '\u25bc ') + c.toFixed(2) + '%';
}

function setChange(el, change) {
  if (!el) return;
  el.textContent = fmtChange(change);
  el.classList.remove('price-up', 'price-down');
  if (change > 0) el.classList.add('price-up');
  else if (change < 0) el.classList.add('price-down');
}

function flashEl(el) {
  if (!el) return;
  el.classList.remove('bdx-price-flash');
  void el.offsetWidth;
  el.classList.add('bdx-price-flash');
}

function updateUI(data, cur) {
  if (!data) return;

  document.querySelectorAll('#market .mkt-skeleton').forEach(function (skeleton) {
    skeleton.remove();
  });

  var mChangeEl = document.getElementById('mkt-change');
  if (mChangeEl) mChangeEl.classList.remove('mkt-hero-change--loading');

  var widget = document.getElementById('bdx-widget');
  if (widget) widget.classList.remove('wgt-loading');

  cur = cur || currentCurrency;
  var symbol = symbols[cur] || '$';
  var price = data.current_price;
  var change = data.price_change_percentage_24h;
  var mcap = data.market_cap;
  var vol = data.total_volume;
  var now = new Date().toLocaleTimeString();

  var circSup = (cache.usd || data).circulating_supply;
  var totalSup = (cache.usd || data).total_supply;
  var maxSup = (cache.usd || data).max_supply;

  var wPrice = document.getElementById('wgt-price');
  var wChange = document.getElementById('wgt-change');
  if (wPrice) {
    wPrice.textContent = fmtPrice(price, cur);
    flashEl(wPrice);
  }
  setChange(wChange, change);

  var heroLabel = document.getElementById('mkt-hero-label');
  var mPrice = document.getElementById('mkt-price');
  var mChange = document.getElementById('mkt-change');
  var mCCard = document.getElementById('mkt-change-card');
  var mMcap = document.getElementById('mkt-mcap');
  var mVol = document.getElementById('mkt-vol');
  var mSupply = document.getElementById('mkt-supply');
  var mTotalSup = document.getElementById('mkt-total-supply');
  var mMaxSup = document.getElementById('mkt-max-supply');
  var mUpd = document.getElementById('mkt-updated');

  if (heroLabel) heroLabel.textContent = 'BDX\u00a0/\u00a0' + cur.toUpperCase() + '\u00a0\u00b7\u00a0Live Price';
  if (mPrice) {
    mPrice.textContent = fmtPrice(price, cur);
    flashEl(mPrice);
  }
  setChange(mChange, change);
  if (mCCard) {
    mCCard.textContent = fmtChange(change);
    mCCard.className = 'mkt-stat-val ' + (change >= 0 ? 'price-up' : 'price-down');
  }
  if (mMcap) mMcap.textContent = fmtBig(mcap, symbol);
  if (mVol) mVol.textContent = fmtBig(vol, symbol);
  if (mSupply) mSupply.textContent = fmtSupply(circSup);
  if (mTotalSup) mTotalSup.textContent = fmtSupply(totalSup);
  if (mMaxSup) mMaxSup.textContent = maxSup ? fmtSupply(maxSup) : '\u221e  No Cap';
  if (mUpd) mUpd.textContent = 'Last updated: ' + now + '\u2002\u00b7\u2002' + cur.toUpperCase();
}

function fetchPrice() {
  return Promise.all([
    fetch(API_BASE + 'usd').then(function (response) { return response.json(); }),
    fetch(API_BASE + 'inr').then(function (response) { return response.json(); })
  ])
    .then(function (results) {
      var usd = results[0] && results[0][0];
      var inr = results[1] && results[1][0];
      if (usd) cache.usd = usd;
      if (inr) cache.inr = inr;
      updateUI(cache[currentCurrency], currentCurrency);
    })
    .catch(function () {
      var updated = document.getElementById('mkt-updated');
      var data = cache.usd || cache.inr;
      if (updated && data) updated.textContent += ' (retrying\u2026)';
    });
}

function initToggle() {
  var buttons = document.querySelectorAll('.mkt-currency-btn');
  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      currentCurrency = button.dataset.currency;
      buttons.forEach(function (b) { b.classList.remove('active'); });
      button.classList.add('active');
      var data = cache[currentCurrency];
      if (data) updateUI(data, currentCurrency);
    });
  });
}

export function initPriceWidget() {
  if (initialized) return;
  initialized = true;

  initToggle();
  fetchPrice();
  if (!refreshTimer) {
    refreshTimer = setInterval(fetchPrice, REFRESH_MS);
  }
}
