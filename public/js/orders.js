/**
 * ShopSphere - User Order History Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const ordersContainer = document.getElementById('orders-container');
  const authRequiredState = document.getElementById('orders-auth-required');

  if (!Auth.isLoggedIn()) {
    if (ordersContainer) ordersContainer.style.display = 'none';
    if (authRequiredState) authRequiredState.style.display = 'block';
    return;
  }

  if (authRequiredState) authRequiredState.style.display = 'none';
  if (ordersContainer) ordersContainer.style.display = 'block';

  try {
    const res = await API.getMyOrders();
    const orders = res.data || [];

    if (orders.length === 0) {
      renderEmptyOrders();
    } else {
      renderOrdersList(orders);
    }
  } catch (error) {
    console.error('Failed to load orders:', error);
    ordersContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Failed to retrieve orders</h3>
        <p>${error.message || 'Something went wrong while retrieving your purchase history.'}</p>
        <button class="btn btn-primary" onclick="window.location.reload()">Try Again</button>
      </div>
    `;
  }

  function renderOrdersList(orders) {
    const listHtml = orders
      .map((order) => {
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const statusClass = (order.status || 'processing').toLowerCase();

        const itemsHtml = order.orderItems
          .map(
            (item) => `
          <div class="order-item-row">
            <img class="order-item-img" src="${item.image}" alt="${item.name}" />
            <div style="flex: 1;">
              <h5 style="font-weight: 700; font-size: 0.95rem; color: var(--gray-900);">
                <a href="/product.html?id=${item.product}">${item.name}</a>
              </h5>
              <div style="font-size: 0.825rem; color: var(--gray-500); margin-top: 2px;">
                Quantity: ${item.qty} × $${item.price.toFixed(2)}
              </div>
            </div>
            <div style="font-weight: 800; font-size: 1rem; color: var(--gray-900);">
              $${(item.price * item.qty).toFixed(2)}
            </div>
          </div>
        `
          )
          .join('');

        return `
          <div class="order-card">
            <div class="order-card-header">
              <div class="order-meta-group">
                <div class="order-meta-item">
                  <span class="label">Order Placed</span>
                  <strong>${orderDate}</strong>
                </div>
                <div class="order-meta-item">
                  <span class="label">Total Amount</span>
                  <strong style="color: var(--primary);">$${order.totalPrice.toFixed(2)}</strong>
                </div>
                <div class="order-meta-item">
                  <span class="label">Ship To</span>
                  <strong>${order.shippingAddress.fullName}</strong>
                </div>
                <div class="order-meta-item">
                  <span class="label">Payment</span>
                  <strong>💵 ${order.paymentMethod}</strong>
                </div>
              </div>

              <div>
                <span class="status-badge ${statusClass}">
                  ● ${order.status}
                </span>
              </div>
            </div>

            <div class="order-card-body">
              <div style="font-size: 0.8rem; color: var(--gray-400); margin-bottom: 0.75rem;">
                ORDER # ${order._id}
              </div>

              <div class="order-items-grid">
                ${itemsHtml}
              </div>

              <div class="order-card-footer">
                <div>
                  📍 <strong>Delivery Address:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city} ${order.shippingAddress.postalCode} (${order.shippingAddress.phone})
                </div>
                <div>
                  <span style="color: var(--gray-500);">Expected Delivery:</span> <strong>3–5 Business Days</strong>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    ordersContainer.innerHTML = `
      <div class="orders-list">
        ${listHtml}
      </div>
    `;
  }

  function renderEmptyOrders() {
    ordersContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <h3>No orders placed yet</h3>
        <p>When you complete a purchase, your orders and real-time delivery tracking will appear here.</p>
        <a href="/index.html" class="btn btn-primary">Start Shopping</a>
      </div>
    `;
  }
});
