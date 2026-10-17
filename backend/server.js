const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const CATEGORIES_FILE = path.join(__dirname, 'categories.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');
const SETTINGS_FILE = path.join(__dirname, 'settings.json');

const loadData = (filePath, defaultData) => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return defaultData;
};

const saveData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
};

let products = loadData(PRODUCTS_FILE, [
  { id: '1', _id: '1', name: 'All-Purpose Cleaner', category: 'Cleaning', price: 9.99, stock: 20, image: '', images: [], description: '', sizes: [], colors: [], featured: true },
  { id: '2', _id: '2', name: 'Modern Velvet Sofa', category: 'Furniture', price: 349.99, stock: 3, image: '', images: [], description: '', sizes: [], colors: [], featured: true },
  { id: '3', _id: '3', name: 'Matte Liquid Lipstick', category: 'Makeup', price: 18.50, stock: 15, image: '', images: [], description: '', sizes: [], colors: [], featured: false }
]);

let categoriesList = loadData(CATEGORIES_FILE, ['Cleaning', 'Furniture', 'Makeup', 'Gifts', 'Kitchen', 'General']);
let orders = loadData(ORDERS_FILE, []);
let storeSettings = loadData(SETTINGS_FILE, { deliveryFee: 3.00, discountCodes: { "WELCOME10": 0.10, "KARAM5": 5.00 } });

// --- SETTINGS ENDPOINTS ---
app.get('/api/settings', (req, res) => res.json(storeSettings));
app.patch('/api/settings', (req, res) => {
  const { deliveryFee, discountCodes } = req.body;
  if (deliveryFee !== undefined) storeSettings.deliveryFee = Number(deliveryFee);
  if (discountCodes !== undefined) storeSettings.discountCodes = discountCodes;
  saveData(SETTINGS_FILE, storeSettings);
  res.json({ message: 'Settings updated successfully', storeSettings });
});

// --- CATEGORY ENDPOINTS ---
app.get('/api/categories', (req, res) => res.json(categoriesList));

app.post('/api/categories', (req, res) => {
  const { name } = req.body;
  if (name && name.trim() !== '') {
    const trimmed = name.trim();
    if (!categoriesList.includes(trimmed)) {
      categoriesList.push(trimmed);
      saveData(CATEGORIES_FILE, categoriesList);
    }
    return res.status(201).json(categoriesList);
  }
  res.status(400).json({ message: 'Category name is required' });
});

app.delete('/api/categories/:name', (req, res) => {
  const catName = req.params.name;
  categoriesList = categoriesList.filter(c => c !== catName);
  products = products.map(p => p.category === catName ? { ...p, category: 'General' } : p);
  if (!categoriesList.includes('General')) categoriesList.push('General');
  saveData(CATEGORIES_FILE, categoriesList);
  saveData(PRODUCTS_FILE, products);
  res.json({ message: 'Category removed successfully', categories: categoriesList });
});

// --- PRODUCT ENDPOINTS ---
app.get('/api/products', (req, res) => res.json(products));

app.post('/api/products', (req, res) => {
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
  saveData(PRODUCTS_FILE, products);
  res.status(201).json(newProduct);
});

app.patch('/api/products/:id', (req, res) => {
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
    
    saveData(PRODUCTS_FILE, products);
    return res.json({ message: 'Product updated successfully', product });
  }
  res.status(404).json({ message: 'Product not found' });
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  products = products.filter(p => (p.id !== id && p._id !== id));
  saveData(PRODUCTS_FILE, products);
  res.json({ message: 'Product removed successfully' });
});

// POST /api/orders (Includes automatic stock deduction & discount calculations)
app.post('/api/orders', async (req, res) => {
  try {
    const incomingOrder = req.body;
    const items = incomingOrder.items || [];

    // Deduct stock automatically
    items.forEach(item => {
      const prod = products.find(p => String(p.id || p._id) === String(item.id || item._id));
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });
    saveData(PRODUCTS_FILE, products);

    const subtotal = incomingOrder.total || items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const deliveryFee = storeSettings.deliveryFee;
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
    saveData(ORDERS_FILE, orders);
    res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.patch('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  orders = orders.map(o => (String(o.id) === String(id) || String(o._id) === String(id)) ? { ...o, status } : o);
  saveData(ORDERS_FILE, orders);
  res.json({ message: 'Order status updated successfully' });
});

app.get('/api/orders', async (req, res) => {
  res.json(orders);
});

app.delete('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    orders = orders.filter(o => String(o._id || o.id) !== String(id));
    saveData(ORDERS_FILE, orders);
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});