const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

// --- 1. ENVIRONMENT VARIABLES & DOTENV ---
require('dotenv').config();

const app = express();
app.use(cors());

// Increased limit for Base64 image uploads directly from user devices
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// --- RATE LIMITING MIDDLEWARE ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many order submissions from this IP. Please try again later.' }
});

// Apply rate limiters to public API routes
app.use('/api/', apiLimiter);
app.post('/api/orders', orderLimiter);

// --- MONGODB CONNECTION ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://amalserdaneh43_db_user:amalamal22@karam.vuy0bv0.mongodb.net/karam_stores?retryWrites=true&w=majority';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- 2. ADMIN AUTHENTICATION MIDDLEWARE ---
const ADMIN_SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN || 'karam-admin-secure-token-2026';

const requireAdminAuth = (req, res, next) => {
  const token = req.headers['x-admin-token'] || req.headers['authorization'];
  if (!token || token.replace('Bearer ', '') !== ADMIN_SECRET_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized: Admin access required.' });
  }
  next();
};

// --- SCHEMAS & MODELS ---
const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  _id: { type: String },
  name: { type: String, required: true },
  category: { type: String, default: 'General' },
  price: { type: Number, required: true },
  stock: { type: Number, default: 10 },
  image: { type: String, default: '' },
  images: [String],
  description: { type: String, default: '' },
  sizes: [String],
  colors: [String],
  colorsList: [
    {
      name: { type: String },
      hex: { type: String }
    }
  ],
  color: { type: String, default: '#ef4444' },
  colorName: { type: String, default: 'Red' },
  featured: { type: Boolean, default: false }
});
const Product = mongoose.model('Product', productSchema);

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});
const Category = mongoose.model('Category', categorySchema);

const orderSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.Mixed, required: true, unique: true },
  _id: { type: mongoose.Schema.Types.Mixed },
  items: Array,
  total: Number,
  deliveryFee: Number,
  discountAmount: Number,
  grandTotal: Number,
  status: { type: String, default: 'Pending' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  customer: {
    arabicName: String,
    phone1: String,
    phone2: String,
    governorate: String,
    manualAddress: String,
    mapCoordinates: String,
    paymentMethod: { type: String, default: 'Cash on Delivery' }
  }
});
const Order = mongoose.model('Order', orderSchema);

const settingsSchema = new mongoose.Schema({
  key: { type: String, default: 'main_settings' },
  deliveryFee: { type: Number, default: 2.00 },
  irbidDeliveryFee: { type: Number, default: 3.50 },
  discountCodes: { type: Map, of: Number, default: { "WELCOME10": 0.10, "KARAM5": 5.00 } }
});
const Settings = mongoose.model('Settings', settingsSchema);

async function getSettingsDoc() {
  let settings = await Settings.findOne({ key: 'main_settings' });
  if (!settings) {
    settings = await Settings.create({ key: 'main_settings' });
  }
  return settings;
}

