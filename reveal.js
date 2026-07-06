// Subtle scroll-reveal for value prop cards, how-it-works steps, feature cards,
// FAQ items, and the final CTA block. Respects prefers-reduced-motion.
(function () {
  var els = document.querySelectorAll(
    '#values .card, #how .step, #features .feature, #faq .faq-item, #signup .section-title, #signup .section-sub, #signup #signup-form, #signup .cta-note'
  );
  els.forEach(function (el) { el.classList.add('reveal'); });

  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
    els.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(function (el) { io.observe(el); });
})();
