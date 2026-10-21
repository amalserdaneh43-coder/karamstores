const express = require('express');

const cors = require('cors');

const fs = require('fs').promises;

const fsSync = require('fs');

const path = require('path');

const jwt = require('jsonwebtoken');



const app = express();

app.use(cors());

app.use(express.json({ limit: '10mb' }));



// --- ENVIRONMENT & SECRETS ---

const PORT = process.env.PORT || 5000;

const JWT_SECRET = process.env.JWT_SECRET || 'karam_stores_secret_jwt_key_2026';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Karam123';



// --- FILE PATHS ---

const PRODUCTS_FILE = path.join(__dirname, 'products.json');

const CATEGORIES_FILE = path.join(__dirname, 'categories.json');

const ORDERS_FILE = path.join(__dirname, 'orders.json');

const SETTINGS_FILE = path.join(__dirname, 'settings.json');



// --- ATOMIC FILE HELPERS (Prevents Data Corruption during Simultaneous Writes) ---

const loadDataSync = (filePath, defaultData) => {

  try {

    if (fsSync.existsSync(filePath)) {

      return JSON.parse(fsSync.readFileSync(filePath, 'utf8'));

    }

  } catch (err) {

    console.error(`Error reading sync ${filePath}:`, err);

  }

  return defaultData;

};



const atomicSaveData = async (filePath, data) => {

  const tempPath = `${filePath}.tmp.${Date.now()}`;

  try {

    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');

    await fs.rename(tempPath, filePath);

  } catch (err) {

    console.error(`Error writing ${filePath}:`, err);

    try { await fs.unlink(tempPath); } catch (_) {}

  }

};



// --- INITIALIZE IN-MEMORY DATA FROM STORAGE ---

let products = loadDataSync(PRODUCTS_FILE, [

  { id: '1', _id: '1', name: 'All-Purpose Cleaner', category: 'Cleaning', price: 9.99, stock: 20, image: '', images: [], description: '', sizes: [], colors: [], featured: true },

  { id: '2', _id: '2', name: 'Modern Velvet Sofa', category: 'Furniture', price: 349.99, stock: 3, image: '', images: [], description: '', sizes: [], colors: [], featured: true },

  { id: '3', _id: '3', name: 'Matte Liquid Lipstick', category: 'Makeup', price: 18.50, stock: 15, image: '', images: [], description: '', sizes: [], colors: [], featured: false }

]);



let categoriesList = loadDataSync(CATEGORIES_FILE, ['Cleaning', 'Furniture', 'Makeup', 'Gifts', 'Kitchen', 'General']);

let orders = loadDataSync(ORDERS_FILE, []);

let storeSettings = loadDataSync(SETTINGS_FILE, { deliveryFee: 2.00, irbidDeliveryFee: 3.50, discountCodes: { "WELCOME10": 0.10, "KARAM5": 5.00 } });



// --- AUTHENTICATION MIDDLEWARE ---

const authenticateAdminToken = (req, res, next) => {

  const authHeader = req.headers['authorization'];

  const token = authHeader && authHeader.split(' ')[1];



  if (!token) return res.status(401).json({ error: 'Unauthorized: Admin token required' });



  jwt.verify(token, JWT_SECRET, (err, user) => {

    if (err) return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });

    req.user = user;

    next();

  });

};



// --- AUTHENTICATION ROUTE ---

app.post('/api/admin/login', (req, res) => {

  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {

    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });

    return res.json({ success: true, token });

  }

  return res.status(401).json({ error: 'Incorrect admin password' });

});



// --- PUBLIC STORE ENDPOINTS ---

app.get('/api/settings', (req, res) => res.json(storeSettings));

app.get('/api/categories', (req, res) => res.json(categoriesList));

app.get('/api/products', (req, res) => res.json(products));

app.get('/api/orders', (req, res) => res.json(orders));



