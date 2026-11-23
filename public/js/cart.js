/**
 * ShopSphere - Shopping Cart Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  const cartContainer = document.getElementById('cart-items-container');
  const cartSummaryContainer = document.getElementById('cart-summary-container');
  const emptyCartState = document.getElementById('empty-cart-state');
  const cartLayout = document.getElementById('cart-layout');

  let discountAmount = 0;
  let activeCoupon = null;

  renderCart();

  function renderCart() {
    const items = Cart.getItems();

    if (items.length === 0) {
      if (cartLayout) cartLayout.style.display = 'none';
      if (emptyCartState) emptyCartState.style.display = 'block';
      return;
    }

    if (cartLayout) cartLayout.style.display = 'grid';
    if (emptyCartState) emptyCartState.style.display = 'none';

    renderCartItems(items);
    renderCartSummary();
  }

  function renderCartItems(items) {
    if (!cartContainer) return;

    const rowsHtml = items
      .map(
        (item) => `
      <div class="cart-item-row" data-id="${item.product}">
        <div class="cart-item-product">
          <img class="cart-item-img" src="${item.image}" alt="${item.name}" />
          <div>
            <h4 class="cart-item-title">
              <a href="/product.html?id=${item.product}">${item.name}</a>
            </h4>
            <span class="cart-item-cat">${item.category || 'Product'}</span>
          </div>
        </div>

        <div class="cart-item-price">
          $${item.price.toFixed(2)}
        </div>

        <div>
          <div class="quantity-control" style="width: fit-content;">
            <button class="qty-btn btn-cart-dec" data-id="${item.product}">−</button>
            <input class="qty-input" type="number" value="${item.qty}" min="1" max="${item.stock || 99}" readonly />
            <button class="qty-btn btn-cart-inc" data-id="${item.product}">+</button>
          </div>
        </div>

        <div class="cart-item-subtotal">
          $${(item.price * item.qty).toFixed(2)}
        </div>

        <div>
          <button class="cart-remove-btn" data-id="${item.product}" title="Remove item">
            🗑
          </button>
        </div>
      </div>
    `
      )
      .join('');

    cartContainer.innerHTML = `
      <div class="cart-items-card">
        <div class="cart-table-header">
          <div>Product</div>
          <div>Price</div>
          <div>Quantity</div>
          <div>Subtotal</div>
          <div></div>
        </div>
        ${rowsHtml}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--gray-200);">
          <a href="/index.html" class="btn btn-outline btn-sm">← Continue Shopping</a>
          <button id="clear-cart-btn" class="btn btn-danger btn-sm">Clear Cart</button>
        </div>
      </div>
    `;

    // Event listeners for item controls
    cartContainer.querySelectorAll('.btn-cart-dec').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = items.find((i) => i.product === id);
        if (item) {
          Cart.updateQty(id, item.qty - 1);
          renderCart();
        }
      });
    });

    cartContainer.querySelectorAll('.btn-cart-inc').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = items.find((i) => i.product === id);
        if (item) {
          Cart.updateQty(id, item.qty + 1);
          renderCart();
        }
      });
    });

    cartContainer.querySelectorAll('.cart-remove-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        Cart.removeItem(id);
        renderCart();
      });
    });

    const clearBtn = document.getElementById('clear-cart-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to remove all items from your cart?')) {
          Cart.clearCart();
          discountAmount = 0;
          activeCoupon = null;
          renderCart();
        }
      });
    }
  }

  function renderCartSummary() {
    if (!cartSummaryContainer) return;

    const calc = Cart.getCalculations();
    const finalTotal = Math.max(0, Number((calc.total - discountAmount).toFixed(2)));

    const freeShippingProgress = Math.min(100, Math.round((calc.subtotal / calc.freeShippingThreshold) * 100));

    let shippingMeterMsg = '';
    if (calc.shipping === 0) {
      shippingMeterMsg = '🎉 Congratulations! You have unlocked <strong>FREE Shipping!</strong>';
    } else {
      shippingMeterMsg = `Add <strong>$${calc.amountNeededForFreeShipping}</strong> more to qualify for <strong>FREE Delivery</strong>`;
    }

    cartSummaryContainer.innerHTML = `
      <div class="cart-summary-card">
        <h3 class="summary-title">Order Summary</h3>

        <!-- Free shipping meter -->
        <div class="shipping-meter">
          <p class="meter-text">${shippingMeterMsg}</p>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${freeShippingProgress}%;"></div>
          </div>
        </div>

        <div class="summary-rows">
          <div class="summary-row">
            <span>Items Subtotal (${calc.count} items)</span>
            <span>$${calc.subtotal.toFixed(2)}</span>
          </div>

          <div class="summary-row">
            <span>Estimated Shipping</span>
            <span>${calc.shipping === 0 ? '<span style="color: var(--success); font-weight: 700;">FREE</span>' : `$${calc.shipping.toFixed(2)}`}</span>
          </div>

          <div class="summary-row">
            <span>Estimated Tax (8%)</span>
            <span>$${calc.tax.toFixed(2)}</span>
          </div>

          ${
            discountAmount > 0
              ? `
            <div class="summary-row" style="color: var(--success); font-weight: 600;">
              <span>Promo Discount (${activeCoupon})</span>
              <span>-$${discountAmount.toFixed(2)}</span>
            </div>
          `
              : ''
          }

          <div class="summary-row total-row">
            <span>Total</span>
            <span class="total-amount">$${finalTotal.toFixed(2)}</span>
          </div>
        </div>

        <!-- Promo Code Input -->
        <div class="coupon-box">
          <input type="text" id="promo-code-input" placeholder="Promo code (e.g. SAVE10)" value="${activeCoupon || ''}" />
          <button class="btn btn-secondary btn-sm" id="apply-promo-btn">Apply</button>
        </div>

        <a href="/checkout.html" class="btn btn-primary btn-block btn-lg">
          Proceed to Checkout →
        </a>

        <div style="text-align: center; margin-top: 1rem; font-size: 0.8rem; color: var(--gray-500);">
          🔒 Guaranteed Safe & Secure Checkout
        </div>
      </div>
    `;

    // Coupon logic
    const promoBtn = document.getElementById('apply-promo-btn');
    const promoInput = document.getElementById('promo-code-input');

    if (promoBtn && promoInput) {
      promoBtn.addEventListener('click', () => {
        const code = promoInput.value.trim().toUpperCase();
        if (code === 'SAVE10' || code === 'SHOPSPHERE10') {
          discountAmount = 10.0;
          activeCoupon = code;
          showToast('Coupon applied! $10 discount has been deducted.', 'success');
          renderCartSummary();
        } else if (code === '') {
          discountAmount = 0;
          activeCoupon = null;
          renderCartSummary();
        } else {
          showToast('Invalid promo code. Try "SAVE10".', 'error');
        }
      });
    }
  }
});