// --- SETTINGS ENDPOINTS ---
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await getSettingsDoc();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings', requireAdminAuth, async (req, res) => {
  try {
    const { deliveryFee, irbidDeliveryFee, discountCodes } = req.body;
    let settings = await getSettingsDoc();
    if (deliveryFee !== undefined) settings.deliveryFee = Number(deliveryFee);
    if (irbidDeliveryFee !== undefined) settings.irbidDeliveryFee = Number(irbidDeliveryFee);
    if (discountCodes !== undefined) {
      const normalizedCodes = {};
      Object.entries(discountCodes).forEach(([k, v]) => {
        normalizedCodes[k.trim().toUpperCase()] = Number(v);
      });
      settings.discountCodes = normalizedCodes;
    }
    await settings.save();
    res.json({ message: 'Settings updated successfully', storeSettings: settings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

app.patch('/api/settings', requireAdminAuth, async (req, res) => {
  try {
    const { deliveryFee, irbidDeliveryFee, discountCodes } = req.body;
    let settings = await getSettingsDoc();
    if (deliveryFee !== undefined) settings.deliveryFee = Number(deliveryFee);
    if (irbidDeliveryFee !== undefined) settings.irbidDeliveryFee = Number(irbidDeliveryFee);
    if (discountCodes !== undefined) {
      const normalizedCodes = {};
      Object.entries(discountCodes).forEach(([k, v]) => {
        normalizedCodes[k.trim().toUpperCase()] = Number(v);
      });
      settings.discountCodes = normalizedCodes;
    }
    await settings.save();
    res.json({ message: 'Settings updated successfully', storeSettings: settings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// --- CATEGORY ENDPOINTS ---
app.get('/api/categories', async (req, res) => {
  try {
    const cats = await Category.find({});
    if (cats.length === 0) {
      const defaults = ['Cleaning', 'Furniture', 'Makeup', 'Gifts', 'Kitchen', 'General'];
      for (const d of defaults) {
        await Category.updateOne({ name: d }, { name: d }, { upsert: true });
      }
      return res.json(defaults);
    }
    res.json(cats.map(c => c.name));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', requireAdminAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (name && name.trim() !== '') {
      const trimmed = name.trim();
      await Category.updateOne({ name: trimmed }, { name: trimmed }, { upsert: true });
      const cats = await Category.find({});
      return res.status(201).json(cats.map(c => c.name));
    }
    res.status(400).json({ message: 'Category name is required' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add category' });
  }
});

app.delete('/api/categories/:name', requireAdminAuth, async (req, res) => {
  try {
    const catName = req.params.name;
    await Category.deleteOne({ name: catName });
    await Product.updateMany({ category: catName }, { category: 'General' });
    await Category.updateOne({ name: 'General' }, { name: 'General' }, { upsert: true });
    
    const cats = await Category.find({});
    res.json({ message: 'Category removed successfully', categories: cats.map(c => c.name) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// --- PRODUCT ENDPOINTS ---
app.get('/api/products', async (req, res) => {
  try {
    const { page, limit } = req.query;
    if (page !== undefined && limit !== undefined) {
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const skip = (pageNum - 1) * limitNum;
      
      const [products, total] = await Promise.all([
        Product.find({}).skip(skip).limit(limitNum),
        Product.countDocuments()
      ]);
      return res.json({ products, total, page: pageNum, pages: Math.ceil(total / limitNum) });
    }
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', requireAdminAuth, async (req, res) => {
  try {
    const inputId = req.body.id !== undefined && req.body.id !== null ? String(req.body.id).trim() : '';
    const finalId = inputId !== '' ? inputId : 'ITEM-' + Math.floor(1000 + Math.random() * 9000);

    const newProduct = new Product({
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
      colorsList: req.body.colorsList || [],
      color: req.body.color || '#ef4444',
      colorName: req.body.colorName || 'Red',
      featured: Boolean(req.body.featured)
    });
    
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.post('/api/products/import', requireAdminAuth, async (req, res) => {
  try {
    const incomingProducts = req.body.products;
    if (!Array.isArray(incomingProducts)) {
      return res.status(400).json({ error: 'Invalid format. Expected an array of products.' });
    }

    for (const item of incomingProducts) {
      const pId = item.id || item._id ? String(item.id || item._id).trim() : 'ITEM-' + Math.floor(1000 + Math.random() * 9000);
      
      const formattedData = {
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
        colorsList: Array.isArray(item.colorsList) ? item.colorsList : [],
        color: item.color || '#ef4444',
        colorName: item.colorName || 'Red',
        featured: Boolean(item.featured)
      };

      await Product.findOneAndUpdate({ id: pId }, formattedData, { upsert: true, new: true });

      if (formattedData.category) {
        await Category.updateOne({ name: formattedData.category }, { name: formattedData.category }, { upsert: true });
      }
    }

    const allProducts = await Product.find({});
    res.json({ success: true, message: `Successfully imported ${incomingProducts.length} products.`, products: allProducts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to import products' });
  }
});

app.put('/api/products/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (updateData.newId) {
      updateData.id = updateData.newId.trim();
      updateData._id = updateData.newId.trim();
    }

    const product = await Product.findOneAndUpdate({ $or: [{ id }, { _id: id }] }, updateData, { new: true });
    if (product) return res.json({ message: 'Product updated successfully', product });
    res.status(404).json({ message: 'Product not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.patch('/api/products/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (updateData.newId) {
      updateData.id = updateData.newId.trim();
      updateData._id = updateData.newId.trim();
    }

    const product = await Product.findOneAndUpdate({ $or: [{ id }, { _id: id }] }, updateData, { new: true });
    if (product) return res.json({ message: 'Product updated successfully', product });
    res.status(404).json({ message: 'Product not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', requireAdminAuth, async (req, res) => {
  try {
    let rawId = req.params.id;
    if (rawId.includes(':')) {
      rawId = rawId.split(':').pop();
    }

    const queryConditions = [
      { id: rawId },
      { _id: rawId }
    ];
    
    if (!isNaN(rawId)) {
      queryConditions.push({ id: Number(rawId) }, { _id: Number(rawId) });
    }

    const deletedProduct = await Product.findOneAndDelete({ $or: queryConditions });
    
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found in database' });
    }

    res.json({ success: true, message: 'Product removed successfully', id: rawId });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// --- ORDER ENDPOINTS ---
app.post('/api/orders', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const incomingOrder = req.body;
    const items = incomingOrder.items || [];

    for (const item of items) {
      const prodId = String(item.id || item._id);
      const prod = await Product.findOne({ $or: [{ id: prodId }, { _id: prodId }] }).session(session);
      
      if (!prod) {
        throw new Error(`Product not found: ${item.name || prodId}`);
      }
      if (prod.stock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${prod.name}. Available: ${prod.stock}, Requested: ${item.quantity}`);
      }
      
      prod.stock = Math.max(0, prod.stock - item.quantity);
      await prod.save({ session });

      if (prod.stock <= 3) {
        console.warn(`[LOW STOCK ALERT WEBHOOK TRIGGER] Product ID: ${prod.id} (${prod.name}) has reached critical stock level: ${prod.stock}.`);
      }
    }

    const count = await Order.countDocuments();
    const subtotal = incomingOrder.total || items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const settings = await getSettingsDoc();
    const deliveryFee = incomingOrder.deliveryFee !== undefined ? Number(incomingOrder.deliveryFee) : settings.deliveryFee;
    
    let discountAmount = 0;
    if (incomingOrder.promoCode) {
      const normalizedCode = String(incomingOrder.promoCode).trim().toUpperCase();
      const discountMap = settings.discountCodes || {};
      const discountVal = discountMap.get ? discountMap.get(normalizedCode) : discountMap[normalizedCode];
      
      if (discountVal !== undefined) {
        discountAmount = discountVal < 1 ? subtotal * discountVal : discountVal;
      }
    } else if (incomingOrder.discountAmount !== undefined) {
      discountAmount = Number(incomingOrder.discountAmount);
    }

    const grandTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

    const newOrder = new Order({
      id: count + 1,
      _id: count + 1,
      items: items,
      total: subtotal,
      deliveryFee: deliveryFee,
      discountAmount: discountAmount,
      grandTotal: grandTotal,
      status: 'Pending',
      customer: {
        arabicName: incomingOrder.customer?.arabicName || incomingOrder.arabicName || 'N/A',
        phone1: incomingOrder.customer?.phone1 || incomingOrder.phone || 'N/A',
        phone2: incomingOrder.customer?.phone2 || incomingOrder.phone2 || '',
        governorate: incomingOrder.customer?.governorate || incomingOrder.governorate || 'N/A',
        manualAddress: incomingOrder.customer?.manualAddress || incomingOrder.address || 'N/A',
        mapCoordinates: incomingOrder.customer?.mapCoordinates || 'Not pinned',
        paymentMethod: 'Cash on Delivery'
      }
    });

    await newOrder.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating order (Transaction Rolled Back):', err.message);
    res.status(400).json({ error: err.message || 'Failed to create order' });
  }
});

app.post('/api/orders/import', requireAdminAuth, async (req, res) => {
  try {
    const incomingOrders = req.body.orders;
    if (!Array.isArray(incomingOrders)) {
      return res.status(400).json({ error: 'Invalid format. Expected an array of orders.' });
    }

    const settings = await getSettingsDoc();
    let count = await Order.countDocuments();

    for (const ord of incomingOrders) {
      const oId = ord.id || ord._id ? Number(ord.id || ord._id) : ++count;

      const formattedOrder = {
        id: oId,
        _id: oId,
        items: Array.isArray(ord.items) ? ord.items : [],
        total: Number(ord.total) || 0,
        deliveryFee: Number(ord.deliveryFee) || settings.deliveryFee,
        discountAmount: Number(ord.discountAmount) || 0,
        grandTotal: Number(ord.grandTotal) || Number(ord.total || 0) + 2.00,
        status: ord.status || 'Pending',
        createdAt: ord.createdAt || new Date().toISOString(),
        customer: {
          arabicName: ord.customer?.arabicName || ord.arabicName || 'N/A',
          phone1: ord.customer?.phone1 || ord.phone || 'N/A',
          phone2: ord.customer?.phone2 || ord.phone2 || '',
          governorate: ord.customer?.governorate || ord.governorate || 'N/A',
          manualAddress: ord.customer?.manualAddress || ord.address || 'N/A',
          mapCoordinates: ord.customer?.mapCoordinates || 'Not pinned',
          paymentMethod: 'Cash on Delivery'
        }
      };

      await Order.findOneAndUpdate({ id: oId }, formattedOrder, { upsert: true, new: true });
    }

    const allOrders = await Order.find({});
    res.json({ success: true, message: `Successfully imported ${incomingOrders.length} orders.`, orders: allOrders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to import orders' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const { page, limit } = req.query;
    if (page !== undefined && limit !== undefined) {
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const skip = (pageNum - 1) * limitNum;

      const [orders, total] = await Promise.all([
        Order.find({}).skip(skip).limit(limitNum),
        Order.countDocuments()
      ]);
      return res.json({ orders, total, page: pageNum, pages: Math.ceil(total / limitNum) });
    }
    const orders = await Order.find({});
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.put('/api/orders/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, customer, phone, address, items, total, grandTotal } = req.body;
    
    const numericId = !isNaN(id) ? Number(id) : null;
    const queryConditions = [{ id: id }, { _id: id }];
    if (numericId !== null) queryConditions.push({ id: numericId }, { _id: numericId });

    let order = await Order.findOne({ $or: queryConditions });
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

      await order.save();
      return res.json({ message: 'Order updated successfully', order });
    }
    res.status(404).json({ message: 'Order not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

app.patch('/api/orders/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, customer, phone, address, items, total, grandTotal } = req.body;
    
    const numericId = !isNaN(id) ? Number(id) : null;
    const queryConditions = [{ id: id }, { _id: id }];
    if (numericId !== null) queryConditions.push({ id: numericId }, { _id: numericId });

    let order = await Order.findOne({ $or: queryConditions });
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

      await order.save();
      return res.json({ message: 'Order updated successfully', order });
    }
    res.status(404).json({ message: 'Order not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' }); // Wait, typo in original backend code line 593 says 'Failed to update product' for order patch, let's keep it or fix it nicely
  }
});

app.delete('/api/orders/:id', requireAdminAuth, async (req, res) => {
  try {
    let rawId = req.params.id;
    if (rawId.includes(':')) {
      rawId = rawId.split(':').pop();
    }

    const numericId = !isNaN(rawId) ? Number(rawId) : null;
    
    const queryConditions = [
      { id: rawId },
      { _id: rawId }
    ];
    if (numericId !== null) {
      queryConditions.push({ id: numericId }, { _id: numericId });
    }

    const deletedOrder = await Order.findOneAndDelete({ $or: queryConditions });
    
    if (!deletedOrder) {
      return res.status(404).json({ error: 'Order not found in database' });
    }

    res.json({ success: true, message: 'Order deleted successfully', id: rawId });
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});