/**
 * ShopSphere - Unified API Client & State Management
 */

const API_BASE = '/api';

// Toast Notification Engine
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ'}</span>
    <span class="toast-msg">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Authentication State Management
const Auth = {
  getToken() {
    return localStorage.getItem('shopsphere_token');
  },
  getUser() {
    try {
      const data = localStorage.getItem('shopsphere_user');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setAuth(user, token) {
    localStorage.setItem('shopsphere_token', token);
    localStorage.setItem('shopsphere_user', JSON.stringify(user));
    Cart.syncHeader();
  },
  logout() {
    localStorage.removeItem('shopsphere_token');
    localStorage.removeItem('shopsphere_user');
    showToast('You have been logged out.', 'info');
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 600);
  },
  isLoggedIn() {
    return !!this.getToken();
  }
};

// Shopping Cart State Management (Local sync + reactive header counter)
const Cart = {
  getItems() {
    try {
      const cart = localStorage.getItem('shopsphere_cart');
      return cart ? JSON.parse(cart) : [];
    } catch {
      return [];
    }
  },
  saveItems(items) {
    localStorage.setItem('shopsphere_cart', JSON.stringify(items));
    this.syncHeader();
  },
  addItem(product, qty = 1) {
    const items = this.getItems();
    const existingIndex = items.findIndex((i) => i.product === product._id);

    if (existingIndex > -1) {
      const newQty = items[existingIndex].qty + qty;
      if (product.stock && newQty > product.stock) {
        showToast(`Only ${product.stock} units available in stock.`, 'error');
        return false;
      }
      items[existingIndex].qty = newQty;
    } else {
      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        stock: product.stock,
        qty: qty
      });
    }

    this.saveItems(items);
    showToast(`Added "${product.name}" to your cart!`, 'success');
    return true;
  },
  updateQty(productId, qty) {
    let items = this.getItems();
    const item = items.find((i) => i.product === productId);
    if (!item) return;

    if (qty <= 0) {
      this.removeItem(productId);
      return;
    }

    if (item.stock && qty > item.stock) {
      showToast(`Cannot exceed maximum stock of ${item.stock}`, 'error');
      return;
    }

    item.qty = qty;
    this.saveItems(items);
  },
  removeItem(productId) {
    let items = this.getItems();
    items = items.filter((i) => i.product !== productId);
    this.saveItems(items);
    showToast('Item removed from cart', 'info');
  },
  clearCart() {
    localStorage.removeItem('shopsphere_cart');
    this.syncHeader();
  },
  getCount() {
    const items = this.getItems();
    return items.reduce((sum, item) => sum + item.qty, 0);
  },
  getCalculations() {
    const items = this.getItems();
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    // Free shipping if >= $75, otherwise $9.99
    const shipping = subtotal === 0 || subtotal >= 75 ? 0 : 9.99;
    const tax = Number((subtotal * 0.08).toFixed(2));
    const total = Number((subtotal + shipping + tax).toFixed(2));

    return {
      subtotal: Number(subtotal.toFixed(2)),
      shipping,
      tax,
      total,
      count: this.getCount(),
      freeShippingThreshold: 75,
      amountNeededForFreeShipping: Math.max(0, Number((75 - subtotal).toFixed(2)))
    };
  },
  syncHeader() {
    const count = this.getCount();
    const badge = document.getElementById('header-cart-count');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }

    // Update Auth menu in header
    const user = Auth.getUser();
    const userContainer = document.getElementById('header-user-section');
    if (userContainer) {
      if (user) {
        userContainer.innerHTML = `
          <div class="user-menu">
            <button class="user-avatar-btn" id="user-menu-toggle" aria-expanded="false">
              <span class="avatar-circle">${user.name.charAt(0).toUpperCase()}</span>
              <span>${user.name.split(' ')[0]}</span>
              <span style="font-size: 0.75rem;">▼</span>
            </button>
            <div class="user-dropdown" id="user-dropdown-menu">
              <div class="user-dropdown-header">
                Signed in as
                <strong>${user.name}</strong>
                <span style="font-size: 0.75rem; color: var(--gray-400);">${user.email}</span>
              </div>
              <a href="/orders.html">📦 My Orders</a>
              <hr />
              <button id="header-logout-btn" style="color: var(--danger);">🚪 Sign Out</button>
            </div>
          </div>
        `;

        const toggleBtn = document.getElementById('user-menu-toggle');
        const dropdown = document.getElementById('user-dropdown-menu');
        const logoutBtn = document.getElementById('header-logout-btn');

        if (toggleBtn && dropdown) {
          toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
          });

          document.addEventListener('click', () => {
            dropdown.classList.remove('show');
          });
        }

        if (logoutBtn) {
          logoutBtn.addEventListener('click', () => Auth.logout());
        }
      } else {
        userContainer.innerHTML = `
          <a href="/login.html" class="nav-link">
            <span>👤</span>
            <span>Sign In</span>
          </a>
        `;
      }
    }
  }
};

// Generic HTTP API Request Handler
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = Auth.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

// API Services
const API = {
  // Product endpoints
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await apiRequest(`/products${query ? `?${query}` : ''}`);
  },
  async getProductById(id) {
    return await apiRequest(`/products/${id}`);
  },
  async getCategories() {
    return await apiRequest('/products/categories');
  },

  // Auth endpoints
  async login(email, password) {
    return await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },
  async register(name, email, password) {
    return await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },
  async getProfile() {
    return await apiRequest('/auth/profile');
  },

  // Order endpoints
  async createOrder(orderData) {
    return await apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },
  async getMyOrders() {
    return await apiRequest('/orders/myorders');
  },
  async getOrderById(id) {
    return await apiRequest(`/orders/${id}`);
  }
};

// Initialize Header state on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  Cart.syncHeader();

  // Setup mobile menu toggle if exists
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const navActions = document.querySelector('.nav-actions');
  if (mobileToggle && navActions) {
    mobileToggle.addEventListener('click', () => {
      navActions.classList.toggle('open');
    });
  }
});
