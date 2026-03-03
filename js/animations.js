/* Animation module */
export function initAnimations() {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.card, .diagram, .flow-box, .stat-box, .ecosystem-item').forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
    observer.observe(el);
  });

  function animateValue(obj, start, end, duration) {
    var startTimestamp = null;

    function step(timestamp) {
      if (!startTimestamp) startTimestamp = timestamp;
      var progress = Math.min((timestamp - startTimestamp) / duration, 1);
      var val = Math.floor(progress * (end - start) + start);
      obj.innerHTML = (obj.dataset.prefix || '') + val + (obj.dataset.suffix || '');
      if (progress < 1) window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
  }

  var statObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var originalText = el.innerText;
        var numberMatch = originalText.match(/(\d+)/);
        if (numberMatch) {
          var number = parseInt(numberMatch[0], 10);
          var parts = originalText.split(number);
          el.dataset.prefix = parts[0];
          el.dataset.suffix = parts[1];
          animateValue(el, 0, number, 1500);
        }
        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-box h3').forEach(function (box) {
    statObserver.observe(box);
  });

  var scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    window.addEventListener('scroll', function () {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
    });
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
