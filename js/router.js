// router.js — minimal helpers for active link state across multi-page site
export function markActiveLinks() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-link]').forEach(a => {
    const target = a.getAttribute('href');
    if (target === path || (path === '' && target === 'index.html')) {
      a.classList.add('is-active');
    }
  });
}

export function getQuery(name) {
  return new URLSearchParams(location.search).get(name);
}
