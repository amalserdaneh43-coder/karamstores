import React, { useState, useEffect, useMemo } from 'react';



const API_BASE = process.env.REACT_APP_API_URL || 'https://karamstores.onrender.com';



function AdminDashboard({ token, onLogout }) {

  const [activeTab, setActiveTab] = useState('orders');

  const [products, setProducts] = useState([]);

  const [orders, setOrders] = useState([]);

  const [settings, setSettings] = useState({ deliveryFee: 2.00, irbidDeliveryFee: 3.50, discountCodes: {} });

  

  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  const [productSearchQuery, setProductSearchQuery] = useState('');

  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');



  const [selectedOrder, setSelectedOrder] = useState(null);

  const [editingOrder, setEditingOrder] = useState(null);

  const [editArabicName, setEditArabicName] = useState('');

  const [editAddress, setEditAddress] = useState('');

  const [editPhone, setEditPhone] = useState('');

  const [editItems, setEditItems] = useState([]);



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



  const [ammanFee, setAmmanFee] = useState(2.00);

  const [irbidFee, setIrbidFee] = useState(3.50);

  const [newPromoCode, setNewPromoCode] = useState('');

  const [newPromoVal, setNewPromoVal] = useState('');



  const authHeaders = useMemo(() => ({

    'Content-Type': 'application/json',

    'Authorization': `Bearer ${token}`

  }), [token]);



  const fetchData = () => {

    fetch(`${API_BASE}/api/products`)

      .then(res => res.json())

      .then(data => setProducts(data))

      .catch(err => console.error('Error fetching products:', err));



    fetch(`${API_BASE}/api/orders`)

      .then(res => res.json())

      .then(data => setOrders(data))

      .catch(err => console.error('Error fetching orders:', err));



    fetch(`${API_BASE}/api/settings`)

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

                  <td>${i.name}${i.selectedSize ? `(${i.selectedSize})` : ''}</td>

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



  const handleDownloadCsvTemplate = () => {

    const templateHeaders = ['id', 'name', 'price', 'category', 'stock', 'featured', 'image', 'images', 'description'];

    const sampleRow = ['', 'طنجرة', '25.00', 'Kitchen', '10', 'TRUE', 'https://example.com/image.jpg', '', 'High quality pot'];

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



        const id = row[0] || '';

        const name = row[1] || 'Product';

        const price = parseFloat(row[2]) || 0.0;

        const category = row[3] || 'Kitchen';

        const stock = parseInt(row[4]) || 10;

        const featured = String(row[5]).toUpperCase() === 'TRUE';

        const image = row[6] || '';

        const imagesRaw = row[7] || '';

        const description = row[8] || '';



        const imagesArray = imagesRaw ? imagesRaw.split('|').map(s => s.trim()).filter(Boolean) : [];



        parsedProducts.push({

          id: id || undefined,

          _id: id || undefined,

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

        alert('Could not parse any products.');

        return;

      }



      if (window.confirm(`Successfully parsed ${parsedProducts.length} products. Upload now?`)) {

        fetch(`${API_BASE}/api/admin/products/import`, {

          method: 'POST',

          headers: authHeaders,

          body: JSON.stringify({ products: parsedProducts })

        })

          .then(res => res.json())

          .then(data => {

            alert(data.message || 'Inventory updated!');

            fetchData();

          })

          .catch(() => alert('Error importing inventory. Check auth permissions.'));

      }

    };

  };



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

      ? `${API_BASE}/api/admin/products/${editingId}`

      : `${API_BASE}/api/admin/products`;

    const method = editingId ? 'PATCH' : 'POST';



    fetch(url, {

      method,

      headers: authHeaders,

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

      .catch(() => alert('Error saving product. Check server logs.'));

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

    fetch(`${API_BASE}/api/admin/products/${id}`, { method: 'DELETE', headers: authHeaders })

      .then(() => fetchData())

      .catch(err => console.error('Error deleting product:', err));

  };



  const handleUpdateOrderStatus = (orderId, newStatus) => {

    fetch(`${API_BASE}/api/admin/orders/${orderId}`, {

      method: 'PATCH',

      headers: authHeaders,

      body: JSON.stringify({ status: newStatus })

    })

      .then(res => res.json())

      .then(() => fetchData())

      .catch(err => console.error('Error updating status:', err));

  };



  const handleUpdateSettings = (e) => {

    e.preventDefault();

    fetch(`${API_BASE}/api/admin/settings`, {

      method: 'PATCH',

      headers: authHeaders,

      body: JSON.stringify({

        deliveryFee: parseFloat(ammanFee),

        irbidDeliveryFee: parseFloat(irbidFee),

        discountCodes: settings.discountCodes

      })

    })

      .then(res => res.json())

      .then(data => {

        setSettings(data.storeSettings || data);

        alert('Store settings updated successfully!');

      });

  };



  const sortedOrders = useMemo(() => {

    return [...orders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

      .filter(ord => {

        const matchesStatus = orderStatusFilter === 'ALL' || (ord.status || 'Pending').toUpperCase() === orderStatusFilter.toUpperCase();

        const query = orderSearchQuery.toLowerCase();

        const customerName = (ord.customer?.arabicName || ord.arabicName || '').toLowerCase();

        const customerPhone = (ord.customer?.phone1 || ord.phone || '').toLowerCase();

        const orderIdStr = String(ord.id || ord._id || '').toLowerCase();

        return matchesStatus && (!query || customerName.includes(query) || customerPhone.includes(query) || orderIdStr.includes(query));

      });

  }, [orders, orderStatusFilter, orderSearchQuery]);



  const filteredProducts = useMemo(() => {

    return products.filter(p => {

      const matchesCat = productCategoryFilter === 'ALL' || (p.category || '').toLowerCase() === productCategoryFilter.toLowerCase();

      const matchesQuery = !productSearchQuery || (p.name || '').toLowerCase().includes(productSearchQuery.toLowerCase());

      return matchesCat && matchesQuery;

    });

  }, [products, productSearchQuery, productCategoryFilter]);



  return (

    <div style={{ padding: '2rem', background: '#1c1b1b', color: '#FFF7EE', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,247,238,0.2)', paddingBottom: '1rem' }}>

        <div>

          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#FD7100' }}>Karam Stores Admin</h1>

          <p style={{ margin: '0.2rem 0 0 0', opacity: 0.7, fontSize: '0.9rem' }}>Enterprise Control Center</p>

        </div>

        <button onClick={onLogout} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>

          🔒 Logout

        </button>

      </div>



      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem' }}>

        <button onClick={() => setActiveTab('orders')} style={{ padding: '0.7rem 1.2rem', background: activeTab === 'orders' ? '#FD7100' : '#2D2C2C', color: '#FFF7EE', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>

          📋 Orders ({orders.length})

        </button>

        <button onClick={() => setActiveTab('inventory')} style={{ padding: '0.7rem 1.2rem', background: activeTab === 'inventory' ? '#FD7100' : '#2D2C2C', color: '#FFF7EE', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>

          📦 Inventory ({products.length})

        </button>

        <button onClick={() => setActiveTab('settings')} style={{ padding: '0.7rem 1.2rem', background: activeTab === 'settings' ? '#FD7100' : '#2D2C2C', color: '#FFF7EE', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>

          ⚙️ Delivery & Settings

        </button>

      </div>



      {activeTab === 'orders' && (

        <div style={{ background: '#2D2C2C', padding: '1.5rem', borderRadius: '12px' }}>

          <h3 style={{ margin: '0 0 1rem 0', color: '#FD7100' }}>📋 Orders Management</h3>

          {sortedOrders.map(ord => (

            <div key={ord.id || ord._id} style={{ background: '#242323', padding: '1rem', borderRadius: '8px', marginBottom: '0.8rem' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                <div>

                  <strong>Order #{ord.id || ord._id}</strong>

                  <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.2rem' }}>

                    Customer: {ord.customer?.arabicName || ord.arabicName || 'N/A'} | Phone: {ord.customer?.phone1 || ord.phone || 'N/A'}

                  </div>

                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>

                  <button onClick={() => handlePrintReceipt(ord)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}>

                    🖨️ Receipt

                  </button>

                  <select value={ord.status || 'Pending'} onChange={e => handleUpdateOrderStatus(ord.id || ord._id, e.target.value)} style={{ background: '#2D2C2C', color: '#FFF7EE', border: '1px solid #555', borderRadius: '4px', padding: '0.3rem' }}>

                    <option value="Pending">Pending</option>

                    <option value="Processing">Processing</option>

                    <option value="Shipped">Shipped</option>

                    <option value="Delivered">Delivered</option>

                    <option value="Cancelled">Cancelled</option>

                  </select>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}



      {activeTab === 'inventory' && (

        <div style={{ background: '#2D2C2C', padding: '1.5rem', borderRadius: '12px' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>

            <h3 style={{ margin: 0, color: '#FD7100' }}>📦 Inventory Table</h3>

            <div style={{ display: 'flex', gap: '0.5rem' }}>

              <button onClick={handleDownloadCsvTemplate} style={{ background: '#10b981', color: '#FFF7EE', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>📥 CSV Template</button>

              <button onClick={() => { resetProductForm(); setIsAddingProduct(true); }} style={{ background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>➕ Add Item</button>

            </div>

          </div>

          {filteredProducts.map(p => (

            <div key={p.id || p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid #444', alignItems: 'center' }}>

              <span>{p.name} - <strong>{p.price} JD</strong> ({p.category})</span>

              <div>

                <button onClick={() => startEditProduct(p)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', marginRight: '0.4rem', cursor: 'pointer' }}>Edit</button>

                <button onClick={() => handleDeleteProduct(p.id || p._id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>

              </div>

            </div>

          ))}

        </div>

      )}



      {activeTab === 'settings' && (

        <div style={{ background: '#2D2C2C', padding: '1.5rem', borderRadius: '12px' }}>

          <h3 style={{ color: '#FD7100', marginTop: 0 }}>⚙️ Regional Delivery Fees</h3>

          <form onSubmit={handleUpdateSettings}>

            <div style={{ marginBottom: '1rem' }}>

              <label style={{ display: 'block', marginBottom: '0.3rem' }}>Amman Fee (JD)</label>

              <input type="number" step="0.5" value={ammanFee} onChange={e => setAmmanFee(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', width: '100%', background: '#242323', border: '1px solid #444', color: '#fff' }} />

            </div>

            <div style={{ marginBottom: '1rem' }}>

              <label style={{ display: 'block', marginBottom: '0.3rem' }}>Irbid Fee (JD)</label>

              <input type="number" step="0.5" value={irbidFee} onChange={e => setIrbidFee(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', width: '100%', background: '#242323', border: '1px solid #444', color: '#fff' }} />

            </div>

            <button type="submit" style={{ background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Settings</button>

          </form>

        </div>

      )}

    </div>

  );

}



export default function AdminGate() {

  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');

  const [passwordInput, setPasswordInput] = useState('');

  const [errorMsg, setErrorMsg] = useState('');



  const handleLogin = (e) => {

    e.preventDefault();

    setErrorMsg('');

    fetch(`${API_BASE}/api/admin/login`, {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ password: passwordInput })

    })

      .then(res => {

        if (!res.ok) throw new Error('Invalid password');

        return res.json();

      })

      .then(data => {

        if (data.token) {

          localStorage.setItem('admin_token', data.token);

          setToken(data.token);

        }

      })

      .catch(() => setErrorMsg('Incorrect admin password!'));

  };



  const handleLogout = () => {

    localStorage.removeItem('admin_token');

    setToken('');

  };



  if (!token) {

    return (

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1c1b1b', color: '#FFF7EE', fontFamily: 'system-ui' }}>

        <form onSubmit={handleLogin} style={{ background: '#2D2C2C', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,247,238,0.2)', width: '320px', textAlign: 'center' }}>

          <h2 style={{ color: '#FD7100', marginBottom: '1rem' }}>Admin Secure Gate</h2>

          {errorMsg && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{errorMsg}</p>}

          <input 

            type="password" 

            placeholder="Enter Admin Password..." 

            value={passwordInput} 

            onChange={e => setPasswordInput(e.target.value)}

            style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE', marginBottom: '1rem', boxSizing: 'border-box' }}

          />

          <button type="submit" style={{ width: '100%', background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.7rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>

            Unlock Dashboard

          </button>

        </form>

      </div>

    );

  }



  return <AdminDashboard token={token} onLogout={handleLogout} />;

}