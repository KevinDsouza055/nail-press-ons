// main.js — site bootstrap (preloader, nav, drawer, search, toasts, back-to-top)
import { initReveals, autoStaggerCards } from './animations.js';
import { cart, wishlist, updateBadge, openDrawer, closeDrawer, bindWishlistButtons, bindQuickAdd } from './cart.js';
import { initSearch, openSearch, closeSearch, runSearch } from './search.js';
import { markActiveLinks } from './router.js';

// ---------- Toast system ----------
let toastsRoot;
export function toast(msg, type = 'info') {
  if (!toastsRoot) {
    toastsRoot = document.createElement('div');
    toastsRoot.className = 'toasts';
    document.body.appendChild(toastsRoot);
  }
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = `<span class="dot"></span><span>${msg}</span>`;
  toastsRoot.appendChild(el);
  setTimeout(() => el.classList.add('out'), 2400);
  setTimeout(() => el.remove(), 2900);
}
window.komauraToast = toast;

// ---------- Preloader ----------
function hidePreloader() {
  const p = document.querySelector('.preloader');
  if (p) setTimeout(() => p.classList.add('done'), 700);
}

// ---------- Nav scroll state ----------
function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 16);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ---------- Back to top ----------
function initToTop() {
  const btn = document.querySelector('.totop');
  if (!btn) return;
  const on = () => btn.classList.toggle('show', window.scrollY > 600);
  on();
  window.addEventListener('scroll', on, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ---------- Mobile Nav Menu ----------
function toggleMobNav(open) {
  const d = document.getElementById('mob-nav-drawer');
  const b = document.getElementById('mob-nav-back');
  if (!d || !b) return;
  d.style.transform = open ? 'translateX(0)' : 'translateX(-100%)';
  b.classList.toggle('show', open);
  document.body.classList.toggle('no-scroll', open);
}

// ---------- Bind drawer / search triggers ----------
function bindGlobal() {
  document.querySelectorAll('[data-open-drawer]').forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); openDrawer(); }));
  document.querySelectorAll('[data-close-drawer]').forEach(b => b.addEventListener('click', closeDrawer));
  document.querySelectorAll('[data-open-mob-nav]').forEach(b => b.addEventListener('click', () => toggleMobNav(true)));
  document.querySelectorAll('[data-close-mob-nav]').forEach(b => b.addEventListener('click', () => toggleMobNav(false)));
  document.querySelectorAll('[data-open-search]').forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); openSearch(); }));
  document.querySelectorAll('[data-close-search]').forEach(b => b.addEventListener('click', closeSearch));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeDrawer(); closeSearch(); }
  });

  const inp = document.getElementById('search-input');
  if (inp) {
    let t;
    inp.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => runSearch(inp.value.trim()), 220);
    });
  }
}

// ---------- Init on every page ----------
async function init() {
  // Inject shared partials if placeholders present
  await injectPartials();
  markActiveLinks();
  initNavScroll();
  initToTop();
  bindGlobal();
  bindWishlistButtons();
  bindQuickAdd();
  updateBadge();
  initReveals();
  initSearch();
  hidePreloader();
}

async function injectPartials() {
  // Inject only when components/ partial files load (works on http(s) servers).
  const slot = document.querySelector('[data-include="navbar"]');
  if (slot) {
    try {
      const r = await fetch('components/navbar.html');
      if (r.ok) slot.outerHTML = await r.text();
    } catch {}
  }
  const fSlot = document.querySelector('[data-include="footer"]');
  if (fSlot) {
    try {
      const r = await fetch('components/footer.html');
      if (r.ok) fSlot.outerHTML = await r.text();
    } catch {}
  }
}

document.addEventListener('DOMContentLoaded', init);

export { autoStaggerCards };
