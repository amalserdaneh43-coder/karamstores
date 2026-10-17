import React, { useState, useEffect, useMemo } from 'react';

// Dictionary for English and Arabic translation (including category names for the 3x2 grid)
const translations = {
  en: {
    storeName: "Karam Stores",
    trackOrders: "My Past Orders",
    cart: "Cart",
    searchPlaceholder: "Search store products...",
    completeCatalog: "Complete Product Catalog",
    categoryCatalog: "Category Products",
    searchResults: "Search Results for",
    backToCatalog: "← Back to Store Catalog",
    selectSize: "Select Size:",
    selectColor: "Select Color:",
    addToCart: "Add to Cart",
    outOfStock: "Out of Stock",
    similarOptions: "Similar Options in",
    viewDetails: "View Details",
    cartReview: "Your Shopping Cart & Review",
    emptyCart: "Your cart is empty.",
    subtotal: "Subtotal:",
    deliveryFeeLabel: "Estimated Delivery Fee:",
    discountLabel: "Discount Code:",
    applyPromo: "Apply",
    totalAmount: "Total Amount:",
    orderNow: "Order Now!",
    whatsappCheckout: "💬 WhatsApp",
    customerInfo: "Customer Delivery & Information",
    arabicNameLabel: "Full Name in Arabic (الاسم الكامل بالعربية) *",
    arabicNamePlaceholder: "مثال: محمد أحمد علي",
    phoneLabel: "Phone Number (10 digits) *",
    phonePlaceholder: "07XXXXXXXX",
    manualAddressLabel: "Manual Delivery Address (City, Street, Building) *",
    manualAddressPlaceholder: "Enter detailed delivery address...",
    obligatory: "(Obligatory)",
    paymentMethod: "Payment Method",
    cashOnDelivery: "Cash on Delivery (الدفع عند الاستلام)",
    backToCart: "Back to Cart",
    reviewOrder: "Submit Order",
    pastOrdersTitle: "My Past Orders & Receipts",
    noPastOrders: "No past orders found.",
    orderId: "Order ID:",
    status: "Status:",
    totalDue: "Total Due:",
    hideReceipt: "Hide Receipt 📄",
    viewReceipt: "View Receipt 📄",
    officialReceipt: "Official Order Receipt",
    nameArabic: "Name (العربية):",
    phones: "Phone:",
    address: "Address:",
    orderedItems: "Ordered Items:",
    deliveryFee: "Delivery Price:",
    totalToPay: "Total Amount to Pay (Cash):",
    close: "Close",
    printReceipt: "🖨️ Print Receipt",
    // Categories for the grid
    catCleaning: "Cleaning",
    catFurniture: "houseware",
    catMakeup: "Makeup",
    catGifts: "Gifts",
    catKitchen: "Kitchen",
    catMore: "More",
    // Mobile navigation labels
    navHome: "Home",
    navSearch: "Search",
    navCart: "Cart",
    navOrders: "Orders"
  },
  ar: {
    storeName: "كرم ستورز",
    trackOrders: "طلباتي",
    cart: "السلة",
    searchPlaceholder: "ابحث عن منتجات المتجر...",
    completeCatalog: "كتالوج المنتجات الكامل",
    categoryCatalog: "منتجات الفئة",
    searchResults: "نتائج البحث عن",
    backToCatalog: "← العودة إلى الكتالوج",
    selectSize: "اختر المقاس:",
    selectColor: "اختر اللون:",
    addToCart: "أضف إلى السلة",
    outOfStock: "غير متوفر في المخزون",
    similarOptions: "خيارات مشابهة في",
    viewDetails: "عرض التفاصيل",
    cartReview: "سلة التسوق والمراجعة",
    emptyCart: "سلة التسوق فارغة.",
    subtotal: "المجموع الفرعي:",
    deliveryFeeLabel: "رسوم التوصيل المقدرة:",
    discountLabel: "كود الخصم:",
    applyPromo: "تطبيق",
    totalAmount: "المبلغ الإجمالي:",
    orderNow: "اطلب الان!",
    whatsappCheckout: "💬 واتساب",
    customerInfo: "معلومات العميل والتوصيل",
    arabicNameLabel: "الاسم الكامل بالعربية *",
    arabicNamePlaceholder: "مثال: محمد أحمد علي",
    phoneLabel: "رقم الهاتف (10 أرقام) *",
    phonePlaceholder: "07XXXXXXXX",
    manualAddressLabel: "عنوان التوصيل اليدوي (المدينة، الشارع، المبنى) *",
    manualAddressPlaceholder: "أدخل تفاصيل عنوان التوصيل...",
    obligatory: "(إلزامي)",
    paymentMethod: "طريقة الدفع",
    cashOnDelivery: "الدفع عند الاستلام",
    backToCart: "العودة إلى السلة",
    reviewOrder: "إرسال الطلب",
    pastOrdersTitle: "طلباتي السابقة والإيصالات",
    noPastOrders: "لم يتم العثور على طلبات سابقة.",
    orderId: "رقم الطلب:",
    status: "الحالة:",
    totalDue: "المبلغ المستحق:",
    hideReceipt: "إخفاء الإيصال 📄",
    viewReceipt: "عرض الإيصال 📄",
    officialReceipt: "إيصال الطلب الرسمي",
    nameArabic: "الاسم (العربية):",
    phones: "رقم الهاتف:",
    address: "العنوان:",
    orderedItems: "المنتجات المطلوبة:",
    deliveryFee: "سعر التوصيل:",
    totalToPay: "المبلغ الإجمالي للدفع (نقداً):",
    close: "إغلاق",
    printReceipt: "🖨️ طباعة الإيصال",
    // Categories for the grid
    catCleaning: "التنظيف",
    catFurniture: "الأثاث",
    catMakeup: "مكياج",
    catGifts: "هدايا",
    catKitchen: "المطبخ",
    catMore: "المزيد",
    // Mobile navigation labels
    navHome: "الرئيسية",
    navSearch: "البحث",
    navCart: "السلة",
    navOrders: "الطلبات"
  }
};

