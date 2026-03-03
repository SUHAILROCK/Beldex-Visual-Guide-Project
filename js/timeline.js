/* Timeline module */
function initTimelineFilters() {
  var filterRow = document.getElementById('tl-filters');
  if (!filterRow) return;

  var grid = document.getElementById('tl-grid');
  if (!grid) return;

  var futureHeader = document.getElementById('tl-future-header');
  var events = Array.from(grid.querySelectorAll('.timeline-event[data-status]'));
  var yearGroups = Array.from(grid.querySelectorAll('.tl-year-group'));

  filterRow.addEventListener('click', function (event) {
    var btn = event.target.closest('.tl-filter-btn');
    if (!btn) return;

    filterRow.querySelectorAll('.tl-filter-btn').forEach(function (button) {
      button.classList.remove('active');
    });
    btn.classList.add('active');

    var filter = btn.dataset.tlFilter;

    events.forEach(function (timelineEvent) {
      var match;
      if (filter === 'all') {
        match = true;
      } else if (filter === 'hardfork') {
        match = timelineEvent.dataset.hardfork === 'true';
      } else {
        match = timelineEvent.dataset.status === filter;
      }
      timelineEvent.style.display = match ? '' : 'none';
    });

    yearGroups.forEach(function (yearGroup) {
      if (filter === 'all') {
        yearGroup.style.display = '';
        return;
      }

      var sibling = yearGroup.nextElementSibling;
      var hasVisible = false;
      while (sibling && !sibling.classList.contains('tl-year-group') && !sibling.classList.contains('tl-future-header')) {
        if (sibling.classList.contains('timeline-event') && sibling.style.display !== 'none') {
          hasVisible = true;
          break;
        }
        sibling = sibling.nextElementSibling;
      }
      yearGroup.style.display = hasVisible ? '' : 'none';
    });

    if (futureHeader) {
      futureHeader.style.display =
        (filter === 'all' || filter === 'research' || filter === 'future') ? '' : 'none';
    }
  });
}

function createTimelineReveal() {
  var timelineObserver = null;

  function revealEvents() {
    var grid = document.getElementById('tl-grid');
    if (!grid) return;

    var events = Array.from(grid.querySelectorAll('.timeline-event'));
    if (!events.length) return;

    if (timelineObserver) {
      timelineObserver.disconnect();
      timelineObserver = null;
    }

    timelineObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var element = entry.target;
          requestAnimationFrame(function () {
            element.classList.add('tl-visible');
          });
          timelineObserver.unobserve(element);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    events.forEach(function (eventElement, index) {
      eventElement.style.transitionDelay = Math.min(index * 40, 250) + 'ms';
      timelineObserver.observe(eventElement);
    });
  }

  return revealEvents;
}

export function initTimeline() {
  initTimelineFilters();

  var revealEvents = createTimelineReveal();
  var tabBtn = document.getElementById('tab-timeline');
  if (tabBtn) {
    tabBtn.addEventListener('click', function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(revealEvents);
      });
    });
  }

  var timelinePanel = document.getElementById('timeline');
  if (timelinePanel && !timelinePanel.hidden) {
    revealEvents();
  }
}
