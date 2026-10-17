import React, { useState, useEffect, useMemo, useRef } from 'react';

function AdminApp() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({ deliveryFee: 3.00, discountCodes: {} });
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'categories' | 'orders' | 'settings'

  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategoryView, setSelectedCategoryView] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const barcodeInputRef = useRef(null);

  // Settings State Form
  const [editDeliveryFee, setEditDeliveryFee] = useState('3.00');
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoVal, setNewPromoVal] = useState('');

  // Modal State for Add Product
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add Product Form State
  const [newId, setNewId] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagesInput, setImagesInput] = useState('');
  const [description, setDescription] = useState('');
  const [sizesInput, setSizesInput] = useState('');
  const [colorsInput, setColorsInput] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Inline Editing State
  const [editingId, setEditingId] = useState(null);
  const [editIdVal, setEditIdVal] = useState('');
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editFeatured, setEditFeatured] = useState(false);

  // Admin Modal View & Print Mode State ('receipt' | 'barcodes')
  const [selectedOrderModal, setSelectedOrderModal] = useState(null);
  const [printMode, setPrintMode] = useState('receipt'); // 'receipt' | 'barcodes'

  const fetchData = () => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error fetching products:', err));

    fetch('http://localhost:5000/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error('Error fetching orders:', err));

    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0 && !category) setCategory(data[0]);
        if (data.length > 0 && !selectedCategoryView) setSelectedCategoryView(data[0]);
      })
      .catch(err => console.error('Error fetching categories:', err));

    fetch('http://localhost:5000/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        if (data.deliveryFee !== undefined) setEditDeliveryFee(data.deliveryFee);
      })
      .catch(err => console.error('Error fetching settings:', err));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateSettings = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliveryFee: Number(editDeliveryFee) })
    })
      .then(res => res.json())
      .then(data => {
        setSettings(data.storeSettings);
        alert('Delivery fee updated successfully!');
      })
      .catch(err => console.error('Error updating settings:', err));
  };

  const handleAddDiscountCode = (e) => {
    e.preventDefault();
    if (!newPromoCode.trim() || !newPromoVal) return;
    const updatedCodes = { ...settings.discountCodes, [newPromoCode.trim().toUpperCase()]: Number(newPromoVal) };

    fetch('http://localhost:5000/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discountCodes: updatedCodes })
    })
      .then(res => res.json())
      .then(data => {
        setSettings(data.storeSettings);
        setNewPromoCode('');
        setNewPromoVal('');
      })
      .catch(err => console.error('Error adding discount:', err));
  };

  const handleDeleteDiscount = (codeKey) => {
    const updatedCodes = { ...settings.discountCodes };
    delete updatedCodes[codeKey];

    fetch('http://localhost:5000/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discountCodes: updatedCodes })
    })
      .then(res => res.json())
      .then(data => setSettings(data.storeSettings))
      .catch(err => console.error('Error deleting discount:', err));
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    fetch('http://localhost:5000/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategoryName.trim() })
    })
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setNewCategoryName('');
      })
      .catch(err => console.error('Error adding category:', err));
  };

  const handleDeleteCategory = (catName) => {
    if (!window.confirm(`Delete category "${catName}"? Products inside will be moved to General.`)) return;

    fetch(`http://localhost:5000/api/categories/${encodeURIComponent(catName)}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories);
        if (selectedCategoryView === catName) {
          setSelectedCategoryView(data.categories[0] || null);
        }
        fetchData();
      })
      .catch(err => console.error('Error deleting category:', err));
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    const customIdInput = newId ? String(newId).trim() : '';

    const newProductData = {
      id: customIdInput,
      name,
      category: category || (categories[0] || 'General'),
      price: Number(price),
      stock: Number(stock),
      image: imageUrl.trim(),
      images: imagesInput ? imagesInput.split(',').map(s => s.trim()).filter(Boolean) : [],
      description: description.trim(),
      sizes: sizesInput ? sizesInput.split(',').map(s => s.trim()).filter(Boolean) : [],
      colors: colorsInput ? colorsInput.split(',').map(s => s.trim()).filter(Boolean) : [],
      featured: isFeatured
    };

    fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProductData)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to add product');
        return res.json();
      })
      .then(() => {
        setNewId('');
        setName('');
        setPrice('');
        setStock('');
        setImageUrl('');
        setImagesInput('');
        setDescription('');
        setSizesInput('');
        setColorsInput('');
        setIsFeatured(false);
        setIsAddModalOpen(false);
        fetchData();
      })
      .catch(err => console.error('Error adding product:', err));
  };

  const handleDeleteProduct = (id) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return;

    fetch(`http://localhost:5000/api/products/${id}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete product');
        fetchData();
      })
      .catch(err => console.error('Error deleting product:', err));
  };

  const startEditing = (product) => {
    const pId = product.id || product._id;
    setEditingId(pId);
    setEditIdVal(pId);
    setEditName(product.name);
    setEditCategory(product.category || categories[0] || 'General');
    setEditPrice(product.price);
    setEditStock(product.stock);
    setEditImage(product.image || '');
    setEditFeatured(Boolean(product.featured));
  };

  const saveInlineEdit = (oldId) => {
    fetch(`http://localhost:5000/api/products/${oldId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newId: editIdVal.trim(),
        name: editName,
        category: editCategory,
        price: Number(editPrice),
        stock: Number(editStock),
        image: editImage.trim(),
        featured: editFeatured
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update product');
        setEditingId(null);
        fetchData();
      })
      .catch(err => console.error('Error updating product:', err));
  };

  const updateOrderStatus = (id, newStatus) => {
    fetch(`http://localhost:5000/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update status');
        fetchData();
      })
      .catch(err => console.error('Error updating order status:', err));
  };

  const handleDeleteOrder = (id) => {
    if (!window.confirm(`Are you sure you want to cancel and delete order #${id}? This action cannot be undone.`)) return;

    fetch(`http://localhost:5000/api/orders/${id}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete order');
        if (selectedOrderModal && (selectedOrderModal.id || selectedOrderModal._id) === id) {
          setSelectedOrderModal(null);
        }
        fetchData();
      })
      .catch(err => console.error('Error deleting order:', err));
  };

  const handlePrintManifest = () => {
    const activeOrders = orders.filter(o => o.status === 'Processing' || o.status === 'Pending');
    let rowsHtml = '';
    activeOrders.forEach(o => {
      const cust = o.customer || {};
      rowsHtml += `
        <tr>
          <td style="border: 1px solid #000; padding: 6px;">#${o.id || o._id}</td>
          <td style="border: 1px solid #000; padding: 6px;">${cust.arabicName || 'N/A'}</td>
          <td style="border: 1px solid #000; padding: 6px;">${cust.phone1 || 'N/A'}</td>
          <td style="border: 1px solid #000; padding: 6px;">${cust.manualAddress || 'N/A'}</td>
          <td style="border: 1px solid #000; padding: 6px; text-align: right;">$${Number(o.grandTotal || o.total || 0).toFixed(2)}</td>
        </tr>
      `;
    });

    const manifestWin = window.open('', '_blank');
    if (manifestWin) {
      manifestWin.document.write(`
        <html>
          <head><title>Driver Delivery Manifest</title></head>
          <body style="font-family: sans-serif; padding: 20px;">
            <h2>KARAM STORES — Driver Delivery Manifest</h2>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <thead>
                <tr style="background: #eee;">
                  <th style="border: 1px solid #000; padding: 6px; text-align: left;">Order ID</th>
                  <th style="border: 1px solid #000; padding: 6px; text-align: left;">Customer Name</th>
                  <th style="border: 1px solid #000; padding: 6px; text-align: left;">Phone</th>
                  <th style="border: 1px solid #000; padding: 6px; text-align: left;">Address</th>
                  <th style="border: 1px solid #000; padding: 6px; text-align: right;">Cash to Collect</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </body>
        </html>
      `);
      manifestWin.document.close();
      manifestWin.focus();
      setTimeout(() => { manifestWin.print(); manifestWin.close(); }, 500);
    }
  };

  const handlePrintAction = () => {
    if (!selectedOrderModal) return;
    const order = selectedOrderModal;
    const orderId = order.id || order._id;
    const orderDate = new Date(order.createdAt || Date.now()).toLocaleString();
    const customer = order.customer || {};

    let htmlContent = '';

    if (printMode === 'receipt') {
      let itemsHtml = '';
      if (order.items) {
        order.items.forEach(item => {
          itemsHtml += `
            <div style="margin-bottom: 6px;">
              <div style="font-weight: bold;">${item.name}</div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: #333;">
                <span>${item.selectedSize ? 'Size: ' + item.selectedSize + ' ' : ''}${item.selectedColor ? 'Color: ' + item.selectedColor : ''}</span>
                <span>${item.quantity} x $${Number(item.price).toFixed(2)} = $${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          `;
        });
      }

      htmlContent = `
        <html>
          <head>
            <title>Receipt #${orderId}</title>
            <style>
              body { font-family: 'Courier New', Courier, monospace; font-size: 12px; width: 80mm; margin: 0 auto; padding: 10px; color: #000; background: #fff; }
              .center { text-align: center; }
              .line { border-bottom: 1px dashed #000; margin: 8px 0; }
              .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            </style>
          </head>
          <body>
            <div class="center">
              <h2 style="margin: 0 0 4px 0; font-size: 16px;">KARAM STORES</h2>
              <p style="margin: 0; font-size: 11px;">أدوات منزلية | منظفات</p>
            </div>
            <div class="line"></div>
            <div>
              <p style="margin: 0 0 3px 0;"><strong>Order ID:</strong> #${orderId}</p>
              <p style="margin: 0 0 3px 0;"><strong>Date:</strong> ${orderDate}</p>
              <p style="margin: 0 0 3px 0;"><strong>Customer Name:</strong> ${customer.arabicName || 'N/A'}</p>
              <p style="margin: 0 0 3px 0;"><strong>Phones:</strong> ${customer.phone1 || 'N/A'} ${customer.phone2 ? '/ ' + customer.phone2 : ''}</p>
              <p style="margin: 0 0 3px 0;"><strong>Address:</strong> ${customer.manualAddress || 'N/A'}</p>
            </div>
            <div class="line"></div>
            <div style="font-weight: bold; margin-bottom: 6px;">ITEMS:</div>
            ${itemsHtml}
            <div class="line"></div>
            <div class="row"><span>Subtotal:</span><span>$${Number(order.total || 0).toFixed(2)}</span></div>
            <div class="row"><span>Delivery Fee:</span><span>$${Number(order.deliveryFee || 3.00).toFixed(2)}</span></div>
            ${order.discountAmount ? `<div class="row"><span>Discount:</span><span>-$${Number(order.discountAmount).toFixed(2)}</span></div>` : ''}
            <div class="line"></div>
            <div class="row" style="font-weight: bold; font-size: 14px;"><span>TOTAL (CASH):</span><span>$${Number(order.grandTotal || (order.total + 3.00)).toFixed(2)}</span></div>
            <div class="line"></div>
            <div class="center" style="margin-top: 15px; font-size: 11px;">
              <p style="margin: 0;">Thank you for shopping with us!</p>
              <p style="margin: 0;">Karam Stores</p>
            </div>
          </body>
        </html>
      `;
    } else {
      let barcodeCardsHtml = '';
      if (order.items) {
        order.items.forEach((item, idx) => {
          const matchedProduct = products.find(p => (p.id || p._id) === (item.id || item._id)) || item;
          const rawBarcodeId = String(matchedProduct.id || matchedProduct._id || `100${idx}`);
          const barcodeId = rawBarcodeId.replace(/[^a-zA-Z0-9]/g, '') || `ITEM${idx}`;
          const barcodeImageUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(barcodeId)}&scale=2&height=12&includetext`;

          barcodeCardsHtml += `
            <div style="border: 2px solid #000; border-radius: 8px; padding: 12px; background: #fff; page-break-inside: avoid;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; font-weight: bold;">
                <span>Qty to Pack: ${item.quantity}</span>
                <span>$${Number(item.price).toFixed(2)}</span>
              </div>
              <h4 style="margin: 0 0 6px 0; font-size: 14px; line-height: 1.3;">${item.name}</h4>
              <p style="margin: 0 0 10px 0; font-size: 11px; color: #444;">
                ${item.selectedSize ? 'Size: ' + item.selectedSize + ' ' : ''}
                ${item.selectedColor ? 'Color: ' + item.selectedColor : ''}
              </p>
              <div style="background: #ffffff; border: 1px solid #cbd5e1; padding: 8px; text-align: center; border-radius: 6px;">
                <img src="${barcodeImageUrl}" alt="Barcode ${barcodeId}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />
              </div>
            </div>
          `;
        });
      }

      htmlContent = `
        <html>
          <head>
            <title>Barcodes Sheet - Order #${orderId}</title>
            <style>
              body { font-family: system-ui, sans-serif; margin: 0; padding: 15mm; color: #000; background: #fff; }
              .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #000; padding-bottom: 12px; }
              .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2 style="margin: 0 0 5px 0; font-size: 20px;">KARAM STORES — ORDER ITEMS BARCODES</h2>
              <p style="margin: 0; font-size: 13px;">Order ID: #${orderId} | Date: ${orderDate}</p>
              <p style="margin: 4px 0 0 0; font-size: 13px;">Customer: ${customer.arabicName || 'N/A'} | Phone: ${customer.phone1 || 'N/A'}</p>
            </div>
            <div class="grid">${barcodeCardsHtml}</div>
          </body>
        </html>
      `;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const categoryFilterList = useMemo(() => ['All', ...categories], [categories]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const pId = String(p.id || p._id || '');
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || pId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.grandTotal || o.total || 0), 0);
  const lowStockCount = products.filter(p => p.stock < 5).length;
  const totalStockCount = products.reduce((sum, p) => sum + (p.stock || 0), 0);

  return (
    <div>
      <div style={{ padding: '2.5rem', fontFamily: 'system-ui, sans-serif', background: '#f8fafc', color: '#334155', minHeight: '100vh', position: 'relative' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', background: '#ffffff', padding: '1.2rem 1.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img 
              src="/logo.jpg" 
              alt="Karam Stores Logo" 
              style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>Karam Stores — Admin Portal</h1>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>أدوات منزلية | منظفات — High Volume Inventory</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
            <button 
              onClick={() => setActiveTab('inventory')}
              style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: activeTab === 'inventory' ? '#ffffff' : 'transparent', color: activeTab === 'inventory' ? '#1e293b' : '#64748b', fontWeight: 'bold', cursor: 'pointer', boxShadow: activeTab === 'inventory' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
            >
              Inventory ({products.length.toLocaleString()})
            </button>
            <button 
              onClick={() => setActiveTab('categories')}
              style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: activeTab === 'categories' ? '#ffffff' : 'transparent', color: activeTab === 'categories' ? '#1e293b' : '#64748b', fontWeight: 'bold', cursor: 'pointer', boxShadow: activeTab === 'categories' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
            >
              Categories ({categories.length})
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: activeTab === 'orders' ? '#ffffff' : 'transparent', color: activeTab === 'orders' ? '#1e293b' : '#64748b', fontWeight: 'bold', cursor: 'pointer', boxShadow: activeTab === 'orders' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
            >
              Orders ({orders.length})
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: activeTab === 'settings' ? '#ffffff' : 'transparent', color: activeTab === 'settings' ? '#1e293b' : '#64748b', fontWeight: 'bold', cursor: 'pointer', boxShadow: activeTab === 'settings' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
            >
              Settings & Fees ⚙️
            </button>
          </div>
        </div>

        {/* Analytics Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ background: '#ffffff', padding: '1.2rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Total Revenue</p>
            <h2 style={{ margin: '0.4rem 0 0 0', color: '#16a34a' }}>${totalRevenue.toFixed(2)}</h2>
          </div>
          <div style={{ background: '#ffffff', padding: '1.2rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Active Orders</p>
            <h2 style={{ margin: '0.4rem 0 0 0', color: '#0f172a' }}>{orders.length}</h2>
          </div>
          <div style={{ background: '#ffffff', padding: '1.2rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Low Stock Items (&lt;5)</p>
            <h2 style={{ margin: '0.4rem 0 0 0', color: lowStockCount > 0 ? '#dc2626' : '#16a34a' }}>{lowStockCount}</h2>
          </div>
          <div style={{ background: '#ffffff', padding: '1.2rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Total Stock Units</p>
            <h2 style={{ margin: '0.4rem 0 0 0', color: '#ca8a04' }}>{totalStockCount.toLocaleString()}</h2>
          </div>
        </div>

        {/* TAB 1: INVENTORY MANAGEMENT */}
        {activeTab === 'inventory' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
                <input 
                  type="text" 
                  ref={barcodeInputRef}
                  placeholder="🔍 Scan barcode gun or type product/ID here..." 
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  style={{ padding: '0.7rem 1rem', borderRadius: '6px', border: '2px solid #cbd5e1', background: '#f8fafc', width: '420px', outline: 'none', fontSize: '0.95rem', fontWeight: '500' }}
                />
                <select 
                  value={selectedCategory} 
                  onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                  style={{ padding: '0.7rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#1e293b' }}
                >
                  {categoryFilterList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                style={{ background: '#1c1917', color: '#fff', border: 'none', padding: '0.7rem 1.4rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
              >
                + Add New Product
              </button>
            </div>

            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Showing {paginatedProducts.length} of {filteredProducts.length} items
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '0.8rem 1rem' }}>Image</th>
                      <th style={{ padding: '0.8rem 1rem' }}>Barcode / ID</th>
                      <th style={{ padding: '0.8rem 1rem' }}>Product Name</th>
                      <th style={{ padding: '0.8rem 1rem' }}>Category</th>
                      <th style={{ padding: '0.8rem 1rem' }}>Price</th>
                      <th style={{ padding: '0.8rem 1rem' }}>Stock</th>
                      <th style={{ padding: '0.8rem 1rem' }}>Pinned Card</th>
                      <th style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                          No products found matching your search.
                        </td>
                      </tr>
                    ) : (
                      paginatedProducts.map(product => {
                        const pId = product.id || product._id;
                        const isEditing = editingId === pId;

                        return (
                          <tr key={pId} style={{ borderBottom: '1px solid #f1f5f9', background: isEditing ? '#f8fafc' : 'transparent' }}>
                            <td style={{ padding: '0.6rem 1rem' }}>
                              {isEditing ? (
                                <input 
                                  type="text" value={editImage} onChange={e => setEditImage(e.target.value)} placeholder="Img URL"
                                  style={{ width: '80px', padding: '0.3rem', fontSize: '0.75rem' }}
                                />
                              ) : (
                                <img 
                                  src={product.image || 'https://via.placeholder.com/40'} 
                                  alt="" 
                                  style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                  onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                                />
                              )}
                            </td>
                            <td style={{ padding: '0.8rem 1rem' }}>
                              {isEditing ? (
                                <input 
                                  type="text" value={editIdVal} onChange={e => setEditIdVal(e.target.value)} 
                                  style={{ width: '90px', padding: '0.3rem', fontSize: '0.8rem' }}
                                />
                              ) : (
                                <span style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold' }}>{pId}</span>
                              )}
                            </td>
                            <td style={{ padding: '0.8rem 1rem' }}>
                              {isEditing ? (
                                <input 
                                  type="text" value={editName} onChange={e => setEditName(e.target.value)} 
                                  style={{ width: '150px', padding: '0.3rem' }}
                                />
                              ) : (
                                <strong style={{ color: '#1e293b' }}>{product.name}</strong>
                              )}
                            </td>
                            <td style={{ padding: '0.8rem 1rem' }}>
                              {isEditing ? (
                                <select 
                                  value={editCategory} onChange={e => setEditCategory(e.target.value)} 
                                  style={{ width: '110px', padding: '0.3rem' }}
                                >
                                  {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </select>
                              ) : (
                                <span style={{ background: '#e2e8f0', color: '#475569', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                  {product.category || 'General'}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.8rem 1rem' }}>
                              {isEditing ? (
                                <input 
                                  type="number" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} 
                                  style={{ width: '70px', padding: '0.3rem' }}
                                />
                              ) : (
                                `$${Number(product.price).toFixed(2)}`
                              )}
                            </td>
                            <td style={{ padding: '0.8rem 1rem' }}>
                              {isEditing ? (
                                <input 
                                  type="number" value={editStock} onChange={e => setEditStock(e.target.value)} 
                                  style={{ width: '60px', padding: '0.3rem' }}
                                />
                              ) : (
                                <span style={{ color: product.stock > 0 ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                                  {product.stock}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.8rem 1rem' }}>
                              {isEditing ? (
                                <input 
                                  type="checkbox" checked={editFeatured} onChange={e => setEditFeatured(e.target.checked)} 
                                  style={{ width: '16px', height: '16px' }}
                                />
                              ) : (
                                <span style={{ color: product.featured ? '#16a34a' : '#94a3b8', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                  {product.featured ? 'Pinned' : 'No'}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>
                              {isEditing ? (
                                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                  <button onClick={() => saveInlineEdit(pId)} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                                  <button onClick={() => setEditingId(null)} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                  <button onClick={() => startEditing(product)} style={{ background: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', padding: '0.3rem 0.7rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>Edit</button>
                                  <button onClick={() => handleDeleteProduct(pId)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Delete</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  style={{ background: currentPage === 1 ? '#e2e8f0' : '#4a4543', color: currentPage === 1 ? '#94a3b8' : '#fff', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                >
                  ← Previous
                </button>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>
                <button 
                  disabled={currentPage >= totalPages} 
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  style={{ background: currentPage >= totalPages ? '#e2e8f0' : '#4a4543', color: currentPage >= totalPages ? '#94a3b8' : '#fff', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '1.5rem' }}>
            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
              <h3 style={{ marginTop: 0, color: '#1e293b' }}>Category Manager</h3>
              <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input 
                  type="text" placeholder="New Category Name..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} 
                  style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', flex: 1, fontSize: '0.9rem' }}
                />
                <button type="submit" style={{ background: '#4a4543', color: '#fff', border: 'none', padding: '0.6rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Add
                </button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {categories.map(cat => {
                  const count = products.filter(p => p.category === cat).length;
                  const isSelected = selectedCategoryView === cat;
                  return (
                    <div 
                      key={cat} 
                      onClick={() => setSelectedCategoryView(cat)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem', borderRadius: '8px', background: isSelected ? '#f1f5f9' : '#f8fafc', border: isSelected ? '1px solid #cbd5e1' : '1px solid #e2e8f0', cursor: 'pointer' }}
                    >
                      <div>
                        <strong style={{ color: '#1e293b', fontSize: '0.95rem' }}>{cat}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>{count} items in stock</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }}
                        style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                      >
                        Delete
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ marginTop: 0, color: '#1e293b' }}>
                Items in Category: <span style={{ color: '#0284c7' }}>{selectedCategoryView}</span>
              </h3>
              
              {selectedCategoryView && (
                <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                        <th style={{ padding: '0.8rem 1rem' }}>Image</th>
                        <th style={{ padding: '0.8rem 1rem' }}>ID</th>
                        <th style={{ padding: '0.8rem 1rem' }}>Product Name</th>
                        <th style={{ padding: '0.8rem 1rem' }}>Price</th>
                        <th style={{ padding: '0.8rem 1rem' }}>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.filter(p => p.category === selectedCategoryView).length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                            No products found in this category.
                          </td>
                        </tr>
                      ) : (
                        products.filter(p => p.category === selectedCategoryView).map(product => {
                          const pId = product.id || product._id;
                          return (
                            <tr key={pId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '0.6rem 1rem' }}>
                                <img src={product.image || 'https://via.placeholder.com/40'} alt="" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} />
                              </td>
                              <td style={{ padding: '0.8rem 1rem', fontFamily: 'monospace', color: '#64748b', fontSize: '0.8rem' }}>{pId}</td>
                              <td style={{ padding: '0.8rem 1rem', fontWeight: '600', color: '#1e293b' }}>{product.name}</td>
                              <td style={{ padding: '0.8rem 1rem' }}>${Number(product.price).toFixed(2)}</td>
                              <td style={{ padding: '0.8rem 1rem', color: product.stock > 0 ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>{product.stock}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMER ORDERS */}
        {activeTab === 'orders' && (
          <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>Customer Orders Management ({orders.length})</h3>
              <button 
                onClick={handlePrintManifest}
                style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
              >
                🖨️ Print Driver Manifest
              </button>
            </div>
            {orders.length === 0 ? (
              <p style={{ color: '#64748b', padding: '2rem 0', textAlign: 'center' }}>No orders placed yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.2rem', marginTop: '1rem' }}>
                {orders.map(o => {
                  const oId = o.id || o._id;
                  const customer = o.customer || {};

                  return (
                    <div key={oId} style={{ border: '1px solid #e2e8f0', padding: '1.2rem', borderRadius: '8px', background: '#f8fafc', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#1e293b' }}>Order #{oId}</span>
                          <span style={{ color: o.status === 'Shipped' ? '#16a34a' : '#ca8a04', fontWeight: 'bold', fontSize: '0.8rem', background: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>{o.status || 'Pending'}</span>
                        </div>

                        {/* Explicit Customer Info Display */}
                        <div style={{ background: '#ffffff', padding: '0.8rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '0.8rem', fontSize: '0.85rem', color: '#334155' }}>
                          <p style={{ margin: '0 0 0.3rem 0' }}><strong>Name:</strong> <span dir="rtl">{customer.arabicName || 'N/A'}</span></p>
                          <p style={{ margin: '0 0 0.3rem 0' }}><strong>Phone 1:</strong> {customer.phone1 || 'N/A'}</p>
                          {customer.phone2 && <p style={{ margin: '0 0 0.3rem 0' }}><strong>Phone 2:</strong> {customer.phone2}</p>}
                          <p style={{ margin: '0' }}><strong>Address:</strong> {customer.manualAddress || 'N/A'}</p>
                        </div>

                        <p style={{ margin: '0 0 0.8rem 0', color: '#1e293b', fontWeight: 'bold', fontSize: '0.95rem' }}>Grand Total: ${Number(o.grandTotal || o.total || 0).toFixed(2)}</p>
                      </div>

                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
                          <button onClick={() => updateOrderStatus(oId, 'Processing')} style={{ flex: 1, background: '#fef08a', color: '#854d0e', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Processing</button>
                          <button onClick={() => updateOrderStatus(oId, 'Shipped')} style={{ flex: 1, background: '#16a34a', color: '#fff', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Shipped</button>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <button 
                            onClick={() => { setSelectedOrderModal(o); setPrintMode('receipt'); }}
                            style={{ flex: 1, background: '#1c1917', color: '#fff', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}
                          >
                            🖨️ Receipt
                          </button>
                          <button 
                            onClick={() => { setSelectedOrderModal(o); setPrintMode('barcodes'); }}
                            style={{ flex: 1, background: '#0284c7', color: '#fff', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}
                          >
                            🏷️ Barcodes
                          </button>
                        </div>

                        <button 
                          onClick={() => handleDeleteOrder(oId)}
                          style={{ width: '100%', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}
                        >
                          🗑️ Cancel / Delete Order
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SETTINGS & FEES */}
        {activeTab === 'settings' && (
          <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '10px', border: '1px solid #e2e8f0', maxWidth: '650px' }}>
            <h3 style={{ marginTop: 0, color: '#1e293b' }}>Store Configuration & Pricing Fees</h3>
            <form onSubmit={handleUpdateSettings} style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem', color: '#475569', marginBottom: '0.4rem' }}>Standard Delivery Fee ($)</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input 
                  type="number" step="0.01" value={editDeliveryFee} onChange={e => setEditDeliveryFee(e.target.value)} 
                  style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', width: '160px', fontSize: '0.95rem' }} 
                />
                <button type="submit" style={{ background: '#1c1917', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Save Delivery Fee
                </button>
              </div>
            </form>

            <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', margin: '1.5rem 0' }} />

            <h4 style={{ marginBottom: '0.6rem', color: '#1e293b' }}>Promo Discount Codes</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 0 }}>Values less than 1 act as a percentage ratio (e.g., 0.10 for 10%), while values &gt;= 1 act as fixed dollar deductions ($).</p>
            <form onSubmit={handleAddDiscountCode} style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.2rem' }}>
              <input 
                type="text" placeholder="CODE (e.g. SALE10)" value={newPromoCode} onChange={e => setNewPromoCode(e.target.value)} 
                style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', flex: 1, textTransform: 'uppercase' }} 
              />
              <input 
                type="number" step="0.01" placeholder="Value (e.g. 5 or 0.1)" value={newPromoVal} onChange={e => setNewPromoVal(e.target.value)} 
                style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', width: '130px' }} 
              />
              <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Add Code
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(settings.discountCodes || {}).map(([code, val]) => (
                <div key={code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.8rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ color: '#1e293b' }}>{code}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Deduction Value: {val}</span>
                  </div>
                  <button onClick={() => handleDeleteDiscount(code)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADMIN ORDER MODAL */}
        {selectedOrderModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: '#ffffff', padding: '2.5rem', borderRadius: '16px', width: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.25)', position: 'relative' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1e293b', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.3rem' }}>
                    {printMode === 'receipt' ? 'Order Receipt & Details' : 'Order Items Barcodes Sheet'}
                  </h2>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Order ID: #{selectedOrderModal.id || selectedOrderModal._id}</span>
                </div>
                <button onClick={() => setSelectedOrderModal(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <button 
                  onClick={() => setPrintMode('receipt')}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: printMode === 'receipt' ? '2px solid #1e293b' : '1px solid #cbd5e1', background: printMode === 'receipt' ? '#1e293b' : '#f8fafc', color: printMode === 'receipt' ? '#fff' : '#475569', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  📄 View Receipt
                </button>
                <button 
                  onClick={() => setPrintMode('barcodes')}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: printMode === 'barcodes' ? '2px solid #0284c7' : '1px solid #cbd5e1', background: printMode === 'barcodes' ? '#0284c7' : '#f8fafc', color: printMode === 'barcodes' ? '#fff' : '#475569', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  🏷️ View Barcodes Sheet
                </button>
              </div>

              {printMode === 'receipt' ? (
                <>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.2rem', marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 0.6rem 0', color: '#1e293b', fontSize: '1rem' }}>Customer & Delivery Information</h4>
                    <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.6' }}>
                      <p style={{ margin: '0 0 0.3rem 0' }}><strong>Full Name (Arabic):</strong> <span dir="rtl">{selectedOrderModal.customer?.arabicName || 'N/A'}</span></p>
                      <p style={{ margin: '0 0 0.3rem 0' }}><strong>Primary Phone:</strong> {selectedOrderModal.customer?.phone1 || 'N/A'}</p>
                      {selectedOrderModal.customer?.phone2 && <p style={{ margin: '0 0 0.3rem 0' }}><strong>Secondary Phone:</strong> {selectedOrderModal.customer.phone2}</p>}
                      <p style={{ margin: '0 0 0.3rem 0' }}><strong>Manual Address:</strong> {selectedOrderModal.customer?.manualAddress || 'N/A'}</p>
                    </div>
                  </div>

                  <h4 style={{ margin: '0 0 0.8rem 0', color: '#1e293b' }}>Ordered Items Breakdown</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', color: '#475569' }}>
                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Item Name</th>
                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>Options</th>
                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrderModal.items && selectedOrderModal.items.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.6rem 0.8rem', fontWeight: '600', color: '#1e293b' }}>{item.name}</td>
                          <td style={{ padding: '0.6rem 0.8rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                            {item.selectedSize ? `Size: ${item.selectedSize} ` : ''}
                            {item.selectedColor ? `Color: ${item.selectedColor}` : ''}
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>{item.quantity}</td>
                          <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.2rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#475569' }}>
                      <span>Subtotal Items:</span>
                      <span>${Number(selectedOrderModal.total || 0).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#475569' }}>
                      <span>Delivery Fee:</span>
                      <span>${Number(selectedOrderModal.deliveryFee || 3.00).toFixed(2)}</span>
                    </div>
                    {selectedOrderModal.discountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#16a34a' }}>
                        <span>Discount Applied:</span>
                        <span>-${Number(selectedOrderModal.discountAmount).toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', color: '#1e293b', borderTop: '1px solid #cbd5e1', paddingTop: '0.6rem', marginTop: '0.4rem' }}>
                      <span>Total Amount to Collect (Cash):</span>
                      <span style={{ color: '#16a34a' }}>${Number(selectedOrderModal.grandTotal || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  {selectedOrderModal.items && selectedOrderModal.items.map((item, idx) => {
                    const matchedProduct = products.find(p => (p.id || p._id) === (item.id || item._id)) || item;
                    const rawBarcodeId = String(matchedProduct.id || matchedProduct._id || `100${idx}`);
                    const barcodeId = rawBarcodeId.replace(/[^a-zA-Z0-9]/g, '') || `ITEM${idx}`;
                    const barcodeImageUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(barcodeId)}&scale=2&height=12&includetext`;

                    return (
                      <div key={idx} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1rem', background: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          <span>Qty: {item.quantity}</span>
                          <span>${Number(item.price).toFixed(2)}</span>
                        </div>
                        <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1rem', color: '#1e293b' }}>{item.name}</h4>
                        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.6rem', textAlign: 'center', borderRadius: '6px' }}>
                          <img src={barcodeImageUrl} alt="" style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setSelectedOrderModal(null)} style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
                <button onClick={handlePrintAction} style={{ flex: 1, background: '#1c1917', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Print</button>
              </div>
            </div>
          </div>
        )}

        {/* ADD PRODUCT MODAL */}
        {isAddModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '12px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.8rem' }}>
                <h3 style={{ margin: 0, color: '#1e293b' }}>Add New Product</h3>
                <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <input type="text" placeholder="Barcode / Custom ID" value={newId} onChange={e => setNewId(e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                <input type="text" placeholder="Product Name *" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <select value={category} onChange={e => setCategory(e.target.value)} required style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <input type="number" step="0.01" placeholder="Price ($) *" value={price} onChange={e => setPrice(e.target.value)} required style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input type="number" placeholder="Stock Quantity *" value={stock} onChange={e => setStock(e.target.value)} required style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  <input type="text" placeholder="Main Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <textarea placeholder="Product Description..." value={description} onChange={e => setDescription(e.target.value)} rows="3" style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" id="featuredCheck" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
                  <label htmlFor="featuredCheck" style={{ fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>Pin as featured glass card on store banner</label>
                </div>
                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', border: 'none', background: '#f1f5f9', fontWeight: 'bold' }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', border: 'none', background: '#1c1917', color: '#fff', fontWeight: 'bold' }}>Save Product</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminApp;