const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit to support bulk imports

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
let storeSettings = loadData(SETTINGS_FILE, { deliveryFee: 2.00, irbidDeliveryFee: 3.50, discountCodes: { "WELCOME10": 0.10, "KARAM5": 5.00 } });

// --- SETTINGS ENDPOINTS ---
app.get('/api/settings', (req, res) => res.json(storeSettings));
app.put('/api/settings', (req, res) => {
  const { deliveryFee, irbidDeliveryFee, discountCodes } = req.body;
  if (deliveryFee !== undefined) storeSettings.deliveryFee = Number(deliveryFee);
  if (irbidDeliveryFee !== undefined) storeSettings.irbidDeliveryFee = Number(irbidDeliveryFee);
  if (discountCodes !== undefined) storeSettings.discountCodes = discountCodes;
  saveData(SETTINGS_FILE, storeSettings);
  res.json({ message: 'Settings updated successfully', storeSettings });
});
app.patch('/api/settings', (req, res) => {
  const { deliveryFee, irbidDeliveryFee, discountCodes } = req.body;
  if (deliveryFee !== undefined) storeSettings.deliveryFee = Number(deliveryFee);
  if (irbidDeliveryFee !== undefined) storeSettings.irbidDeliveryFee = Number(irbidDeliveryFee);
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

// BULK PRODUCTS IMPORT ENDPOINT
app.post('/api/products/import', (req, res) => {
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
        products[existingIndex] = formattedProduct; // Update if ID exists
      } else {
        products.push(formattedProduct); // Insert if new
      }

      // Automatically add category if missing from list
      if (formattedProduct.category && !categoriesList.includes(formattedProduct.category)) {
        categoriesList.push(formattedProduct.category);
      }
    });

    saveData(PRODUCTS_FILE, products);
    saveData(CATEGORIES_FILE, categoriesList);
    res.json({ success: true, message: `Successfully imported ${incomingProducts.length} products.`, products });
  } catch (err) {
    res.status(500).json({ error: 'Failed to import products' });
  }
});

app.put('/api/products/:id', (req, res) => {
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

// --- ORDER ENDPOINTS ---
app.post('/api/orders', async (req, res) => {
  try {
    const incomingOrder = req.body;
    const items = incomingOrder.items || [];

    items.forEach(item => {
      const prod = products.find(p => String(p.id || p._id) === String(item.id || item._id));
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });
    saveData(PRODUCTS_FILE, products);

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
    saveData(ORDERS_FILE, orders);
    res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// BULK ORDERS IMPORT ENDPOINT
app.post('/api/orders/import', (req, res) => {
  try {
    const incomingOrders = req.body.orders;
    if (!Array.isArray(incomingOrders)) {
      return res.status(400).json({ error: 'Invalid format. Expected an array of orders.' });
    }

    incomingOrders.forEach(ord => {
      const oId = ord.id || ord._id ? String(ord.id || ord._id) : orders.length + 1;
      const existingIndex = orders.findIndex(o => String(o.id || o._id) === String(oId));

      const formattedOrder = {
        id: oId,
        _id: oId,
        items: Array.isArray(ord.items) ? ord.items : [],
        total: Number(ord.total) || 0,
        deliveryFee: Number(ord.deliveryFee) || storeSettings.deliveryFee,
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

      if (existingIndex >= 0) {
        orders[existingIndex] = formattedOrder;
      } else {
        orders.push(formattedOrder);
      }
    });

    saveData(ORDERS_FILE, orders);
    res.json({ success: true, message: `Successfully imported ${incomingOrders.length} orders.`, orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to import orders' });
  }
});

app.get('/api/orders', async (req, res) => {
  res.json(orders);
});

app.put('/api/orders/:id', (req, res) => {
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

    saveData(ORDERS_FILE, orders);
    return res.json({ message: 'Order updated successfully', order });
  }
  res.status(404).json({ message: 'Order not found' });
});

app.patch('/api/orders/:id', (req, res) => {
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

    saveData(ORDERS_FILE, orders);
    return res.json({ message: 'Order updated successfully', order });
  }
  res.status(404).json({ message: 'Order not found' });
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});