/**
 * ShopSphere - Storefront Homepage Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    category: 'All',
    search: '',
    sort: 'featured',
    products: []
  };

  // DOM Elements
  const productsGrid = document.getElementById('products-grid');
  const categoryPillsContainer = document.getElementById('category-pills');
  const sortSelect = document.getElementById('sort-select');
  const activeFiltersContainer = document.getElementById('active-filters');
  const productCountDisplay = document.getElementById('product-count-display');
  const headerSearchForm = document.getElementById('header-search-form');
  const headerSearchInput = document.getElementById('header-search-input');

  // Check URL parameters for search or category query
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('category')) {
    state.category = urlParams.get('category');
  }
  if (urlParams.get('search')) {
    state.search = urlParams.get('search');
    if (headerSearchInput) headerSearchInput.value = state.search;
  }

  // Initial Load
  initCategories();
  loadProducts();

  // Event Listeners
  if (headerSearchForm) {
    headerSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      state.search = headerSearchInput.value.trim();
      loadProducts();
      scrollToProducts();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sort = e.target.value;
      loadProducts();
    });
  }

  // Fetch and Render Categories
  async function initCategories() {
    try {
      const response = await API.getCategories();
      const categories = response.data || [];

      // Calculate total count
      const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

      let html = `
        <button class="cat-pill ${state.category === 'All' ? 'active' : ''}" data-category="All">
          <span>✨ All Products</span>
          <span class="count">${totalCount}</span>
        </button>
      `;

      const categoryIcons = {
        'Audio': '🎧',
        'Wearables': '⌚',
        'Electronics': '💻',
        'Accessories': '⌨️',
        'Home & Living': '🛋️',
        'Fashion': '🎒'
      };

      categories.forEach((cat) => {
        const icon = categoryIcons[cat.name] || '📦';
        const isActive = state.category.toLowerCase() === cat.name.toLowerCase();
        html += `
          <button class="cat-pill ${isActive ? 'active' : ''}" data-category="${cat.name}">
            <span>${icon} ${cat.name}</span>
            <span class="count">${cat.count}</span>
          </button>
        `;
      });

      if (categoryPillsContainer) {
        categoryPillsContainer.innerHTML = html;

        // Attach click handlers
        categoryPillsContainer.querySelectorAll('.cat-pill').forEach((btn) => {
          btn.addEventListener('click', () => {
            const selectedCat = btn.getAttribute('data-category');
            state.category = selectedCat;
            categoryPillsContainer.querySelectorAll('.cat-pill').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            loadProducts();
            scrollToProducts();
          });
        });
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  // Fetch and Render Products
  async function loadProducts() {
    renderLoadingSkeletons();
    updateActiveFilterChips();

    try {
      const params = {};
      if (state.category && state.category !== 'All') {
        params.category = state.category;
      }
      if (state.search) {
        params.search = state.search;
      }
      if (state.sort) {
        params.sort = state.sort;
      }

      const response = await API.getProducts(params);
      state.products = response.data || [];

      if (productCountDisplay) {
        productCountDisplay.textContent = `Showing ${state.products.length} product${state.products.length === 1 ? '' : 's'}`;
      }

      if (state.products.length === 0) {
        renderEmptyState();
      } else {
        renderProductCards(state.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      productsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">⚠️</div>
          <h3>Unable to load products</h3>
          <p>Please check your backend connection or refresh the page.</p>
          <button class="btn btn-primary" onclick="window.location.reload()">Retry Now</button>
        </div>
      `;
    }
  }

  // Render Product Cards Grid
  function renderProductCards(products) {
    productsGrid.innerHTML = products
      .map((p) => {
        const discountPercentage = p.originalPrice && p.originalPrice > p.price
          ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
          : null;

        const stockClass = p.stock > 10 ? 'stock-in' : p.stock > 0 ? 'stock-low' : 'stock-out';
        const stockText = p.stock > 10 ? 'In Stock' : p.stock > 0 ? `Only ${p.stock} left` : 'Out of Stock';

        // Generate Star icons
        const fullStars = Math.floor(p.rating || 4.5);
        const starIcons = '★'.repeat(fullStars) + (p.rating % 1 !== 0 ? '½' : '') + '☆'.repeat(5 - Math.ceil(p.rating || 4.5));

        return `
          <div class="product-card" data-id="${p._id}">
            <div class="card-image-wrap">
              <img src="${p.image}" alt="${p.name}" loading="lazy" />
              <div class="card-badges">
                ${p.isFeatured ? '<span class="badge-tag badge-featured">Featured</span>' : ''}
                ${discountPercentage ? `<span class="badge-tag badge-discount">-${discountPercentage}%</span>` : ''}
              </div>
              <div class="card-quick-actions">
                <a href="/product.html?id=${p._id}" class="quick-view-btn">View Details</a>
              </div>
            </div>

            <div class="card-content">
              <span class="card-category">${p.category}</span>
              <h3 class="card-title">
                <a href="/product.html?id=${p._id}" title="${p.name}">${p.name}</a>
              </h3>

              <div class="rating-row">
                <span class="stars">${starIcons}</span>
                <span class="rating-num">${p.rating ? p.rating.toFixed(1) : '4.5'}</span>
                <span class="rating-count">(${p.numReviews || 0})</span>
              </div>

              <div class="stock-status ${stockClass}">
                ● ${stockText}
              </div>

              <div class="card-footer">
                <div class="card-price-wrap">
                  <span class="card-price">$${p.price.toFixed(2)}</span>
                  ${p.originalPrice ? `<span class="card-old-price">$${p.originalPrice.toFixed(2)}</span>` : ''}
                </div>

                <button 
                  class="add-cart-btn" 
                  data-id="${p._id}" 
                  title="Add to Shopping Cart"
                  ${p.stock <= 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                >
                  🛒
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    // Attach Add To Cart events
    productsGrid.querySelectorAll('.add-cart-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const product = state.products.find((p) => p._id === id);
        if (product) {
          Cart.addItem(product, 1);
          btn.style.transform = 'scale(1.2)';
          setTimeout(() => (btn.style.transform = 'scale(1)'), 200);
        }
      });
    });
  }

  // Skeleton Loaders
  function renderLoadingSkeletons() {
    productsGrid.innerHTML = Array(6)
      .fill(0)
      .map(
        () => `
        <div class="product-card" style="pointer-events: none;">
          <div class="card-image-wrap skeleton"></div>
          <div class="card-content" style="gap: 0.75rem;">
            <div class="skeleton" style="height: 14px; width: 30%;"></div>
            <div class="skeleton" style="height: 20px; width: 85%;"></div>
            <div class="skeleton" style="height: 16px; width: 45%;"></div>
            <div class="skeleton" style="height: 36px; width: 100%; margin-top: auto;"></div>
          </div>
        </div>
      `
      )
      .join('');
  }

  // Empty Results State
  function renderEmptyState() {
    productsGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🔍</div>
        <h3>No matching products found</h3>
        <p>We couldn't find any items matching your active search or filters. Try checking your spelling or reset filters.</p>
        <button class="btn btn-outline" id="clear-all-filters-btn">Clear All Filters</button>
      </div>
    `;

    const clearBtn = document.getElementById('clear-all-filters-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', resetFilters);
    }
  }

  // Active Filter Chips
  function updateActiveFilterChips() {
    if (!activeFiltersContainer) return;

    const chips = [];

    if (state.category && state.category !== 'All') {
      chips.push(`
        <span class="chip">
          Category: ${state.category}
          <button type="button" data-remove="category">&times;</button>
        </span>
      `);
    }

    if (state.search) {
      chips.push(`
        <span class="chip">
          Search: "${state.search}"
          <button type="button" data-remove="search">&times;</button>
        </span>
      `);
    }

    if (chips.length > 0) {
      activeFiltersContainer.innerHTML = `
        <span>Active:</span>
        ${chips.join('')}
        <button class="btn btn-sm" id="reset-all-chips" style="color: var(--danger); font-size: 0.75rem;">Reset all</button>
      `;

      // Handlers
      activeFiltersContainer.querySelectorAll('[data-remove]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const type = btn.getAttribute('data-remove');
          if (type === 'category') {
            state.category = 'All';
            if (categoryPillsContainer) {
              categoryPillsContainer.querySelectorAll('.cat-pill').forEach((p) => {
                p.classList.toggle('active', p.getAttribute('data-category') === 'All');
              });
            }
          } else if (type === 'search') {
            state.search = '';
            if (headerSearchInput) headerSearchInput.value = '';
          }
          loadProducts();
        });
      });

      const resetAll = document.getElementById('reset-all-chips');
      if (resetAll) {
        resetAll.addEventListener('click', resetFilters);
      }
    } else {
      activeFiltersContainer.innerHTML = '';
    }
  }

  function resetFilters() {
    state.category = 'All';
    state.search = '';
    state.sort = 'featured';
    if (headerSearchInput) headerSearchInput.value = '';
    if (sortSelect) sortSelect.value = 'featured';

    if (categoryPillsContainer) {
      categoryPillsContainer.querySelectorAll('.cat-pill').forEach((p) => {
        p.classList.toggle('active', p.getAttribute('data-category') === 'All');
      });
    }

    loadProducts();
  }

  function scrollToProducts() {
    const section = document.getElementById('catalog-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }
});