function StoreApp() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  
  const [catalogSearch, setCatalogSearch] = useState('');
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false); 
  const [selectedCategoryView, setSelectedCategoryView] = useState(null);

  const [lang, setLang] = useState('ar'); 
  const [storeSettings, setStoreSettings] = useState({ deliveryFee: 3.00, discountCodes: {} });
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };
  
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);
  const [discountValue, setDiscountValue] = useState(0);

  const [checkoutMessage, setCheckoutMessage] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState('');

  const [arabicName, setArabicName] = useState('');
  const [phone, setPhone] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [paymentMethod] = useState('Cash');

  const [allOrders, setAllOrders] = useState([]);
  const [expandedReceiptId, setExpandedReceiptId] = useState(null);

  const fetchProducts = () => {
    fetch('https://karamstores.onrender.com/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error fetching products:', err));
  };

  const fetchOrders = () => {
    fetch('https://karamstores.onrender.com/api/orders')
      .then(res => res.json())
      .then(data => setAllOrders(data))
      .catch(err => console.error('Error fetching orders:', err));
  };

  const fetchSettings = () => {
    fetch('https://karamstores.onrender.com/api/settings')
      .then(res => res.json())
      .then(data => setStoreSettings(data))
      .catch(err => console.error('Error fetching settings:', err));
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchSettings();
    const interval = setInterval(() => {
      fetchProducts();
      fetchOrders();
      fetchSettings();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const openProductDetails = (product) => {
    setSelectedProduct(product);
    setSelectedCategoryView(null);
    setSubmittedSearchQuery('');
    setIsSearchOpen(false);
    setActiveImage(product.image || (product.images && product.images[0]) || '');
    setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : '');
    setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCartFromDetails = () => {
    if (!selectedProduct) return;
    const itemToAdd = {
      ...selectedProduct,
      selectedSize,
      selectedColor
    };
    addToCart(itemToAdd);
    triggerToast(lang === 'ar' ? 'تمت إضافة المنتج إلى السلة بنجاح!' : 'Product added to cart successfully!');
  };

  const addToCart = (product) => {
    setCart(prev => {
      const pId = product.id || product._id;
      const existing = prev.find(item => (item.id || item._id) === pId && item.selectedSize === product.selectedSize && item.selectedColor === product.selectedColor);
      if (existing) {
        return prev.map(item => 
          ((item.id || item._id) === pId && item.selectedSize === product.selectedSize && item.selectedColor === product.selectedColor)
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (index, delta) => {
    setCart(prev => prev.map((item, i) => {
      if (i === index) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = storeSettings.deliveryFee || 3.00;
  const grandTotal = Math.max(0, cartSubtotal + deliveryFee - discountValue);

  const handleApplyDiscount = () => {
    const code = promoInput.trim().toUpperCase();
    const codesMap = storeSettings.discountCodes || {};
    if (codesMap[code] !== undefined) {
      const val = codesMap[code];
      const calculatedDiscount = val < 1 ? cartSubtotal * val : val;
      setDiscountValue(calculatedDiscount);
      setAppliedPromoCode(code);
      triggerToast(lang === 'ar' ? 'تم تطبيق كود الخصم بنجاح!' : 'Discount code applied successfully!', 'success');
    } else {
      triggerToast(lang === 'ar' ? 'كود الخصم غير صالح.' : 'Invalid discount code.', 'error');
    }
  };

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    let text = `New Order from Karam Stores:\n`;
    cart.forEach(i => { text += `- ${i.name} (Qty: ${i.quantity}) - $${(i.price * i.quantity).toFixed(2)}\n`; });
    text += `Subtotal: $${cartSubtotal.toFixed(2)}\nDelivery Fee: $${deliveryFee.toFixed(2)}`;
    if (discountValue > 0) text += `\nDiscount (${appliedPromoCode}): -$${discountValue.toFixed(2)}`;
    text += `\nTotal: $${grandTotal.toFixed(2)}`;
    window.open(`https://wa.me/962000000000?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleOpenCheckoutForm = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!catalogSearch.trim()) return;
    setSubmittedSearchQuery(catalogSearch.trim());
    setSelectedCategoryView(null);
    setSelectedProduct(null);
    setIsSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExecuteOrderSubmission = (e) => {
    e.preventDefault();
    
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      triggerToast(lang === 'ar' ? 'يجب أن يتكون رقم الهاتف من 10 أرقام بالضبط.' : 'Phone number must be exactly 10 digits.', 'error');
      return;
    }

    if (!arabicName.trim() || !manualAddress.trim()) {
      triggerToast(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة.' : 'Please fill out all required fields.', 'error');
      return;
    }

    const orderData = { 
      items: cart, 
      total: cartSubtotal,
      deliveryFee: deliveryFee,
      discountAmount: discountValue,
      grandTotal: grandTotal,
      arabicName: arabicName.trim(),
      phone: phone.trim(),
      address: manualAddress.trim(),
      customer: {
        arabicName: arabicName.trim() || 'N/A',
        phone1: phone.trim() || 'N/A',
        manualAddress: manualAddress.trim() || 'N/A',
        paymentMethod: 'Cash on Delivery'
      }
    };

    fetch('https://karamstores.onrender.com/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    })
      .then(res => {
        if (!res.ok) throw new Error('Checkout failed');
        return res.json();
      })
      .then(data => {
        setCheckoutMessage(lang === 'ar' ? `تم تقديم الطلب بنجاح! رقم الطلب: #${data.order?.id || 'مؤكد'}` : `Order placed successfully! Order ID: #${data.order?.id || 'Confirmed'}`);
        triggerToast(lang === 'ar' ? 'تم إرسال طلبك بنجاح!' : 'Order submitted successfully!', 'success');
        setCart([]);
        setDiscountValue(0);
        setAppliedPromoCode(null);
        setIsCheckoutOpen(false);
        setArabicName('');
        setPhone('');
        setManualAddress('');
        setTimeout(() => setCheckoutMessage(''), 6000);
        fetchProducts();
        fetchOrders();
      })
      .catch(err => console.error('Error during checkout:', err));
  };

  const featuredProducts = products.filter(p => p.featured);

  const searchResultsList = useMemo(() => {
    if (!catalogSearch.trim()) return [];
    return products.filter(p => p.name.toLowerCase().includes(catalogSearch.toLowerCase()) || (p.category && p.category.toLowerCase().includes(catalogSearch.toLowerCase())));
  }, [products, catalogSearch]);

  const sortedSearchResults = useMemo(() => {
    if (!submittedSearchQuery) return [];
    const query = submittedSearchQuery.toLowerCase();
    return products.map(product => {
      let score = 0;
      const name = (product.name || '').toLowerCase();
      const category = (product.category || '').toLowerCase();
      if (name === query) score += 100;
      else if (name.startsWith(query)) score += 75;
      else if (name.includes(query)) score += 50;
      if (category.includes(query)) score += 30;
      return { product, score };
    }).filter(item => item.score > 0).sort((a, b) => b.score - a.score).map(item => item.product);
  }, [products, submittedSearchQuery]);

  const categoryViewProducts = useMemo(() => {
    if (!selectedCategoryView) return [];
    return products.filter(p => p.category && p.category.toLowerCase() === selectedCategoryView.toLowerCase());
  }, [products, selectedCategoryView]);

  const similarProducts = selectedProduct 
    ? products.filter(p => p.category === selectedProduct.category && (p.id || p._id) !== (selectedProduct.id || selectedProduct._id))
    : [];

  const categoriesList = [
    { key: 'Cleaning', labelEn: t.catCleaning, labelAr: t.catCleaning, iconSrc: '/icons/cleaning.png' },
    { key: 'Furniture', labelEn: t.catFurniture, labelAr: t.catFurniture, iconSrc: '/icons/furniture.png' },
    { key: 'Makeup', labelEn: t.catMakeup, labelAr: t.catMakeup, iconSrc: '/icons/makeup.png' },
    { key: 'Gifts', labelEn: t.catGifts, labelAr: t.catGifts, iconSrc: '/icons/gifts.png' },
    { key: 'Kitchen', labelEn: t.catKitchen, labelAr: t.catKitchen, iconSrc: '/icons/kitchen.png' },
    { key: 'More', labelEn: t.catMore, labelAr: t.catMore, iconSrc: '/icons/more.png' },
  ];

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily: "'Plus Jakarta Sans', 'Cairo', system-ui, sans-serif", background: '#242323', color: '#FFF7EE', minHeight: '100vh', margin: 0, paddingBottom: '6rem', textAlign: isRtl ? 'right' : 'left', boxSizing: 'border-box' }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        * { box-sizing: border-box; }
        .store-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .store-card:active {
          transform: scale(0.98);
        }
        .store-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(253, 113, 0, 0.15) !important;
          border-color: #FD7100 !important;
        }
        .cat-circle {
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .cat-circle:active {
          transform: scale(0.95);
        }
        .cat-circle:hover {
          transform: scale(1.05);
          background: #FD7100 !important;
        }
      `}</style>

      {/* Floating Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: toast.type === 'error' ? '#7f1d1d' : '#FD7100',
          color: '#FFF7EE',
          padding: '0.7rem 1.2rem',
          borderRadius: '10px',
          fontWeight: '600',
          fontSize: '0.9rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: '90%',
          maxWidth: '400px',
          justifyContent: 'center'
        }}>
          <span>{toast.type === 'error' ? '⚠️' : '✨'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem', background: 'rgba(36, 35, 35, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 247, 238, 0.15)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div onClick={() => { setSelectedProduct(null); setSelectedCategoryView(null); setSubmittedSearchQuery(''); setCatalogSearch(''); setIsSearchOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
          <img 
            src="/logo.jpg" 
            alt="Logo" 
            style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #FFF7EE' }} 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h2 style={{ margin: 0, fontSize: '1.1rem', letterSpacing: '-0.5px', color: '#FFF7EE', fontWeight: '800' }}>{t.storeName}</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button 
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            style={{ background: 'transparent', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)', padding: '0.4rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.75rem' }}
          >
            {lang === 'en' ? 'العربية' : 'English'}
          </button>

          <button 
            onClick={() => setIsCartOpen(!isCartOpen)}
            style={{ background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.4rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}
          >
            {t.cart} ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </button>
        </div>
      </nav>

      {/* Toggleable Search Bar */}
      {isSearchOpen && (
        <div style={{ background: '#1c1b1b', borderBottom: '1px solid rgba(255,247,238,0.15)', padding: '0.8rem 1rem', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 95 }}>
          <form onSubmit={handleSearchSubmit} style={{ width: '100%', maxWidth: '600px', position: 'relative' }}>
            <input 
              type="text"
              placeholder={t.searchPlaceholder}
              value={catalogSearch}
              autoFocus
              onChange={e => setCatalogSearch(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.7rem 1rem 0.7rem 2.5rem', 
                borderRadius: '10px', 
                border: '1px solid #FD7100', 
                background: '#242323', 
                color: '#FFF7EE', 
                fontSize: '0.9rem', 
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <span style={{ position: 'absolute', left: isRtl ? 'auto' : '0.8rem', right: isRtl ? '0.8rem' : 'auto', top: '50%', transform: 'translateY(-50%)', opacity: 0.8 }}>
              🔍
            </span>

            {catalogSearch.trim() && (
              <div style={{ position: 'absolute', top: '105%', left: 0, width: '100%', background: '#242323', border: '1px solid rgba(255,247,238,0.2)', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.6)', maxHeight: '280px', overflowY: 'auto', zIndex: 110 }}>
                {searchResultsList.length === 0 ? (
                  <div style={{ padding: '0.8rem', textAlign: 'center', opacity: 0.7, fontSize: '0.85rem' }}>{lang === 'ar' ? 'لا توجد منتجات مطابقة' : 'No products found'}</div>
                ) : (
                  searchResultsList.map(prod => (
                    <div 
                      key={prod.id || prod._id} 
                      onClick={() => openProductDetails(prod)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.8rem', borderBottom: '1px solid rgba(255,247,238,0.1)', cursor: 'pointer' }}
                    >
                      <img src={prod.image || 'https://via.placeholder.com/40'} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#FFF7EE' }}>{prod.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: '#FD7100', fontWeight: 'bold' }}>${Number(prod.price).toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </form>
        </div>
      )}

      {/* CONDITIONAL VIEW: PRODUCT DETAILS */}
      {selectedProduct ? (
        <div style={{ width: '92%', maxWidth: '800px', margin: '1.5rem auto', padding: '0' }}>
          <button 
            onClick={() => setSelectedProduct(null)}
            style={{ background: 'transparent', border: 'none', color: '#FFF7EE', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.9rem', opacity: 0.8 }}
          >
            {t.backToCatalog}
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', background: '#242323', padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(255,247,238,0.2)', marginBottom: '2rem' }}>
            <div>
              <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '10px', background: '#242323', marginBottom: '0.8rem', border: '1px solid rgba(255,247,238,0.2)' }}>
                <img 
                  src={activeImage || selectedProduct.image || 'https://via.placeholder.com/400'} 
                  alt={selectedProduct.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
                  {[selectedProduct.image, ...selectedProduct.images].filter(Boolean).map((imgUrl, idx) => (
                    <div key={idx} style={{ width: '50px', height: '50px', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '6px', flexShrink: 0 }}>
                      <img 
                        src={imgUrl} 
                        alt="" 
                        onClick={() => setActiveImage(imgUrl)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', border: activeImage === imgUrl ? '2px solid #FD7100' : '1px solid rgba(255,247,238,0.2)' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <span style={{ background: 'rgba(253, 113, 0, 0.15)', color: '#FD7100', border: '1px solid rgba(253, 113, 0, 0.4)', padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '700' }}>
                {selectedProduct.category || 'General'}
              </span>
              <h1 style={{ margin: '0.5rem 0 0.4rem 0', fontSize: '1.5rem', color: '#FFF7EE', fontWeight: '800' }}>{selectedProduct.name}</h1>
              <p style={{ fontSize: '1.3rem', fontWeight: '800', color: '#FD7100', margin: '0 0 1rem 0' }}>${Number(selectedProduct.price).toFixed(2)}</p>
              
              <p style={{ color: '#FFF7EE', opacity: 0.85, lineHeight: '1.5', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
                {selectedProduct.description || 'High quality product designed for daily convenience.'}
              </p>

              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#FFF7EE', marginBottom: '0.4rem', opacity: 0.9 }}>{t.selectSize}</label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {selectedProduct.sizes.map(size => (
                      <button 
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: selectedSize === size ? '2px solid #FD7100' : '1px solid rgba(255,247,238,0.3)', background: selectedSize === size ? '#FD7100' : '#242323', color: '#FFF7EE', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#FFF7EE', marginBottom: '0.4rem', opacity: 0.9 }}>{t.selectColor}</label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {selectedProduct.colors.map(color => (
                      <button 
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: selectedColor === color ? '2px solid #FD7100' : '1px solid rgba(255,247,238,0.3)', background: selectedColor === color ? '#FD7100' : '#242323', color: '#FFF7EE', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button 
                disabled={selectedProduct.stock <= 0}
                onClick={addToCartFromDetails}
                style={{ background: selectedProduct.stock > 0 ? '#FD7100' : '#555', color: '#FFF7EE', border: 'none', padding: '0.8rem', borderRadius: '8px', cursor: selectedProduct.stock > 0 ? 'pointer' : 'not-allowed', fontWeight: '700', fontSize: '0.95rem', width: '100%', marginTop: '0.5rem', boxShadow: selectedProduct.stock > 0 ? '0 4px 12px rgba(253, 113, 0, 0.3)' : 'none' }}
              >
                {selectedProduct.stock > 0 ? t.addToCart : t.outOfStock}
              </button>
            </div>
          </div>

          {similarProducts.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#FFF7EE', marginBottom: '1rem', fontWeight: '700' }}>{t.similarOptions} {selectedProduct.category}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem' }}>
                {similarProducts.map(simProd => {
                  const sId = simProd.id || simProd._id;
                  return (
                    <div 
                      key={sId} 
                      onClick={() => openProductDetails(simProd)} 
                      className="store-card"
                      style={{ background: '#242323', border: '1px solid rgba(255,247,238,0.2)', borderRadius: '10px', padding: '0.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
                    >
                      <div>
                        <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '6px', marginBottom: '0.5rem', background: '#242323' }}>
                          <img src={simProd.image || 'https://via.placeholder.com/200'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem', color: '#FFF7EE', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '600' }}>{simProd.name}</h4>
                        <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.9rem', fontWeight: '700', color: '#FD7100' }}>${Number(simProd.price).toFixed(2)}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openProductDetails(simProd); }}
                        style={{ background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.75rem', width: '100%' }}
                      >
                        {t.viewDetails}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : submittedSearchQuery ? (
        /* CONDITIONAL VIEW: SEARCH RESULTS */
        <div style={{ width: '92%', maxWidth: '1000px', margin: '1.5rem auto', padding: '0' }}>
          <button 
            onClick={() => setSubmittedSearchQuery('')}
            style={{ background: 'transparent', border: 'none', color: '#FFF7EE', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.9rem', opacity: 0.8 }}
          >
            {t.backToCatalog}
          </button>

          <h2 style={{ fontSize: '1.4rem', color: '#FFF7EE', marginBottom: '1.2rem', fontWeight: '700' }}>
            {t.searchResults} "{submittedSearchQuery}"
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem' }}>
            {sortedSearchResults.length === 0 ? (
              <p style={{ color: '#FFF7EE', opacity: 0.6, padding: '2rem 0', gridColumn: 'span 2', textAlign: 'center' }}>
                {lang === 'ar' ? 'لم يتم العثور على منتجات مطابقة لبحثك.' : 'No matching products found.'}
              </p>
            ) : (
              sortedSearchResults.map(product => {
                const pId = product.id || product._id;
                return (
                  <div key={pId} onClick={() => openProductDetails(product)} className="store-card" style={{ background: '#242323', border: '1px solid rgba(255,247,238,0.2)', borderRadius: '10px', padding: '0.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div>
                      <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '6px', marginBottom: '0.6rem', background: '#242323' }}>
                        <img src={product.image || 'https://via.placeholder.com/260'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <span style={{ background: 'rgba(253, 113, 0, 0.15)', color: '#FD7100', border: '1px solid rgba(253, 113, 0, 0.4)', padding: '0.15rem 0.4rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '700' }}>
                        {product.category || 'General'}
                      </span>
                      <h4 style={{ margin: '0.4rem 0 0.2rem 0', fontSize: '0.9rem', color: '#FFF7EE', fontWeight: '700' }}>{product.name}</h4>
                      <p style={{ margin: '0 0 0.8rem 0', fontSize: '1rem', fontWeight: '800', color: '#FD7100' }}>${Number(product.price).toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); openProductDetails(product); }}
                      style={{ background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', width: '100%', fontSize: '0.8rem' }}
                    >
                      {t.viewDetails}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : selectedCategoryView ? (
        /* CONDITIONAL VIEW: CATEGORY PRODUCTS */
        <div style={{ width: '92%', maxWidth: '1000px', margin: '1.5rem auto', padding: '0' }}>
          <button 
            onClick={() => setSelectedCategoryView(null)}
            style={{ background: 'transparent', border: 'none', color: '#FFF7EE', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.9rem', opacity: 0.8 }}
          >
            {t.backToCatalog}
          </button>

          <h2 style={{ fontSize: '1.4rem', color: '#FFF7EE', marginBottom: '1.2rem', fontWeight: '700' }}>
            {t.categoryCatalog}: {selectedCategoryView}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem' }}>
            {categoryViewProducts.length === 0 ? (
              <p style={{ color: '#FFF7EE', opacity: 0.6, padding: '2rem 0', gridColumn: 'span 2', textAlign: 'center' }}>
                {lang === 'ar' ? 'لا توجد منتجات في هذه الفئة حالياً.' : 'No products found in this category.'}
              </p>
            ) : (
              categoryViewProducts.map(product => {
                const pId = product.id || product._id;
                return (
                  <div key={pId} onClick={() => openProductDetails(product)} className="store-card" style={{ background: '#242323', border: '1px solid rgba(255,247,238,0.2)', borderRadius: '10px', padding: '0.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div>
                      <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '6px', marginBottom: '0.6rem', background: '#242323' }}>
                        <img src={product.image || 'https://via.placeholder.com/260'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <span style={{ background: 'rgba(253, 113, 0, 0.15)', color: '#FD7100', border: '1px solid rgba(253, 113, 0, 0.4)', padding: '0.15rem 0.4rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '700' }}>
                        {product.category || 'General'}
                      </span>
                      <h4 style={{ margin: '0.4rem 0 0.2rem 0', fontSize: '0.9rem', color: '#FFF7EE', fontWeight: '700' }}>{product.name}</h4>
                      <p style={{ margin: '0 0 0.8rem 0', fontSize: '1rem', fontWeight: '800', color: '#FD7100' }}>${Number(product.price).toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); openProductDetails(product); }}
                      style={{ background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', width: '100%', fontSize: '0.8rem' }}
                    >
                      {t.viewDetails}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* STANDARD STOREFRONT HOME */
        <>
          {/* Banner */}
          <div style={{ position: 'relative', width: '100%', height: '260px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <img 
              src="/background.jpg" 
              alt="Banner" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(180deg, rgba(36,35,35,0.2) 0%, rgba(36,35,35,0.85) 100%)', zIndex: 1 }} />

            {featuredProducts.length > 0 && (
              <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', width: '92%', zIndex: 10 }}>
                <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
                  {featuredProducts.map(product => {
                    const pId = product.id || product._id;
                    return (
                      <div key={`slide-${pId}`} onClick={() => openProductDetails(product)} className="store-card" style={{ 
                        minWidth: '200px', 
                        maxWidth: '200px',
                        background: 'rgba(36, 35, 35, 0.92)', 
                        backdropFilter: 'blur(12px)', 
                        border: '1px solid rgba(255,247,238,0.2)', 
                        borderRadius: '12px', 
                        padding: '0.9rem', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}>
                        <div>
                          <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '8px', marginBottom: '0.5rem', background: '#242323' }}>
                            <img src={product.image || 'https://via.placeholder.com/200'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <h4 style={{ margin: '0.3rem 0 0.2rem 0', fontSize: '0.85rem', color: '#FFF7EE', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '700' }}>{product.name}</h4>
                          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#FD7100' }}>${Number(product.price).toFixed(2)}</p>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); openProductDetails(product); }}
                          style={{ marginTop: '0.6rem', background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', width: '100%' }}
                        >
                          {t.viewDetails}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3x2 Grid Categories */}
          <div style={{ width: '92%', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', justifyContent: 'center' }}>
              {categoriesList.map((cat, index) => (
                <div 
                  key={index} 
                  onClick={() => {
                    if (cat.key === 'More') {
                      setSelectedCategoryView(null);
                    } else {
                      setSelectedCategoryView(cat.key);
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', textAlign: 'center' }}
                >
                  <div className="cat-circle" style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#1c1b1b',
                    border: '1px solid rgba(255,247,238,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.4rem',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                  }}>
                    <img 
                      src={cat.iconSrc} 
                      alt={cat.key} 
                      style={{ width: '30px', height: '30px', objectFit: 'contain' }}
                      onError={(e) => { e.target.style.display = 'none'; }} 
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#FFF7EE' }}>
                    {isRtl ? cat.labelAr : cat.labelEn}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Catalog Grid */}
          <div style={{ width: '92%', maxWidth: '1000px', margin: '0 auto' }}>
            {checkoutMessage && (
              <div style={{ background: '#242323', color: '#FD7100', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', border: '1px solid #FD7100' }}>
                {checkoutMessage}
              </div>
            )}

            <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: '#FFF7EE', fontWeight: '700' }}>
              {t.completeCatalog}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem' }}>
              {products.map(product => {
                const pId = product.id || product._id;
                return (
                  <div key={pId} onClick={() => openProductDetails(product)} className="store-card" style={{ background: '#242323', border: '1px solid rgba(255,247,238,0.2)', borderRadius: '10px', padding: '0.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div>
                      <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '6px', marginBottom: '0.6rem', background: '#242323' }}>
                        <img src={product.image || 'https://via.placeholder.com/260'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <span style={{ background: 'rgba(253, 113, 0, 0.15)', color: '#FD7100', border: '1px solid rgba(253, 113, 0, 0.4)', padding: '0.15rem 0.4rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '700' }}>
                        {product.category || 'General'}
                      </span>
                      <h4 style={{ margin: '0.4rem 0 0.2rem 0', fontSize: '0.9rem', color: '#FFF7EE', fontWeight: '700' }}>{product.name}</h4>
                      <p style={{ margin: '0 0 0.8rem 0', fontSize: '1rem', fontWeight: '800', color: '#FD7100' }}>${Number(product.price).toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); openProductDetails(product); }}
                      style={{ background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', width: '100%', fontSize: '0.8rem' }}
                    >
                      {t.viewDetails}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* MOBILE BOTTOM APP NAVIGATION BAR */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '60px',
        background: 'rgba(36, 35, 35, 0.98)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,247,238,0.15)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 900
      }}>
        <button 
          onClick={() => { setSelectedProduct(null); setSelectedCategoryView(null); setSubmittedSearchQuery(''); setIsSearchOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          style={{ background: 'transparent', border: 'none', color: '#FFF7EE', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '600' }}
        >
          <span style={{ fontSize: '1.2rem', marginBottom: '2px' }}>🏠</span>
          {t.navHome}
        </button>

        <button 
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          style={{ background: 'transparent', border: 'none', color: '#FFF7EE', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '600' }}
        >
          <span style={{ fontSize: '1.2rem', marginBottom: '2px' }}>🔍</span>
          {t.navSearch}
        </button>

        <button 
          onClick={() => setIsCartOpen(true)}
          style={{ background: 'transparent', border: 'none', color: '#FFF7EE', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '600', position: 'relative' }}
        >
          <span style={{ fontSize: '1.2rem', marginBottom: '2px' }}>🛒</span>
          {t.navCart}
        </button>

        <button 
          onClick={() => setIsOrderHistoryOpen(true)}
          style={{ background: 'transparent', border: 'none', color: '#FFF7EE', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '600' }}
        >
          <span style={{ fontSize: '1.2rem', marginBottom: '2px' }}>📦</span>
          {t.navOrders}
        </button>
      </div>

      {/* CART MODAL WINDOW */}
      {isCartOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.75)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
          <div dir={isRtl ? 'rtl' : 'ltr'} style={{ background: '#242323', borderTop: '1px solid rgba(255,247,238,0.25)', padding: '1.5rem 1.2rem 2rem 1.2rem', borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 30px rgba(0,0,0,0.6)', color: '#FFF7EE' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,247,238,0.2)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#FFF7EE', fontSize: '1.1rem', fontWeight: '700' }}>{t.cartReview}</h3>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#FFF7EE' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {cart.length === 0 ? (
                <p style={{ color: '#FFF7EE', opacity: 0.6, textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>{t.emptyCart}</p>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,247,238,0.1)', paddingBottom: '0.6rem' }}>
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '6px', flexShrink: 0, border: '1px solid rgba(255,247,238,0.2)' }}>
                        <img src={item.image || 'https://via.placeholder.com/40'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 0.1rem 0', fontSize: '0.85rem', color: '#FFF7EE', fontWeight: '600' }}>{item.name}</h4>
                        <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.7rem', color: '#FFF7EE', opacity: 0.7 }}>
                          {item.selectedSize ? `Size: ${item.selectedSize} ` : ''} 
                          {item.selectedColor ? `Color: ${item.selectedColor}` : ''}
                        </p>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#FD7100' }}>${Number(item.price).toFixed(2)}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255,247,238,0.3)', borderRadius: '6px' }}>
                        <button onClick={() => updateQuantity(idx, -1)} style={{ background: '#242323', color: '#FFF7EE', border: 'none', padding: '0.2rem 0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                        <span style={{ padding: '0 0.4rem', fontSize: '0.85rem', fontWeight: 'bold', color: '#FFF7EE' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(idx, 1)} style={{ background: '#242323', color: '#FFF7EE', border: 'none', padding: '0.2rem 0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                      </div>
                      <button onClick={() => removeFromCart(idx)} style={{ background: '#7f1d1d', color: '#FFF7EE', border: 'none', padding: '0.3rem 0.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(255,247,238,0.2)', paddingTop: '1rem', marginTop: '0.8rem' }}>
                <div style={{ background: '#242323', border: '1px solid rgba(255,247,238,0.2)', borderRadius: '8px', padding: '0.8rem', marginBottom: '0.8rem', fontSize: '0.85rem', color: '#FFF7EE' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ opacity: 0.8 }}>{t.subtotal}</span>
                    <span>\${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ opacity: 0.8 }}>{t.deliveryFeeLabel}</span>
                    <span>\${deliveryFee.toFixed(2)}</span>
                  </div>
                  {discountValue > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', color: '#4ade80' }}>
                      <span>Discount ({appliedPromoCode}):</span>
                      <span>-\${discountValue.toFixed(2)}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.4rem', margin: '0.6rem 0' }}>
                    <input 
                      type="text" 
                      placeholder={t.discountLabel} 
                      value={promoInput} 
                      onChange={e => setPromoInput(e.target.value)} 
                      style={{ flex: 1, padding: '0.4rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(255,247,238,0.3)', background: '#242323', color: '#FFF7EE', textTransform: 'uppercase', fontSize: '0.8rem' }} 
                    />
                    <button 
                      onClick={handleApplyDiscount}
                      style={{ padding: '0.4rem 0.7rem', background: '#FD7100', color: '#FFF7EE', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                    >
                      {t.applyPromo}
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1rem', color: '#FFF7EE', borderTop: '1px solid rgba(255,247,238,0.2)', paddingTop: '0.5rem', marginTop: '0.3rem' }}>
                    <span>{t.totalAmount}</span>
                    <span style={{ color: '#FD7100' }}>\${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button 
                    onClick={handleOpenCheckoutForm}
                    style={{ flex: 1, background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(253, 113, 0, 0.3)' }}
                  >
                    {t.orderNow}
                  </button>
                  <button 
                    onClick={handleWhatsAppCheckout}
                    style={{ background: '#25d366', color: '#fff', border: 'none', padding: '0.8rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}
                  >
                    {t.whatsappCheckout}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* CHECKOUT INFORMATION MODAL */}
      {isCheckoutOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.75)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div dir={isRtl ? 'rtl' : 'ltr'} style={{ background: '#242323', border: '1px solid rgba(255,247,238,0.25)', padding: '1.5rem', borderRadius: '16px', width: '92%', maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', color: '#FFF7EE' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,247,238,0.2)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#FFF7EE', fontSize: '1.1rem', fontWeight: '700' }}>{t.customerInfo}</h3>
              <button onClick={() => setIsCheckoutOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#FFF7EE' }}>✕</button>
            </div>

            <form onSubmit={handleExecuteOrderSubmission} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#FFF7EE', marginBottom: '0.3rem', opacity: 0.9 }}>
                  {t.arabicNameLabel}
                </label>
                <input 
                  type="text" 
                  placeholder={t.arabicNamePlaceholder} 
                  value={arabicName} 
                  onChange={e => setArabicName(e.target.value)} 
                  required 
                  dir="rtl"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,247,238,0.3)', background: '#242323', color: '#FFF7EE', fontSize: '0.9rem', textAlign: 'right' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#FFF7EE', marginBottom: '0.3rem', opacity: 0.9 }}>{t.phoneLabel}</label>
                <input 
                  type="tel" 
                  placeholder={t.phonePlaceholder} 
                  maxLength="10"
                  value={phone} 
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} 
                  required 
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,247,238,0.3)', background: '#242323', color: '#FFF7EE', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#FFF7EE', marginBottom: '0.3rem', opacity: 0.9 }}>
                  {t.manualAddressLabel} <span style={{ color: '#f87171' }}>{t.obligatory}</span>
                </label>
                <textarea 
                  placeholder={t.manualAddressPlaceholder} 
                  value={manualAddress} 
                  onChange={e => setManualAddress(e.target.value)} 
                  rows="3" 
                  required 
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,247,238,0.3)', background: '#242323', color: '#FFF7EE', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#FFF7EE', marginBottom: '0.3rem', opacity: 0.9 }}>{t.paymentMethod}</label>
                <select 
                  value={paymentMethod} 
                  disabled
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,247,238,0.3)', background: '#242323', color: '#FFF7EE', opacity: 0.7, fontWeight: 'bold', fontSize: '0.9rem' }}
                >
                  <option value="Cash">{t.cashOnDelivery}</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.8rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsCheckoutOpen(false)}
                  style={{ flex: 1, background: '#242323', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                >
                  {t.backToCart}
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 1, background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', boxShadow: '0 4px 10px rgba(253, 113, 0, 0.3)' }}
                >
                  {t.reviewOrder}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* PAST ORDERS MODAL */}
      {isOrderHistoryOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.75)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div dir={isRtl ? 'rtl' : 'ltr'} style={{ background: '#242323', border: '1px solid rgba(255,247,238,0.25)', padding: '1.5rem', borderRadius: '16px', width: '92%', maxWidth: '500px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', color: '#FFF7EE' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,247,238,0.2)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#FFF7EE', fontSize: '1.1rem', fontWeight: '700' }}>{t.pastOrdersTitle}</h3>
              <button onClick={() => setIsOrderHistoryOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#FFF7EE' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {allOrders.length === 0 ? (
                <p style={{ color: '#FFF7EE', opacity: 0.6, textAlign: 'center', padding: '2rem 0', fontSize: '0.9rem' }}>{t.noPastOrders}</p>
              ) : (
                allOrders.map(ord => {
                  const oId = ord.id || ord._id;
                  const statusColor = ord.status === 'Shipped' ? '#4ade80' : ord.status === 'Processing' ? '#facc15' : '#60a5fa';
                  const isExpanded = expandedReceiptId === oId;
                  const orderDate = new Date(ord.createdAt || Date.now()).toLocaleString();

                  return (
                    <div key={oId} style={{ border: '1px solid rgba(255,247,238,0.2)', borderRadius: '10px', padding: '1rem', background: '#242323' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#FFF7EE' }}>{t.orderId} #{oId}</span>
                          <span style={{ display: 'block', fontSize: '0.7rem', color: '#FFF7EE', opacity: 0.6 }}>{orderDate}</span>
                        </div>
                        <span style={{ border: '1px solid rgba(255,247,238,0.3)', color: statusColor, padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                          {ord.status || 'Pending'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#FFF7EE' }}>
                          {t.totalDue} <span style={{ color: '#FD7100' }}>\${Number(ord.grandTotal || ord.total || 0).toFixed(2)}</span>
                        </span>
                        <button 
                          onClick={() => setExpandedReceiptId(isExpanded ? null : oId)}
                          style={{ background: '#FD7100', color: '#FFF7EE', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                        >
                          {isExpanded ? t.hideReceipt : t.viewReceipt}
                        </button>
                      </div>

                      {isExpanded && (
                        <div style={{ marginTop: '0.8rem', background: '#242323', border: '1px dashed rgba(255,247,238,0.3)', borderRadius: '8px', padding: '1rem' }}>
                          <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.9rem', color: '#FFF7EE', borderBottom: '1px solid rgba(255,247,238,0.2)', paddingBottom: '0.3rem', fontWeight: '700' }}>
                            {t.officialReceipt}
                          </h4>

                          {ord.customer && (
                            <div style={{ marginBottom: '0.6rem', fontSize: '0.8rem', color: '#FFF7EE', opacity: 0.85, lineHeight: '1.4' }}>
                              <p style={{ margin: '0 0 0.2rem 0' }}><strong>{t.nameArabic}</strong> {ord.customer.arabicName}</p>
                              <p style={{ margin: '0 0 0.2rem 0' }}><strong>{t.phones}</strong> {ord.customer.phone1}</p>
                              <p style={{ margin: '0 0 0.2rem 0' }}><strong>{t.address}</strong> {ord.customer.manualAddress}</p>
                            </div>
                          )}

                          <div style={{ borderTop: '1px solid rgba(255,247,238,0.2)', paddingTop: '0.5rem', marginBottom: '0.6rem' }}>
                            <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.8rem', fontWeight: 'bold', color: '#FFF7EE' }}>{t.orderedItems}</p>
                            {ord.items && ord.items.map((it, i) => (
                              <div key={i} style={{ fontSize: '0.75rem', color: '#FFF7EE', opacity: 0.85, display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                <div>
                                  <span>{it.name} (×{it.quantity})</span>
                                </div>
                                <span style={{ fontWeight: 'bold', color: '#FD7100' }}>\${(it.price * it.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          <div style={{ borderTop: '1px solid rgba(255,247,238,0.2)', paddingTop: '0.5rem', fontSize: '0.8rem', color: '#FFF7EE' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                              <span style={{ opacity: 0.8 }}>{t.subtotal}</span>
                              <span>\${Number(ord.total || 0).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                              <span style={{ opacity: 0.8 }}>{t.deliveryFee}</span>
                              <span>\${Number(ord.deliveryFee || 3.00).toFixed(2)}</span>
                            </div>
                            {ord.discountAmount > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem', color: '#4ade80' }}>
                                <span>Discount:</span>
                                <span>-\${Number(ord.discountAmount).toFixed(2)}</span>
                              </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '0.9rem', marginTop: '0.3rem', borderTop: '1px solid rgba(255,247,238,0.2)', paddingTop: '0.3rem' }}>
                              <span>{t.totalToPay}</span>
                              <span style={{ color: '#FD7100' }}>\${Number(ord.grandTotal || (ord.total + (ord.deliveryFee || 3.00))).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default StoreApp;