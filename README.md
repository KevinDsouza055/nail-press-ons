# Komaura Beauty — Production Frontend

A handcrafted multi-page ecommerce site for **Komaura Beauty**, a soft gel
press-on nail atelier by Komal Joshi (Jodhpur, India).

Built in pure **HTML5 + CSS3 + Vanilla JavaScript (ES6 modules)**.
No frameworks, no Tailwind, no jQuery.

---

## Run locally

ES modules and `fetch()` require an HTTP server (they don't work over `file://`).
From this folder:

```bash
# Python 3
python3 -m http.server 5173

# or Node
npx serve .
```

Then open http://localhost:5173

---

## Project structure

```
/index.html              Home (hero, vibes, bestsellers, story, testimonials, instagram)
/shop.html               Full shop with filters + sort
/product.html            Product detail (gallery, variants, accordion, related)
/about.html              Atelier story, process, timeline
/faq.html                Tabbed FAQ (Ordering, Shipping, Sizing, Application)
/contact.html            Form + WhatsApp + Instagram + email
/checkout.html           2-col luxury checkout with Razorpay
/success.html            Animated checkmark + confetti + order summary

/assets/
  /images                Editorial + hero photography
  /products              Product photography
  /icons                 (reserved for future svg icons)

/css/
  base.css               Tokens, reset, typography, buttons
  components.css         Nav, cards, drawer, search, accordion, footer, etc.
  animations.css         Reveal-on-scroll + reduced-motion guard
  responsive.css         Tablet + mobile breakpoints

/js/
  main.js                Bootstrap (preloader, nav, toast, drawer/search wiring)
  products.js            Product loading + card rendering
  cart.js                Cart, wishlist, recently-viewed (LocalStorage)
  search.js              Fullscreen search overlay
  router.js              Active-link helper + query parsing
  animations.js          IntersectionObserver reveal system
  checkout.js            Razorpay (test mode) integration

/data/products.json      Centralized product catalog
/components/             Reusable HTML partials (navbar, footer, product-card)
```

---

## Razorpay (test mode)

`js/checkout.js` ships with the public Razorpay test key
`rzp_test_1DP5mmOlF5G5ag`. To go live:

1. Replace `RAZORPAY_KEY_ID` with your production key.
2. Add a server endpoint that creates an `order_id` (required for live mode
   signature verification). Pass it into `options.order_id`.
3. Verify `razorpay_payment_id`, `razorpay_order_id`, and
   `razorpay_signature` on your server before fulfilling the order.

The current frontend is structured so step 2/3 can be added without
touching UI code.

---

## Design system (CSS variables)

| Token | Value |
|---|---|
| `--cream` | `#FAF7F4` |
| `--blush` | `#F2D9D0` |
| `--rose` | `#C9847A` |
| `--mauve` | `#9E6B6B` |
| `--chrome` | `#C8C0BB` |
| `--ink` | `#2A1F1F` |

**Typography**
- Display: Cormorant Garamond
- Body: DM Sans
- Accent: Sacramento

**Motion** — 240–600ms `cubic-bezier(.22,1,.36,1)`, transform/opacity only.
Respects `prefers-reduced-motion`.

---

## Persistent state (LocalStorage)

- `komaura_cart_v1` — bag contents
- `komaura_wish_v1` — wishlisted product ids
- `komaura_recent_v1` — recently viewed products
- `komaura_recent_search_v1` — recent search terms

---

## Performance notes

- Critical fonts preconnected, swap-loaded
- Hero image uses `fetchpriority="high"`; rest are `loading="lazy"`
- All animations use `transform` / `opacity` only — no layout thrashing
- Skeleton loaders for products and search
- Reduced-motion guard in `animations.css`
- Inline SVG favicon (no extra request)

---

Made by hand. Built to feel like one.
