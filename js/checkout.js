// checkout.js — checkout form + Razorpay (TEST MODE) frontend integration
import { loadProducts, formatPrice } from './products.js';
import { cart } from './cart.js';
import { toast } from './main.js';

// TEST KEY — public publishable test key. Replace with your own for production.
const RAZORPAY_KEY_ID = 'rzp_test_1DP5mmOlF5G5ag';

export async function renderCheckoutSummary() {
  const wrap = document.getElementById('co-summary-lines');
  if (!wrap) return;
  const products = await loadProducts();
  if (cart.items.length === 0) {
    wrap.innerHTML = `<p style="text-align:center; padding:24px 0">Your bag is empty.</p>`;
    document.getElementById('co-pay').setAttribute('disabled', 'true');
    return;
  }
  let subtotal = 0;
  wrap.innerHTML = cart.items.map(it => {
    const p = products.find(x => x.id === it.id);
    if (!p) return '';
    subtotal += p.price * it.qty;
    return `<div class="line"><span>${p.name} × ${it.qty}<br><small style="color:var(--mauve)">Size ${it.size}</small></span><span>${formatPrice(p.price * it.qty)}</span></div>`;
  }).join('');
  const shipping = subtotal > 1500 ? 0 : 99;
  document.getElementById('co-subtotal').textContent = formatPrice(subtotal);
  document.getElementById('co-shipping').textContent = shipping === 0 ? 'Complimentary' : formatPrice(shipping);
  document.getElementById('co-total').textContent = formatPrice(subtotal + shipping);
  window.__coTotal = subtotal + shipping;
}

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}

export function initCheckoutForm() {
  const form = document.getElementById('co-form');
  if (!form) return;
  renderCheckoutSummary();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    // basic validation
    for (const k of ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode']) {
      if (!data[k] || String(data[k]).trim().length < 2) {
        toast('Please complete all fields', 'error');
        return;
      }
    }
    if (!/^\S+@\S+\.\S+$/.test(data.email)) { toast('Enter a valid email', 'error'); return; }
    if (!/^\d{10}$/.test(String(data.phone).replace(/\D/g, ''))) { toast('Enter a 10-digit phone', 'error'); return; }
    if (cart.items.length === 0) { toast('Your bag is empty', 'error'); return; }

    const btn = document.getElementById('co-pay');
    btn.disabled = true;
    btn.textContent = 'Loading secure checkout…';

    const ok = await loadRazorpay();
    if (!ok) { toast('Could not load payment gateway', 'error'); btn.disabled = false; btn.textContent = 'Pay Securely'; return; }

    const total = window.__coTotal || 0;
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: total * 100,
      currency: 'INR',
      name: 'Komaura Beauty',
      description: 'Handmade soft gel press-on nails',
      image: 'assets/images/hero-1.jpg',
      // NOTE: order_id should come from your server in production for signature verification.
      handler: function (response) {
        // Persist a lightweight order summary for the success page.
        const order = {
          id: response.razorpay_payment_id || ('KOM' + Date.now()),
          customer: data,
          items: cart.items,
          total,
          createdAt: new Date().toISOString(),
        };
        sessionStorage.setItem('komaura_last_order', JSON.stringify(order));
        cart.clear();
        location.href = 'success.html';
      },
      prefill: {
        name: data.name,
        email: data.email,
        contact: data.phone,
      },
      notes: { address: data.address + ', ' + data.city + ', ' + data.state + ' - ' + data.pincode },
      theme: { color: '#2A1F1F' },
      method: { upi: true, card: true, netbanking: true, wallet: true },
      modal: {
        ondismiss: function () { btn.disabled = false; btn.textContent = 'Pay Securely'; }
      }
    };

    try {
      const rz = new Razorpay(options);
      rz.on('payment.failed', function (resp) {
        toast('Payment failed. Please try again.', 'error');
        btn.disabled = false; btn.textContent = 'Pay Securely';
      });
      rz.open();
    } catch (err) {
      toast('Unable to start checkout', 'error');
      btn.disabled = false; btn.textContent = 'Pay Securely';
    }
  });
}

document.addEventListener('DOMContentLoaded', initCheckoutForm);
