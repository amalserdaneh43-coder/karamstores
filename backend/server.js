const express = require('express');

const cors = require('cors');

const mongoose = require('mongoose');



const app = express();

app.use(cors());

app.use(express.json({ limit: '10mb' }));



// --- MONGODB CONNECTION ---

// Replace with your MongoDB connection string (or use environment variables process.env.MONGO_URI)

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://amalserdaneh43_db_user:amalamal22@karam.vuy0bv0.mongodb.net/karam_stores?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)

  .then(() => console.log('Connected to MongoDB successfully'))

  .catch(err => console.error('MongoDB connection error:', err));



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

  id: { type: Number, required: true, unique: true },

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



// Helper to ensure default settings exist in DB

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



app.put('/api/settings', async (req, res) => {

  try {

    const { deliveryFee, irbidDeliveryFee, discountCodes } = req.body;

    let settings = await getSettingsDoc();

    if (deliveryFee !== undefined) settings.deliveryFee = Number(deliveryFee);

    if (irbidDeliveryFee !== undefined) settings.irbidDeliveryFee = Number(irbidDeliveryFee);

    if (discountCodes !== undefined) settings.discountCodes = discountCodes;

    await settings.save();

    res.json({ message: 'Settings updated successfully', storeSettings: settings });

  } catch (err) {

    res.status(500).json({ error: 'Failed to update settings' });

  }

});



app.patch('/api/settings', async (req, res) => {

  try {

    const { deliveryFee, irbidDeliveryFee, discountCodes } = req.body;

    let settings = await getSettingsDoc();

    if (deliveryFee !== undefined) settings.deliveryFee = Number(deliveryFee);

    if (irbidDeliveryFee !== undefined) settings.irbidDeliveryFee = Number(irbidDeliveryFee);

    if (discountCodes !== undefined) settings.discountCodes = discountCodes;

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

    // Fallback to default if empty

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



app.post('/api/categories', async (req, res) => {

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



app.delete('/api/categories/:name', async (req, res) => {

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

    const products = await Product.find({});

    res.json(products);

  } catch (err) {

    res.status(500).json({ error: 'Failed to fetch products' });

  }

});



app.post('/api/products', async (req, res) => {

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



// BULK PRODUCTS IMPORT ENDPOINT

app.post('/api/products/import', async (req, res) => {

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



app.put('/api/products/:id', async (req, res) => {

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



app.patch('/api/products/:id', async (req, res) => {

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



app.delete('/api/products/:id', async (req, res) => {

  try {

    const { id } = req.params;

    await Product.deleteOne({ $or: [{ id }, { _id: id }] });

    res.json({ message: 'Product removed successfully' });

  } catch (err) {

    res.status(500).json({ error: 'Failed to delete product' });

  }

});



// --- ORDER ENDPOINTS ---

app.post('/api/orders', async (req, res) => {

  try {

    const incomingOrder = req.body;

    const items = incomingOrder.items || [];



    for (const item of items) {

      const prod = await Product.findOne({ $or: [{ id: String(item.id || item._id) }, { _id: String(item.id || item._id) }] });

      if (prod) {

        prod.stock = Math.max(0, prod.stock - item.quantity);

        await prod.save();

      }

    }



    const count = await Order.countDocuments();

    const subtotal = incomingOrder.total || items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    const settings = await getSettingsDoc();

    const deliveryFee = incomingOrder.deliveryFee !== undefined ? Number(incomingOrder.deliveryFee) : settings.deliveryFee;

    let discountAmount = incomingOrder.discountAmount || 0;

    const grandTotal = Math.max(0, subtotal + deliveryFee - discountAmount);



    const newOrder = new Order({

      id: count + 1,

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

        manualAddress: incomingOrder.customer?.manualAddress || incomingOrder.address || 'N/A',

        mapCoordinates: incomingOrder.customer?.mapCoordinates || 'Not pinned',

        paymentMethod: 'Cash on Delivery'

      }

    });



    await newOrder.save();

    res.status(201).json({ success: true, order: newOrder });

  } catch (err) {

    res.status(500).json({ error: 'Failed to create order' });

  }

});



// BULK ORDERS IMPORT ENDPOINT

app.post('/api/orders/import', async (req, res) => {

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

    const orders = await Order.find({});

    res.json(orders);

  } catch (err) {

    res.status(500).json({ error: 'Failed to fetch orders' });

  }

});



app.put('/api/orders/:id', async (req, res) => {

  try {

    const { id } = req.params;

    const { status, customer, phone, address, items, total, grandTotal } = req.body;

    

    let order = await Order.findOne({ $or: [{ id: Number(id) }, { _id: id }] });

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



app.patch('/api/orders/:id', async (req, res) => {

  try {

    const { id } = req.params;

    const { status, customer, phone, address, items, total, grandTotal } = req.body;

    

    let order = await Order.findOne({ $or: [{ id: Number(id) }, { _id: id }] });

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



app.delete('/api/orders/:id', async (req, res) => {

  try {

    const { id } = req.params;

    await Order.deleteOne({ $or: [{ id: Number(id) }, { _id: id }] });

    res.json({ success: true, message: 'Order deleted successfully' });

  } catch (err) {

    res.status(500).json({ error: 'Failed to delete order' });

  }

});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(`Backend server running on port ${PORT}`);

});