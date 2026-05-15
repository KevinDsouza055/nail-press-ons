// products.js — fetch and render product data
export async function loadProducts() {
  if (window.__komauraProducts) return window.__komauraProducts;
  const res = await fetch('data/products.json', { cache: 'force-cache' });
  if (!res.ok) throw new Error('Failed to load products');
  const data = await res.json();
  window.__komauraProducts = data;
  return data;
}

export function formatPrice(n) {
  return '₹' + n.toLocaleString('en-IN');
}

export function productCard(p) {
  return `
    <article class="card reveal" data-id="${p.id}">
      <a class="card__media" href="product.html?id=${p.id}" aria-label="${p.name}">
        <img class="a" src="${p.image}" alt="${p.name}" loading="lazy" decoding="async" width="800" height="1000">
        ${p.imageHover ? `<img class="b" src="${p.imageHover}" alt="" loading="lazy" decoding="async" aria-hidden="true">` : ''}
      </a>
      <button class="card__heart" data-wishlist="${p.id}" aria-label="Add to wishlist">
        <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.5-9.1C1.1 8.5 3.4 5 6.8 5c2 0 3.6 1.1 4.4 2.5C12 6.1 13.6 5 15.6 5 19 5 21.3 8.5 19.9 11.9 17.9 16.4 12 21 12 21z"/></svg>
      </button>
      <div class="card__content">
        <a href="product.html?id=${p.id}" class="card__details">
          <div class="card__cat">${p.category}</div>
          <h3 class="card__name">${p.name}</h3>
          <div class="card__price">${p.compareAt ? `<s>${formatPrice(p.compareAt)}</s>` : ''}${formatPrice(p.price)}</div>
        </a>
        <div class="card__actions">
          <button class="card__btn card__btn--add" data-quick="${p.id}" aria-label="Add to bag">Add</button>
          <button class="card__btn card__btn--buy" data-buy-now="${p.id}">Buy Now</button>
        </div>
      </div>
    </article>`;
}

export function renderGrid(target, products) {
  target.innerHTML = products.map(productCard).join('');
}
