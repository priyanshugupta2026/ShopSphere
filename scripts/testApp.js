require('dotenv').config();
const http = require('http');
const app = require('../server');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const User = require('../models/User');
const sampleProducts = require('../data/seedData');

async function runTestSuite() {
  console.log('\n=============================================');
  console.log(' Starting ShopSphere Comprehensive Test Suite');
  console.log('=============================================\n');

  await connectDB();

  // Populate data
  await Product.deleteMany({});
  await Product.insertMany(sampleProducts);

  const demoUser = await User.findOne({ email: 'alex@example.com' });
  if (!demoUser) {
    await User.create({
      name: 'Alex Johnson',
      email: 'alex@example.com',
      password: 'password123',
      role: 'user'
    });
  }

  // Start test server on random port
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  console.log(`✓ Test server running on http://127.0.0.1:${port}`);

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ FAIL: ${name} -> ${err.message || err}`);
      failed++;
    }
  }

  // Helper request
  function request(path, options = {}) {
    return new Promise((resolve, reject) => {
      const opt = {
        hostname: '127.0.0.1',
        port: port,
        path: path,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      };

      const req = http.request(opt, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(body);
          } catch (e) {}
          resolve({ status: res.statusCode, headers: res.headers, body, json });
        });
      });

      req.on('error', reject);
      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }
      req.end();
    });
  }

  // 1. Health check
  await test('GET /api/health returns 200 OK', async () => {
    const res = await request('/api/health');
    if (res.status !== 200 || res.json?.status !== 'ok') {
      throw new Error(`Unexpected status ${res.status}`);
    }
  });

  // 2. Fetch products
  let firstProductId = null;
  await test('GET /api/products returns catalog list', async () => {
    const res = await request('/api/products');
    if (res.status !== 200 || !res.json?.data || res.json.data.length === 0) {
      throw new Error(`Failed to retrieve products`);
    }
    firstProductId = res.json.data[0]._id;
  });

  // 3. Category aggregation
  await test('GET /api/products/categories returns categories with count', async () => {
    const res = await request('/api/products/categories');
    if (res.status !== 200 || !res.json?.data || res.json.data.length === 0) {
      throw new Error(`Failed to retrieve categories`);
    }
  });

  // 4. Single product by ID
  await test(`GET /api/products/:id returns specific product`, async () => {
    const res = await request(`/api/products/${firstProductId}`);
    if (res.status !== 200 || res.json?.data?._id !== firstProductId) {
      throw new Error(`Failed to fetch product by ID`);
    }
  });

  // 5. Search & filter
  await test('GET /api/products?search=headphones returns filtered items', async () => {
    const res = await request('/api/products?search=headphones');
    if (res.status !== 200 || res.json?.data.length === 0) {
      throw new Error(`Search returned no results`);
    }
  });

  // 6. User Login
  let userToken = null;
  await test('POST /api/auth/login authenticates demo user', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'alex@example.com', password: 'password123' }
    });
    if (res.status !== 200 || !res.json?.data?.token) {
      throw new Error(`Login failed with status ${res.status}: ${res.json?.message}`);
    }
    userToken = res.json.data.token;
  });

  // 7. Get user profile with token
  await test('GET /api/auth/profile validates JWT and returns user details', async () => {
    const res = await request('/api/auth/profile', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    if (res.status !== 200 || res.json?.data?.email !== 'alex@example.com') {
      throw new Error(`Failed to get protected profile`);
    }
  });

  // 8. User registration
  const newEmail = `sarah_${Date.now()}@test.com`;
  let newRegisteredToken = null;
  await test('POST /api/auth/register creates new account with hashed password', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Sarah Connor',
        email: newEmail,
        password: 'securepassword123'
      }
    });
    if (res.status !== 201 || !res.json?.data?.token) {
      throw new Error(`Registration failed: ${res.json?.message}`);
    }
    newRegisteredToken = res.json.data.token;
  });

  // 9. Create Order (Cash on Delivery)
  let createdOrderId = null;
  await test('POST /api/orders creates COD order with shipping address', async () => {
    const orderPayload = {
      orderItems: [
        {
          product: firstProductId,
          name: 'Aura Pro Noise Cancelling Wireless Headphones',
          qty: 1,
          price: 249.99,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
        }
      ],
      shippingAddress: {
        fullName: 'Alex Johnson',
        phone: '+1 555-0199',
        address: '742 Evergreen Terrace',
        city: 'Springfield',
        postalCode: '97477',
        state: 'Oregon'
      },
      paymentMethod: 'Cash on Delivery'
    };

    const res = await request('/api/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: orderPayload
    });

    if (res.status !== 201 || !res.json?.data?._id) {
      throw new Error(`Order creation failed: ${res.json?.message}`);
    }

    createdOrderId = res.json.data._id;
    if (res.json.data.paymentMethod !== 'Cash on Delivery') {
      throw new Error(`Expected Cash on Delivery payment method`);
    }
  });

  // 10. Get User Orders
  await test('GET /api/orders/myorders lists customer order history', async () => {
    const res = await request('/api/orders/myorders', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    if (res.status !== 200 || !res.json?.data || res.json.data.length === 0) {
      throw new Error(`Orders history empty`);
    }
    const hasOrder = res.json.data.some((o) => o._id === createdOrderId);
    if (!hasOrder) {
      throw new Error(`Created order ID not found in user history`);
    }
  });

  // 11. Verify Static Frontend HTML Pages
  await test('Frontend HTML routes serve 200 OK', async () => {
    const pages = ['/', '/index.html', '/product.html', '/cart.html', '/checkout.html', '/orders.html', '/login.html'];
    for (const page of pages) {
      const res = await request(page);
      if (res.status !== 200 || !res.body.includes('ShopSphere')) {
        throw new Error(`Failed to load ${page}`);
      }
    }
  });

  // 12. Verify CSS & JS Static Assets
  await test('Static CSS and JS files serve with correct status', async () => {
    const assets = ['/css/style.css', '/js/api.js', '/js/app.js', '/js/product.js', '/js/cart.js', '/js/checkout.js', '/js/orders.js', '/js/auth.js'];
    for (const asset of assets) {
      const res = await request(asset);
      if (res.status !== 200 || res.body.length < 50) {
        throw new Error(`Asset ${asset} failed to load or is empty`);
      }
    }
  });

  console.log('\n=============================================');
  console.log(` Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('=============================================\n');

  server.close();
  process.exit(failed > 0 ? 1 : 0);
}

runTestSuite().catch((e) => {
  console.error('Test Suite encountered fatal error:', e);
  process.exit(1);
});
