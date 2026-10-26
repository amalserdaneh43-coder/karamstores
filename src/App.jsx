import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

const translations = {
  en: {
    storeName: "Karam Stores",
    trackOrders: "My Past Orders",
    cart: "Cart",
    searchPlaceholder: "Search store products...",
    completeCatalog: "Complete Product Catalog",
    categoryCatalog: "Category Products",
    allCategoriesFilter: "All Categories",
    filterByCat: "Filter by Category:",
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
    whatsappCheckout: "💬 Order via WhatsApp",
    customerInfo: "Customer Delivery & Information",
    arabicNameLabel: "Full Name in Arabic (الاسم الكامل بالعربية) *",
    arabicNamePlaceholder: "مثال: محمد أحمد علي",
    phoneLabel: "Phone Number (10 digits) *",
    phonePlaceholder: "07XXXXXXXX",
    cityLabel: "Delivery City *",
    ammanCity: "Amman",
    irbidCity: "Irbid & Other Cities",
    manualAddressLabel: "Manual Delivery Address (Street, Building) *",
    manualAddressPlaceholder: "Enter detailed delivery address...",
    obligatory: "(Obligatory)",
    paymentMethod: "Payment Method",
    cashOnDelivery: "Cash on Delivery (الدفع عند الاستلام)",
    backToCart: "Back to Cart",
    reviewOrder: "Submit Order",
    pastOrdersTitle: "Track My Orders & Receipts",
    lookupPrompt: "Enter your 10-digit phone number to view your order history:",
    lookupBtn: "Search Orders",
    noPastOrders: "No orders found for this phone number.",
    orderId: "Order ID:",
    status: "Status:",
    totalDue: "Total Due:",
    hideReceipt: "Hide Receipt",
    viewReceipt: "View Receipt",
    officialReceipt: "Official Order Receipt",
    nameArabic: "Name (العربية):",
    phones: "Phone:",
    address: "Address:",
    orderedItems: "Ordered Items:",
    deliveryFee: "Delivery Price:",
    totalToPay: "Total Amount to Pay (Cash):",
    close: "Close",
    printReceipt: "🖨️ Print Receipt",
    catCleaning: "Cleaning",
    catFurniture: "houseware",
    catMakeup: "Makeup",
    catGifts: "Gifts",
    catKitchen: "Kitchen",
    catMore: "More",
    navHome: "Home",
    navSearch: "Search",
    navCart: "Cart",
    navOrders: "Orders",
    storeInfoTitle: "Store Information & Delivery",
    storeHours: "Working Hours: 9:00 AM - 10:00 PM (Daily)",
    storeLocation: "Location: Amman, Jordan (Cash on Delivery Available)",
    storeSupport: "Customer Service: 0781794172",
    footerSlogan: "كل ما يلزم المنزل تحت سقف واحد"
  },
  ar: {
    storeName: "كرم ستورز",
    trackOrders: "طلباتي",
    cart: "السلة",
    searchPlaceholder: "ابحث عن منتجات المتجر...",
    completeCatalog: "كتالوج المنتجات الكامل",
    categoryCatalog: "منتجات الفئة",
    allCategoriesFilter: "جميع الفئات",
    filterByCat: "تصفية حسب الفئة:",
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
    whatsappCheckout: "💬 اطلب عبر واتساب",
    customerInfo: "معلومات العميل والتوصيل",
    arabicNameLabel: "الاسم الكامل بالعربية *",
    arabicNamePlaceholder: "مثال: محمد أحمد علي",
    phoneLabel: "رقم الهاتف (10 أرقام) *",
    phonePlaceholder: "07XXXXXXXX",
    cityLabel: "مدينة التوصيل *",
    ammanCity: "عمان",
    irbidCity: "إربد والمحافظات الأخرى",
    manualAddressLabel: "عنوان التوصيل اليدوي (الشارع، المبنى) *",
    manualAddressPlaceholder: "أدخل تفاصيل عنوان التوصيل...",
    obligatory: "(إلزامي)",
    paymentMethod: "طريقة الدفع",
    cashOnDelivery: "الدفع عند الاستلام",
    backToCart: "العودة إلى السلة",
    reviewOrder: "إرسال الطلب",
    pastOrdersTitle: "تتبع طلباتي والإيصالات",
    lookupPrompt: "أدخل رقم هاتفك المكون من 10 أرقام لعرض سجل طلباتك:",
    lookupBtn: "بحث عن الطلبات",
    noPastOrders: "لم يتم العثور على طلبات سابقة لهذا الرقم.",
    orderId: "رقم الطلب:",
    status: "الحالة:",
    totalDue: "المبلغ المستحق:",
    hideReceipt: "إخفاء الإيصال",
    viewReceipt: "عرض الإيصال",
    officialReceipt: "إيصال الطلب الرسمي",
    nameArabic: "Name (العربية):",
    phones: "رقم الهاتف:",
    address: "العنوان:",
    orderedItems: "المنتجات المطلوبة:",
    deliveryFee: "سعر التوصيل:",
    totalToPay: "المبلغ الإجمالي للدفع (نقداً):",
    close: "إغلاق",
    printReceipt: "🖨️ طباعة الإيصال",
    catCleaning: "التنظيف",
    catFurniture: "الأثاث",
    catMakeup: "مكياج",
    catGifts: "هدايا",
    catKitchen: "المطبخ",
    catMore: "المزيد",
    navHome: "الرئيسية",
    navSearch: "البحث",
    navCart: "السلة",
    navOrders: "الطلبات",
    storeInfoTitle: "معلومات المتجر والتوصيل",
    storeHours: "ساعات العمل: 9:00 صباحاً - 10:00 مساءً (يومياً)",
    storeLocation: "الموقع: عمان، الأردن (متوفر الدفع عند الاستلام)",
    storeSupport: "خدمة العملاء: 0781794172",
    footerSlogan: "كل ما يلزم المنزل تحت سقف واحد"
  }
};

