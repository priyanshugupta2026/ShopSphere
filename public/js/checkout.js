/**
 * ShopSphere - Checkout & Cash on Delivery Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  const items = Cart.getItems();

  // Redirect if cart is empty
  if (items.length === 0) {
    window.location.href = '/cart.html';
    return;
  }

  // DOM Elements
  const checkoutForm = document.getElementById('checkout-form');
  const checkoutItemsContainer = document.getElementById('checkout-items-summary');
  const summarySubtotal = document.getElementById('checkout-subtotal');
  const summaryShipping = document.getElementById('checkout-shipping');
  const summaryTax = document.getElementById('checkout-tax');
  const summaryTotal = document.getElementById('checkout-total');
  const placeOrderBtn = document.getElementById('place-order-btn');
  const authNotice = document.getElementById('checkout-auth-notice');

  // Pre-fill user data if logged in
  const user = Auth.getUser();
  if (user) {
    if (authNotice) authNotice.style.display = 'none';
    const nameInput = document.getElementById('shipping-fullname');
    if (nameInput && !nameInput.value) {
      nameInput.value = user.name || '';
    }
  } else {
    if (authNotice) {
      authNotice.style.display = 'block';
    }
  }

  // Render Order Review Items
  renderCheckoutSummary();

  function renderCheckoutSummary() {
    const calc = Cart.getCalculations();

    if (checkoutItemsContainer) {
      checkoutItemsContainer.innerHTML = items
        .map(
          (item) => `
        <div class="checkout-item">
          <img class="checkout-item-img" src="${item.image}" alt="${item.name}" />
          <div class="checkout-item-details">
            <h5 class="checkout-item-name">${item.name}</h5>
            <span class="checkout-item-qty">Qty: ${item.qty} × $${item.price.toFixed(2)}</span>
          </div>
          <div class="checkout-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        </div>
      `
        )
        .join('');
    }

    if (summarySubtotal) summarySubtotal.textContent = `$${calc.subtotal.toFixed(2)}`;
    if (summaryShipping) {
      summaryShipping.innerHTML = calc.shipping === 0 ? '<span style="color: var(--success); font-weight: 700;">FREE</span>' : `$${calc.shipping.toFixed(2)}`;
    }
    if (summaryTax) summaryTax.textContent = `$${calc.tax.toFixed(2)}`;
    if (summaryTotal) summaryTotal.textContent = `$${calc.total.toFixed(2)}`;
  }

  // Handle Form Submission
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Check if user is logged in; if not, ask them to log in or register quickly
      if (!Auth.isLoggedIn()) {
        showToast('Please sign in or create an account to place your order.', 'info');
        setTimeout(() => {
          // Save intended redirect
          sessionStorage.setItem('redirect_after_login', '/checkout.html');
          window.location.href = '/login.html';
        }, 800);
        return;
      }

      // Collect and validate form values
      const fullName = document.getElementById('shipping-fullname').value.trim();
      const phone = document.getElementById('shipping-phone').value.trim();
      const address = document.getElementById('shipping-address').value.trim();
      const city = document.getElementById('shipping-city').value.trim();
      const postalCode = document.getElementById('shipping-postal').value.trim();
      const state = document.getElementById('shipping-state').value.trim();

      let hasError = false;

      function validateField(id, valid, message) {
        const input = document.getElementById(id);
        const errEl = document.getElementById(`${id}-error`);
        if (!valid) {
          if (input) input.classList.add('error');
          if (errEl) errEl.textContent = message;
          hasError = true;
        } else {
          if (input) input.classList.remove('error');
          if (errEl) errEl.textContent = '';
        }
      }

      validateField('shipping-fullname', fullName.length >= 2, 'Please enter your full name');
      validateField('shipping-phone', phone.length >= 7, 'Please enter a valid phone number for delivery contact');
      validateField('shipping-address', address.length >= 5, 'Please enter your complete street delivery address');
      validateField('shipping-city', city.length >= 2, 'Please enter your city');
      validateField('shipping-postal', postalCode.length >= 3, 'Please enter your postal or ZIP code');

      if (hasError) {
        showToast('Please complete all required fields correctly.', 'error');
        return;
      }

      // Build Order Payload
      const orderData = {
        orderItems: items.map((i) => ({
          product: i.product,
          name: i.name,
          qty: i.qty,
          price: i.price,
          image: i.image
        })),
        shippingAddress: {
          fullName,
          phone,
          address,
          city,
          postalCode,
          state
        },
        paymentMethod: 'Cash on Delivery'
      };

      // Disable button and show spinner
      placeOrderBtn.disabled = true;
      placeOrderBtn.innerHTML = '⏳ Processing Order...';

      try {
        const res = await API.createOrder(orderData);
        const order = res.data;

        // Clear cart
        Cart.clearCart();

        // Show Success Modal
        showSuccessModal(order);
      } catch (err) {
        console.error('Order placement failed:', err);
        showToast(err.message || 'Failed to place order. Please check your details.', 'error');
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerHTML = 'Place Order (Cash on Delivery)';
      }
    });
  }

  function showSuccessModal(order) {
    const modal = document.getElementById('order-success-modal');
    if (!modal) return;

    const orderIdDisplay = document.getElementById('modal-order-id');
    const orderTotalDisplay = document.getElementById('modal-order-total');
    const orderItemsCount = document.getElementById('modal-order-items-count');
    const orderAddressDisplay = document.getElementById('modal-order-address');

    if (orderIdDisplay) orderIdDisplay.textContent = order._id;
    if (orderTotalDisplay) orderTotalDisplay.textContent = `$${order.totalPrice.toFixed(2)}`;
    if (orderItemsCount) orderItemsCount.textContent = `${order.orderItems.length} item${order.orderItems.length > 1 ? 's' : ''}`;
    if (orderAddressDisplay) {
      orderAddressDisplay.textContent = `${order.shippingAddress.fullName}, ${order.shippingAddress.address}, ${order.shippingAddress.city} ${order.shippingAddress.postalCode}`;
    }

    modal.classList.add('active');
  }
});
