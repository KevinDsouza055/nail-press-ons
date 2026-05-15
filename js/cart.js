// cart.js — cart, wishlist, recently viewed (LocalStorage)
import { loadProducts, formatPrice } from './products.js';
import { toast } from './main.js';

const KEY_CART = 'komaura_cart_v1';
const KEY_WISH = 'komaura_wish_v1';
const KEY_RECENT = 'komaura_recent_v1';

const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } };
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export const cart = {
  items: read(KEY_CART),
  save() { write(KEY_CART, this.items); updateBadge(); },
  add(id, opts = {}) {
    const key = id + '|' + (opts.size || 'M') + '|' + (opts.shape || '');
    const ex = this.items.find(i => i.key === key);
    if (ex) ex.qty += opts.qty || 1;
    else this.items.push({ key, id, size: opts.size || 'M', shape: opts.shape || '', qty: opts.qty || 1 });
    this.save();
  },
  remove(key) { this.items = this.items.filter(i => i.key !== key); this.save(); },
  setQty(key, qty) {
    const it = this.items.find(i => i.key === key);
    if (it) { it.qty = Math.max(1, qty); this.save(); }
  },
  count() { return this.items.reduce((a, i) => a + i.qty, 0); },
  clear() { this.items = []; this.save(); },
};

export const wishlist = {
  ids: read(KEY_WISH),
  has(id) { return this.ids.includes(id); },
  toggle(id) {
    if (this.has(id)) this.ids = this.ids.filter(x => x !== id);
    else this.ids.push(id);
    write(KEY_WISH, this.ids);
    return this.has(id);
  }
};

export const recent = {
  ids: read(KEY_RECENT),
  push(id) {
    this.ids = [id, ...this.ids.filter(x => x !== id)].slice(0, 8);
    write(KEY_RECENT, this.ids);
  }
};

export function updateBadge() {
  const b = document.querySelector('[data-cart-count]');
  if (!b) return;
  const c = cart.count();
  b.textContent = c;
  b.classList.toggle('is-on', c > 0);
}

export async function renderCartDrawer() {
  const body = document.getElementById('drawer-body');
  const foot = document.getElementById('drawer-foot');
  if (!body) return;
  const products = await loadProducts();
  if (cart.items.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <span class="script">Your edit awaits</span>
        <p style="margin-top:12px">Begin with the pieces you love.</p>
        <a href="shop.html" class="btn btn-primary" style="margin-top:18px">Browse Shop</a>
      </div>`;
    foot.style.display = 'none';
    return;
  }
  foot.style.display = 'block';
  let subtotal = 0;
  body.innerHTML = cart.items.map(it => {
    const p = products.find(x => x.id === it.id);
    if (!p) return '';
    subtotal += p.price * it.qty;
    return `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.name}">
        <div>
          <h4>${p.name}</h4>
          <div class="meta">Size ${it.size}${it.shape ? ' · ' + it.shape : ''}</div>
          <div class="qty">
            <button data-dec="${it.key}" aria-label="Decrease">−</button>
            <span>${it.qty}</span>
            <button data-inc="${it.key}" aria-label="Increase">+</button>
          </div>
          <button class="rm" data-rm="${it.key}">Remove</button>
        </div>
        <div class="price">${formatPrice(p.price * it.qty)}</div>
      </div>`;
  }).join('');
  document.getElementById('cart-subtotal').textContent = formatPrice(subtotal);
  document.getElementById('cart-total').textContent = formatPrice(subtotal);

  body.querySelectorAll('[data-inc]').forEach(b => b.onclick = () => { cart.setQty(b.dataset.inc, (cart.items.find(i=>i.key===b.dataset.inc).qty)+1); renderCartDrawer(); });
  body.querySelectorAll('[data-dec]').forEach(b => b.onclick = () => { cart.setQty(b.dataset.dec, (cart.items.find(i=>i.key===b.dataset.dec).qty)-1); renderCartDrawer(); });
  body.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { cart.remove(b.dataset.rm); renderCartDrawer(); toast('Removed from bag', 'info'); });
}

export function openDrawer() {
  document.getElementById('drawer').classList.add('show');
  document.getElementById('drawer-back').classList.add('show');
  document.body.classList.add('no-scroll');
  renderCartDrawer();
}
export function closeDrawer() {
  document.getElementById('drawer').classList.remove('show');
  document.getElementById('drawer-back').classList.remove('show');
  document.body.classList.remove('no-scroll');
}

export function bindWishlistButtons(root = document) {
  root.querySelectorAll('[data-wishlist]').forEach(btn => {
    const id = btn.dataset.wishlist;
    if (wishlist.has(id)) btn.classList.add('is-on');
    btn.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const on = wishlist.toggle(id);
      btn.classList.toggle('is-on', on);
      toast(on ? 'Added to wishlist ♡' : 'Removed from wishlist', on ? 'success' : 'info');
    });
  });
}

export function bindQuickAdd(root = document) {
  root.querySelectorAll('[data-quick]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      cart.add(btn.dataset.quick, { size: 'M' });
      toast('Added to bag ✓', 'success');
    });
  });
}
