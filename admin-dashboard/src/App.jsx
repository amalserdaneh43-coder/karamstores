import React, { useState, useEffect, useRef, useMemo } from 'react';

export default function AdminDashboard() {
  // --- PIN / AUTH GUARD STATE ---
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const ADMIN_PIN = '2026'; //[cite: 1]

  const [activeTab, setActiveTab] = useState('orders');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({ deliveryFee: 2.00, irbidDeliveryFee: 3.50, discountCodes: {} });
  
  // Filtering & Search States
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');

  // --- FEATURE: BARCODE SCANNER QUICK LOOKUP MODE ---
  const [barcodeScanInput, setBarcodeScanInput] = useState('');
  const barcodeInputRef = useRef(null);

  // --- FEATURE: BATCH ORDER SELECTION STATE ---
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [batchStatusTarget, setBatchStatusTarget] = useState('Processing');

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
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('مطبخ');
  const [formImage, setFormImage] = useState('');
  const [formImagesInput, setFormImagesInput] = useState('');
  const [formStock, setFormStock] = useState('10');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formDescription, setFormDescription] = useState('');

  // --- CSV STAGING GRID STATE ---
  const [stagedCsvProducts, setStagedCsvProducts] = useState(null);

  // --- MULTI-COLOR BUILDER STATES & PRESETS ---
  const popularColors = [
    { name: 'أحمر (Red)', hex: '#ef4444' },
    { name: 'أسود (Black)', hex: '#000000' },
    { name: 'أبيض (White)', hex: '#ffffff' },
    { name: 'أزرق (Blue)', hex: '#3b82f6' },
    { name: 'أخضر (Green)', hex: '#10b981' },
    { name: 'زهري/وردي (Pink)', hex: '#ec4899' },
    { name: 'رمادي (Gray)', hex: '#6b7280' },
    { name: 'ذهبي (Gold)', hex: '#d97706' },
    { name: 'فضي (Silver)', hex: '#9ca3af' }
  ];
  const [formColorsList, setFormColorsList] = useState([{ name: 'أحمر', hex: '#ef4444' }]);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#ef4444');

  // Settings Form State
  const [ammanFee, setAmmanFee] = useState(2.00);
  const [irbidFee, setIrbidFee] = useState(3.50);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoVal, setNewPromoVal] = useState('');

  // Admin Token Header helper
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'x-admin-token': 'karam-admin-secure-token-2026'
    };
  };

  const fetchData = () => {
    fetch('https://karamstores.onrender.com/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('خطأ في جلب المنتجات:', err));

    fetch('https://karamstores.onrender.com/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error('خطأ في جلب الطلبات:', err));

    fetch('https://karamstores.onrender.com/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setAmmanFee(data.deliveryFee !== undefined ? data.deliveryFee : 2.00);
        setIrbidFee(data.irbidDeliveryFee !== undefined ? data.irbidDeliveryFee : 3.50);
      })
      .catch(err => console.error('خطأ في جلب الإعدادات:', err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FEATURE: BARCODE SCANNER HANDLER ---
  const handleBarcodeScanSubmit = (e) => {
    e.preventDefault();
    const scannedCode = barcodeScanInput.trim();
    if (!scannedCode) return;

    const foundProd = products.find(p => String(p.id || p._id) === scannedCode);
    if (foundProd) {
      startEditProduct(foundProd);
      setBarcodeScanInput('');
    } else {
      alert(`لم يتم العثور على منتج بالباركود: ${scannedCode}. هل ترغب في إضافته؟`);
      resetProductForm();
      setFormId(scannedCode);
      setIsAddingProduct(true);
      setBarcodeScanInput('');
    }
  };

  // --- 80mm THERMAL RECEIPT PRINT CSS & LOGIC ---
  const handlePrintReceipt = (ord) => {
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <html dir="rtl">
        <head>
          <title>إيصال رقم #${ord.id || ord._id}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { font-family: Tahoma, sans-serif; padding: 5px 10px; color: #000; width: 72mm; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px dashed #333; padding-bottom: 5px; margin-bottom: 10px; }
            .header h2 { font-size: 16px; margin: 0 0 5px 0; }
            .header p { font-size: 11px; margin: 0; }
            .details { margin-bottom: 10px; font-size: 12px; line-height: 1.4; }
            .details p { margin: 2px 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            th, td { border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 11px; }
            th { background: #f4f4f4; }
            .totals { font-size: 12px; line-height: 1.4; border-top: 1px solid #333; padding-top: 5px; }
            .totals p { margin: 2px 0; }
            .barcode-box { text-align: center; margin-top: 15px; font-family: monospace; font-size: 18px; letter-spacing: 4px; font-weight: bold; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>كرم ستورز</h2>
            <p>إيصال طلب رسمي / Official Receipt</p>
          </div>
          <div class="details">
            <p><strong>رقم الطلب:</strong> #${ord.id || ord._id}</p>
            <p><strong>التاريخ:</strong> ${new Date(ord.createdAt || Date.now()).toLocaleString()}</p>
            <p><strong>اسم العميل:</strong> ${ord.customer?.arabicName || ord.arabicName || 'غير متوفر'}</p>
            <p><strong>رقم الهاتف:</strong> ${ord.customer?.phone1 || ord.phone || 'غير متوفر'}</p>
            <p><strong>العنوان:</strong> ${ord.customer?.manualAddress || ord.address || 'غير متوفر'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>المنتج</th>
                <th>كمية</th>
                <th>السعر</th>
                <th>المجموع</th>
              </tr>
            </thead>
            <tbody>
              ${(ord.items || []).map(i => `
                <tr>
                  <td>${i.name} ${i.selectedSize ? `(${i.selectedSize})` : ''} ${i.selectedColor ? `- ${i.selectedColor}` : ''}</td>
                  <td>${i.quantity}</td>
                  <td>${Number(i.price).toFixed(2)}</td>
                  <td>${(i.price * i.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <p>المجموع الفرعي: <strong>${Number(ord.total || 0).toFixed(2)} دينار</strong></p>
            <p>رسوم التوصيل: <strong>${Number(ord.deliveryFee || 2.00).toFixed(2)} دينار</strong></p>
            ${ord.discountAmount > 0 ? `<p>الخصم: <strong>-${Number(ord.discountAmount).toFixed(2)} دينار</strong></p>` : ''}
            <p style="font-size: 14px; color: #000;"><strong>المجموع الإجمالي: ${Number(ord.grandTotal || ord.total || 0).toFixed(2)} دينار</strong></p>
          </div>
          <div class="barcode-box">
            *ORD-${ord.id || ord._id}*
            <div style="font-size: 9px; margin-top: 3px; letter-spacing: normal;">ID: ${ord.id || ord._id}</div>
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

  // --- FEATURE: COURIER DELIVERY MANIFEST EXPORT (CSV) ---
  const handleExportDeliveryManifest = () => {
    const targetOrders = selectedOrderIds.length > 0 
      ? orders.filter(o => selectedOrderIds.includes(String(o.id || o._id)))
      : orders.filter(o => (o.status || 'Pending') === 'Pending' || (o.status || 'Pending') === 'Processing');

    if (targetOrders.length === 0) {
      alert('لا توجد طلبات لتصدير كشف التوصيل.');
      return;
    }

    const headers = ['رقم الطلب', 'اسم العميل', 'رقم الهاتف', 'المحافظة / العنوان', 'عدد القطع', 'المبلغ المطلوب تحصيله (نقداً)'];
    const csvRows = [headers.join(',')];

    targetOrders.forEach(ord => {
      const escapeCell = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const totalPieces = ord.items ? ord.items.reduce((s, i) => s + i.quantity, 0) : 0;
      const cashDue = Number(ord.grandTotal || ord.total || 0).toFixed(2);
      const custName = ord.customer?.arabicName || ord.arabicName || 'غير متوفر';
      const custPhone = ord.customer?.phone1 || ord.phone || 'غير متوفر';
      const custAddress = ord.customer?.manualAddress || ord.address || 'غير متوفر';

      const row = [
        escapeCell(`#${ord.id || ord._id}`),
        escapeCell(custName),
        escapeCell(`\t${custPhone}`),
        escapeCell(custAddress),
        escapeCell(totalPieces),
        escapeCell(`${cashDue} JD`)
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `karam_delivery_manifest_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- FEATURE: BATCH ORDER STATUS UPDATES ---
  const handleBatchStatusUpdate = () => {
    if (selectedOrderIds.length === 0) {
      alert('يرجى تحديد طلب واحد على الأقل أولاً.');
      return;
    }

    Promise.all(
      selectedOrderIds.map(id =>
        fetch(`https://karamstores.onrender.com/api/orders/${id}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: batchStatusTarget })
        }).then(res => res.json())
      )
    )
      .then(() => {
        alert(`تم تحديث حالة ${selectedOrderIds.length} طلب إلى (${batchStatusTarget}) بنجاح!`);
        setSelectedOrderIds([]);
        fetchData();
      })
      .catch(err => {
        console.error('خطأ في التحديث الجماعي:', err);
        alert('حدث خطأ أثناء تنفيذ التحديث الجماعي للطلبات.');
      });
  };

  const toggleSelectAllOrders = (e) => {
    if (e.target.checked) {
      const allIds = sortedOrders.map(o => String(o.id || o._id));
      setSelectedOrderIds(allIds);
    } else {
      setSelectedOrderIds([]);
    }
  };

  const toggleSelectSingleOrder = (id) => {
    const strId = String(id);
    setSelectedOrderIds(prev => 
      prev.includes(strId) ? prev.filter(i => i !== strId) : [...prev, strId]
    );
  };

  // --- FEATURE: DISCOUNT CODE ANALYTICS COMPUTATION ---
  const promoCodeAnalytics = useMemo(() => {
    const codesMap = settings.discountCodes || {};
    const stats = {};

    // Initialize all configured codes
    Object.keys(codesMap).forEach(code => {
      stats[code] = { count: 0, totalValueGiven: 0 };
    });

    // Scan all orders to tally redemptions
    orders.forEach(ord => {
      // Check if order has discount amount recorded and associated promo code
      if (ord.discountAmount && ord.discountAmount > 0) {
        // Find matching code based on discount value or default fallback tag
        // If order doesn't explicitly store code string, attribute proportionally or group under general redemption
        let matchedCode = ord.promoCode ? String(ord.promoCode).toUpperCase() : null;
        if (!matchedCode) {
          // Attempt to match by exact discount value
          for (const [code, val] of Object.entries(codesMap)) {
            const expectedVal = val < 1 ? (ord.total || 0) * val : val;
            if (Math.abs(expectedVal - ord.discountAmount) < 0.1) {
              matchedCode = code;
              break;
            }
          }
        }
        if (!matchedCode) matchedCode = 'CUSTOM / OTHER';

        if (!stats[matchedCode]) {
          stats[matchedCode] = { count: 0, totalValueGiven: 0 };
        }
        stats[matchedCode].count++;
        stats[matchedCode].totalValueGiven += Number(ord.discountAmount);
      }
    });

    return stats;
  }, [orders, settings]);

  // --- CSV TEMPLATE & EXPORT ---
  const handleDownloadCsvTemplate = () => {
    const templateHeaders = ['id', 'name', 'price', 'category', 'stock', 'featured', 'image', 'images', 'description', 'color', 'colorName'];
    const sampleRow = ['6578465137110', 'طنجرة', '25.00', 'Kitchen', '10', 'TRUE', 'https://example.com/image.jpg', '', 'قدر عالي الجودة', '#ef4444', 'أحمر'];
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

  const handleExportInventory = () => {
    const headers = ['id', 'name', 'price', 'category', 'stock', 'featured', 'image', 'images', 'description', 'color', 'colorName'];
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
        escapeCell(p.category || 'مطبخ'),
        escapeCell(p.stock || 0),
        escapeCell(p.featured ? 'TRUE' : 'FALSE'),
        escapeCell(p.image || ''),
        escapeCell(imagesString),
        escapeCell(p.description || ''),
        escapeCell(p.color || '#ef4444'),
        escapeCell(p.colorName || 'أحمر')
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

  // --- HELPERS ---
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

  // --- CSV IMPORT STAGING GRID PARSER ---
  const handleImportInventory = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r\n|\n/).filter(l => l.trim() !== '');
      if (lines.length < 2) {
        alert('تنسيق ملف CSV غير صالح أو الملف فارغ.');
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
        const name = cleanArabicText(row[1]) || 'منتج';
        const price = parseFloat(row[2]) || 0.0;
        const category = cleanArabicText(row[3]) || 'مطبخ';
        const stock = parseInt(row[4]) || 10;
        const featured = String(row[5]).toUpperCase() === 'TRUE';
        const image = row[6] || '';
        const imagesRaw = row[7] || '';
        const description = cleanArabicText(row[8]) || '';
        const color = row[9] || '#ef4444';
        const colorName = cleanArabicText(row[10]) || 'أحمر';

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
          description,
          colorsList: [{ name: colorName, hex: color }],
          color,
          colorName
        });
      }

      setStagedCsvProducts(parsedProducts);
      e.target.value = null;
    };
  };

  const confirmStagedImport = () => {
    if (!stagedCsvProducts || stagedCsvProducts.length === 0) return;

    fetch('https://karamstores.onrender.com/api/products/import', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ products: stagedCsvProducts })
    })
      .then(res => {
        if (!res.ok) throw new Error('فشل الاستيراد');
        return res.json();
      })
      .then(data => {
        alert(data.message || 'تم استيراد وتحديث المخزون بنجاح!');
        setStagedCsvProducts(null);
        fetchData();
      })
      .catch(err => {
        console.error('خطأ في الاستيراد:', err);
        alert('حدث خطأ أثناء اعتماد الاستيراد.');
      });
  };

  // --- MULTI-COLOR LIST HANDLERS ---
  const handleAddColorToList = (name, hex) => {
    if (!name) return;
    if (formColorsList.some(c => c.name === name)) return;
    setFormColorsList(prev => [...prev, { name, hex }]);
  };

  const handleRemoveColorFromList = (index) => {
    setFormColorsList(prev => prev.filter((_, i) => i !== index));
  };

  // --- PRODUCT MANAGEMENT ---
  const handleSaveProduct = (e) => {
    e.preventDefault();
    const extraImagesArray = formImagesInput ? formImagesInput.split(',').map(s => s.trim()).filter(Boolean) : [];
    const primaryColor = formColorsList[0] || { name: 'أحمر', hex: '#ef4444' };

    const productData = {
      ...(formId.trim() ? { id: formId.trim() } : {}),
      name: formName,
      price: parseFloat(formPrice),
      category: formCategory,
      image: formImage,
      images: extraImagesArray,
      stock: parseInt(formStock) || 0,
      featured: formFeatured,
      description: formDescription,
      colorsList: formColorsList,
      color: primaryColor.hex,
      colorName: primaryColor.name
    };

    const url = editingId 
      ? `https://karamstores.onrender.com/api/products/${editingId}`
      : 'https://karamstores.onrender.com/api/products';
    const method = editingId ? 'PATCH' : 'POST';

    fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    })
      .then(res => {
        if (!res.ok) throw new Error('فشل في حفظ المنتج');
        return res.json();
      })
      .then(() => {
        resetProductForm();
        fetchData();
        alert(editingId ? 'تم تحديث المنتج بنجاح!' : 'تمت إضافة المنتج بنجاح!');
      })
      .catch(err => {
        console.error('خطأ في حفظ المنتج:', err);
        alert('خطأ في حفظ المنتج. يرجى التحقق من الصلاحيات.');
      });
  };

  const startEditProduct = (prod) => {
    const prodId = prod.id || prod._id;
    setEditingId(prodId);
    setFormId(prodId || '');
    setFormName(prod.name || '');
    setFormPrice(prod.price !== undefined ? prod.price : '');
    setFormCategory(prod.category || 'مطبخ');
    setFormImage(prod.image || '');
    setFormImagesInput(Array.isArray(prod.images) ? prod.images.join(', ') : '');
    setFormStock(prod.stock !== undefined ? String(prod.stock) : '10');
    setFormFeatured(prod.featured || false);
    setFormDescription(prod.description || '');

    if (Array.isArray(prod.colorsList) && prod.colorsList.length > 0) {
      setFormColorsList(prod.colorsList);
    } else if (prod.colorName) {
      setFormColorsList([{ name: prod.colorName, hex: prod.color || '#ef4444' }]);
    } else {
      setFormColorsList([{ name: 'أحمر', hex: '#ef4444' }]);
    }

    setIsAddingProduct(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetProductForm = () => {
    setEditingId(null);
    setFormId('');
    setFormName('');
    setFormPrice('');
    setFormCategory('مطبخ');
    setFormImage('');
    setFormImagesInput('');
    setFormStock('10');
    setFormFeatured(false);
    setFormDescription('');
    setFormColorsList([{ name: 'أحمر', hex: '#ef4444' }]);
    setIsAddingProduct(false);
  };

  const handleDeleteProduct = (id) => {
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا المنتج؟')) return;
    fetch(`https://karamstores.onrender.com/api/products/${id}`, { 
      method: 'DELETE',
      headers: getAuthHeaders()
    })
      .then(res => {
        if (!res.ok) throw new Error('فشل في حذف المنتج');
        fetchData();
        alert('تم حذف المنتج بنجاح!');
      })
      .catch(err => {
        console.error('خطأ في حذف المنتج:', err);
        alert('تعذر حذف المنتج.');
      });
  };

  // --- STATE-PRESERVING STATUS UPDATES ---
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    fetch(`https://karamstores.onrender.com/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(() => {
        setOrders(prevOrders => prevOrders.map(ord => {
          const id = ord.id || ord._id;
          if (String(id) === String(orderId)) {
            return { ...ord, status: newStatus };
          }
          return ord;
        }));
      })
      .catch(err => console.error('خطأ في تحديث الحالة:', err));
  };

  const handleDeleteOrder = (orderId) => {
    if (!window.confirm(`هل أنت متأكد أنك تريد حذف الطلب #${orderId}؟`)) return;
    fetch(`https://karamstores.onrender.com/api/orders/${orderId}`, { 
      method: 'DELETE',
      headers: getAuthHeaders()
    })
      .then(res => {
        if (!res.ok) throw new Error('فشل في حذف الطلب');
        setOrders(prev => prev.filter(o => String(o.id || o._id) !== String(orderId)));
        alert('تم حذف الطلب بنجاح!');
      })
      .catch(err => console.error('خطأ في حذف الطلب:', err));
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
      headers: getAuthHeaders(),
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
        alert('تم تحديث الطلب بنجاح!');
      })
      .catch(err => console.error('خطأ في تحديث الطلب:', err));
  };

  // --- SETTINGS ---
  const handleUpdateSettings = (e) => {
    e.preventDefault();
    fetch('https://karamstores.onrender.com/api/settings', {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        deliveryFee: parseFloat(ammanFee),
        irbidDeliveryFee: parseFloat(irbidFee),
        discountCodes: settings.discountCodes
      })
    })
      .then(res => res.json())
      .then(data => {
        setSettings(data.storeSettings || data);
        alert('تم تحديث إعدادات المتجر ورسوم التوصيل الإقليمية بنجاح!');
      })
      .catch(err => console.error('خطأ في تحديث الإعدادات:', err));
  };

  const handleAddPromoCode = () => {
    if (!newPromoCode.trim() || !newPromoVal) return;
    const updatedCodes = { ...settings.discountCodes, [newPromoCode.trim().toUpperCase()]: parseFloat(newPromoVal) };
    
    fetch('https://karamstores.onrender.com/api/settings', {
      method: 'PATCH',
      headers: getAuthHeaders(),
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
        alert('تمت إضافة رمز الخصم!');
      });
  };

  const handleRemovePromoCode = (codeKey) => {
    const updatedCodes = { ...settings.discountCodes };
    delete updatedCodes[codeKey];

    fetch('https://karamstores.onrender.com/api/settings', {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        deliveryFee: settings.deliveryFee,
        irbidDeliveryFee: settings.irbidDeliveryFee,
        discountCodes: updatedCodes
      })
    })
      .then(res => res.json())
      .then(data => setSettings(data.storeSettings || data));
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

  // --- ADMIN PIN AUTH SCREEN ---
  if (!isAdminAuthenticated) {
    return (
      <div dir="rtl" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#1c1b1b', color: '#FFF7EE', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: '#2D2C2C', padding: '2.5rem', borderRadius: '16px', border: '1px solid rgba(253,113,0,0.4)', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
          <h2 style={{ color: '#FD7100', margin: '0 0 0.5rem 0' }}>حماية لوحة التحكم</h2>
          <p style={{ opacity: 0.7, fontSize: '0.85rem', marginBottom: '1.5rem' }}>يرجى إدخال رمز المرور الإداري (PIN) للوصول إلى لوحة التحكم والمخزون.</p>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            if (adminPinInput === ADMIN_PIN) {
              setIsAdminAuthenticated(true);
            } else {
              alert('رمز المرور غير صحيح.');
              setAdminPinInput('');
            }
          }}>
            <input 
              type="password"
              placeholder="أدخل رمز المرور..."
              value={adminPinInput}
              onChange={e => setAdminPinInput(e.target.value)}
              autoFocus
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE', fontSize: '1.1rem', textAlign: 'center', letterSpacing: '4px', marginBottom: '1rem' }}
            />
            <button type="submit" style={{ width: '100%', background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
              دخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ padding: '2rem', background: '#1c1b1b', color: '#FFF7EE', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', textAlign: 'right' }}>
      
      {/* HEADER & FINANCIAL METRICS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,247,238,0.2)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#FD7100' }}>لوحة تحكم كرم ستورز</h1>
          <p style={{ margin: '0.2rem 0 0 0', opacity: 0.7, fontSize: '0.9rem' }}>مركز التحكم المؤسسي ({products.length} منتج محمل)</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1.2rem', background: '#2D2C2C', padding: '0.8rem 1.2rem', borderRadius: '10px', border: '1px solid rgba(255,247,238,0.1)', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.7rem', opacity: 0.7, display: 'block' }}>إجمالي الطلبات</span>
            <strong style={{ fontSize: '1.05rem' }}>{orders.length}</strong>
          </div>
          <div style={{ borderRight: '1px solid rgba(255,247,238,0.2)', paddingRight: '1rem' }}>
            <span style={{ fontSize: '0.7rem', opacity: 0.7, display: 'block' }}>إجمالي الإيرادات</span>
            <strong style={{ fontSize: '1.05rem', color: '#4ade80' }}>{totalRevenue.toFixed(2)} دينار</strong>
          </div>
          <div style={{ borderRight: '1px solid rgba(255,247,238,0.2)', paddingRight: '1rem' }}>
            <span style={{ fontSize: '0.7rem', opacity: 0.7, display: 'block' }}>دخل الشهر ({monthlyStats.currentMonthKey})</span>
            <strong style={{ fontSize: '1.05rem', color: '#60a5fa' }}>{monthlyStats.monthRev.toFixed(2)} دينار ({monthlyStats.monthCount} طلب)</strong>
          </div>
          <div style={{ borderRight: '1px solid rgba(255,247,238,0.2)', paddingRight: '1rem' }}>
            <span style={{ fontSize: '0.7rem', opacity: 0.7, display: 'block' }}>مخزون منخفض</span>
            <strong style={{ fontSize: '1.05rem', color: lowStockProducts.length > 0 ? '#ef4444' : '#4ade80' }}>{lowStockProducts.length}</strong>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('orders')} style={{ padding: '0.7rem 1.2rem', background: activeTab === 'orders' ? '#FD7100' : '#2D2C2C', color: '#FFF7EE', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          📋 الطلبات ({orders.length})
        </button>
        <button onClick={() => setActiveTab('inventory')} style={{ position: 'relative', padding: '0.7rem 1.2rem', background: activeTab === 'inventory' ? '#FD7100' : '#2D2C2C', color: '#FFF7EE', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          📦 جدول المخزون والقوالب ({products.length})
          {lowStockProducts.length > 0 && (
            <span style={{ position: 'absolute', top: '-6px', left: '-6px', background: '#ef4444', color: '#fff', borderRadius: '50%', padding: '0.1rem 0.5rem', fontSize: '0.7rem', fontWeight: 'bold' }}>
              {lowStockProducts.length}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab('settings')} style={{ padding: '0.7rem 1.2rem', background: activeTab === 'settings' ? '#FD7100' : '#2D2C2C', color: '#FFF7EE', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          ⚙️ التوصيل الإقليمي والخصومات
        </button>
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div style={{ background: '#2D2C2C', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,247,238,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0, color: '#FD7100' }}>📋 طلبات العملاء</h3>
            
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="البحث بالاسم، الهاتف، المعرف..." 
                value={orderSearchQuery} 
                onChange={e => setOrderSearchQuery(e.target.value)}
                style={{ padding: '0.5rem 0.8rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE', fontSize: '0.85rem', textAlign: 'right' }}
              />
              <select 
                value={orderStatusFilter} 
                onChange={e => setOrderStatusFilter(e.target.value)}
                style={{ padding: '0.5rem 0.8rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE', fontWeight: 'bold', fontSize: '0.85rem' }}
              >
                <option value="ALL">جميع الحالات</option>
                <option value="Pending">قيد الانتظار (Pending)</option>
                <option value="Processing">قيد المعالجة (Processing)</option>
                <option value="Shipped">تم الشحن (Shipped)</option>
                <option value="Delivered">تم التوصيل (Delivered)</option>
                <option value="Cancelled">ملغي (Cancelled)</option>
              </select>
            </div>
          </div>

          {/* BATCH ACTIONS & MANIFEST EXPORT TOOLBAR */}
          <div style={{ background: '#242323', padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', border: '1px solid rgba(255,247,238,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                <input 
                  type="checkbox" 
                  onChange={toggleSelectAllOrders}
                  checked={sortedOrders.length > 0 && selectedOrderIds.length === sortedOrders.length}
                  style={{ width: '16px', height: '16px', accentColor: '#FD7100' }}
                />
                تحديد الكل ({selectedOrderIds.length} محدد)
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <select 
                  value={batchStatusTarget} 
                  onChange={e => setBatchStatusTarget(e.target.value)}
                  style={{ padding: '0.4rem', borderRadius: '6px', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)', fontSize: '0.8rem' }}
                >
                  <option value="Pending">قيد الانتظار</option>
                  <option value="Processing">قيد المعالجة</option>
                  <option value="Shipped">تم الشحن</option>
                  <option value="Delivered">تم التوصيل</option>
                  <option value="Cancelled">ملغي</option>
                </select>
                <button 
                  onClick={handleBatchStatusUpdate}
                  disabled={selectedOrderIds.length === 0}
                  style={{ background: selectedOrderIds.length > 0 ? '#3b82f6' : '#555', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: selectedOrderIds.length > 0 ? 'pointer' : 'not-allowed', fontSize: '0.8rem', fontWeight: 'bold' }}
                >
                  ⚡ تحديث جماعي للحالة
                </button>
              </div>
            </div>

            <button 
              onClick={handleExportDeliveryManifest}
              style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
            >
              📄 تصدير كشف التوصيل (CSV)
            </button>
          </div>
          
          {sortedOrders.length === 0 ? (
            <p style={{ opacity: 0.6, textAlign: 'center', padding: '2rem 0' }}>لم يتم العثور على طلبات مطابقة.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sortedOrders.map(ord => {
                const ordId = String(ord.id || ord._id);
                const isSelected = selectedOrderIds.includes(ordId);
                const statusColor = ord.status === 'Shipped' || ord.status === 'Delivered' ? '#4ade80' : ord.status === 'Processing' ? '#facc15' : '#60a5fa';
                
                return (
                  <div key={ordId} style={{ background: '#242323', padding: '1.2rem', borderRadius: '10px', border: isSelected ? '2px solid #FD7100' : '1px solid rgba(255,247,238,0.15)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', borderBottom: '1px solid rgba(255,247,238,0.1)', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleSelectSingleOrder(ordId)}
                          style={{ width: '16px', height: '16px', accentColor: '#FD7100', cursor: 'pointer' }}
                        />
                        <div>
                          <strong style={{ fontSize: '1rem', color: '#FD7100' }}>طلب #{ordId}</strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.6 }}>{new Date(ord.createdAt || Date.now()).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '10px', border: `1px solid ${statusColor}`, color: statusColor, fontWeight: 'bold' }}>{ord.status || 'Pending'}</span>
                        <select 
                          value={ord.status || 'Pending'} 
                          onChange={e => handleUpdateOrderStatus(ordId, e.target.value)}
                          style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          <option value="Pending">قيد الانتظار</option>
                          <option value="Processing">قيد المعالجة</option>
                          <option value="Shipped">تم الشحن</option>
                          <option value="Delivered">تم التوصيل</option>
                          <option value="Cancelled">ملغي</option>
                        </select>
                      </div>
                    </div>

                    {ord.customer && (
                      <div style={{ fontSize: '0.85rem', marginBottom: '0.8rem', opacity: 0.9, background: 'rgba(255,247,238,0.03)', padding: '0.6rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <p style={{ margin: '0 0 0.2rem 0' }}>👤 <strong>الاسم:</strong> {ord.customer.arabicName}</p>
                          <p style={{ margin: '0 0 0.2rem 0' }}>📞 <strong>الهاتف:</strong> {ord.customer.phone1}</p>
                          <p style={{ margin: 0 }}>📍 <strong>العنوان:</strong> {ord.customer.manualAddress}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button onClick={() => { setEditingOrder(ord); setEditArabicName(ord.customer.arabicName || ''); setEditPhone(ord.customer.phone1 || ''); setEditAddress(ord.customer.manualAddress || ''); setEditItems(ord.items ? [...ord.items] : []); }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            ✏️ تعديل كامل
                          </button>
                          <button onClick={() => handlePrintReceipt(ord)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            🖨️ طباعة الإيصال
                          </button>
                          <button onClick={() => handleDeleteOrder(ordId)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            🗑️ حذف الطلب
                          </button>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                        عدد المنتجات: <strong>{ord.items ? ord.items.reduce((s, i) => s + i.quantity, 0) : 0}</strong>
                      </span>
                      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', color: '#FD7100', fontSize: '0.95rem' }}>
                          المجموع: {Number(ord.grandTotal || ord.total || 0).toFixed(2)} دينار
                        </span>
                        <button onClick={() => setSelectedOrder(ord)} style={{ background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.4rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          🔍 عرض التفاصيل
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

      {/* TAB 2: INVENTORY & MULTI-COLOR PRODUCT FORM */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* BARCODE SCANNER QUICK LOOKUP MODE */}
          <div style={{ background: '#2D2C2C', padding: '1.2rem 1.5rem', borderRadius: '12px', border: '2px dashed #FD7100' }}>
            <h3 style={{ margin: '0 0 0.4rem 0', color: '#FD7100', fontSize: '1.05rem' }}>⚡ وضع ماسح الباركود السريع (Barcode Scanner Mode)</h3>
            <p style={{ margin: '0 0 0.8rem 0', fontSize: '0.8rem', opacity: 0.7 }}>
              قم بتوصيل قارئ الباركود (مثل Honeywell Voyager 1250g) وامسح أي منتج لجلب بياناته وتعديله فوراً.
            </p>
            <form onSubmit={handleBarcodeScanSubmit} style={{ display: 'flex', gap: '0.6rem' }}>
              <input 
                type="text"
                ref={barcodeInputRef}
                placeholder="امسح الباركود هنا أو أدخله يدوياً واضغط Enter..."
                value={barcodeScanInput}
                onChange={e => setBarcodeScanInput(e.target.value)}
                style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE', fontFamily: 'monospace', fontSize: '0.95rem' }}
              />
              <button type="submit" style={{ background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.7rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                🔍 بحث بالباركود
              </button>
            </form>
          </div>

          {/* CSV STAGING / PREVIEW MODAL OR SECTION */}
          {stagedCsvProducts && (
            <div style={{ background: '#2D2C2C', padding: '1.5rem', borderRadius: '12px', border: '2px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#3b82f6' }}>📋 معاينة واستعراض ملف CSV قبل الاعتماد ({stagedCsvProducts.length} منتج)</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={confirmStagedImport} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    ✅ تأكيد واعتماد الاستيراد
                  </button>
                  <button onClick={() => setStagedCsvProducts(null)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    ❌ إلغاء
                  </button>
                </div>
              </div>
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'right' }}>
                  <thead>
                    <tr style={{ background: '#242323', color: '#3b82f6' }}>
                      <th style={{ padding: '0.5rem' }}>الباركود</th>
                      <th style={{ padding: '0.5rem' }}>الاسم</th>
                      <th style={{ padding: '0.5rem' }}>السعر</th>
                      <th style={{ padding: '0.5rem' }}>الفئة</th>
                      <th style={{ padding: '0.5rem' }}>المخزون</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stagedCsvProducts.map((p, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,247,238,0.1)' }}>
                        <td style={{ padding: '0.5rem', fontFamily: 'monospace' }}>{p.id}</td>
                        <td style={{ padding: '0.5rem' }}>{p.name}</td>
                        <td style={{ padding: '0.5rem' }}>{p.price} دينار</td>
                        <td style={{ padding: '0.5rem' }}>{p.category}</td>
                        <td style={{ padding: '0.5rem' }}>{p.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: '#2D2C2C', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,247,238,0.2)' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#FD7100', fontSize: '1.1rem' }}>📄 قوالب CSV والاستيراد/التصدير</h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', opacity: 0.7, lineHeight: '1.4' }}>
                قم بتنزيل قالب CSV، عدله عبر إكسل، ثم ارفعه للمعاينة والاعتماد.
              </p>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                <button onClick={handleDownloadCsvTemplate} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                  📥 تنزيل قالب CSV
                </button>
                <label style={{ background: '#3b82f6', color: '#fff', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', display: 'inline-block' }}>
                  📤 استيراد ملف CSV للمعاينة
                  <input type="file" accept=".csv" onChange={handleImportInventory} style={{ display: 'none' }} />
                </label>
                <button onClick={handleExportInventory} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                  💾 نسخة احتياطية كاملة (CSV)
                </button>
              </div>
            </div>

            {/* RESPONSIVE LOW-STOCK MONITOR */}
            <div style={{ background: '#2D2C2C', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,247,238,0.2)' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#ef4444', fontSize: '1.1rem' }}>⚠️ مراقبة المخزون المنخفض ({lowStockProducts.length})</h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', opacity: 0.7, lineHeight: '1.4' }}>
                المنتجات التي نفذت أو قاربت على النفاد (المخزون ≤ 3).
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {lowStockProducts.length === 0 ? (
                  <span style={{ fontSize: '0.85rem', color: '#4ade80' }}>جميع المنتجات متوفرة بشكل جيد!</span>
                ) : (
                  lowStockProducts.map(p => (
                    <div key={p.id || p._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', background: '#242323', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                      <span>{p.name}</span>
                      <strong style={{ color: '#ef4444' }}>المخزون: {p.stock}</strong>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div style={{ background: '#2D2C2C', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,247,238,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ margin: 0, color: '#FD7100' }}>📦 جدول المخزون ({filteredProducts.length} منتج معروض)</h3>
              
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={() => { resetProductForm(); setIsAddingProduct(true); }} style={{ background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                  ➕ إضافة منتج جديد
                </button>
                <input 
                  type="text" 
                  placeholder="البحث في المنتجات..." 
                  value={productSearchQuery} 
                  onChange={e => setProductSearchQuery(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE', fontSize: '0.85rem', width: '200px', textAlign: 'right' }}
                />
                <select 
                  value={productCategoryFilter} 
                  onChange={e => setProductCategoryFilter(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE', fontWeight: 'bold', fontSize: '0.85rem' }}
                >
                  <option value="ALL">جميع الفئات</option>
                  <option value="Cleaning">تنظيف</option>
                  <option value="Furniture">أثاث</option>
                  <option value="Makeup">مكياج</option>
                  <option value="Gifts">هدايا</option>
                  <option value="Kitchen">مطبخ</option>
                </select>
              </div>
            </div>

            {/* PRODUCT EDIT / ADD FORM WITH MULTI-COLOR DROPDOWN BUILDER */}
            {isAddingProduct && (
              <div style={{ background: '#242323', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid #FD7100' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#FD7100' }}>{editingId ? `✏️ تعديل باركود/معرف المنتج: ${editingId}` : '➕ إضافة منتج جديد'}</h4>
                <form onSubmit={handleSaveProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>الباركود / معرف المنتج (اختياري)</label>
                    <input type="text" value={formId} onChange={e => setFormId(e.target.value)} placeholder="اتركه فارغاً للتوليد التلقائي" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)', textAlign: 'right' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>اسم المنتج *</label>
                    <input type="text" value={formName} onChange={e => setFormName(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)', textAlign: 'right' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>السعر (دينار) *</label>
                    <input type="number" step="0.01" value={formPrice} onChange={e => setFormPrice(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)', textAlign: 'right' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>الفئة *</label>
                    <select value={formCategory} onChange={e => setFormCategory(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)' }}>
                      <option value="Cleaning">تنظيف</option>
                      <option value="Furniture">أثاث</option>
                      <option value="Makeup">مكياج</option>
                      <option value="Gifts">هدايا</option>
                      <option value="Kitchen">مطبخ</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>كمية المخزون</label>
                    <input type="number" value={formStock} onChange={e => setFormStock(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)', textAlign: 'right' }} />
                  </div>

                  {/* MULTI-COLOR SELECTOR WITH POPULAR DROPDOWN */}
                  <div style={{ gridColumn: 'span 2', background: '#2D2C2C', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,247,238,0.15)' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', color: '#FD7100' }}>🎨 ألوان المنتج المتوفرة (أضف لوناً أو أكثر)</label>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                      <select 
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) return;
                          const found = popularColors.find(c => c.name === val);
                          if (found) {
                            handleAddColorToList(found.name, found.hex);
                          }
                          e.target.value = '';
                        }} 
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', background: '#242323', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)' }}
                      >
                        <option value="">-- اختر من الألوان الشائعة --</option>
                        {popularColors.map((col, idx) => (
                          <option key={idx} value={col.name}>{col.name}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input 
                        type="color" 
                        value={customColorHex} 
                        onChange={e => setCustomColorHex(e.target.value)} 
                        style={{ width: '40px', height: '36px', border: 'none', background: 'transparent', cursor: 'pointer' }} 
                      />
                      <input 
                        type="text" 
                        placeholder="اسم اللون المخصص (مثال: ذهبي لامع)" 
                        value={customColorName} 
                        onChange={e => setCustomColorName(e.target.value)} 
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', background: '#242323', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)', textAlign: 'right' }} 
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          if (customColorName.trim()) {
                            handleAddColorToList(customColorName.trim(), customColorHex);
                            setCustomColorName('');
                          }
                        }} 
                        style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        إضافة لون
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      {formColorsList.map((col, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#242323', padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(255,247,238,0.2)' }}>
                          <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: col.hex, border: '1px solid #fff' }}></div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{col.name}</span>
                          <button type="button" onClick={() => handleRemoveColorFromList(idx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>رابط الصورة الرئيسية</label>
                    <input type="text" value={formImage} onChange={e => setFormImage(e.target.value)} placeholder="/icons/... أو https://..." style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)' }} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>روابط الصور الإضافية (تفصل بينها بفواصل)</label>
                    <input type="text" value={formImagesInput} onChange={e => setFormImagesInput(e.target.value)} placeholder="https://img1.com/a.jpg, https://img2.com/b.jpg" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)' }} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>الوصف والمميزات</label>
                    <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} rows="3" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)', textAlign: 'right' }} />
                  </div>
                  <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" id="featuredCheck" checked={formFeatured} onChange={e => setFormFeatured(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#FD7100' }} />
                    <label htmlFor="featuredCheck" style={{ fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>⭐ تثبيت كمنتج مميز في الشريط العلوي</label>
                  </div>
                  <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button type="submit" style={{ background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{editingId ? 'تحديث المنتج' : 'حفظ المنتج'}</button>
                    <button type="button" onClick={resetProductForm} style={{ background: '#555', color: '#FFF7EE', border: 'none', padding: '0.7rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}>إلغاء</button>
                  </div>
                </form>
              </div>
            )}

            {/* PRODUCT TABLE VIEW */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#242323', borderBottom: '1px solid rgba(255,247,238,0.2)', color: '#FD7100' }}>
                    <th style={{ padding: '0.8rem' }}>الباركود / المعرف</th>
                    <th style={{ padding: '0.8rem' }}>اسم المنتج</th>
                    <th style={{ padding: '0.8rem' }}>الفئة</th>
                    <th style={{ padding: '0.8rem' }}>السعر</th>
                    <th style={{ padding: '0.8rem' }}>الألوان</th>
                    <th style={{ padding: '0.8rem' }}>المخزون</th>
                    <th style={{ padding: '0.8rem' }}>مميز</th>
                    <th style={{ padding: '0.8rem', textAlign: 'center' }}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(prod => {
                    const pId = prod.id || prod._id;
                    const colorsArr = Array.isArray(prod.colorsList) && prod.colorsList.length > 0 
                      ? prod.colorsList 
                      : [{ name: prod.colorName || 'افتراضي', hex: prod.color || '#ef4444' }];

                    return (
                      <tr key={pId} style={{ borderBottom: '1px solid rgba(255,247,238,0.1)' }}>
                        <td style={{ padding: '0.8rem', fontFamily: 'monospace', opacity: 0.8, fontSize: '0.75rem' }}>{pId}</td>
                        <td style={{ padding: '0.8rem', fontWeight: 'bold' }}>{prod.name}</td>
                        <td style={{ padding: '0.8rem' }}>
                          <span style={{ fontSize: '0.7rem', background: 'rgba(253,113,0,0.2)', color: '#FD7100', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>{prod.category}</span>
                        </td>
                        <td style={{ padding: '0.8rem', fontWeight: 'bold', color: '#FD7100' }}>{Number(prod.price).toFixed(2)} دينار</td>
                        <td style={{ padding: '0.8rem' }}>
                          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            {colorsArr.map((c, i) => (
                              <div key={i} title={c.name} style={{ width: '14px', height: '14px', borderRadius: '50%', background: c.hex, border: '1px solid #fff' }}></div>
                            ))}
                            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>({colorsArr.length})</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.8rem', fontWeight: 'bold', color: (prod.stock !== undefined ? prod.stock : 10) <= 3 ? '#ef4444' : '#4ade80' }}>
                          {prod.stock !== undefined ? prod.stock : 10}
                        </td>
                        <td style={{ padding: '0.8rem' }}>{prod.featured ? '⭐ نعم' : '-'}</td>
                        <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                            <button onClick={() => startEditProduct(prod)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.35rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>تعديل</button>
                            <button onClick={() => handleDeleteProduct(pId)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.35rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>حذف</button>
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

      {/* TAB 3: SETTINGS & DISCOUNT CODE ANALYTICS */}
      {activeTab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ background: '#2D2C2C', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,247,238,0.2)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#FD7100' }}>🚚 تكوين رسوم التوصيل الإقليمية</h3>
            <form onSubmit={handleUpdateSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>رسوم توصيل عمان (دينار)</label>
                <input type="number" step="0.50" value={ammanFee} onChange={e => setAmmanFee(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE', textAlign: 'right' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>رسوم توصيل إربد والمدن الأخرى (دينار)</label>
                <input type="number" step="0.50" value={irbidFee} onChange={e => setIrbidFee(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE', textAlign: 'right' }} />
              </div>
              <button type="submit" style={{ background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.7rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>حفظ أسعار التوصيل</button>
            </form>
          </div>

          <div style={{ background: '#2D2C2C', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,247,238,0.2)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#FD7100' }}>🎟️ الخصومات ورموز القسائم وتحليلاتها</h3>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input type="text" placeholder="الرمز (مثال: KARAM10)" value={newPromoCode} onChange={e => setNewPromoCode(e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE', textTransform: 'uppercase', textAlign: 'right' }} />
              <input type="number" step="0.05" placeholder="القيمة" value={newPromoVal} onChange={e => setNewPromoVal(e.target.value)} style={{ width: '100px', padding: '0.5rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE', textAlign: 'right' }} />
              <button type="button" onClick={handleAddPromoCode} style={{ background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>إضافة</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '250px', overflowY: 'auto' }}>
              {Object.keys(settings.discountCodes || {}).length === 0 ? (
                <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>لا توجد رموز خصم نشطة.</p>
              ) : (
                Object.entries(settings.discountCodes).map(([code, val]) => {
                  const analytics = promoCodeAnalytics[code] || { count: 0, totalValueGiven: 0 };
                  return (
                    <div key={code} style={{ background: '#242323', padding: '0.7rem 0.9rem', borderRadius: '8px', border: '1px solid rgba(255,247,238,0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <span style={{ fontWeight: 'bold', color: '#4ade80', fontSize: '0.9rem' }}>{code} ({val < 1 ? `خصم ${val * 100}%` : `خصم ${val} دينار`})</span>
                        <button onClick={() => handleRemovePromoCode(code)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>إزالة</button>
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.8, display: 'flex', gap: '1rem' }}>
                        <span>مرات الاستخدام: <strong>{analytics.count}</strong></span>
                        <span>إجمالي الخصومات المقدمة: <strong style={{ color: '#FD7100' }}>{analytics.totalValueGiven.toFixed(2)} دينار</strong></span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div dir="rtl" style={{ background: '#2D2C2C', border: '1px solid rgba(255,247,238,0.2)', borderRadius: '14px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', color: '#FFF7EE', textAlign: 'right' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,247,238,0.2)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#FD7100' }}>🔍 تفاصيل الإيصال الكاملة #{selectedOrder.id || selectedOrder._id}</h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', border: 'none', color: '#FFF7EE', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ background: '#242323', padding: '0.8rem', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 0.3rem 0' }}>📅 <strong>الوقت:</strong> {new Date(selectedOrder.createdAt || Date.now()).toLocaleString()}</p>
                <p style={{ margin: '0 0 0.3rem 0' }}>📌 <strong>الحالة:</strong> {selectedOrder.status || 'Pending'}</p>
              </div>

              {selectedOrder.customer && (
                <div style={{ background: '#242323', padding: '0.8rem', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 0.3rem 0' }}>👤 <strong>الاسم:</strong> {selectedOrder.customer.arabicName}</p>
                  <p style={{ margin: '0 0 0.3rem 0' }}>📞 <strong>الهاتف:</strong> {selectedOrder.customer.phone1}</p>
                  <p style={{ margin: 0 }}>📍 <strong>العنوان:</strong> {selectedOrder.customer.manualAddress}</p>
                </div>
              )}

              <div>
                <strong>المنتجات المطلوبة:</strong>
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                    <div key={idx} style={{ background: '#242323', padding: '0.6rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                        <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.7 }}>
                          {item.selectedSize ? `الحجم: ${item.selectedSize} ` : ''} {item.selectedColor ? `اللون: ${item.selectedColor}` : ''} (الكمية: {item.quantity})
                        </span>
                      </div>
                      <span style={{ fontWeight: 'bold', color: '#FD7100' }}>{(item.price * item.quantity).toFixed(2)} دينار</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#242323', padding: '0.8rem', borderRadius: '8px', borderTop: '1px solid rgba(255,247,238,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span>المجموع الفرعي:</span>
                  <span>{Number(selectedOrder.total || 0).toFixed(2)} دينار</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span>رسوم التوصيل:</span>
                  <span>{Number(selectedOrder.deliveryFee || 2.00).toFixed(2)} دينار</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.05rem', color: '#FD7100', marginTop: '0.4rem', borderTop: '1px solid rgba(255,247,238,0.2)', paddingTop: '0.4rem' }}>
                  <span>المجموع الإجمالي (نقداً):</span>
                  <span>{Number(selectedOrder.grandTotal || selectedOrder.total || 0).toFixed(2)} دينار</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem' }}>
              <button onClick={() => handlePrintReceipt(selectedOrder)} style={{ flex: 1, background: '#10b981', color: '#FFF7EE', border: 'none', padding: '0.7rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>🖨️ طباعة الإيصال</button>
              <button onClick={() => setSelectedOrder(null)} style={{ flex: 1, background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.7rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* FULL EDIT ORDER MODAL */}
      {editingOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div dir="rtl" style={{ background: '#2D2C2C', border: '1px solid rgba(255,247,238,0.2)', borderRadius: '14px', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', color: '#FFF7EE', textAlign: 'right' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#FD7100' }}>✏️ تعديل الطلب #{editingOrder.id || editingOrder._id}</h3>
            
            <form onSubmit={handleSaveEditedOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>اسم العميل (بالعربية)</label>
                <input type="text" value={editArabicName} onChange={e => setEditArabicName(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE', textAlign: 'right' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>رقم هاتف العميل</label>
                <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE', textAlign: 'right' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>عنوان التوصيل</label>
                <textarea value={editAddress} onChange={e => setEditAddress(e.target.value)} rows="2" required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#242323', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE', textAlign: 'right' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>المنتجات والكميات المطلوبة:</label>
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
                      style={{ width: '60px', padding: '0.3rem', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)', borderRadius: '4px', textAlign: 'right' }}
                    />
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#FD7100' }}>{(item.price * item.quantity).toFixed(2)} دينار</span>
                    <button type="button" onClick={() => setEditItems(prev => prev.filter((_, i) => i !== idx))} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button type="submit" style={{ flex: 1, background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.7rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>حفظ كافة التغييرات</button>
                <button type="button" onClick={() => setEditingOrder(null)} style={{ flex: 1, background: '#555', color: '#FFF7EE', border: 'none', padding: '0.7rem', borderRadius: '8px', cursor: 'pointer' }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}