/**
 * ShopSphere - Product Details Page Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  const container = document.getElementById('product-detail-container');
  const relatedGrid = document.getElementById('related-products-grid');

  if (!productId) {
    renderError('No product selected. Please choose a product from our catalog.');
    return;
  }

  try {
    const res = await API.getProductById(productId);
    const product = res.data;

    if (!product) {
      renderError('Product not found or has been discontinued.');
      return;
    }

    renderProductDetail(product);
    loadRelatedProducts(product.category, product._id);
  } catch (error) {
    console.error('Failed to load product details:', error);
    renderError('Unable to load product information. Please verify the URL or try again later.');
  }

  function renderProductDetail(p) {
    document.title = `${p.name} - ShopSphere`;

    // Breadcrumb title
    const breadcrumbCurrent = document.getElementById('breadcrumb-product-name');
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = p.name;
    const breadcrumbCat = document.getElementById('breadcrumb-category');
    if (breadcrumbCat) {
      breadcrumbCat.textContent = p.category;
      breadcrumbCat.href = `/index.html?category=${encodeURIComponent(p.category)}`;
    }

    const discountPercentage = p.originalPrice && p.originalPrice > p.price
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
      : null;

    const fullStars = Math.floor(p.rating || 4.5);
    const starIcons = '★'.repeat(fullStars) + (p.rating % 1 !== 0 ? '½' : '') + '☆'.repeat(5 - Math.ceil(p.rating || 4.5));

    const stockClass = p.stock > 10 ? 'stock-in' : p.stock > 0 ? 'stock-low' : 'stock-out';
    const stockText = p.stock > 10 ? `In Stock (${p.stock} available)` : p.stock > 0 ? `Only ${p.stock} units left in stock!` : 'Currently Out of Stock';

    const featuresList = (p.features && p.features.length > 0)
      ? p.features.map((f) => `<li>${f}</li>`).join('')
      : `<li>Authentic original manufacturer warranty</li>
         <li>Premium certified craftsmanship</li>
         <li>Fast doorstep delivery with tracking</li>`;

    container.innerHTML = `
      <div class="product-detail-card">
        <!-- Product Image Gallery -->
        <div class="detail-gallery">
          <div class="detail-main-img">
            <img id="main-product-img" src="${p.image}" alt="${p.name}" />
          </div>
        </div>

        <!-- Product Details -->
        <div class="detail-info">
          <span class="detail-cat-badge">${p.category}</span>
          <h1 class="detail-title">${p.name}</h1>

          <div class="rating-row" style="margin-bottom: 1rem;">
            <span class="stars" style="font-size: 1.1rem;">${starIcons}</span>
            <span class="rating-num" style="font-size: 1rem;">${p.rating ? p.rating.toFixed(1) : '4.5'}</span>
            <span class="rating-count">(${p.numReviews || 0} customer reviews)</span>
          </div>

          <div class="stock-status ${stockClass}" style="font-size: 0.9rem;">
            ● ${stockText}
          </div>

          <div class="detail-price-box">
            <span class="detail-price">$${p.price.toFixed(2)}</span>
            ${p.originalPrice ? `<span class="detail-old-price">$${p.originalPrice.toFixed(2)}</span>` : ''}
            ${discountPercentage ? `<span class="detail-discount-tag">Save ${discountPercentage}%</span>` : ''}
          </div>

          <p class="detail-description">${p.description}</p>

          <div class="detail-features">
            <h4>Highlights & Key Specifications</h4>
            <ul>
              ${featuresList}
            </ul>
          </div>

          <!-- Quantity & Purchase CTAs -->
          <div class="detail-actions">
            <div class="quantity-control">
              <button class="qty-btn" id="qty-decrement" type="button" aria-label="Decrease quantity">−</button>
              <input class="qty-input" id="qty-input" type="number" value="1" min="1" max="${p.stock || 10}" readonly />
              <button class="qty-btn" id="qty-increment" type="button" aria-label="Increase quantity">+</button>
            </div>

            <button 
              class="btn btn-primary btn-lg" 
              id="detail-add-cart-btn"
              ${p.stock <= 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
            >
              🛒 Add to Cart
            </button>

            <button 
              class="btn btn-secondary btn-lg" 
              id="detail-buy-now-btn"
              style="background: var(--dark); color: white;"
              ${p.stock <= 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
            >
              ⚡ Buy Now
            </button>
          </div>

          <!-- Trust Guarantees -->
          <div class="detail-guarantees">
            <div class="guarantee-box">
              <span class="icon">🚚</span>
              <div>
                <strong>Free Delivery</strong>
                <div>On orders over $75</div>
              </div>
            </div>
            <div class="guarantee-box">
              <span class="icon">💵</span>
              <div>
                <strong>Cash on Delivery</strong>
                <div>Pay at your door</div>
              </div>
            </div>
            <div class="guarantee-box">
              <span class="icon">🛡️</span>
              <div>
                <strong>30-Day Guarantee</strong>
                <div>Hassle-free returns</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Quantity Counter Handlers
    const qtyInput = document.getElementById('qty-input');
    const btnDec = document.getElementById('qty-decrement');
    const btnInc = document.getElementById('qty-increment');
    const btnAddCart = document.getElementById('detail-add-cart-btn');
    const btnBuyNow = document.getElementById('detail-buy-now-btn');

    let currentQty = 1;
    const maxStock = p.stock || 10;

    btnDec.addEventListener('click', () => {
      if (currentQty > 1) {
        currentQty--;
        qtyInput.value = currentQty;
      }
    });

    btnInc.addEventListener('click', () => {
      if (currentQty < maxStock) {
        currentQty++;
        qtyInput.value = currentQty;
      } else {
        showToast(`Maximum available stock is ${maxStock}`, 'info');
      }
    });

    // Add to Cart
    btnAddCart.addEventListener('click', () => {
      const success = Cart.addItem(p, currentQty);
      if (success) {
        btnAddCart.textContent = '✓ Added to Cart!';
        setTimeout(() => {
          btnAddCart.innerHTML = '🛒 Add to Cart';
        }, 1500);
      }
    });

    // Buy Now
    btnBuyNow.addEventListener('click', () => {
      Cart.addItem(p, currentQty);
      window.location.href = '/checkout.html';
    });
  }

  // Load Related Products from same category
  async function loadRelatedProducts(category, currentId) {
    if (!relatedGrid) return;
    try {
      const res = await API.getProducts({ category });
      const related = (res.data || []).filter((item) => item._id !== currentId).slice(0, 4);

      if (related.length === 0) {
        relatedGrid.parentElement.style.display = 'none';
        return;
      }

      relatedGrid.innerHTML = related
        .map(
          (p) => `
        <div class="product-card">
          <div class="card-image-wrap">
            <img src="${p.image}" alt="${p.name}" loading="lazy" />
            <div class="card-quick-actions">
              <a href="/product.html?id=${p._id}" class="quick-view-btn">View Details</a>
            </div>
          </div>
          <div class="card-content">
            <span class="card-category">${p.category}</span>
            <h3 class="card-title">
              <a href="/product.html?id=${p._id}">${p.name}</a>
            </h3>
            <div class="card-footer">
              <div class="card-price-wrap">
                <span class="card-price">$${p.price.toFixed(2)}</span>
              </div>
              <a href="/product.html?id=${p._id}" class="btn btn-sm btn-outline">Explore</a>
            </div>
          </div>
        </div>
      `
        )
        .join('');
    } catch (e) {
      console.warn('Failed to load related products:', e);
    }
  }

  function renderError(message) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Product Not Available</h3>
        <p>${message}</p>
        <a href="/index.html" class="btn btn-primary">Back to Storefront</a>
      </div>
    `;
  }
});
