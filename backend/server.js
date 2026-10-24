const express = require('express');

const cors = require('cors');

const fs = require('fs');

const path = require('path');



const app = express();

const PORT = process.env.PORT || 5000;



// Enable CORS and JSON body parsing

app.use(cors());

app.use(express.json({ limit: '10mb' }));



// Helper paths for JSON persistence

const PRODUCTS_FILE = path.join(__dirname, 'products.json');

const ORDERS_FILE = path.join(__dirname, 'orders.json');

const SETTINGS_FILE = path.join(__dirname, 'settings.json');



// --- ATOMIC FILE READ/WRITE UTILITIES (Prevents file corruption on concurrent requests) ---

const safeReadJSON = (filePath, fallbackData = []) => {

  try {

    if (!fs.existsSync(filePath)) {

      safeWriteJSON(filePath, fallbackData);

      return fallbackData;

    }

    const data = fs.readFileSync(filePath, 'utf8');

    return JSON.parse(data);

  } catch (err) {

    console.error(`Error reading ${filePath}:`, err);

    return fallbackData;

  }

};



const safeWriteJSON = (filePath, data) => {

  const tempPath = `${filePath}.tmp`;

  try {

    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');

    fs.renameSync(tempPath, filePath);

  } catch (err) {

    console.error(`Error writing to ${filePath}:`, err);

  }

};



// Default Settings Initializer

const getDefaultSettings = () => ({

  deliveryFee: 2.00,

  irbidDeliveryFee: 3.50,

  discountCodes: {

    "WELCOME10": 0.10,

    "SAVE2": 2.00

  }

});



// ==================== PRODUCTS ENDPOINTS ====================



// GET All Products

app.get('/api/products', (req, res) => {

  const products = safeReadJSON(PRODUCTS_FILE, []);

  res.json(products);

});



// GET Single Product

app.get('/api/products/:id', (req, res) => {

  const products = safeReadJSON(PRODUCTS_FILE, []);

  const product = products.find(p => String(p.id || p._id) === String(req.params.id));

  if (!product) return res.status(404).json({ error: 'Product not found' });

  res.json(product);

});



// POST Create Product (Admin)

app.post('/api/products', (req, res) => {

  const products = safeReadJSON(PRODUCTS_FILE, []);

  const newProduct = {

    id: Date.now().toString(),

    name: req.body.name || 'Unnamed Product',

    price: Number(req.body.price) || 0,

    category: req.body.category || 'General',

    description: req.body.description || '',

    stock: Number(req.body.stock) || 0,

    featured: Boolean(req.body.featured),

    image: req.body.image || '',

    images: Array.isArray(req.body.images) ? req.body.images : [],

    sizes: Array.isArray(req.body.sizes) ? req.body.sizes : [],

    colors: Array.isArray(req.body.colors) ? req.body.colors : [],

    createdAt: new Date().toISOString()

  };



  products.push(newProduct);

  safeWriteJSON(PRODUCTS_FILE, products);

  res.status(201).json(newProduct);

});



// PUT Update Product (Admin)

app.put('/api/products/:id', (req, res) => {

  let products = safeReadJSON(PRODUCTS_FILE, []);

  const index = products.findIndex(p => String(p.id || p._id) === String(req.params.id));



  if (index === -1) {

    return res.status(404).json({ error: 'Product not found' });

  }



  products[index] = {

    ...products[index],

    ...req.body,

    price: req.body.price !== undefined ? Number(req.body.price) : products[index].price,

    stock: req.body.stock !== undefined ? Number(req.body.stock) : products[index].stock,

    updatedAt: new Date().toISOString()

  };



  safeWriteJSON(PRODUCTS_FILE, products);

  res.json(products[index]);

});



// DELETE Product (Admin)

app.delete('/api/products/:id', (req, res) => {

  let products = safeReadJSON(PRODUCTS_FILE, []);

  const initialLength = products.length;

  products = products.filter(p => String(p.id || p._id) !== String(req.params.id));



  if (products.length === initialLength) {

    return res.status(404).json({ error: 'Product not found' });

  }



  safeWriteJSON(PRODUCTS_FILE, products);

  res.json({ message: 'Product deleted successfully' });

});



// ==================== ORDERS ENDPOINTS ====================



// GET All Orders

app.get('/api/orders', (req, res) => {

  const orders = safeReadJSON(ORDERS_FILE, []);

  res.json(orders);

});



// POST Create Order (Frontend Checkout)

