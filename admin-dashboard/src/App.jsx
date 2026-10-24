import React, { useState, useEffect, useMemo } from 'react';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({ deliveryFee: 2.00, irbidDeliveryFee: 3.50, discountCodes: {} });
  
  // Filtering & Search States
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');

  // Transaction Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Edit Order State
  const [editingOrder, setEditingOrder] = useState(null);
  const [editArabicName, setEditArabicName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editItems, setEditItems] = useState([]);

  // Product Form State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('Kitchen');
  const [formImage, setFormImage] = useState('');
  const [formImagesInput, setFormImagesInput] = useState('');
  const [formStock, setFormStock] = useState('10');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formDescription, setFormDescription] = useState('');

  // Settings Form State
  const [ammanFee, setAmmanFee] = useState(2.00);
  const [irbidFee, setIrbidFee] = useState(3.50);
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
        setAmmanFee(data.deliveryFee !== undefined ? data.deliveryFee : 2.00);
        setIrbidFee(data.irbidDeliveryFee !== undefined ? data.irbidDeliveryFee : 3.50);
      })
      .catch(err => console.error('Error fetching settings:', err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- PRINTING RECEIPT & BARCODES ---
  const handlePrintReceipt = (ord) => {
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <html dir="rtl">
        <head>
          <title>Receipt #${ord.id || ord._id}</title>
          <style>
            body { font-family: Tahoma, sans-serif; padding: 20px; color: #000; }
            .header { text-align: center; border-bottom: 2px dashed #333; padding-bottom: 10px; margin-bottom: 15px; }
            .details { margin-bottom: 15px; font-size: 14px; line-height: 1.5; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 13px; }
            th { background: #f4f4f4; }
            .totals { font-size: 14px; line-height: 1.6; border-top: 1px solid #333; padding-top: 10px; }
            .barcode-box { text-align: center; margin-top: 30px; font-family: monospace; font-size: 22px; letter-spacing: 6px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>كرم ستورز - Karam Stores</h2>
            <p>إيصال طلب رسمي / Official Order Receipt</p>
          </div>
          <div class="details">
            <p><strong>رقم الطلب:</strong> #${ord.id || ord._id}</p>
            <p><strong>التاريخ:</strong> ${new Date(ord.createdAt || Date.now()).toLocaleString()}</p>
            <p><strong>اسم العميل:</strong> ${ord.customer?.arabicName || ord.arabicName || 'N/A'}</p>
            <p><strong>رقم الهاتف:</strong> ${ord.customer?.phone1 || ord.phone || 'N/A'}</p>
            <p><strong>العنوان:</strong> ${ord.customer?.manualAddress || ord.address || 'N/A'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>السعر الفردي</th>
                <th>المجموع</th>
              </tr>
            </thead>
            <tbody>
              ${(ord.items || []).map(i => `
                <tr>
                  <td>${i.name} ${i.selectedSize ? `(${i.selectedSize})` : ''}</td>
                  <td>${i.quantity}</td>
                  <td>${Number(i.price).toFixed(2)} JD</td>
                  <td>${(i.price * i.quantity).toFixed(2)} JD</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <p>المجموع الفرعي: <strong>${Number(ord.total || 0).toFixed(2)} JD</strong></p>
            <p>رسوم التوصيل: <strong>${Number(ord.deliveryFee || 2.00).toFixed(2)} JD</strong></p>
            ${ord.discountAmount > 0 ? `<p>الخصم: <strong>-${Number(ord.discountAmount).toFixed(2)} JD</strong></p>` : ''}
            <p style="font-size: 16px; color: #d97706;">المجموع الإجمالي (نقداً): <strong>${Number(ord.grandTotal || ord.total || 0).toFixed(2)} JD</strong></p>
          </div>
          <div class="barcode-box">
            *ORD-${ord.id || ord._id}*
            <div style="font-size: 11px; margin-top: 5px; letter-spacing: normal;">Barcode ID: ${ord.id || ord._id}</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // --- DOWNLOAD CSV TEMPLATE WITH ID ---
  const handleDownloadCsvTemplate = () => {
    const templateHeaders = ['id', 'name', 'price', 'category', 'stock', 'featured', 'image', 'images', 'description'];
    const sampleRow = ['6578465137110', 'طنجرة', '25.00', 'Kitchen', '10', 'TRUE', 'https://example.com/image.jpg', '', 'High quality pot'];
    const csvContent = [templateHeaders.join(','), sampleRow.join(',')].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'karam_stores_product_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- CSV BACKUP & ROBUST IMPORT PARSER ---
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
        escapeCell(p.category || 'Kitchen'),
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

  // --- SANITIZER HELPERS FOR EXCEL SCIENTIFIC NOTATION & ARABIC TEXT ---
  const cleanId = (rawId) => {
    if (!rawId) return '';
    let str = String(rawId).trim().replace(/^"\t?|"$|^'/g, '');
    if (str.includes('E+') || str.includes('e+')) {
      try {
        const num = Number(str);
        str = BigInt(Math.round(num)).toString();
      } catch (e) {
        str = Number(str).toFixed(0);
      }
    }
    return str;
  };

  const cleanArabicText = (text) => {
    if (!text) return '';
    return String(text).trim().replace(/\uFFFD/g, '');
  };

  const handleImportInventory = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r\n|\n/).filter(l => l.trim() !== '');
      if (lines.length < 2) {
        alert('Invalid CSV file format or empty file.');
        return;
      }

      const parseLine = (line) => {
        const row = [];
        let inQuotes = false;
        let currentField = '';
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') { currentField += '"'; i++; }
            else { inQuotes = !inQuotes; }
          } else if (char === ',' && !inQuotes) {
            row.push(currentField.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
            currentField = '';
          } else { currentField += char; }
        }
        row.push(currentField.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        return row;
      };

      const parsedProducts = [];
      for (let i = 1; i < lines.length; i++) {
        const row = parseLine(lines[i]);
        if (row.length < 3) continue;

        const rawId = cleanId(row[0]);
        const name = cleanArabicText(row[1]) || 'Product';
        const price = parseFloat(row[2]) || 0.0;
        const category = cleanArabicText(row[3]) || 'Kitchen';
        const stock = parseInt(row[4]) || 10;
        const featured = String(row[5]).toUpperCase() === 'TRUE';
        const image = row[6] || '';
        const imagesRaw = row[7] || '';
        const description = cleanArabicText(row[8]) || '';

        const imagesArray = imagesRaw ? imagesRaw.split('|').map(s => s.trim()).filter(Boolean) : [];

        parsedProducts.push({
          id: rawId || undefined,
          _id: rawId || undefined,
          name,
          price,
          category,
          stock,
          featured,
          image,
          images: imagesArray,
          description
        });
      }

      if (parsedProducts.length === 0) {
        alert('Could not parse any products. Please check the CSV structure.');
        return;
      }

      if (window.confirm(`Successfully parsed ${parsedProducts.length} valid products from CSV. Upload/Update them now?`)) {
        fetch('https://karamstores.onrender.com/api/products/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: parsedProducts })
        })
          .then(res => res.json())
          .then(data => {
            alert(data.message || 'Inventory successfully imported & updated!');
            fetchData();
          })
          .catch(err => {
            console.error('Import error:', err);
            alert('Error during bulk import.');
          });
      }
    };
  };

  // --- PRODUCT MANAGEMENT ---
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
    const method = editingId ? 'PATCH' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to save product');
        return res.json();
      })
      .then(() => {
        resetProductForm();
        fetchData();
        alert(editingId ? 'Product updated successfully!' : 'Product added successfully!');
      })
      .catch(err => {
        console.error('Error saving product:', err);
        alert('Error saving product. Please check console.');
      });
  };

  const startEditProduct = (prod) => {
    const prodId = prod.id || prod._id;
    setEditingId(prodId);
    setFormName(prod.name || '');
    setFormPrice(prod.price !== undefined ? prod.price : '');
    setFormCategory(prod.category || 'Kitchen');
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
    setFormCategory('Kitchen');
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
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(() => fetchData())
      .catch(err => console.error('Error updating status:', err));
  };

  const handleSaveEditedOrder = (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    const ordId = editingOrder.id || editingOrder._id;
    
    const newSubtotal = editItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const delivery = Number(editingOrder.deliveryFee || 2.00);
    const discount = Number(editingOrder.discountAmount || 0);
    const newGrandTotal = Math.max(0, newSubtotal + delivery - discount);

    const updatedCustomer = {
      ...(editingOrder.customer || {}),
      arabicName: editArabicName,
      phone1: editPhone,
      manualAddress: editAddress
    };

    fetch(`https://karamstores.onrender.com/api/orders/${ordId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: updatedCustomer,
        phone: editPhone,
        address: editAddress,
        items: editItems,
        total: newSubtotal,
        grandTotal: newGrandTotal
      })
    })
      .then(res => res.json())
      .then(() => {
        setEditingOrder(null);
        fetchData();
        alert('Order updated successfully!');
      })
      .catch(err => console.error('Error updating order:', err));
  };

  // --- SETTINGS ---
  const handleUpdateSettings = (e) => {
    e.preventDefault();
    fetch('https://karamstores.onrender.com/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deliveryFee: parseFloat(ammanFee),
        irbidDeliveryFee: parseFloat(irbidFee),
        discountCodes: settings.discountCodes
      })
    })
      .then(res => res.json())
      .then(data => {
        setSettings(data.storeSettings || data);
        alert('Store settings & regional delivery fees updated successfully!');
      })
      .catch(err => console.error('Error updating settings:', err));
  };

  const handleAddPromoCode = () => {
    if (!newPromoCode.trim() || !newPromoVal) return;
    const updatedCodes = { ...settings.discountCodes, [newPromoCode.trim().toUpperCase()]: parseFloat(newPromoVal) };
    
    fetch('https://karamstores.onrender.com/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deliveryFee: settings.deliveryFee,
        irbidDeliveryFee: settings.irbidDeliveryFee,
        discountCodes: updatedCodes
      })
    })
      .then(res => res.json())
      .then(data => {
        setSettings(data.storeSettings || data);
        setNewPromoCode('');
        setNewPromoVal('');
        alert('Discount code added!');
      });
  };

  const handleRemovePromoCode = (codeKey) => {
    const updatedCodes = { ...settings.discountCodes };
    delete updatedCodes[codeKey];

    fetch('https://karamstores.onrender.com/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deliveryFee: settings.deliveryFee,
        irbidDeliveryFee: settings.irbidDeliveryFee,
        discountCodes: updatedCodes
      })
    })
      .then(res => res.json())
      .then(data => setSettings(data.storeSettings || data));
  };

  // --- COMPUTED DATA & ANALYTICS ---
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

  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const monthlyStats = useMemo(() => {
    let monthRev = 0;
    let monthCount = 0;
    orders.forEach(ord => {
      const ordDate = ord.createdAt ? ord.createdAt.slice(0, 7) : currentMonthKey;
      if (ordDate === currentMonthKey) {
        monthRev += Number(ord.grandTotal || ord.total || 0);
        monthCount++;
      }
    });
    return { monthRev, monthCount, currentMonthKey };
  }, [orders, currentMonthKey]);

  return (
    <div style={{ padding: '2rem', background: '#1c1b1b', color: '#FFF7EE', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header & Financial Metrics */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,247,238,0.2)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#FD7100' }}>Karam Stores Admin</h1>
          <p style={{ margin: '0.2rem 0 0 0', opacity: 0.7, fontSize: '0.9rem' }}>Enterprise Control Center ({products.length} Items Loaded)</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1.2rem', background: '#2D2C2C', padding: '0.8rem 1.2rem', borderRadius: '10px', border: '1px solid rgba(255,247,238,0.1)', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.7rem', opacity: 0.7, display: 'block' }}>Total Orders</span>
            <strong style={{ fontSize: '1.05rem' }}>{orders.length}</strong>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,247,238,0.2)', paddingLeft: '1rem' }}>
            <span style={{ fontSize: '0.7rem', opacity: 0.7, display: 'block' }}>Total Revenue</span>
            <strong style={{ fontSize: '1.05rem', color: '#4ade80' }}>{totalRevenue.toFixed(2)} JD</strong>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,247,238,0.2)', paddingLeft: '1rem' }}>
            <span style={{ fontSize: '0.7rem', opacity: 0.7, display: 'block' }}>Monthly Income ({monthlyStats.currentMonthKey})</span>
            <strong style={{ fontSize: '1.05rem', color: '#60a5fa' }}>{monthlyStats.monthRev.toFixed(2)} JD ({monthlyStats.monthCount} orders)</strong>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,247,238,0.2)', paddingLeft: '1rem' }}>
            <span style={{ fontSize: '0.7rem', opacity: 0.7, display: 'block' }}>Low Stock</span>
            <strong style={{ fontSize: '1.05rem', color: lowStockProducts.length > 0 ? '#ef4444' : '#4ade80' }}>{lowStockProducts.length}</strong>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('orders')} style={{ padding: '0.7rem 1.2rem', background: activeTab === 'orders' ? '#FD7100' : '#2D2C2C', color: '#FFF7EE', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          📋 Orders ({orders.length})
        </button>
        <button onClick={() => setActiveTab('inventory')} style={{ padding: '0.7rem 1.2rem', background: activeTab === 'inventory' ? '#FD7100' : '#2D2C2C', color: '#FFF7EE', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          📦 Inventory Table & Templates ({products.length})
        </button>
        <button onClick={() => setActiveTab('settings')} style={{ padding: '0.7rem 1.2rem', background: activeTab === 'settings' ? '#FD7100' : '#2D2C2C', color: '#FFF7EE', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          ⚙️ Regional Delivery & Promos
        </button>
      </div>

      {/* TAB 1: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div style={{ background: '#2D2C2C', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,247,238,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0, color: '#FD7100' }}>📋 Customer Orders</h3>
            
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
                          style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
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
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => { setEditingOrder(ord); setEditArabicName(ord.customer.arabicName || ''); setEditPhone(ord.customer.phone1 || ''); setEditAddress(ord.customer.manualAddress || ''); setEditItems(ord.items ? [...ord.items] : []); }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            ✏️ Full Edit
                          </button>
                          <button onClick={() => handlePrintReceipt(ord)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            🖨️ Print Receipt & Barcode
                          </button>
                        </div>
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
                          🔍 View Details
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

      {/* TAB 2: INVENTORY TABLE & TEMPLATE IMPORT */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: '#2D2C2C', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,247,238,0.2)' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#FD7100', fontSize: '1.1rem' }}>📄 CSV Templates with ID & Import</h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', opacity: 0.7, lineHeight: '1.4' }}>
                Download the CSV template containing product IDs, edit in Excel, and import to update/add items.
              </p>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                <button onClick={handleDownloadCsvTemplate} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                  📥 Download CSV Template
                </button>
                <label style={{ background: '#3b82f6', color: '#fff', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', display: 'inline-block' }}>
                  📤 Import Filled CSV
                  <input type="file" accept=".csv" onChange={handleImportInventory} style={{ display: 'none' }} />
                </label>
                <button onClick={handleExportInventory} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                  💾 Backup All (CSV)
                </button>
              </div>
            </div>

            <div style={{ background: '#2D2C2C', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,247,238,0.2)' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#ef4444', fontSize: '1.1rem' }}>⚠️ Low Stock Monitor ({lowStockProducts.length})</h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', opacity: 0.7, lineHeight: '1.4' }}>
                Products running low or out of stock (Stock ≤ 3).
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
              <h3 style={{ margin: 0, color: '#FD7100' }}>📦 Inventory Table ({filteredProducts.length} items shown)</h3>
              
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={() => { resetProductForm(); setIsAddingProduct(true); }} style={{ background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                  ➕ Add New Product
                </button>
                <input 
                  type="text" 
                  placeholder="Search items..." 
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
                <h4 style={{ margin: '0 0 1rem 0', color: '#FD7100' }}>{editingId ? `✏️ Edit Product ID: ${editingId}` : '➕ Add New Product'}</h4>
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
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Extra Images URLs (Comma-separated)</label>
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

            {/* PRODUCT TABLE VIEW */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#242323', borderBottom: '1px solid rgba(255,247,238,0.2)', color: '#FD7100' }}>
                    <th style={{ padding: '0.8rem' }}>ID</th>
                    <th style={{ padding: '0.8rem' }}>Product Name</th>
                    <th style={{ padding: '0.8rem' }}>Category</th>
                    <th style={{ padding: '0.8rem' }}>Price</th>
                    <th style={{ padding: '0.8rem' }}>Stock</th>
                    <th style={{ padding: '0.8rem' }}>Featured</th>
                    <th style={{ padding: '0.8rem', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(prod => {
                    const pId = prod.id || prod._id;
                    return (
                      <tr key={pId} style={{ borderBottom: '1px solid rgba(255,247,238,0.1)' }}>
                        <td style={{ padding: '0.8rem', fontFamily: 'monospace', opacity: 0.7, fontSize: '0.75rem' }}>{pId}</td>
                        <td style={{ padding: '0.8rem', fontWeight: 'bold' }}>{prod.name}</td>
                        <td style={{ padding: '0.8rem' }}>
                          <span style={{ fontSize: '0.7rem', background: 'rgba(253,113,0,0.2)', color: '#FD7100', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>{prod.category}</span>
                        </td>
                        <td style={{ padding: '0.8rem', fontWeight: 'bold', color: '#FD7100' }}>{Number(prod.price).toFixed(2)} JD</td>
                        <td style={{ padding: '0.8rem', fontWeight: 'bold', color: (prod.stock !== undefined ? prod.stock : 10) <= 3 ? '#ef4444' : '#4ade80' }}>
                          {prod.stock !== undefined ? prod.stock : 10}
                        </td>
                        <td style={{ padding: '0.8rem' }}>{prod.featured ? '⭐ Yes' : '-'}</td>
                        <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                            <button onClick={() => startEditProduct(prod)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.35rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Edit</button>
                            <button onClick={() => handleDeleteProduct(pId)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.35rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REGIONAL DELIVERY & PROMO CODES */}
      {activeTab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ background: '#2D2C2C', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,247,238,0.2)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#FD7100' }}>🚚 Regional Delivery Fee Configuration</h3>
            <form onSubmit={handleUpdateSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Amman Delivery Fee (JD)</label>
                <input type="number" step="0.50" value={ammanFee} onChange={e => setAmmanFee(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Irbid & Distant Cities Delivery Fee (JD)</label>
                <input type="number" step="0.50" value={irbidFee} onChange={e => setIrbidFee(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE' }} />
              </div>
              <button type="submit" style={{ background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.7rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Save Delivery Rates</button>
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
              <h3 style={{ margin: 0, color: '#FD7100' }}>🔍 Full Receipt #{selectedOrder.id || selectedOrder._id}</h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', border: 'none', color: '#FFF7EE', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ background: '#242323', padding: '0.8rem', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 0.3rem 0' }}>📅 <strong>Timestamp:</strong> {new Date(selectedOrder.createdAt || Date.now()).toLocaleString()}</p>
                <p style={{ margin: '0 0 0.3rem 0' }}>📌 <strong>Status:</strong> {selectedOrder.status || 'Pending'}</p>
              </div>

              {selectedOrder.customer && (
                <div style={{ background: '#242323', padding: '0.8rem', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 0.3rem 0' }}>👤 <strong>Name:</strong> {selectedOrder.customer.arabicName}</p>
                  <p style={{ margin: '0 0 0.3rem 0' }}>📞 <strong>Phone:</strong> {selectedOrder.customer.phone1}</p>
                  <p style={{ margin: 0 }}>📍 <strong>Address:</strong> {selectedOrder.customer.manualAddress}</p>
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
                          {item.selectedSize ? `Size: ${item.selectedSize} ` : ''} (Qty: {item.quantity})
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.05rem', color: '#FD7100', marginTop: '0.4rem', borderTop: '1px solid rgba(255,247,238,0.2)', paddingTop: '0.4rem' }}>
                  <span>Grand Total (Cash):</span>
                  <span>{Number(selectedOrder.grandTotal || selectedOrder.total || 0).toFixed(2)} JD</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem' }}>
              <button onClick={() => handlePrintReceipt(selectedOrder)} style={{ flex: 1, background: '#10b981', color: '#FFF7EE', border: 'none', padding: '0.7rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>🖨️ Print Receipt & Barcode</button>
              <button onClick={() => setSelectedOrder(null)} style={{ flex: 1, background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.7rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* FULL EDIT ORDER MODAL */}
      {editingOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ background: '#2D2C2C', border: '1px solid rgba(255,247,238,0.2)', borderRadius: '14px', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', color: '#FFF7EE' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#FD7100' }}>✏️ Edit Order #{editingOrder.id || editingOrder._id}</h3>
            
            <form onSubmit={handleSaveEditedOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Customer Name (Arabic)</label>
                <input type="text" value={editArabicName} onChange={e => setEditArabicName(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Customer Phone Number</label>
                <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Delivery Address</label>
                <textarea value={editAddress} onChange={e => setEditAddress(e.target.value)} rows="2" required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Ordered Products & Quantities:</label>
                {editItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', background: '#242323', padding: '0.5rem', borderRadius: '6px' }}>
                    <span style={{ flex: 1, fontSize: '0.8rem' }}>{item.name}</span>
                    <input 
                      type="number" 
                      min="1" 
                      value={item.quantity} 
                      onChange={e => {
                        const val = parseInt(e.target.value) || 1;
                        setEditItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: val } : it));
                      }} 
                      style={{ width: '60px', padding: '0.3rem', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)', borderRadius: '4px' }}
                    />
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#FD7100' }}>{(item.price * item.quantity).toFixed(2)} JD</span>
                    <button type="button" onClick={() => setEditItems(prev => prev.filter((_, i) => i !== idx))} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button type="submit" style={{ flex: 1, background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.7rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Save All Changes</button>
                <button type="button" onClick={() => setEditingOrder(null)} style={{ flex: 1, background: '#555', color: '#FFF7EE', border: 'none', padding: '0.7rem', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );

  return <AdminDashboard />;
}