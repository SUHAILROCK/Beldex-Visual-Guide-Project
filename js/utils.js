/* Shared utilities */

/**
 * Returns a function that only calls `fn` after `delay` ms of no new calls.
 */
export function debounce(fn, delay) {
  var timer;
  return function () {
    clearTimeout(timer);
    var args = arguments;
    var ctx = this;
    timer = setTimeout(function () { fn.apply(ctx, args); }, delay);
  };
}

/**
 * Returns a function throttled to one call per animation frame.
 * Uses requestAnimationFrame so it aligns with browser paint cycles.
 */
export function throttleRaf(fn) {
  var ticking = false;
  return function () {
    if (!ticking) {
      var args = arguments;
      var ctx = this;
      requestAnimationFrame(function () {
        fn.apply(ctx, args);
        ticking = false;
      });
      ticking = true;
    }
  };
}