app.post('/api/orders', async (req, res) => {

  try {

    const incomingOrder = req.body;

    const items = incomingOrder.items || [];



    // Deduct stock for ordered items safely

    items.forEach(item => {

      const prod = products.find(p => String(p.id || p._id) === String(item.id || item._id));

      if (prod) {

        prod.stock = Math.max(0, prod.stock - item.quantity);

      }

    });

    await atomicSaveData(PRODUCTS_FILE, products);



    const subtotal = incomingOrder.total || items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    const deliveryFee = incomingOrder.deliveryFee !== undefined ? Number(incomingOrder.deliveryFee) : storeSettings.deliveryFee;

    let discountAmount = incomingOrder.discountAmount || 0;

    const grandTotal = Math.max(0, subtotal + deliveryFee - discountAmount);



    const newOrder = {

      id: orders.length + 1,

      items: items,

      total: subtotal,

      deliveryFee: deliveryFee,

      discountAmount: discountAmount,

      grandTotal: grandTotal,

      status: 'Pending',

      createdAt: new Date().toISOString(),

      customer: {

        arabicName: incomingOrder.customer?.arabicName || incomingOrder.arabicName || 'N/A',

        phone1: incomingOrder.customer?.phone1 || incomingOrder.phone || 'N/A',

        phone2: incomingOrder.customer?.phone2 || incomingOrder.phone2 || '',

        manualAddress: incomingOrder.customer?.manualAddress || incomingOrder.address || 'N/A',

        mapCoordinates: incomingOrder.customer?.mapCoordinates || 'Not pinned',

        paymentMethod: 'Cash on Delivery'

      }

    };



    orders.push(newOrder);

    await atomicSaveData(ORDERS_FILE, orders);

    res.status(201).json({ success: true, order: newOrder });

  } catch (err) {

    res.status(500).json({ error: 'Failed to create order' });

  }

});



// --- PROTECTED ADMIN ENDPOINTS ---

app.use('/api/admin/*', authenticateAdminToken);



// Update Store Settings

app.put('/api/settings', async (req, res) => {

  const { deliveryFee, irbidDeliveryFee, discountCodes } = req.body;

  if (deliveryFee !== undefined) storeSettings.deliveryFee = Number(deliveryFee);

  if (irbidDeliveryFee !== undefined) storeSettings.irbidDeliveryFee = Number(irbidDeliveryFee);

  if (discountCodes !== undefined) storeSettings.discountCodes = discountCodes;

  await atomicSaveData(SETTINGS_FILE, storeSettings);

  res.json({ message: 'Settings updated successfully', storeSettings });

});



app.patch('/api/settings', async (req, res) => {

  const { deliveryFee, irbidDeliveryFee, discountCodes } = req.body;

  if (deliveryFee !== undefined) storeSettings.deliveryFee = Number(deliveryFee);

  if (irbidDeliveryFee !== undefined) storeSettings.irbidDeliveryFee = Number(irbidDeliveryFee);

  if (discountCodes !== undefined) storeSettings.discountCodes = discountCodes;

  await atomicSaveData(SETTINGS_FILE, storeSettings);

  res.json({ message: 'Settings updated successfully', storeSettings });

});



// Product Management

app.post('/api/products', async (req, res) => {

  const inputId = req.body.id !== undefined && req.body.id !== null ? String(req.body.id).trim() : '';

  const finalId = inputId !== '' ? inputId : 'ITEM-' + Math.floor(1000 + Math.random() * 9000);



  const newProduct = {

    id: finalId,

    _id: finalId,

    name: req.body.name,

    category: req.body.category || 'General',

    price: Number(req.body.price),

    stock: Number(req.body.stock),

    image: req.body.image || '',

    images: req.body.images || [],

    description: req.body.description || '',

    sizes: req.body.sizes || [],

    colors: req.body.colors || [],

    featured: Boolean(req.body.featured)

  };

  

  products.push(newProduct);

  await atomicSaveData(PRODUCTS_FILE, products);

  res.status(201).json(newProduct);

});



