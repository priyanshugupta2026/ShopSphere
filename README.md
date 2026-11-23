# ShopSphere - Modern Full-Stack E-Commerce Platform

ShopSphere is a responsive, full-stack e-commerce web application built with **HTML5, CSS3, Vanilla JavaScript**, **Node.js**, **Express.js**, and **MongoDB with Mongoose**.

---

## ✨ Features

1. **Modern Homepage & Navigation**
   - Glassmorphic sticky navigation bar with search bar, cart item counter, and user profile dropdown.
   - Hero banner with CTA buttons and floating trust badges.
   - Quick feature highlight cards (Free Shipping, Cash on Delivery, 30-Day Guarantee, 24/7 Support).
   - Category filter pills (Audio, Wearables, Electronics, Accessories, Home & Living, Fashion).

2. **Product Catalog & Advanced Filtering**
   - Dynamic product grid with product images, discount stickers, stock availability indicators, ratings, and reviews.
   - Live search across product titles and descriptions.
   - Category filtering with active filter chip management.
   - Multiple sort modes: *Featured*, *Price: Low to High*, *Price: High to Low*, *Top Rated*, and *Name: A to Z*.

3. **Product Details Page**
   - High-resolution product image gallery.
   - Detailed specifications checklist and feature highlights.
   - Interactive quantity selector with real-time stock limits.
   - "Add to Cart" and "Buy Now" instant action buttons.
   - Related products recommendation section.

4. **Interactive Shopping Cart**
   - Add, increment, decrement, and remove items with instant total updates.
   - Free shipping progress meter (unlocks 100% free delivery on orders over $75).
   - Promo coupon code system (`SAVE10` or `SHOPSPHERE10` for discounts).
   - Real-time tax (8%) and shipping calculation.

5. **User Authentication & Security**
   - User registration and login with input validation.
   - Password encryption using **bcryptjs** (salt rounds: 10).
   - Secure stateless authentication using **JSON Web Tokens (JWT)**.
   - Quick "Fill Demo" button for testing.

6. **Checkout & Cash on Delivery (COD)**
   - Two-step checkout with comprehensive shipping form validation.
   - Zero-risk **Cash on Delivery (COD)** payment selection.
   - Order review panel displaying thumbnails, quantities, subtotal, tax, and grand total.
   - Interactive order confirmation modal with generated Order ID and tracking summary.

7. **Order Processing & History**
   - Real-time stock decrement upon confirmed order placement.
   - "My Orders" customer portal showing past orders, statuses (*Processing*, *Shipped*, *Delivered*), item breakdowns, timestamps, and delivery addresses.

8. **Database & Resilience**
   - Full **Mongoose ODM** integration for `User`, `Product`, and `Order` collections.
   - Automatic database catalog seeding on first boot.
   - Built-in zero-config in-memory fallback layer: works out of the box if local MongoDB is not yet running, and automatically connects to local MongoDB (`mongodb://127.0.0.1:27017/shopsphere`) or MongoDB Atlas when available.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Modern Vanilla JavaScript (ES6+)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose ODM
- **Authentication:** JWT (`jsonwebtoken`), `bcryptjs`
- **Utilities:** `dotenv`, `cors`, `morgan`

---

## 📂 Project Structure

```
ecommerse full/
├── config/
│   ├── db.js               # MongoDB connection & hybrid adapter
│   └── memoryStore.js      # Zero-config in-memory persistence layer
├── controllers/
│   ├── authController.js   # User registration, login, profile retrieval
│   ├── productController.js# Catalog query, categories, single item
│   └── orderController.js  # Order placement, order history, order lookup
├── data/
│   └── seedData.js         # Curated realistic sample products
├── middleware/
│   ├── authMiddleware.js   # JWT verification & route protection
│   └── errorHandler.js     # Centralized 404 & error handling
├── models/
│   ├── Order.js            # Mongoose Order Schema
│   ├── Product.js          # Mongoose Product Schema
│   └── User.js             # Mongoose User Schema (with bcrypt hooks)
├── public/                 # Frontend Web Assets
│   ├── index.html          # Main Storefront & Catalog
│   ├── product.html        # Product Details Page
│   ├── cart.html           # Shopping Cart Page
│   ├── checkout.html       # Checkout & COD Page
│   ├── orders.html         # User Order History Page
│   ├── login.html          # Login & Registration Page
│   ├── css/
│   │   └── style.css       # Complete modern responsive styles
│   └── js/
│       ├── api.js          # Unified API client & state manager
│       ├── app.js          # Storefront catalog & filtering
│       ├── auth.js         # Authentication page handlers
│       ├── cart.js         # Cart calculations & UI sync
│       ├── checkout.js     # Checkout form & order creation
│       ├── orders.js       # Order history renderer
│       └── product.js      # Product detail page logic
├── routes/
│   ├── authRoutes.js       # /api/auth routes
│   ├── orderRoutes.js      # /api/orders routes
│   └── productRoutes.js    # /api/products routes
├── scripts/
│   ├── seed.js             # Manual database seeding script
│   └── testApp.js          # Automated end-to-end test suite
├── .env                    # Environment variables
├── .env.example            # Example configuration
├── package.json            # Project manifest & scripts
├── README.md               # Documentation
└── server.js               # Main Express application entry point
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher recommended; tested on v24)
- **npm** (v9 or higher)
- *(Optional)* **MongoDB** running locally on port 27017 or a **MongoDB Atlas URI**

### 2. Installation
Open your terminal in the project directory:

```bash
npm install
```

### 3. Environment Variables
A default `.env` file is already provided. You can customize the settings if needed:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/shopsphere
JWT_SECRET=shopsphere_super_secret_jwt_key_2026_modern_ecommerce
NODE_ENV=development
```

> **Note:** If MongoDB is not installed or running locally, ShopSphere automatically switches to its built-in in-memory database mode so all features (users, catalog, cart, and orders) function immediately with zero setup!

### 4. Start the Application

```bash
npm start
```

Visit the application in your browser:
**`http://localhost:5000`**

---

## 🧪 Running Automated Tests

To run the automated test suite verifying all 12 API endpoints, authentication flows, orders, and frontend assets:

```bash
npm test
```

---

## 👤 Demo Credentials

You can use the built-in demo credentials to test user login, checkout, and order history:

- **Email:** `alex@example.com`
- **Password:** `password123`

*(On the login page, you can also click the **"Fill Demo"** button to automatically populate these credentials).*

---

## 📡 API Reference Summary

### Products (`/api/products`)
- `GET /api/products` — Get products (supports `?category=...`, `?search=...`, `?sort=...`)
- `GET /api/products/categories` — Get list of categories with item counts
- `GET /api/products/:id` — Get single product by ID

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account (`{ name, email, password }`)
- `POST /api/auth/login` — Sign in and receive JWT (`{ email, password }`)
- `GET /api/auth/profile` — Get authenticated user details (Requires `Authorization: Bearer <token>`)

### Orders (`/api/orders`)
- `POST /api/orders` — Create a new order with items and shipping address (Requires Auth)
- `GET /api/orders/myorders` — Get logged-in user's order history (Requires Auth)
- `GET /api/orders/:id` — Get details of a specific order (Requires Auth)

---

## 📄 License
ISC License &copy; 2026 ShopSphere.