app.post('/api/orders', (req, res) => {

  const incomingOrder = req.body;



  // Enforce basic validation

  if (!incomingOrder.items || !Array.isArray(incomingOrder.items) || incomingOrder.items.length === 0) {

    return res.status(400).json({ error: 'Order must contain at least one item.' });

  }



  const phone = (incomingOrder.phone || (incomingOrder.customer && incomingOrder.customer.phone1) || '').trim();

  if (!/^\d{10}$/.test(phone)) {

    return res.status(400).json({ error: 'Valid 10-digit phone number is required.' });

  }



  const settings = safeReadJSON(SETTINGS_FILE, getDefaultSettings());

  const orders = safeReadJSON(ORDERS_FILE, []);



  // Calculate items subtotal on backend for safety

  const calculatedSubtotal = incomingOrder.items.reduce((sum, item) => {

    return sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1));

  }, 0);



  // Dynamic regional delivery fee determination

  const deliveryFee = incomingOrder.deliveryFee !== undefined 

    ? Number(incomingOrder.deliveryFee) 

    : (incomingOrder.address && incomingOrder.address.includes('Irbid') ? (settings.irbidDeliveryFee || 3.50) : (settings.deliveryFee || 2.00));



  const discountAmount = Number(incomingOrder.discountAmount) || 0;

  const grandTotal = Math.max(0, calculatedSubtotal + deliveryFee - discountAmount);



  const newOrder = {

    id: Date.now().toString(),

    items: incomingOrder.items,

    total: calculatedSubtotal,

    deliveryFee: deliveryFee,

    discountAmount: discountAmount,

    grandTotal: grandTotal,

    arabicName: incomingOrder.arabicName || (incomingOrder.customer && incomingOrder.customer.arabicName) || 'N/A',

    phone: phone,

    address: incomingOrder.address || (incomingOrder.customer && incomingOrder.customer.manualAddress) || 'N/A',

    status: 'Pending',

    customer: {

      arabicName: incomingOrder.arabicName || (incomingOrder.customer && incomingOrder.customer.arabicName) || 'N/A',

      phone1: phone,

      manualAddress: incomingOrder.address || (incomingOrder.customer && incomingOrder.customer.manualAddress) || 'N/A',

      paymentMethod: 'Cash on Delivery'

    },

    createdAt: new Date().toISOString()

  };



  orders.unshift(newOrder);

  safeWriteJSON(ORDERS_FILE, orders);



  // Deduct Inventory Stock

  const products = safeReadJSON(PRODUCTS_FILE, []);

  incomingOrder.items.forEach(cartItem => {

    const pIndex = products.findIndex(p => String(p.id || p._id) === String(cartItem.id || cartItem._id));

    if (pIndex !== -1) {

      products[pIndex].stock = Math.max(0, (products[pIndex].stock || 0) - (cartItem.quantity || 1));

    }

  });

  safeWriteJSON(PRODUCTS_FILE, products);



  res.status(201).json({ message: 'Order created successfully', order: newOrder });

});



// PUT / PATCH Update Order Status (Admin)

app.use('/api/orders/:id', (req, res, next) => {

  if (req.method === 'PUT' || req.method === 'PATCH') {

    let orders = safeReadJSON(ORDERS_FILE, []);

    const index = orders.findIndex(o => String(o.id || o._id) === String(req.params.id));



    if (index === -1) {

      return res.status(404).json({ error: 'Order not found' });

    }



    orders[index] = {

      ...orders[index],

      ...req.body,

      updatedAt: new Date().toISOString()

    };



    safeWriteJSON(ORDERS_FILE, orders);

    return res.json(orders[index]);

  }

  next();

});



// DELETE Order (Admin)

app.delete('/api/orders/:id', (req, res) => {

  let orders = safeReadJSON(ORDERS_FILE, []);

  const initialLength = orders.length;

  orders = orders.filter(o => String(o.id || o._id) !== String(req.params.id));



  if (orders.length === initialLength) {

    return res.status(404).json({ error: 'Order not found' });

  }



  safeWriteJSON(ORDERS_FILE, orders);

  res.json({ message: 'Order deleted successfully' });

});



// ==================== SETTINGS ENDPOINTS ====================



// GET Settings

app.get('/api/settings', (req, res) => {

  const settings = safeReadJSON(SETTINGS_FILE, getDefaultSettings());

  res.json(settings);

});



// PUT / PATCH Update Settings

app.use('/api/settings', (req, res, next) => {

  if (req.method === 'PUT' || req.method === 'PATCH') {

    const currentSettings = safeReadJSON(SETTINGS_FILE, getDefaultSettings());

    const updatedSettings = {

      ...currentSettings,

      ...req.body,

      deliveryFee: req.body.deliveryFee !== undefined ? Number(req.body.deliveryFee) : currentSettings.deliveryFee,

      irbidDeliveryFee: req.body.irbidDeliveryFee !== undefined ? Number(req.body.irbidDeliveryFee) : currentSettings.irbidDeliveryFee

    };



    safeWriteJSON(SETTINGS_FILE, updatedSettings);

    return res.json(updatedSettings);

  }

  next();

});



// Start Server

app.listen(PORT, () => {

  console.log(`Karam Stores Backend running on port ${PORT}`);

});