const bcrypt = require('bcryptjs');

// In-Memory Storage Tables
const store = {
  users: [],
  products: [],
  orders: []
};

// Generate MongoDB-like 24-char hex ObjectId
const generateId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return timestamp + random;
};

// Product Memory Model
const MockProduct = {
  async countDocuments() {
    return store.products.length;
  },

  async insertMany(items) {
    const created = items.map((item) => {
      const doc = {
        _id: item._id ? item._id.toString() : generateId(),
        ...item,
        createdAt: item.createdAt || new Date(),
        updatedAt: new Date()
      };
      doc.save = async function () {
        const idx = store.products.findIndex((p) => p._id.toString() === doc._id.toString());
        if (idx > -1) store.products[idx] = { ...doc };
        return doc;
      };
      return doc;
    });
    store.products.push(...created);
    return created;
  },

  async deleteMany() {
    store.products = [];
    return { acknowledged: true, deletedCount: store.products.length };
  },

  find(query = {}) {
    let results = [...store.products];

    // Filter by category
    if (query.category) {
      if (query.category instanceof RegExp) {
        results = results.filter((p) => query.category.test(p.category));
      } else if (typeof query.category === 'string') {
        results = results.filter((p) => p.category.toLowerCase() === query.category.toLowerCase());
      }
    }

    // Filter by $or search
    if (query.$or && Array.isArray(query.$or)) {
      results = results.filter((p) => {
        return query.$or.some((condition) => {
          if (condition.name && condition.name.$regex) {
            const re = new RegExp(condition.name.$regex, condition.name.$options || 'i');
            if (re.test(p.name)) return true;
          }
          if (condition.description && condition.description.$regex) {
            const re = new RegExp(condition.description.$regex, condition.description.$options || 'i');
            if (re.test(p.description)) return true;
          }
          return false;
        });
      });
    }

    // Filter by isFeatured
    if (query.isFeatured !== undefined) {
      results = results.filter((p) => Boolean(p.isFeatured) === Boolean(query.isFeatured));
    }

    // Wrap with chainable sort
    const queryObj = {
      _results: results,
      sort(sortOption = {}) {
        if (sortOption.price === 1) {
          this._results.sort((a, b) => a.price - b.price);
        } else if (sortOption.price === -1) {
          this._results.sort((a, b) => b.price - a.price);
        } else if (sortOption.rating === -1) {
          this._results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortOption.name === 1) {
          this._results.sort((a, b) => a.name.localeCompare(b.name));
        } else {
          this._results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return Promise.resolve(this._results.map(createProductDoc));
      },
      then(resolve, reject) {
        return Promise.resolve(this._results.map(createProductDoc)).then(resolve, reject);
      }
    };

    return queryObj;
  },

  async findById(id) {
    const found = store.products.find((p) => p._id.toString() === id.toString());
    return found ? createProductDoc(found) : null;
  },

  async aggregate() {
    const counts = {};
    for (const p of store.products) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return Object.keys(counts).map((cat) => ({
      _id: cat,
      count: counts[cat]
    }));
  }
};

function createProductDoc(item) {
  const doc = { ...item };
  doc.save = async function () {
    const idx = store.products.findIndex((p) => p._id.toString() === doc._id.toString());
    if (idx > -1) {
      store.products[idx] = { ...store.products[idx], ...doc };
    }
    return doc;
  };
  return doc;
}

// User Memory Model
const MockUser = {
  async countDocuments() {
    return store.users.length;
  },

  async findOne({ email }) {
    if (!email) return null;
    const found = store.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );
    return found ? createUserDoc(found) : null;
  },

  findById(id) {
    const found = store.users.find((u) => u._id.toString() === id.toString());
    const queryObj = {
      _doc: found ? createUserDoc(found) : null,
      select(fields) {
        if (this._doc && fields === '-password') {
          const { password, ...safe } = this._doc;
          this._doc = safe;
        }
        return this;
      },
      then(resolve, reject) {
        return Promise.resolve(this._doc).then(resolve, reject);
      }
    };
    return queryObj;
  },

  async create({ name, email, password, role = 'user' }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      _id: generateId(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    store.users.push(newUser);
    return createUserDoc(newUser);
  }
};

function createUserDoc(raw) {
  const doc = { ...raw };
  doc.matchPassword = async function (entered) {
    return await bcrypt.compare(entered, doc.password);
  };
  return doc;
}

// Order Memory Model
function MockOrder(orderData) {
  this._id = generateId();
  Object.assign(this, orderData);
  this.status = this.status || 'Processing';
  this.isPaid = this.isPaid !== undefined ? this.isPaid : false;
  this.createdAt = new Date();
  this.updatedAt = new Date();

  this.save = async function () {
    store.orders.push(this);
    return this;
  };
}

MockOrder.find = function (query = {}) {
  let results = [...store.orders];

  if (query.user) {
    results = results.filter((o) => o.user.toString() === query.user.toString());
  }

  const queryObj = {
    _results: results,
    sort(sortOption = {}) {
      this._results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return Promise.resolve(this._results);
    },
    then(resolve, reject) {
      return Promise.resolve(this._results).then(resolve, reject);
    }
  };

  return queryObj;
};

MockOrder.findById = function (id) {
  const order = store.orders.find((o) => o._id.toString() === id.toString());
  const queryObj = {
    _doc: order ? { ...order } : null,
    populate(field, select) {
      if (this._doc && field === 'user') {
        const u = store.users.find((user) => user._id.toString() === this._doc.user.toString());
        if (u) {
          this._doc.user = { _id: u._id, name: u.name, email: u.email };
        }
      }
      return this;
    },
    then(resolve, reject) {
      return Promise.resolve(this._doc).then(resolve, reject);
    }
  };
  return queryObj;
};

module.exports = {
  store,
  MockProduct,
  MockUser,
  MockOrder
};