export default function StoreApp() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  
  const [catalogSearch, setCatalogSearch] = useState('');
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false); 
  const [selectedCategoryView, setSelectedCategoryView] = useState(null);
  const [isMoreCatalogOpen, setIsMoreCatalogOpen] = useState(false);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('All');

  const [lang, setLang] = useState('ar'); 
  const [storeSettings, setStoreSettings] = useState({ deliveryFee: 2.00, irbidDeliveryFee: 3.50, discountCodes: {} });
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
  const [selectedCity, setSelectedCity] = useState('Amman');
  const [manualAddress, setManualAddress] = useState('');
  const [paymentMethod] = useState('Cash');

  const [allOrders, setAllOrders] = useState([]);
  const [expandedReceiptId, setExpandedReceiptId] = useState(null);
  const [lookupPhone, setLookupPhone] = useState(localStorage.getItem('user_phone') || '');

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
  }, []);

  // --- INTERCEPT MOBILE & BROWSER BACK BUTTON ---
  useEffect(() => {
    const isPopupActive = 
      selectedProduct !== null || 
      selectedCategoryView !== null || 
      isMoreCatalogOpen || 
      submittedSearchQuery !== '' || 
      isCartOpen || 
      isCheckoutOpen || 
      isOrderHistoryOpen ||
      isSearchOpen;

    if (isPopupActive) {
      window.history.pushState({ modalOpen: true }, '');

      const handlePopState = () => {
        setSelectedProduct(null);
        setSelectedCategoryView(null);
        setIsMoreCatalogOpen(false);
        setSubmittedSearchQuery('');
        setIsCartOpen(false);
        setIsCheckoutOpen(false);
        setIsOrderHistoryOpen(false);
        setIsSearchOpen(false);
      };

      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [
    selectedProduct, 
    selectedCategoryView, 
    isMoreCatalogOpen, 
    submittedSearchQuery, 
    isCartOpen, 
    isCheckoutOpen, 
    isOrderHistoryOpen,
    isSearchOpen
  ]);

  const openProductDetails = (product) => {
    window.history.pushState({ modalOpen: true }, '');
    setSelectedProduct(product);
    setSelectedCategoryView(null);
    setIsMoreCatalogOpen(false);
    setSubmittedSearchQuery('');
    setIsSearchOpen(false);
    setActiveImage(product.image || (product.images && product.images[0]) || '');
    setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : '');
    setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCartFromDetails = () => {
    if (!selectedProduct) return;
    addToCart({ ...selectedProduct, selectedSize, selectedColor });
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
  
  const deliveryFee = selectedCity === 'Irbid' 
    ? (storeSettings.irbidDeliveryFee !== undefined ? storeSettings.irbidDeliveryFee : 3.50) 
    : (storeSettings.deliveryFee !== undefined ? storeSettings.deliveryFee : 2.00);

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
    
    let customerPhoneNum = phone.trim() || localStorage.getItem('user_phone') || '';
    if (!customerPhoneNum) {
      customerPhoneNum = prompt(lang === 'ar' ? 'يرجى إدخال رقم هاتفك لتأكيد طلب الواتساب:' : 'Please enter your phone number for WhatsApp checkout:') || '07XXXXXXXX';
    }

    let text = `مرحباً، أود طلب المنتجات التالية من كرم ستورز:\n`;
    text += `📞 رقم الهاتف: ${customerPhoneNum}\n`;
    if (arabicName) text += `👤 الاسم: ${arabicName}\n`;
    text += `📍 المدینة: ${selectedCity}\n`;
    text += `------------------------\n`;
    
    cart.forEach(i => { 
      text += `- ${i.name} (الكمية: ${i.quantity}) - ${(i.price * i.quantity).toFixed(2)} JD\n`; 
    });
    
    text += `------------------------\n`;
    text += `المجموع الفرعي: ${cartSubtotal.toFixed(2)} JD\n`;
    text += `رسوم التوصيل (${selectedCity}): ${deliveryFee.toFixed(2)} JD`;
    if (discountValue > 0) text += `\nالخصم (${appliedPromoCode}): -${discountValue.toFixed(2)} JD`;
    text += `\nالمجموع الإجمالي: ${grandTotal.toFixed(2)} JD`;
    
    window.open(`https://wa.me/962781794172?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!catalogSearch.trim()) return;
    window.history.pushState({ modalOpen: true }, '');
    setSubmittedSearchQuery(catalogSearch.trim());
    setSelectedCategoryView(null);
    setIsMoreCatalogOpen(false);
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

    const trimmedPhone = phone.trim();
    localStorage.setItem('user_phone', trimmedPhone);
    setLookupPhone(trimmedPhone);

    const fullAddressString = `[${selectedCity}] ${manualAddress.trim()}`;

    const orderData = { 
      items: cart, 
      total: cartSubtotal,
      deliveryFee: deliveryFee,
      discountAmount: discountValue,
      grandTotal: grandTotal,
      arabicName: arabicName.trim(),
      phone: trimmedPhone,
      address: fullAddressString,
      customer: {
        arabicName: arabicName.trim() || 'N/A',
        phone1: trimmedPhone || 'N/A',
        manualAddress: fullAddressString || 'N/A',
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

  const moreFilteredProducts = useMemo(() => {
    if (selectedFilterCategory === 'All') return products;
    return products.filter(p => p.category && p.category.toLowerCase() === selectedFilterCategory.toLowerCase());
  }, [products, selectedFilterCategory]);

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

  const myOrders = allOrders.filter(ord => {
    if (!lookupPhone.trim()) return false;
    const ordPhone = ord.customer?.phone1 || ord.phone;
    return String(ordPhone).trim() === String(lookupPhone).trim();
  });

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="store-container">
      
      {toast.show && (
        <div className="toast-notification" style={{ background: toast.type === 'error' ? '#7f1d1d' : '#FD7100' }}>
          <span>{toast.type === 'error' ? '⚠️' : '✨'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <nav className="navbar">
        <div onClick={() => { setSelectedProduct(null); setSelectedCategoryView(null); setIsMoreCatalogOpen(false); setSubmittedSearchQuery(''); setCatalogSearch(''); setIsSearchOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
          <img src="/logo.jpg" alt="Logo" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #FFF7EE' }} onError={(e) => { e.target.style.display = 'none'; }} />
          <h2 style={{ margin: 0, fontSize: '1.1rem', letterSpacing: '-0.5px', color: '#FFF7EE', fontWeight: '800' }}>{t.storeName}</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} style={{ background: 'transparent', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)', padding: '0.4rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.75rem' }}>
            {lang === 'en' ? 'العربية' : 'English'}
          </button>
          <button onClick={() => { window.history.pushState({ modalOpen: true }, ''); setIsCartOpen(!isCartOpen); }} className="btn-primary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}>
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
              className="form-input"
              style={{ paddingLeft: isRtl ? '0.9rem' : '2.5rem', paddingRight: isRtl ? '2.5rem' : '0.9rem' }}
            />
            <span style={{ position: 'absolute', left: isRtl ? 'auto' : '0.8rem', right: isRtl ? '0.8rem' : 'auto', top: '50%', transform: 'translateY(-50%)', opacity: 0.8 }}>🔍</span>

            {catalogSearch.trim() && (
              <div style={{ position: 'absolute', top: '105%', left: 0, width: '100%', background: '#2D2C2C', border: '1px solid rgba(255,247,238,0.2)', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.6)', maxHeight: '280px', overflowY: 'auto', zIndex: 110 }}>
                {searchResultsList.length === 0 ? (
                  <div style={{ padding: '0.8rem', textAlign: 'center', opacity: 0.7, fontSize: '0.85rem' }}>{lang === 'ar' ? 'لا توجد منتجات مطابقة' : 'No products found'}</div>
                ) : (
                  searchResultsList.map(prod => (
                    <div key={prod.id || prod._id} onClick={() => openProductDetails(prod)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.8rem', borderBottom: '1px solid rgba(255,247,238,0.1)', cursor: 'pointer' }}>
                      <img src={prod.image || 'https://via.placeholder.com/40'} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#FFF7EE' }}>{prod.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: '#FD7100', fontWeight: 'bold' }}>{Number(prod.price).toFixed(2)} JD</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </form>
        </div>
      )}

      {/* VIEW: PRODUCT DETAILS */}
      {selectedProduct ? (
        <div style={{ width: '92%', maxWidth: '800px', margin: '1.5rem auto' }}>
          <button onClick={() => window.history.back()} className="back-button">
            {t.backToCatalog}
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', background: '#2D2C2C', padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(255,247,238,0.2)', marginBottom: '2rem' }}>
            <div>
              <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '10px', background: '#242323', marginBottom: '0.8rem', border: '1px solid rgba(255,247,238,0.2)' }}>
                <img src={activeImage || selectedProduct.image || 'https://via.placeholder.com/400'} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
                  {[selectedProduct.image, ...selectedProduct.images].filter(Boolean).map((imgUrl, idx) => (
                    <div key={idx} style={{ width: '50px', height: '50px', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '6px', flexShrink: 0 }}>
                      <img src={imgUrl} alt="" onClick={() => setActiveImage(imgUrl)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', border: activeImage === imgUrl ? '2px solid #FD7100' : '1px solid rgba(255,247,238,0.2)' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <span className="badge-category">{selectedProduct.category || 'General'}</span>
              <h1 style={{ margin: '0.5rem 0 0.4rem 0', fontSize: '1.5rem', color: '#FFF7EE', fontWeight: '800' }}>{selectedProduct.name}</h1>
              <p style={{ fontSize: '1.3rem', fontWeight: '800', color: '#FD7100', margin: '0 0 1rem 0' }}>{Number(selectedProduct.price).toFixed(2)} JD</p>
              
              <p style={{ color: '#FFF7EE', opacity: 0.85, lineHeight: '1.5', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
                {selectedProduct.description || 'High quality product designed for daily convenience.'}
              </p>

              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem' }}>{t.selectSize}</label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {selectedProduct.sizes.map(size => (
                      <button key={size} onClick={() => setSelectedSize(size)} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: selectedSize === size ? '2px solid #FD7100' : '1px solid rgba(255,247,238,0.3)', background: selectedSize === size ? '#FD7100' : '#242323', color: '#FFF7EE', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                <div style={{ marginBottom: '1.2rem' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem' }}>{t.selectColor}</label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {selectedProduct.colors.map(color => (
                      <button key={color} onClick={() => setSelectedColor(color)} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: selectedColor === color ? '2px solid #FD7100' : '1px solid rgba(255,247,238,0.3)', background: selectedColor === color ? '#FD7100' : '#242323', color: '#FFF7EE', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button disabled={selectedProduct.stock <= 0} onClick={addToCartFromDetails} className="btn-primary" style={{ background: selectedProduct.stock > 0 ? '#FD7100' : '#555', width: '100%', marginTop: '0.5rem', cursor: selectedProduct.stock > 0 ? 'pointer' : 'not-allowed' }}>
                {selectedProduct.stock > 0 ? t.addToCart : t.outOfStock}
              </button>
            </div>
          </div>

          {similarProducts.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#FFF7EE', marginBottom: '1rem', fontWeight: '700' }}>{t.similarOptions} {selectedProduct.category}</h3>
              <div className="grid-2col">
                {similarProducts.map(simProd => (
                  <div key={simProd.id || simProd._id} onClick={() => openProductDetails(simProd)} className="store-card">
                    <div>
                      <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '6px', marginBottom: '0.5rem', background: '#242323' }}>
                        <img src={simProd.image || 'https://via.placeholder.com/200'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <h4 className="product-title">{simProd.name}</h4>
                      <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.9rem', fontWeight: '700', color: '#FD7100' }}>{Number(simProd.price).toFixed(2)} JD</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); openProductDetails(simProd); }} className="btn-primary" style={{ width: '100%', padding: '0.4rem', fontSize: '0.75rem' }}>
                      {t.viewDetails}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : submittedSearchQuery ? (
        /* VIEW: SEARCH RESULTS */
        <div style={{ width: '92%', maxWidth: '1000px', margin: '1.5rem auto' }}>
          <button onClick={() => window.history.back()} className="back-button">
            {t.backToCatalog}
          </button>
          <h2 style={{ fontSize: '1.4rem', color: '#FFF7EE', marginBottom: '1.2rem', fontWeight: '700' }}>{t.searchResults} "{submittedSearchQuery}"</h2>
          <div className="grid-2col">
            {sortedSearchResults.length === 0 ? (
              <p style={{ color: '#FFF7EE', opacity: 0.6, padding: '2rem 0', gridColumn: 'span 2', textAlign: 'center' }}>{lang === 'ar' ? 'لم يتم العثور على منتجات مطابقة لبحثك.' : 'No matching products found.'}</p>
            ) : (
              sortedSearchResults.map(product => (
                <div key={product.id || product._id} onClick={() => openProductDetails(product)} className="store-card">
                  <div>
                    <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '6px', marginBottom: '0.6rem', background: '#242323' }}>
                      <img src={product.image || 'https://via.placeholder.com/260'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span className="badge-category">{product.category || 'General'}</span>
                    <h4 className="product-title">{product.name}</h4>
                    <p style={{ margin: '0 0 0.8rem 0', fontSize: '1rem', fontWeight: '800', color: '#FD7100' }}>{Number(product.price).toFixed(2)} JD</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); openProductDetails(product); }} className="btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}>{t.viewDetails}</button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : selectedCategoryView ? (
        /* VIEW: CATEGORY PRODUCTS */
        <div style={{ width: '92%', maxWidth: '1000px', margin: '1.5rem auto' }}>
          <button onClick={() => window.history.back()} className="back-button">{t.backToCatalog}</button>
          <h2 style={{ fontSize: '1.4rem', color: '#FFF7EE', marginBottom: '1.2rem', fontWeight: '700' }}>{t.categoryCatalog}: {selectedCategoryView}</h2>
          <div className="grid-2col">
            {categoryViewProducts.length === 0 ? (
              <p style={{ color: '#FFF7EE', opacity: 0.6, padding: '2rem 0', gridColumn: 'span 2', textAlign: 'center' }}>{lang === 'ar' ? 'لا توجد منتجات في هذه الفئة حالياً.' : 'No products found in this category.'}</p>
            ) : (
              categoryViewProducts.map(product => (
                <div key={product.id || product._id} onClick={() => openProductDetails(product)} className="store-card">
                  <div>
                    <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '6px', marginBottom: '0.6rem', background: '#242323' }}>
                      <img src={product.image || 'https://via.placeholder.com/260'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span className="badge-category">{product.category || 'General'}</span>
                    <h4 className="product-title">{product.name}</h4>
                    <p style={{ margin: '0 0 0.8rem 0', fontSize: '1rem', fontWeight: '800', color: '#FD7100' }}>{Number(product.price).toFixed(2)} JD</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); openProductDetails(product); }} className="btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}>{t.viewDetails}</button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : isMoreCatalogOpen ? (
        /* VIEW: "MORE" FULL STORE EXPLORER & FILTER VIEW */
        <div style={{ width: '92%', maxWidth: '1000px', margin: '1.5rem auto' }}>
          <button onClick={() => window.history.back()} className="back-button">{t.backToCatalog}</button>
          <h2 style={{ fontSize: '1.4rem', color: '#FFF7EE', marginBottom: '1rem', fontWeight: '700' }}>{t.completeCatalog}</h2>

          {/* Category Filter Bar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>{t.filterByCat}</label>
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
              {['All', 'Cleaning', 'Furniture', 'Makeup', 'Gifts', 'Kitchen'].map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedFilterCategory(cat)} 
                  style={{ 
                    padding: '0.4rem 0.9rem', 
                    borderRadius: '8px', 
                    border: selectedFilterCategory === cat ? '2px solid #FD7100' : '1px solid rgba(255,247,238,0.25)', 
                    background: selectedFilterCategory === cat ? '#FD7100' : '#2D2C2C', 
                    color: '#FFF7EE', 
                    fontWeight: '700', 
                    fontSize: '0.8rem', 
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  {cat === 'All' ? t.allCategoriesFilter : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid-2col">
            {moreFilteredProducts.length === 0 ? (
              <p style={{ color: '#FFF7EE', opacity: 0.6, padding: '2rem 0', gridColumn: 'span 2', textAlign: 'center' }}>{lang === 'ar' ? 'لا توجد منتجات في هذه الفئة.' : 'No products found in this category.'}</p>
            ) : (
              moreFilteredProducts.map(product => (
                <div key={product.id || product._id} onClick={() => openProductDetails(product)} className="store-card">
                  <div>
                    <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '6px', marginBottom: '0.6rem', background: '#242323' }}>
                      <img src={product.image || 'https://via.placeholder.com/260'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span className="badge-category">{product.category || 'General'}</span>
                    <h4 className="product-title">{product.name}</h4>
                    <p style={{ margin: '0 0 0.8rem 0', fontSize: '1rem', fontWeight: '800', color: '#FD7100' }}>{Number(product.price).toFixed(2)} JD</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); openProductDetails(product); }} className="btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}>{t.viewDetails}</button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* STANDARD STOREFRONT HOME */
        <>
          {/* Banner & Scrolling Pinned Cards Container */}
          <div style={{ position: 'relative', width: '100%', minHeight: '320px', overflow: 'hidden', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <img src="/background.jpg" alt="Banner" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} onError={(e) => { e.target.style.display = 'none'; }} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(180deg, rgba(36,35,35,0.3) 0%, rgba(36,35,35,0.9) 100%)', zIndex: 1 }} />

            {featuredProducts.length > 0 && (
              <div style={{ position: 'relative', zIndex: 10, width: '92%', maxWidth: '1000px', margin: '0 auto 15px auto' }}>
                <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
                  {featuredProducts.map(product => (
                    <div key={`slide-${product.id || product._id}`} onClick={() => openProductDetails(product)} className="store-card" style={{ minWidth: '190px', maxWidth: '190px', flexShrink: 0, background: 'rgba(45, 44, 44, 0.95)', backdropFilter: 'blur(8px)' }}>
                      <div>
                        <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '8px', marginBottom: '0.5rem', background: '#242323' }}>
                          <img src={product.image || 'https://via.placeholder.com/200'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <h4 className="product-title">{product.name}</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#FD7100' }}>{Number(product.price).toFixed(2)} JD</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); openProductDetails(product); }} className="btn-primary" style={{ marginTop: '0.6rem', width: '100%', padding: '0.4rem', fontSize: '0.75rem' }}>{t.viewDetails}</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3x2 Grid Categories */}
          <div style={{ width: '92%', maxWidth: '600px', margin: '0 auto 1.8rem auto' }}>
            <div className="grid-3col">
              {categoriesList.map((cat, index) => (
                <div 
                  key={index} 
                  onClick={() => { 
                    window.history.pushState({ modalOpen: true }, '');
                    if (cat.key === 'More') {
                      setIsMoreCatalogOpen(true);
                      setSelectedFilterCategory('All');
                    } else {
                      setSelectedCategoryView(cat.key);
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' }); 
                  }} 
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', textAlign: 'center' }}
                >
                  <div className="cat-circle">
                    <img src={cat.iconSrc} alt={cat.key} style={{ width: '30px', height: '30px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#FFF7EE' }}>{isRtl ? cat.labelAr : cat.labelEn}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Catalog Grid */}
          <div style={{ width: '92%', maxWidth: '1000px', margin: '0 auto' }}>
            {checkoutMessage && (
              <div style={{ background: '#2D2C2C', color: '#FD7100', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', border: '1px solid #FD7100' }}>
                {checkoutMessage}
              </div>
            )}

            <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: '#FFF7EE', fontWeight: '700' }}>{t.completeCatalog}</h3>

            <div className="grid-2col">
              {products.map(product => (
                <div key={product.id || product._id} onClick={() => openProductDetails(product)} className="store-card">
                  <div>
                    <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '6px', marginBottom: '0.6rem', background: '#242323' }}>
                      <img src={product.image || 'https://via.placeholder.com/260'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span className="badge-category">{product.category || 'General'}</span>
                    <h4 className="product-title">{product.name}</h4>
                    <p style={{ margin: '0 0 0.8rem 0', fontSize: '1rem', fontWeight: '800', color: '#FD7100' }}>{Number(product.price).toFixed(2)} JD</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); openProductDetails(product); }} className="btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}>{t.viewDetails}</button>
                </div>
              ))}
            </div>
          </div>

          {/* Clean Store Information Section Added to Homepage with Store Number */}
          <div style={{ width: '92%', maxWidth: '1000px', margin: '2.5rem auto 1rem auto', background: '#2D2C2C', border: '1px solid rgba(255,247,238,0.15)', borderRadius: '12px', padding: '1.2rem 1.5rem' }}>
            <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '1rem', color: '#FD7100', fontWeight: '700' }}>{t.storeInfoTitle}</h4>
            <div style={{ fontSize: '0.85rem', opacity: 0.85, display: 'flex', flexDirection: 'column', gap: '0.3rem', lineHeight: '1.5' }}>
              <span>{t.storeHours}</span>
              <span>{t.storeLocation}</span>
              <span>{t.storeSupport}</span>
            </div>
          </div>
        </>
      )}

      {/* --- ADDED NEW FOOTER MATCHING THEME --- */}
      <footer style={{
        background: '#1c1b1b',
        color: '#FFF7EE',
        padding: '3rem 2rem 2rem 2rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,247,238,0.15)',
        marginTop: '3rem',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          
          {/* Logo / Store Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'center' }}>
            <img src="/logo.jpg" alt="Logo" style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,247,238,0.2)' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#FD7100', letterSpacing: '-0.5px' }}>
              {t.storeName}
            </h3>
          </div>

          {/* Slogan */}
          <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.85, fontWeight: '600' }}>
            {t.footerSlogan}
          </p>

          {/* Social Media Links */}
          <div style={{ display: 'flex', gap: '1.5rem', margin: '0.5rem 0', alignItems: 'center' }}>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#FFF7EE', fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#2D2C2C', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,247,238,0.1)', fontWeight: 'bold' }}
            >
              📘 Facebook
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#FFF7EE', fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#2D2C2C', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,247,238,0.1)', fontWeight: 'bold' }}
            >
              📷 Instagram
            </a>
          </div>

          {/* Divider Line */}
          <div style={{ width: '100%', height: '1px', background: 'rgba(255,247,238,0.1)', margin: '0.8rem 0' }}></div>

          {/* Copyright */}
          <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>
            Copyright &copy; 2026 {t.storeName}. All rights reserved.
          </div>

        </div>
      </footer>

      {/* MOBILE BOTTOM APP NAVIGATION BAR */}
      <div className="bottom-nav">
        <button onClick={() => { setSelectedProduct(null); setSelectedCategoryView(null); setIsMoreCatalogOpen(false); setSubmittedSearchQuery(''); setIsSearchOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="bottom-nav-btn">
          <span className="bottom-nav-icon">⌂</span>
          <span>{t.navHome}</span>
        </button>
        <button onClick={() => { window.history.pushState({ modalOpen: true }, ''); setIsSearchOpen(!isSearchOpen); }} className="bottom-nav-btn">
          <span className="bottom-nav-icon">⚲</span>
          <span>{t.navSearch}</span>
        </button>
        <button onClick={() => { window.history.pushState({ modalOpen: true }, ''); setIsCartOpen(true); }} className="bottom-nav-btn">
          <span className="bottom-nav-icon">▢</span>
          <span>{t.navCart}</span>
        </button>
        <button onClick={() => { window.history.pushState({ modalOpen: true }, ''); setIsOrderHistoryOpen(true); }} className="bottom-nav-btn">
          <span className="bottom-nav-icon">≡</span>
          <span>{t.navOrders}</span>
        </button>
      </div>

      {/* CART MODAL WINDOW */}
      {isCartOpen && (
        <div className="modal-overlay" style={{ alignItems: 'flex-end' }}>
          <div dir={isRtl ? 'rtl' : 'ltr'} className="modal-content modal-bottom-sheet">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,247,238,0.2)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#FFF7EE', fontSize: '1.1rem', fontWeight: '700' }}>{t.cartReview}</h3>
              <button onClick={() => window.history.back()} style={{ background: 'transparent', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#FFF7EE' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '40vh' }}>
              {cart.length === 0 ? (
                <p style={{ color: '#FFF7EE', opacity: 0.6, textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>{t.emptyCart}</p>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,247,238,0.1)', paddingBottom: '0.6rem' }}>
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', overflow: 'hidden', borderRadius: '6px', flexShrink: 0, border: '1px solid rgba(255,247,238,0.2)' }}>
                        <img src={item.image || 'https://via.placeholder.com/40'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 0.1rem 0', fontSize: '0.85rem', color: '#FFF7EE', fontWeight: '600' }}>{item.name}</h4>
                        <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.7rem', color: '#FFF7EE', opacity: 0.7 }}>
                          {item.selectedSize ? `Size: ${item.selectedSize} ` : ''} {item.selectedColor ? `Color: ${item.selectedColor}` : ''}
                        </p>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#FD7100' }}>{Number(item.price).toFixed(2)} JD</span>
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
                    <span>{cartSubtotal.toFixed(2)} JD</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ opacity: 0.8 }}>{t.deliveryFeeLabel}</span>
                    <span>{deliveryFee.toFixed(2)} JD</span>
                  </div>
                  {discountValue > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', color: '#4ade80' }}>
                      <span>Discount ({appliedPromoCode}):</span>
                      <span>-{discountValue.toFixed(2)} JD</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.4rem', margin: '0.6rem 0' }}>
                    <input type="text" placeholder={t.discountLabel} value={promoInput} onChange={e => setPromoInput(e.target.value)} className="form-input" style={{ flex: 1, textTransform: 'uppercase', padding: '0.4rem 0.5rem', fontSize: '0.8rem' }} />
                    <button onClick={handleApplyDiscount} className="btn-primary" style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem' }}>{t.applyPromo}</button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1rem', color: '#FFF7EE', borderTop: '1px solid rgba(255,247,238,0.2)', paddingTop: '0.5rem', marginTop: '0.3rem' }}>
                    <span>{t.totalAmount}</span>
                    <span style={{ color: '#FD7100' }}>{grandTotal.toFixed(2)} JD</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} className="btn-primary" style={{ flex: 1, padding: '0.8rem', fontSize: '0.9rem' }}>{t.orderNow}</button>
                  <button onClick={handleWhatsAppCheckout} className="btn-whatsapp">{t.whatsappCheckout}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT INFORMATION MODAL */}
      {isCheckoutOpen && (
        <div className="modal-overlay">
          <div dir={isRtl ? 'rtl' : 'ltr'} className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,247,238,0.2)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#FFF7EE', fontSize: '1.1rem', fontWeight: '700' }}>{t.customerInfo}</h3>
              <button onClick={() => window.history.back()} style={{ background: 'transparent', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#FFF7EE' }}>✕</button>
            </div>

            <form onSubmit={handleExecuteOrderSubmission} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div className="form-group">
                <label className="form-label">{t.arabicNameLabel}</label>
                <input type="text" placeholder={t.arabicNamePlaceholder} value={arabicName} onChange={e => setArabicName(e.target.value)} required dir="rtl" className="form-input" style={{ textAlign: 'right' }} />
              </div>
              <div className="form-group">
                <label className="form-label">{t.phoneLabel}</label>
                <input type="tel" placeholder={t.phonePlaceholder} maxLength="10" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} required className="form-input" />
              </div>
              
              <div className="form-group">
                <label className="form-label">{t.cityLabel}</label>
                <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="form-input" style={{ fontWeight: 'bold' }}>
                  <option value="Amman">{t.ammanCity} ({storeSettings.deliveryFee !== undefined ? storeSettings.deliveryFee : 2.00} JD)</option>
                  <option value="Irbid">{t.irbidCity} ({storeSettings.irbidDeliveryFee !== undefined ? storeSettings.irbidDeliveryFee : 3.50} JD)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t.manualAddressLabel} <span style={{ color: '#f87171' }}>{t.obligatory}</span></label>
                <textarea placeholder={t.manualAddressPlaceholder} value={manualAddress} onChange={e => setManualAddress(e.target.value)} rows="3" required className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">{t.paymentMethod}</label>
                <select value={paymentMethod} disabled className="form-input" style={{ opacity: 0.7, fontWeight: 'bold' }}>
                  <option value="Cash">{t.cashOnDelivery}</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.8rem' }}>
                <button type="button" onClick={() => window.history.back()} className="btn-secondary" style={{ flex: 1 }}>{t.backToCart}</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.75rem', fontSize: '0.85rem' }}>{t.reviewOrder}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRACK PAST ORDERS & RECEIPTS MODAL */}
      {isOrderHistoryOpen && (
        <div className="modal-overlay">
          <div dir={isRtl ? 'rtl' : 'ltr'} className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,247,238,0.2)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#FFF7EE', fontSize: '1.1rem', fontWeight: '700' }}>{t.pastOrdersTitle}</h3>
              <button onClick={() => window.history.back()} style={{ background: 'transparent', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#FFF7EE' }}>✕</button>
            </div>

            <div style={{ marginBottom: '1.2rem', background: '#242323', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255,247,238,0.2)' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.4rem', opacity: 0.9 }}>{t.lookupPrompt}</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="tel" 
                  maxLength="10"
                  placeholder="07XXXXXXXX" 
                  value={lookupPhone} 
                  onChange={e => setLookupPhone(e.target.value.replace(/\D/g, ''))} 
                  className="form-input"
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '50vh', overflowY: 'auto' }}>
              {!lookupPhone || lookupPhone.length < 10 ? (
                <p style={{ color: '#FFF7EE', opacity: 0.6, textAlign: 'center', padding: '1.5rem 0', fontSize: '0.85rem' }}>
                  {lang === 'ar' ? 'يرجى إدخال رقم الهاتف الكامل المكون من 10 أرقام أعلاه لعرض الطلبات.' : 'Please enter your full 10-digit phone number above to view orders.'}
                </p>
              ) : myOrders.length === 0 ? (
                <p style={{ color: '#FFF7EE', opacity: 0.6, textAlign: 'center', padding: '1.5rem 0', fontSize: '0.85rem' }}>{t.noPastOrders}</p>
              ) : (
                myOrders.map(ord => {
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
                        <span style={{ border: '1px solid rgba(255,247,238,0.3)', color: statusColor, padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold' }}>{ord.status || 'Pending'}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#FFF7EE' }}>
                          {t.totalDue} <span style={{ color: '#FD7100' }}>{Number(ord.grandTotal || ord.total || 0).toFixed(2)} JD</span>
                        </span>
                        <button onClick={() => setExpandedReceiptId(isExpanded ? null : oId)} className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                          {isExpanded ? t.hideReceipt : t.viewReceipt}
                        </button>
                      </div>

                      {isExpanded && (
                        <div style={{ marginTop: '0.8rem', background: '#242323', border: '1px dashed rgba(255,247,238,0.3)', borderRadius: '8px', padding: '1rem' }}>
                          <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.9rem', color: '#FFF7EE', borderBottom: '1px solid rgba(255,247,238,0.2)', paddingBottom: '0.3rem', fontWeight: '700' }}>{t.officialReceipt}</h4>

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
                                <span>{it.name} (×{it.quantity})</span>
                                <span style={{ fontWeight: 'bold', color: '#FD7100' }}>{(it.price * it.quantity).toFixed(2)} JD</span>
                              </div>
                            ))}
                          </div>

                          <div style={{ borderTop: '1px solid rgba(255,247,238,0.2)', paddingTop: '0.5rem', fontSize: '0.8rem', color: '#FFF7EE' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                              <span style={{ opacity: 0.8 }}>{t.subtotal}</span>
                              <span>{Number(ord.total || 0).toFixed(2)} JD</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                              <span style={{ opacity: 0.8 }}>{t.deliveryFee}</span>
                              <span>{Number(ord.deliveryFee || 2.00).toFixed(2)} JD</span>
                            </div>
                            {ord.discountAmount > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem', color: '#4ade80' }}>
                                <span>Discount:</span>
                                <span>-{Number(ord.discountAmount).toFixed(2)} JD</span>
                              </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '0.9rem', marginTop: '0.3rem', borderTop: '1px solid rgba(255,247,238,0.2)', paddingTop: '0.3rem' }}>
                              <span>{t.totalToPay}</span>
                              <span style={{ color: '#FD7100' }}>{Number(ord.grandTotal || (ord.total + (ord.deliveryFee || 2.00))).toFixed(2)} JD</span>
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