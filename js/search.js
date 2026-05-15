// search.js — fullscreen search overlay
import { loadProducts } from './products.js';
import { productCard } from './products.js';

const KEY_RECENT = 'komaura_recent_search_v1';
const recent = () => { try { return JSON.parse(localStorage.getItem(KEY_RECENT) || '[]'); } catch { return []; } };
const pushRecent = (q) => {
  const arr = [q, ...recent().filter(x => x !== q)].slice(0, 6);
  localStorage.setItem(KEY_RECENT, JSON.stringify(arr));
};

let allProducts = [];

export async function initSearch() {
  allProducts = await loadProducts();
  renderRecent();
}

export function openSearch() {
  const o = document.getElementById('search');
  o.classList.add('show');
  document.body.classList.add('no-scroll');
  setTimeout(() => document.getElementById('search-input').focus(), 100);
  renderRecent();
}

export function closeSearch() {
  document.getElementById('search').classList.remove('show');
  document.body.classList.remove('no-scroll');
}

function renderRecent() {
  const wrap = document.getElementById('search-recent');
  if (!wrap) return;
  const items = recent();
  if (items.length === 0) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = `<span class="label">Recent</span>` +
    items.map(q => `<button class="chip" data-q="${q}">${q}</button>`).join('');
  wrap.querySelectorAll('[data-q]').forEach(b => {
    b.addEventListener('click', () => {
      const inp = document.getElementById('search-input');
      inp.value = b.dataset.q;
      runSearch(b.dataset.q);
    });
  });
}

export function runSearch(q) {
  const results = document.getElementById('search-results');
  if (!q || q.length < 2) {
    results.innerHTML = '';
    return;
  }
  // Skeleton
  results.innerHTML = Array.from({length: 4}).map(() => `<div class="skeleton skel-card"></div>`).join('');
  setTimeout(() => {
    const ql = q.toLowerCase();
    const matches = allProducts.filter(p =>
      p.name.toLowerCase().includes(ql) ||
      p.category.toLowerCase().includes(ql) ||
      p.tagline.toLowerCase().includes(ql)
    );
    if (matches.length === 0) {
      results.innerHTML = `<div class="empty" style="grid-column:1/-1"><span class="script">No matches</span><p>Try “bridal”, “red”, or “chrome”.</p></div>`;
    } else {
      results.innerHTML = matches.map(productCard).join('');
    }
    pushRecent(q);
  }, 280);
}
