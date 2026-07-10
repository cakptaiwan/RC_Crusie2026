(function () {
  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function init() {
    var revEls = document.querySelectorAll('.rev');
    if (!revEls.length) return;

    if (prefersReducedMotion()) {
      revEls.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    var i = 0;
    revEls.forEach(function (el) {
      if (el.classList.contains('is-visible')) return;
      el.style.transitionDelay = ((i++ % 5) * 90) + 'ms';
      io.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
