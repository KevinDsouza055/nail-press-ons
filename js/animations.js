// animations.js — IntersectionObserver scroll reveals
export function initReveals(root = document) {
  const els = root.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(e => e.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(e => io.observe(e));
}

export function autoStaggerCards(container) {
  if (!container) return;
  Array.from(container.children).forEach((el, i) => {
    el.classList.add('reveal');
    el.dataset.delay = String((i % 6) + 1);
  });
}
