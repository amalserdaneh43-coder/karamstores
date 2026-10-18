import React, { useState, useEffect, useMemo } from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({ deliveryFee: 2.00, discountCodes: {} });
  
  // Filtering & Search States
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');

  // Transaction Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Edit Order State
  const [editingOrder, setEditingOrder] = useState(null);
  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Product Form State (With Multi-Images Support)
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('Cleaning');
  const [formImage, setFormImage] = useState('');
  const [formImagesInput, setFormImagesInput] = useState(''); // Comma separated extra images
  const [formStock, setFormStock] = useState('10');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formDescription, setFormDescription] = useState('');

  // Settings Form State
  const [newFee, setNewFee] = useState('');
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoVal, setNewPromoVal] = useState('');

  const fetchData = () => {
    fetch('https://karamstores.onrender.com/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error fetching products:', err));

    fetch('https://karamstores.onrender.com/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error('Error fetching orders:', err));

    fetch('https://karamstores.onrender.com/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setNewFee(data.deliveryFee || 2.00);
      })
      .catch(err => console.error('Error fetching settings:', err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- CSV EXPORT WITH MULTI-IMAGES SUPPORT ---
  const handleExportInventory = () => {
    const headers = ['id', 'name', 'price', 'category', 'stock', 'featured', 'image', 'images', 'description'];
    const csvRows = [headers.join(',')];

    products.forEach(p => {
      const escapeCell = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const formattedId = `"\t${p.id || p._id || ''}"`;
      const imagesString = Array.isArray(p.images) ? p.images.join('|') : (p.images || '');

      const row = [
        formattedId,
        escapeCell(p.name || ''),
        escapeCell(p.price || 0),
        escapeCell(p.category || 'Cleaning'),
        escapeCell(p.stock || 0),
        escapeCell(p.featured ? 'TRUE' : 'FALSE'),
        escapeCell(p.image || ''),
        escapeCell(imagesString),
        escapeCell(p.description || '')
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `karam_inventory_backup_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- ULTIMATE AUTO-DETECTING CSV IMPORT PARSER ---
  const handleImportInventory = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r\n|\n/);
      if (lines.length < 2) {
        alert('Invalid CSV file format.');
        return;
      }

      const parseLine = (line) => {
        const row = [];
        let inQuotes = false;
        let currentField = '';
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              currentField += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            row.push(currentField.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
            currentField = '';
          } else {
            currentField += char;
          }
        }
        row.push(currentField.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        return row;
      };

      const parsedProducts = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const row = parseLine(line).filter(cell => cell !== '');
        if (row.length < 2) continue;

        // Intelligent auto-detection: find which cell looks like a price (number with decimal) or category
        // This completely bypasses Excel column shifting!
        let priceVal = 0.0;
        let priceIdx = row.findIndex(cell => !isNaN(cell) && Number(cell) > 0 && String(cell).includes('.'));
        if (priceIdx === -1) {
          priceIdx = row.findIndex(cell => !isNaN(cell) && Number(cell) > 0);
        }

        if (priceIdx !== -1) {
          priceVal = parseFloat(row[priceIdx]);
          // Name is usually right before price
          const nameVal = priceIdx > 0 ? row[priceIdx - 1] : row[0];
          // Category is usually right after price
          const catVal = priceIdx + 1 < row.length ? row[priceIdx + 1] : 'Cleaning';
          // Stock is usually after category
          const stockVal = parseInt(row[priceIdx + 2]) || 10;
          const featVal = row.some(cell => String(cell).toUpperCase() === 'TRUE');
          const imgVal = row.find(cell => String(cell).startsWith('http') || String(cell).startsWith('data:image')) || '';

          parsedProducts.push({
            name: isNaN(nameVal) ? nameVal : 'Product',
            price: priceVal,
            category: isNaN(catVal) ? catVal : 'Cleaning',
            stock: !isNaN(stockVal) ? stockVal : 10,
            featured: featVal,
            image: imgVal,
            images: [],
            description: ''
          });
        }
      }

      if (window.confirm(`Successfully auto-detected and parsed ${parsedProducts.length} valid products from CSV. Upload them to the database now?`)) {
        let successCount = 0;
        parsedProducts.forEach(prod => {
          fetch('https://karamstores.onrender.com/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prod)
          })
            .then(res => {
              if (res.ok) successCount++;
              if (successCount === parsedProducts.length) {
                alert('Inventory successfully imported!');
                fetchData();
              }
            })
            .catch(err => console.error('Import error:', err));
        });
      }
    };
  };

  // --- PRODUCT FORM SAVING (WITH MULTI-IMAGES) ---
  const handleSaveProduct = (e) => {
    e.preventDefault();
    const extraImagesArray = formImagesInput ? formImagesInput.split(',').map(s => s.trim()).filter(Boolean) : [];

    const productData = {
      name: formName,
      price: parseFloat(formPrice),
      category: formCategory,
      image: formImage,
      images: extraImagesArray,
      stock: parseInt(formStock) || 0,
      featured: formFeatured,
      description: formDescription
    };

    const url = editingId 
      ? `https://karamstores.onrender.com/api/products/${editingId}`
      : 'https://karamstores.onrender.com/api/products';
    
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    })
      .then(res => res.json())
      .then(() => {
        resetProductForm();
        fetchData();
        alert(editingId ? 'Product updated successfully!' : 'Product added successfully!');
      })
      .catch(err => console.error('Error saving product:', err));
  };

  const startEditProduct = (prod) => {
    setEditingId(prod.id || prod._id);
    setFormName(prod.name || '');
    setFormPrice(prod.price || '');
    setFormCategory(prod.category || 'Cleaning');
    setFormImage(prod.image || '');
    setFormImagesInput(Array.isArray(prod.images) ? prod.images.join(', ') : '');
    setFormStock(prod.stock !== undefined ? String(prod.stock) : '10');
    setFormFeatured(prod.featured || false);
    setFormDescription(prod.description || '');
    setIsAddingProduct(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetProductForm = () => {
    setEditingId(null);
    setFormName('');
    setFormPrice('');
    setFormCategory('Cleaning');
    setFormImage('');
    setFormImagesInput('');
    setFormStock('10');
    setFormFeatured(false);
    setFormDescription('');
    setIsAddingProduct(false);
  };

  const handleDeleteProduct = (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    fetch(`https://karamstores.onrender.com/api/products/${id}`, { method: 'DELETE' })
      .then(() => fetchData())
      .catch(err => console.error('Error deleting product:', err));
  };

  // --- ORDER STATUS & EDITING ---
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    fetch(`https://karamstores.onrender.com/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(() => fetchData())
      .catch(err => console.error('Error updating order status:', err));
  };

  const handleSaveEditedOrder = (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    const ordId = editingOrder.id || editingOrder._id;
    const updatedCustomer = {
      ...(editingOrder.customer || {}),
      phone1: editPhone,
      manualAddress: editAddress
    };

    fetch(`https://karamstores.onrender.com/api/orders/${ordId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer: updatedCustomer, phone: editPhone, address: editAddress })
    })
      .then(res => res.json())
      .then(() => {
        setEditingOrder(null);
        fetchData();
        alert('Order updated successfully!');
      })
      .catch(err => console.error('Error updating order:', err));
  };

  // --- SETTINGS & PROMOS ---
  const handleUpdateSettings = (e) => {
    e.preventDefault();
    fetch('https://karamstores.onrender.com/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliveryFee: parseFloat(newFee), discountCodes: settings.discountCodes })
    })
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        alert('Store settings updated successfully!');
      })
      .catch(err => console.error('Error updating settings:', err));
  };

  const handleAddPromoCode = () => {
    if (!newPromoCode.trim() || !newPromoVal) return;
    const updatedCodes = { ...settings.discountCodes, [newPromoCode.trim().toUpperCase()]: parseFloat(newPromoVal) };
    
    fetch('https://karamstores.onrender.com/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliveryFee: settings.deliveryFee, discountCodes: updatedCodes })
    })
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setNewPromoCode('');
        setNewPromoVal('');
        alert('Discount code added!');
      });
  };

  const handleRemovePromoCode = (codeKey) => {
    const updatedCodes = { ...settings.discountCodes };
    delete updatedCodes[codeKey];

    fetch('https://karamstores.onrender.com/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliveryFee: settings.deliveryFee, discountCodes: updatedCodes })
    })
      .then(res => res.json())
      .then(data => setSettings(data));
  };

  // --- COMPUTED DATA ---
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.id || 0).getTime();
      const timeB = new Date(b.createdAt || b.id || 0).getTime();
      return timeB - timeA;
    }).filter(ord => {
      const matchesStatus = orderStatusFilter === 'ALL' || (ord.status || 'Pending').toUpperCase() === orderStatusFilter.toUpperCase();
      const query = orderSearchQuery.toLowerCase();
      const customerName = (ord.customer?.arabicName || ord.arabicName || '').toLowerCase();
      const customerPhone = (ord.customer?.phone1 || ord.phone || '').toLowerCase();
      const orderIdStr = String(ord.id || ord._id || '').toLowerCase();
      const matchesSearch = !query || customerName.includes(query) || customerPhone.includes(query) || orderIdStr.includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [orders, orderStatusFilter, orderSearchQuery]);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => (p.stock !== undefined ? p.stock : 10) <= 3);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCat = productCategoryFilter === 'ALL' || (p.category || '').toLowerCase() === productCategoryFilter.toLowerCase();
      const matchesQuery = !productSearchQuery || (p.name || '').toLowerCase().includes(productSearchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [products, productSearchQuery, productCategoryFilter]);

  const totalRevenue = orders.reduce((sum, ord) => sum + Number(ord.grandTotal || ord.total || 0), 0);

  return (
    <div style={{ padding: '2rem', background: '#1c1b1b', color: '#FFF7EE', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header & Quick Metrics */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,247,238,0.2)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#FD7100' }}>Karam Stores Admin</h1>
          <p style={{ margin: '0.2rem 0 0 0', opacity: 0.7, fontSize: '0.9rem' }}>Enterprise Control Center ({products.length} Items Loaded)</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1.5rem', background: '#2D2C2C', padding: '0.8rem 1.2rem', borderRadius: '10px', border: '1px solid rgba(255,247,238,0.1)' }}>
          <div>
            <span style={{ fontSize: '0.75rem', opacity: 0.7, display: 'block' }}>Total Orders</span>
            <strong style={{ fontSize: '1.1rem' }}>{orders.length}</strong>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,247,238,0.2)', paddingLeft: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.7, display: 'block' }}>Total Revenue</span>
            <strong style={{ fontSize: '1.1rem', color: '#4ade80' }}>{totalRevenue.toFixed(2)} JD</strong>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,247,238,0.2)', paddingLeft: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.7, display: 'block' }}>Low Stock Alerts</span>
            <strong style={{ fontSize: '1.1rem', color: lowStockProducts.length > 0 ? '#ef4444' : '#4ade80' }}>{lowStockProducts.length}</strong>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('orders')} style={{ padding: '0.7rem 1.2rem', background: activeTab === 'orders' ? '#FD7100' : '#2D2C2C', color: '#FFF7EE', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          📋 Orders ({orders.length})
        </button>
        <button onClick={() => setActiveTab('inventory')} style={{ padding: '0.7rem 1.2rem', background: activeTab === 'inventory' ? '#FD7100' : '#2D2C2C', color: '#FFF7EE', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          📦 Inventory & 14k Backup ({products.length})
        </button>
        <button onClick={() => setActiveTab('settings')} style={{ padding: '0.7rem 1.2rem', background: activeTab === 'settings' ? '#FD7100' : '#2D2C2C', color: '#FFF7EE', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          ⚙️ Store Settings & Promos
        </button>
      </div>

      {/* TAB 1: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div style={{ background: '#2D2C2C', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,247,238,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0, color: '#FD7100' }}>📋 Customer Orders (Newest First)</h3>
            
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="Search by name, phone, ID..." 
                value={orderSearchQuery} 
                onChange={e => setOrderSearchQuery(e.target.value)}
                style={{ padding: '0.5rem 0.8rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE', fontSize: '0.85rem' }}
              />
              <select 
                value={orderStatusFilter} 
                onChange={e => setOrderStatusFilter(e.target.value)}
                style={{ padding: '0.5rem 0.8rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE', fontWeight: 'bold', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          {sortedOrders.length === 0 ? (
            <p style={{ opacity: 0.6, textAlign: 'center', padding: '2rem 0' }}>No matching orders found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sortedOrders.map(ord => {
                const ordId = ord.id || ord._id;
                const statusColor = ord.status === 'Shipped' || ord.status === 'Delivered' ? '#4ade80' : ord.status === 'Processing' ? '#facc15' : '#60a5fa';
                return (
                  <div key={ordId} style={{ background: '#242323', padding: '1.2rem', borderRadius: '10px', border: '1px solid rgba(255,247,238,0.15)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', borderBottom: '1px solid rgba(255,247,238,0.1)', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <strong style={{ fontSize: '1rem', color: '#FD7100' }}>Order #{ordId}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.6 }}>{new Date(ord.createdAt || Date.now()).toLocaleString()}</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '10px', border: `1px solid ${statusColor}`, color: statusColor, fontWeight: 'bold' }}>{ord.status || 'Pending'}</span>
                        <select 
                          value={ord.status || 'Pending'} 
                          onChange={e => handleUpdateOrderStatus(ordId, e.target.value)}
                          style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)', fontWeight: 'bold', fontSize: '0.8rem' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {ord.customer && (
                      <div style={{ fontSize: '0.85rem', marginBottom: '0.8rem', opacity: 0.9, background: 'rgba(255,247,238,0.03)', padding: '0.6rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <p style={{ margin: '0 0 0.2rem 0' }}>👤 <strong>Name:</strong> {ord.customer.arabicName}</p>
                          <p style={{ margin: '0 0 0.2rem 0' }}>📞 <strong>Phone:</strong> {ord.customer.phone1}</p>
                          <p style={{ margin: 0 }}>📍 <strong>Address:</strong> {ord.customer.manualAddress}</p>
                        </div>
                        <button onClick={() => { setEditingOrder(ord); setEditPhone(ord.customer.phone1 || ''); setEditAddress(ord.customer.manualAddress || ''); }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          ✏️ Edit Order
                        </button>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                        Items count: <strong>{ord.items ? ord.items.reduce((s, i) => s + i.quantity, 0) : 0}</strong>
                      </span>
                      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', color: '#FD7100', fontSize: '0.95rem' }}>
                          Total: {Number(ord.grandTotal || ord.total || 0).toFixed(2)} JD
                        </span>
                        <button onClick={() => setSelectedOrder(ord)} style={{ background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.4rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          🔍 Full Transaction View
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INVENTORY & 14K BACKUP */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: '#2D2C2C', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,247,238,0.2)' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#FD7100', fontSize: '1.1rem' }}>💾 14k+ Inventory Backup & Safety</h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', opacity: 0.7, lineHeight: '1.4' }}>
                Export your entire product catalog as a clean CSV backup file, or restore items instantly if the server ever resets.
              </p>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                <button onClick={handleExportInventory} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                  📥 Export Inventory (CSV)
                </button>
                <label style={{ background: '#3b82f6', color: '#fff', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', display: 'inline-block' }}>
                  📤 Import CSV Backup
                  <input type="file" accept=".csv" onChange={handleImportInventory} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            <div style={{ background: '#2D2C2C', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,247,238,0.2)' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#ef4444', fontSize: '1.1rem' }}>⚠️ Low Stock Monitor ({lowStockProducts.length})</h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', opacity: 0.7, lineHeight: '1.4' }}>
                Products running low or out of stock (Stock ≤ 3) that need restocked immediately.
              </p>
              <div style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {lowStockProducts.length === 0 ? (
                  <span style={{ fontSize: '0.85rem', color: '#4ade80' }}>All products are well stocked!</span>
                ) : (
                  lowStockProducts.map(p => (
                    <div key={p.id || p._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', background: '#242323', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                      <span>{p.name}</span>
                      <strong style={{ color: '#ef4444' }}>Stock: {p.stock}</strong>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div style={{ background: '#2D2C2C', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,247,238,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ margin: 0, color: '#FD7100' }}>📦 Manage Catalog ({filteredProducts.length} items shown)</h3>
              
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={() => { resetProductForm(); setIsAddingProduct(true); }} style={{ background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                  ➕ Add New Product Manually
                </button>
                <input 
                  type="text" 
                  placeholder="Search items by name..." 
                  value={productSearchQuery} 
                  onChange={e => setProductSearchQuery(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE', fontSize: '0.85rem', width: '200px' }}
                />
                <select 
                  value={productCategoryFilter} 
                  onChange={e => setProductCategoryFilter(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE', fontWeight: 'bold', fontSize: '0.85rem' }}
                >
                  <option value="ALL">All Categories</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Makeup">Makeup</option>
                  <option value="Gifts">Gifts</option>
                  <option value="Kitchen">Kitchen</option>
                </select>
              </div>
            </div>

            {/* MANUAL ADD / EDIT PRODUCT FORM */}
            {isAddingProduct && (
              <div style={{ background: '#242323', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid #FD7100' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#FD7100' }}>{editingId ? `✏️ Edit Product ID: ${editingId}` : '➕ Add New Product Manually'}</h4>
                <form onSubmit={handleSaveProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Product Name *</label>
                    <input type="text" value={formName} onChange={e => setFormName(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Price (JD) *</label>
                    <input type="number" step="0.01" value={formPrice} onChange={e => setFormPrice(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Category *</label>
                    <select value={formCategory} onChange={e => setFormCategory(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)' }}>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Makeup">Makeup</option>
                      <option value="Gifts">Gifts</option>
                      <option value="Kitchen">Kitchen</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Stock Quantity</label>
                    <input type="number" value={formStock} onChange={e => setFormStock(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)' }} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Main Image URL</label>
                    <input type="text" value={formImage} onChange={e => setFormImage(e.target.value)} placeholder="/icons/... or https://..." style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)' }} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Extra Images URLs (Comma-separated for multiple images)</label>
                    <input type="text" value={formImagesInput} onChange={e => setFormImagesInput(e.target.value)} placeholder="https://img1.com/a.jpg, https://img2.com/b.jpg" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)' }} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Description</label>
                    <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} rows="2" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)' }} />
                  </div>
                  <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" id="featuredCheck" checked={formFeatured} onChange={e => setFormFeatured(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#FD7100' }} />
                    <label htmlFor="featuredCheck" style={{ fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>⭐ Pin as Featured Product on Top Banner</label>
                  </div>
                  <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button type="submit" style={{ background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{editingId ? 'Update Product' : 'Save Product'}</button>
                    <button type="button" onClick={resetProductForm} style={{ background: '#555', color: '#FFF7EE', border: 'none', padding: '0.7rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
              {filteredProducts.slice(0, 30).map(prod => (
                <div key={prod.id || prod._id} style={{ background: '#242323', padding: '0.9rem', borderRadius: '8px', border: '1px solid rgba(255,247,238,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.65rem', background: 'rgba(253,113,0,0.2)', color: '#FD7100', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>{prod.category}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: prod.stock <= 3 ? '#ef4444' : '#4ade80' }}>Stock: {prod.stock}</span>
                    </div>
                    <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}>{prod.name}</h4>
                    <p style={{ margin: '0 0 0.4rem 0', fontWeight: 'bold', color: '#FD7100', fontSize: '0.9rem' }}>{Number(prod.price).toFixed(2)} JD</p>
                    {prod.images && prod.images.length > 0 && (
                      <span style={{ fontSize: '0.7rem', opacity: 0.7, display: 'block', marginBottom: '0.4rem' }}>📷 {prod.images.length + 1} images attached</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => startEditProduct(prod)} style={{ flex: 1, background: '#3b82f6', color: '#fff', border: 'none', padding: '0.35rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Edit</button>
                    <button onClick={() => handleDeleteProduct(prod.id || prod._id)} style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', padding: '0.35rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
            {filteredProducts.length > 30 && (
              <p style={{ textAlign: 'center', opacity: 0.6, fontSize: '0.8rem', marginTop: '1rem' }}>Showing first 30 results matching filter (out of {filteredProducts.length} total filtered items). Use search to narrow down.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: STORE SETTINGS & PROMO CODES */}
      {activeTab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ background: '#2D2C2C', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,247,238,0.2)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#FD7100' }}>🚚 Delivery Fee Configuration</h3>
            <form onSubmit={handleUpdateSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Standard Delivery Fee (JD)</label>
                <input type="number" step="0.50" value={newFee} onChange={e => setNewFee(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE' }} />
              </div>
              <button type="submit" style={{ background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.7rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Update Delivery Fee</button>
            </form>
          </div>

          <div style={{ background: '#2D2C2C', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,247,238,0.2)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#FD7100' }}>🎟️ Discount & Promo Codes</h3>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input type="text" placeholder="Code (e.g. KARAM10)" value={newPromoCode} onChange={e => setNewPromoCode(e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE', textTransform: 'uppercase' }} />
              <input type="number" step="0.05" placeholder="Value" value={newPromoVal} onChange={e => setNewPromoVal(e.target.value)} style={{ width: '100px', padding: '0.5rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE' }} />
              <button type="button" onClick={handleAddPromoCode} style={{ background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Add</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
              {Object.keys(settings.discountCodes || {}).length === 0 ? (
                <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>No active promo codes.</p>
              ) : (
                Object.entries(settings.discountCodes).map(([code, val]) => (
                  <div key={code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#242323', padding: '0.5rem 0.8rem', borderRadius: '6px' }}>
                    <span style={{ fontWeight: 'bold', color: '#4ade80' }}>{code} ({val < 1 ? `${val * 100}% off` : `${val} JD off`})</span>
                    <button onClick={() => handleRemovePromoCode(code)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Remove</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* FULL TRANSACTION VIEW MODAL */}
      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ background: '#2D2C2C', border: '1px solid rgba(255,247,238,0.2)', borderRadius: '14px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', color: '#FFF7EE' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,247,238,0.2)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#FD7100' }}>🔍 Full Transaction Receipt #{selectedOrder.id || selectedOrder._id}</h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', border: 'none', color: '#FFF7EE', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ background: '#242323', padding: '0.8rem', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 0.3rem 0' }}>📅 <strong>Timestamp:</strong> {new Date(selectedOrder.createdAt || Date.now()).toLocaleString()}</p>
                <p style={{ margin: '0 0 0.3rem 0' }}>📌 <strong>Status:</strong> {selectedOrder.status || 'Pending'}</p>
                <p style={{ margin: '0 0 0.3rem 0' }}>💳 <strong>Payment Method:</strong> Cash on Delivery (الدفع عند الاستلام)</p>
              </div>

              {selectedOrder.customer && (
                <div style={{ background: '#242323', padding: '0.8rem', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 0.3rem 0' }}>👤 <strong>Customer Name:</strong> {selectedOrder.customer.arabicName}</p>
                  <p style={{ margin: '0 0 0.3rem 0' }}>📞 <strong>Phone Number:</strong> {selectedOrder.customer.phone1}</p>
                  <p style={{ margin: 0 }}>📍 <strong>Delivery Address:</strong> {selectedOrder.customer.manualAddress}</p>
                </div>
              )}

              <div>
                <strong>Ordered Line Items:</strong>
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                    <div key={idx} style={{ background: '#242323', padding: '0.6rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                        <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.7 }}>
                          {item.selectedSize ? `Size: ${item.selectedSize} ` : ''} {item.selectedColor ? `Color: ${item.selectedColor}` : ''} (Qty: {item.quantity})
                        </span>
                      </div>
                      <span style={{ fontWeight: 'bold', color: '#FD7100' }}>{(item.price * item.quantity).toFixed(2)} JD</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#242323', padding: '0.8rem', borderRadius: '8px', borderTop: '1px solid rgba(255,247,238,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span>Subtotal:</span>
                  <span>{Number(selectedOrder.total || 0).toFixed(2)} JD</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span>Delivery Fee:</span>
                  <span>{Number(selectedOrder.deliveryFee || 2.00).toFixed(2)} JD</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', color: '#4ade80' }}>
                    <span>Discount Applied:</span>
                    <span>-{Number(selectedOrder.discountAmount).toFixed(2)} JD</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.05rem', color: '#FD7100', marginTop: '0.4rem', borderTop: '1px solid rgba(255,247,238,0.2)', paddingTop: '0.4rem' }}>
                  <span>Grand Total (Cash):</span>
                  <span>{Number(selectedOrder.grandTotal || selectedOrder.total || 0).toFixed(2)} JD</span>
                </div>
              </div>
            </div>

            <button onClick={() => setSelectedOrder(null)} style={{ width: '100%', background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.7rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '1.2rem' }}>Close Receipt</button>
          </div>
        </div>
      )}

      {/* EDIT ORDER MODAL */}
      {editingOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ background: '#2D2C2C', border: '1px solid rgba(255,247,238,0.2)', borderRadius: '14px', width: '100%', maxWidth: '450px', padding: '1.5rem', color: '#FFF7EE' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#FD7100' }}>✏️ Edit Order #{editingOrder.id || editingOrder._id}</h3>
            
            <form onSubmit={handleSaveEditedOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Customer Phone Number</label>
                <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Delivery Address</label>
                <textarea value={editAddress} onChange={e => setEditAddress(e.target.value)} rows="3" required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button type="submit" style={{ flex: 1, background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.7rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Save Changes</button>
                <button type="button" onClick={() => setEditingOrder(null)} style={{ flex: 1, background: '#555', color: '#FFF7EE', border: 'none', padding: '0.7rem', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}