app.post('/api/products/import', async (req, res) => {

  try {

    const incomingProducts = req.body.products;

    if (!Array.isArray(incomingProducts)) {

      return res.status(400).json({ error: 'Invalid format. Expected an array of products.' });

    }



    incomingProducts.forEach(item => {

      const pId = item.id || item._id ? String(item.id || item._id).trim() : 'ITEM-' + Math.floor(1000 + Math.random() * 9000);

      const existingIndex = products.findIndex(p => String(p.id || p._id) === pId);



      const formattedProduct = {

        id: pId,

        _id: pId,

        name: item.name || 'Unnamed Product',

        category: item.category || 'General',

        price: Number(item.price) || 0,

        stock: Number(item.stock) || 0,

        image: item.image || '',

        images: Array.isArray(item.images) ? item.images : [],

        description: item.description || '',

        sizes: Array.isArray(item.sizes) ? item.sizes : [],

        colors: Array.isArray(item.colors) ? item.colors : [],

        featured: Boolean(item.featured)

      };



      if (existingIndex >= 0) {

        products[existingIndex] = formattedProduct;

      } else {

        products.push(formattedProduct);

      }



      if (formattedProduct.category && !categoriesList.includes(formattedProduct.category)) {

        categoriesList.push(formattedProduct.category);

      }

    });



    await atomicSaveData(PRODUCTS_FILE, products);

    await atomicSaveData(CATEGORIES_FILE, categoriesList);

    res.json({ success: true, message: `Successfully imported ${incomingProducts.length} products.`, products });

  } catch (err) {

    res.status(500).json({ error: 'Failed to import products' });

  }

});



app.patch('/api/products/:id', async (req, res) => {

  const { id } = req.params;

  const { newId, price, stock, name, category, image, images, description, sizes, colors, featured } = req.body;



  const product = products.find(p => (p.id === id || p._id === id));

  if (product) {

    if (newId && newId.trim() !== '') {

      product.id = newId.trim();

      product._id = newId.trim();

    }

    if (name !== undefined) product.name = name;

    if (category !== undefined) product.category = category;

    if (price !== undefined) product.price = Number(price);

    if (stock !== undefined) product.stock = Number(stock);

    if (image !== undefined) product.image = image;

    if (images !== undefined) product.images = images;

    if (description !== undefined) product.description = description;

    if (sizes !== undefined) product.sizes = sizes;

    if (colors !== undefined) product.colors = colors;

    if (featured !== undefined) product.featured = Boolean(featured);

    

    await atomicSaveData(PRODUCTS_FILE, products);

    return res.json({ message: 'Product updated successfully', product });

  }

  res.status(404).json({ message: 'Product not found' });

});



app.delete('/api/products/:id', async (req, res) => {

  const { id } = req.params;

  products = products.filter(p => (p.id !== id && p._id !== id));

  await atomicSaveData(PRODUCTS_FILE, products);

  res.json({ message: 'Product removed successfully' });

});



// Order Management

app.patch('/api/orders/:id', async (req, res) => {

  const { id } = req.params;

  const { status, customer, phone, address, items, total, grandTotal } = req.body;

  

  const order = orders.find(o => String(o.id) === String(id) || String(o._id) === String(id));

  if (order) {

    if (status !== undefined) order.status = status;

    if (customer !== undefined) order.customer = customer;

    if (phone !== undefined) {

      if (!order.customer) order.customer = {};

      order.customer.phone1 = phone;

    }

    if (address !== undefined) {

      if (!order.customer) order.customer = {};

      order.customer.manualAddress = address;

    }

    if (items !== undefined) order.items = items;

    if (total !== undefined) order.total = Number(total);

    if (grandTotal !== undefined) order.grandTotal = Number(grandTotal);



    await atomicSaveData(ORDERS_FILE, orders);

    return res.json({ message: 'Order updated successfully', order });

  }

  res.status(404).json({ message: 'Order not found' });

});



app.listen(PORT, () => {

  console.log(`Karam Stores backend server running on port ${PORT}`);

});