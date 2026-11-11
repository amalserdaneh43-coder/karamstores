import React, { useState, useEffect, useMemo } from 'react';

import './App.css';



const translations = {

  en: {

    storeName: "Karam Stores",

    trackOrders: "My Past Orders",

    cart: "Cart",

    wishlist: "Wishlist",

    searchPlaceholder: "Search store products...",

    completeCatalog: "Complete Product Catalog",

    categoryCatalog: "Category Products",

    allCategoriesFilter: "All Categories",

    filterByCat: "Filter by Category:",

    sortByPrice: "Sort by Price:",

    sortDefault: "Default Sorting",

    sortLowHigh: "Price: Low to High",

    sortHighLow: "Price: High to Low",

    searchResults: "Search Results for",

    backToCatalog: "← Back to Store Catalog",

    selectSize: "Select Size:",

    selectColor: "Select Color:",

    addToCart: "Add to Cart",

    buyItNow: "BUY IT NOW",

    outOfStock: "Out of Stock",

    similarOptions: "Recommended | You may also like these products",

    viewDetails: "View product",

    cartReview: "Your Shopping Cart & Review",

    emptyCart: "Your cart is empty.",

    emptyWishlist: "Your wishlist is empty.",

    clearCart: "Clear Cart",

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

    cityLabel: "Delivery City / Governorate *",

    manualAddressLabel: "Manual Delivery Address (Street, Building) *",

    manualAddressPlaceholder: "Enter detailed delivery address...",

    mapCoordinatesLabel: "Map Pin / Location Coordinates (Optional)",

    mapCoordinatesPlaceholder: "Paste Google Maps link or location notes...",

    pinLocationBtn: "📍 Get Current Location / Pin",

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

    navWishlist: "Wishlist",

    navOrders: "Orders",

    backToTop: "↑ Top",

    footerSlogan: "كل ما يلزم المنزل تحت سقف واحد",

    badgeBestSeller: "Best Seller",

    badgeNewArrival: "New Arrival",

    badgeLowStock: "Low Stock"

  },

  ar: {

    storeName: "كرم ستورز",

    trackOrders: "طلباتي",

    cart: "السلة",

    wishlist: "المفضلة",

    searchPlaceholder: "ابحث عن منتجات المتجر...",

    completeCatalog: "كتالوج المنتجات الكامل",

    categoryCatalog: "منتجات الفئة",

    allCategoriesFilter: "جميع الفئات",

    filterByCat: "تصفية حسب الفئة:",

    sortByPrice: "ترتيب حسب السعر:",

    sortDefault: "الترتيب الافتراضي",

    sortLowHigh: "السعر: من الأقل للأعلى",

    sortHighLow: "السعر: من الأعلى للأقل",

    searchResults: "نتائج البحث عن",

    backToCatalog: "← العودة إلى الكتالوج الرئيسي",

    selectSize: "اختر المقاس:",

    selectColor: "اختر اللون المطلوب:",

    addToCart: "أضف إلى السلة",

    buyItNow: "اشتري الآن",

    outOfStock: "غير متوفر في المخزون",

    similarOptions: "منتجات مقترحة قد تعجبك",

    viewDetails: "عرض المنتج",

    cartReview: "سلة التسوق والمراجعة",

    emptyCart: "سلة التسوق فارغة.",

    emptyWishlist: "قائمة المفضلة فارغة.",

    clearCart: "إفراغ السلة",

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

    cityLabel: "محافظة / مدينة التوصيل *",

    manualAddressLabel: "عنوان التوصيل اليدوي (الشارع، المبنى) *",

    manualAddressPlaceholder: "أدخل تفاصيل عنوان التوصيل...",

    mapCoordinatesLabel: "رابط موقع الخريطة أو إحداثيات (اختياري)",

    mapCoordinatesPlaceholder: "الصق رابط خرائط جوجل أو ملاحظات الموقع...",

    pinLocationBtn: "📍 إدراج موقعي الحالي",

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

    navWishlist: "المفضلة",

    navOrders: "الطلبات",

    backToTop: "↑ للأعلى",

    footerSlogan: "كل ما يلزم المنزل تحت سقف واحد",

    badgeBestSeller: "الأكثر مبيعاً",

    badgeNewArrival: "وصل حديثاً",

    badgeLowStock: "نفاد قريب"

  }

};



export default function StoreApp() {

  const [products, setProducts] = useState([]);

  const [cart, setCart] = useState([]);

  const [wishlist, setWishlist] = useState(() => {

    try {

      const saved = localStorage.getItem('karam_wishlist');

      return saved ? JSON.parse(saved) : [];

    } catch (e) {

      return [];

    }

  });



  const [isCartOpen, setIsCartOpen] = useState(false);

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);

  

  const [catalogSearch, setCatalogSearch] = useState('');

  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');

  const [isSearchOpen, setIsSearchOpen] = useState(false); 

  const [selectedCategoryView, setSelectedCategoryView] = useState(null);

  const [isMoreCatalogOpen, setIsMoreCatalogOpen] = useState(false);

  const [selectedFilterCategory, setSelectedFilterCategory] = useState('All');

  const [catalogSortOption, setCatalogSortOption] = useState('default');



  const [lang, setLang] = useState('ar'); 

  const [storeSettings, setStoreSettings] = useState({ deliveryFee: 2.00, irbidDeliveryFee: 3.50, discountCodes: {} });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [showBackToTop, setShowBackToTop] = useState(false);



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

  const [selectedColorName, setSelectedColorName] = useState('');

  const [activeImage, setActiveImage] = useState('');

  const [quantity, setQuantity] = useState(1);



  const [arabicName, setArabicName] = useState('');

  const [phone, setPhone] = useState('');

  const [selectedCity, setSelectedCity] = useState('Amman');

  const [manualAddress, setManualAddress] = useState('');

  const [mapCoordinates, setMapCoordinates] = useState('');

  const [paymentMethod] = useState('Cash');



  const [allOrders, setAllOrders] = useState([]);

  const [expandedReceiptId, setExpandedReceiptId] = useState(null);

  const [lookupPhone, setLookupPhone] = useState(localStorage.getItem('user_phone') || '');



  // Save wishlist to localStorage

  useEffect(() => {

    try {

      localStorage.setItem('karam_wishlist', JSON.stringify(wishlist));

    } catch (e) {}

  }, [wishlist]);



  const toggleWishlist = (product, e) => {

    if (e) e.stopPropagation();

    const pId = product.id || product._id;

    setWishlist(prev => {

      const exists = prev.some(item => (item.id || item._id) === pId);

      if (exists) {

        triggerToast(lang === 'ar' ? 'تم إزالة المنتج من المفضلة' : 'Removed from wishlist', 'success');

        return prev.filter(item => (item.id || item._id) !== pId);

      } else {

        triggerToast(lang === 'ar' ? 'تمت إضافة المنتج إلى المفضلة' : 'Added to wishlist', 'success');

        return [...prev, product];

      }

    });

  };



  // Jordanian Governorates Mapping for delivery fee tiers

  const jordanGovernorates = [

    { key: 'Amman', labelAr: 'عمان', labelEn: 'Amman', isAmman: true },

    { key: 'Irbid', labelAr: 'إربد', labelEn: 'Irbid', isAmman: false },

    { key: 'Zarqa', labelAr: 'الزرقاء', labelEn: 'Zarqa', isAmman: false },

    { key: 'Aqaba', labelAr: 'العقبة', labelEn: 'Aqaba', isAmman: false },

    { key: 'Karak', labelAr: 'الكرك', labelEn: 'Karak', isAmman: false },

    { key: 'Salt', labelAr: 'السلط (البلقاء)', labelEn: 'Salt', isAmman: false },

    { key: 'Madaba', labelAr: 'مادبا', labelEn: 'Madaba', isAmman: false },

    { key: 'Jerash', labelAr: 'جرش', labelEn: 'Jerash', isAmman: false },

    { key: 'Ajloun', labelAr: 'عجلون', labelEn: 'Ajloun', isAmman: false },

    { key: 'Mafraq', labelAr: 'المفرق', labelEn: 'Mafraq', isAmman: false },

    { key: 'Maan', labelAr: 'معان', labelEn: 'Ma\'an', isAmman: false },

    { key: 'Tafilah', labelAr: 'الطفيلة', labelEn: 'Tafilah', isAmman: false }

  ];



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



    const handleScroll = () => {

      if (window.scrollY > 300) {

        setShowBackToTop(true);

      } else {

        setShowBackToTop(false);

      }

    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);

  }, []);



  useEffect(() => {

    const isPopupActive = 

      selectedProduct !== null || 

      selectedCategoryView !== null || 

      isMoreCatalogOpen || 

      submittedSearchQuery !== '' || 

      isCartOpen || 

      isWishlistOpen ||

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

        setIsWishlistOpen(false);

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

    isWishlistOpen,

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

    setIsWishlistOpen(false);

    setActiveImage(product.image || (product.images && product.images[0]) || '');

    setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : '');

    

    const initialColors = Array.isArray(product.colorsList) && product.colorsList.length > 0 

      ? product.colorsList 

      : [{ name: product.colorName || 'Red', hex: product.color || '#ef4444' }];

    setSelectedColorName(initialColors[0].name);



    setQuantity(1);

    window.scrollTo({ top: 0, behavior: 'smooth' });

  };



  const addToCartFromDetails = () => {

    if (!selectedProduct) return;

    addToCart({ ...selectedProduct, selectedSize, selectedColor: selectedColorName }, quantity);

    triggerToast(lang === 'ar' ? 'تمت إضافة المنتج إلى السلة بنجاح!' : 'Product added to cart successfully!');

  };



  const buyItNowAction = () => {

    if (!selectedProduct) return;

    addToCart({ ...selectedProduct, selectedSize, selectedColor: selectedColorName }, quantity);

    setSelectedProduct(null);

    setIsCartOpen(false);

    setIsCheckoutOpen(true);

  };



  const addToCart = (product, qty = 1) => {

    setCart(prev => {

      const pId = product.id || product._id;

      const existing = prev.find(item => (item.id || item._id) === pId && item.selectedSize === product.selectedSize && item.selectedColor === product.selectedColor);

      if (existing) {

        return prev.map(item => 

          ((item.id || item._id) === pId && item.selectedSize === product.selectedSize && item.selectedColor === product.selectedColor)

            ? { ...item, quantity: item.quantity + qty } 

            : item

        );

      }

      return [...prev, { ...product, quantity: qty }];

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



  const clearEntireCart = () => {

    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من إفراغ السلة بالكامل؟' : 'Are you sure you want to clear your cart?')) {

      setCart([]);

      setDiscountValue(0);

      setAppliedPromoCode(null);

    }

  };



  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  

  const isSelectedCityAmman = selectedCity === 'Amman';

  const deliveryFee = isSelectedCityAmman 

    ? (storeSettings.deliveryFee !== undefined ? storeSettings.deliveryFee : 2.00) 

    : (storeSettings.irbidDeliveryFee !== undefined ? storeSettings.irbidDeliveryFee : 3.50);



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

    text += `📍 المحافظة: ${selectedCity}\n`;

    if (manualAddress) text += `🏠 العنوان: ${manualAddress}\n`;

    if (mapCoordinates) text += `📌 الخريطة/الموقع: ${mapCoordinates}\n`;

    text += `------------------------\n`;

    

    cart.forEach(i => { 

      text += `- ${i.name} ${i.selectedColor ? `(${i.selectedColor})` : ''} (الكمية: ${i.quantity}) - ${(i.price * i.quantity).toFixed(2)} JD\n`; 

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



    const fullAddressString = `[${selectedCity}] ${manualAddress.trim()} ${mapCoordinates ? `| Map: ${mapCoordinates}` : ''}`;



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

        mapCoordinates: mapCoordinates || 'Not pinned',

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

        setMapCoordinates('');

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



  const sortProductsArray = (arr) => {

    const copy = [...arr];

    if (catalogSortOption === 'lowHigh') {

      return copy.sort((a, b) => Number(a.price) - Number(b.price));

    }

    if (catalogSortOption === 'highLow') {

      return copy.sort((a, b) => Number(b.price) - Number(a.price));

    }

    return copy;

  };



  const sortedSearchResults = useMemo(() => {

    if (!submittedSearchQuery) return [];

    const query = submittedSearchQuery.toLowerCase();

    const scored = products.map(product => {

      let score = 0;

      const name = (product.name || '').toLowerCase();

      const category = (product.category || '').toLowerCase();

      if (name === query) score += 100;

      else if (name.startsWith(query)) score += 75;

      else if (name.includes(query)) score += 50;

      if (category.includes(query)) score += 30;

      return { product, score };

    }).filter(item => item.score > 0).sort((a, b) => b.score - a.score).map(item => item.product);

    return sortProductsArray(scored);

  }, [products, submittedSearchQuery, catalogSortOption]);



  const categoryViewProducts = useMemo(() => {

    if (!selectedCategoryView) return [];

    const filtered = products.filter(p => p.category && p.category.toLowerCase() === selectedCategoryView.toLowerCase());

    return sortProductsArray(filtered);

  }, [products, selectedCategoryView, catalogSortOption]);



  const moreFilteredProducts = useMemo(() => {

    let filtered = products;

    if (selectedFilterCategory !== 'All') {

      filtered = products.filter(p => p.category && p.category.toLowerCase() === selectedFilterCategory.toLowerCase());

    }

    return sortProductsArray(filtered);

  }, [products, selectedFilterCategory, catalogSortOption]);



  const homeCatalogProducts = useMemo(() => {

    return sortProductsArray(products);

  }, [products, catalogSortOption]);



  const similarProducts = selectedProduct 

    ? products.filter(p => p.category === selectedProduct.category && (p.id || p._id) !== (selectedProduct.id || selectedProduct._id))

    : products.slice(0, 2);



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



  const bigOrangeBackButtonStyle = {

    background: '#FD7100',

    color: '#1c1b1b',

    border: 'none',

    padding: '0.7rem 1.4rem',

    borderRadius: '10px',

    fontWeight: '900',

    fontSize: '1rem',

    cursor: 'pointer',

    display: 'inline-flex',

    alignItems: 'center',

    gap: '0.5rem',

    boxShadow: '0 4px 12px rgba(253, 113, 0, 0.4)'

  };



  // Helper to render product badge

  const renderProductBadge = (product) => {

    const stock = product.stock !== undefined ? product.stock : 10;

    if (stock <= 3) {

      return <span className="product-badge low-stock" style={{ background: '#ef4444', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>{t.badgeLowStock}</span>;

    }

    if (product.featured) {

      return <span className="product-badge best-seller" style={{ background: '#FD7100', color: '#1c1b1b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>{t.badgeBestSeller}</span>;

    }

    return null;

  };



  return (

    <div dir={isRtl ? 'rtl' : 'ltr'} className="store-container">

      

      {toast.show && (

        <div className="toast-notification" style={{ background: toast.type === 'error' ? '#7f1d1d' : '#FD7100' }}>

          <span>{toast.type === 'error' ? '⚠️' : '✨'}</span>

          <span>{toast.message}</span>

        </div>

      )}



      {/* Floating Back To Top Button */}

      {showBackToTop && (

        <button 

          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}

          style={{

            position: 'fixed',

            bottom: '80px',

            right: isRtl ? 'auto' : '20px',

            left: isRtl ? '20px' : 'auto',

            background: '#FD7100',

            color: '#1c1b1b',

            border: 'none',

            borderRadius: '50px',

            padding: '0.6rem 1rem',

            fontWeight: 'bold',

            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',

            zIndex: 90,

            cursor: 'pointer',

            fontSize: '0.85rem'

          }}

        >

          {t.backToTop}

        </button>

      )}



      {/* Top Navbar */}

      <nav className="navbar">

        <div onClick={() => { setSelectedProduct(null); setSelectedCategoryView(null); setIsMoreCatalogOpen(false); setSubmittedSearchQuery(''); setCatalogSearch(''); setIsSearchOpen(false); setIsWishlistOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>

          <img src="/logo.jpg" alt="Logo" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #FFF7EE' }} onError={(e) => { e.target.style.display = 'none'; }} />

          <h2 style={{ margin: 0, fontSize: '1.1rem', letterSpacing: '-0.5px', color: '#FFF7EE', fontWeight: '800' }}>{t.storeName}</h2>

        </div>

        

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>

          <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} style={{ background: 'transparent', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)', padding: '0.4rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.75rem' }}>

            {lang === 'en' ? 'العربية' : 'English'}

          </button>

          <button onClick={() => { window.history.pushState({ modalOpen: true }, ''); setIsWishlistOpen(true); }} style={{ background: 'transparent', border: '1px solid rgba(255,247,238,0.3)', color: '#FFF7EE', padding: '0.4rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>

            <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>

            ({wishlist.length})

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

        <div style={{ width: '100%', margin: '0 auto', paddingBottom: '3rem' }}>

          <div style={{ width: '92%', maxWidth: '850px', margin: '1rem auto 0.5rem auto' }}>

            <button onClick={() => window.history.back()} style={bigOrangeBackButtonStyle}>

              {t.backToCatalog}

            </button>

            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.6rem', marginBottom: '1rem', color: '#FFF7EE' }}>

              Home / {selectedProduct.category || 'Kitchen'} / {selectedProduct.name}

            </div>

          </div>



          <div style={{ width: '100%', background: '#1c1b1b', borderTop: '1px solid rgba(255,247,238,0.15)', borderBottom: '1px solid rgba(255,247,238,0.15)', marginBottom: '1.5rem', overflow: 'hidden', position: 'relative' }}>

            <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 10 }}>

              <button 

                onClick={(e) => toggleWishlist(selectedProduct, e)}

                style={{ background: 'rgba(45,44,44,0.8)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}

              >

                <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlist.some(item => (item.id || item._id) === (selectedProduct.id || selectedProduct._id)) ? '#ef4444' : 'none'} stroke={wishlist.some(item => (item.id || item._id) === (selectedProduct.id || selectedProduct._id)) ? '#ef4444' : '#FFF7EE'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>

              </button>

            </div>

            

            {/* FIXED FLUID UNCROPPED IMAGE CONTAINER */}

            <div style={{ width: '100%', maxWidth: '700px', margin: '0 auto', minHeight: '300px', maxHeight: '550px', background: '#242323', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem 0' }}>

              <img src={activeImage || selectedProduct.image || 'https://via.placeholder.com/600'} alt={selectedProduct.name} style={{ maxWidth: '100%', maxHeight: '550px', width: 'auto', height: 'auto', objectFit: 'contain' }} />

            </div>

          </div>



          <div style={{ width: '92%', maxWidth: '850px', margin: '0 auto' }}>

            {selectedProduct.images && selectedProduct.images.length > 0 && (

              <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.6rem', marginBottom: '1.5rem', justifyContent: 'center' }}>

                {[selectedProduct.image, ...selectedProduct.images].filter(Boolean).map((imgUrl, idx) => (

                  <div key={idx} style={{ width: '65px', height: '65px', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '8px', flexShrink: 0, background: '#242323' }}>

                    <img src={imgUrl} alt="" onClick={() => setActiveImage(imgUrl)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', border: activeImage === imgUrl ? '2px solid #FD7100' : '1px solid rgba(255,247,238,0.2)' }} />

                  </div>

                ))}

              </div>

            )}



            <div style={{ background: '#2D2C2C', padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(255,247,238,0.2)', marginBottom: '2rem' }}>

              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>

                <div>

                  <span style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.3rem', color: '#FD7100' }}>

                    {selectedProduct.category || 'Cast Aluminum'}

                  </span>

                  <h1 style={{ margin: 0, fontSize: '1.6rem', color: '#FFF7EE', fontWeight: '800', lineHeight: '1.3' }}>

                    {selectedProduct.name}

                  </h1>

                </div>

                <div>{renderProductBadge(selectedProduct)}</div>

              </div>



              {/* DYNAMIC COLOR SWATCH IMAGE SYNC */}

              {(() => {

                const productColors = Array.isArray(selectedProduct.colorsList) && selectedProduct.colorsList.length > 0 

                  ? selectedProduct.colorsList 

                  : [{ name: selectedProduct.colorName || 'Red', hex: selectedProduct.color || '#ef4444' }];



                return (

                  <div style={{ background: '#242323', border: '1px solid rgba(255,247,238,0.2)', borderRadius: '10px', padding: '1rem', marginBottom: '1.2rem' }}>

                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.6rem', color: '#FFF7EE' }}>

                      {t.selectColor} <span style={{ color: '#FD7100' }}>{selectedColorName}</span>

                    </div>

                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>

                      {productColors.map((c, idx) => (

                        <button

                          key={idx}

                          type="button"

                          onClick={() => {

                            setSelectedColorName(c.name);

                            if (selectedProduct.images && selectedProduct.images[idx]) {

                              setActiveImage(selectedProduct.images[idx]);

                            }

                          }}

                          style={{

                            width: '36px',

                            height: '36px',

                            borderRadius: '50%',

                            background: c.hex,

                            border: selectedColorName === c.name ? '3px solid #FD7100' : '2px solid #FFF7EE',

                            cursor: 'pointer',

                            boxShadow: '0 2px 4px rgba(0,0,0,0.4)',

                            transition: 'transform 0.2s'

                          }}

                          title={c.name}

                        />

                      ))}

                    </div>

                  </div>

                );

              })()}



              <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>

                <span>SKU: {selectedProduct.sku || selectedProduct.id || 'HLO-52398'}</span>

              </div>



              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#FFF7EE', marginBottom: '1.2rem' }}>

                {Number(selectedProduct.price).toFixed(3)} JD

              </div>



              <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem', flexWrap: 'wrap' }}>

                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255,247,238,0.3)', borderRadius: '8px', background: '#242323' }}>

                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ background: 'transparent', color: '#FFF7EE', border: 'none', padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>-</button>

                  <span style={{ padding: '0 0.8rem', fontSize: '1rem', fontWeight: 'bold', color: '#FFF7EE' }}>{quantity}</span>

                  <button onClick={() => setQuantity(quantity + 1)} style={{ background: 'transparent', color: '#FFF7EE', border: 'none', padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>+</button>

                </div>



                <button disabled={selectedProduct.stock <= 0} onClick={addToCartFromDetails} className="btn-primary" style={{ flex: 1, background: selectedProduct.stock > 0 ? '#000' : '#555', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', cursor: selectedProduct.stock > 0 ? 'pointer' : 'not-allowed', fontSize: '0.95rem' }}>

                  {selectedProduct.stock > 0 ? t.addToCart : t.outOfStock}

                </button>

              </div>



              <button onClick={buyItNowAction} style={{ width: '100%', background: 'transparent', color: '#FFF7EE', border: '1px solid #FFF7EE', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem', marginBottom: '1.5rem', transition: 'all 0.2s' }}>

                {t.buyItNow}

              </button>



              <div style={{ borderTop: '1px solid rgba(255,247,238,0.15)', paddingTop: '1.2rem', color: '#FFF7EE', fontSize: '0.9rem', lineHeight: '1.6' }}>

                <p style={{ margin: '0 0 1rem 0', opacity: 0.9 }}>{selectedProduct.description || 'High-quality product designed for everyday home use.'}</p>

              </div>

            </div>



            <div style={{ marginTop: '2.5rem' }}>

              <h3 style={{ fontSize: '1.1rem', color: '#FFF7EE', marginBottom: '1rem', fontWeight: '700', borderBottom: '1px solid rgba(255,247,238,0.15)', paddingBottom: '0.5rem' }}>

                {t.similarOptions}

              </h3>

              <div className="grid-2col">

                {similarProducts.map(simProd => (

                  <div key={simProd.id || simProd._id} onClick={() => openProductDetails(simProd)} className="store-card" style={{ position: 'relative' }}>

                    <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 5 }}>

                      <button 

                        onClick={(e) => toggleWishlist(simProd, e)}

                        style={{ background: 'rgba(45,44,44,0.8)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}

                      >

                        <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlist.some(item => (item.id || item._id) === (simProd.id || simProd._id)) ? '#ef4444' : 'none'} stroke={wishlist.some(item => (item.id || item._id) === (simProd.id || simProd._id)) ? '#ef4444' : '#FFF7EE'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>

                      </button>

                    </div>

                    <div>

                      <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '6px', marginBottom: '0.5rem', background: '#242323' }}>

                        <img src={simProd.image || 'https://via.placeholder.com/200'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                      </div>

                      <div style={{ marginBottom: '0.3rem' }}>{renderProductBadge(simProd)}</div>

                      <h4 className="product-title">{simProd.name}</h4>

                      <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.9rem', fontWeight: '700', color: '#FD7100' }}>{Number(simProd.price).toFixed(3)} JD</p>

                    </div>

                    <button onClick={(e) => { e.stopPropagation(); openProductDetails(simProd); }} className="btn-primary" style={{ width: '100%', padding: '0.4rem', fontSize: '0.75rem' }}>

                      {t.viewDetails}

                    </button>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

      ) : submittedSearchQuery ? (

        <div style={{ width: '92%', maxWidth: '1000px', margin: '1.5rem auto' }}>

          <button onClick={() => window.history.back()} style={bigOrangeBackButtonStyle}>

            {t.backToCatalog}

          </button>

          

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0 1.2rem 0', flexWrap: 'wrap', gap: '0.8rem' }}>

            <h2 style={{ fontSize: '1.4rem', color: '#FFF7EE', margin: 0, fontWeight: '700' }}>{t.searchResults} "{submittedSearchQuery}"</h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

              <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t.sortByPrice}</label>

              <select value={catalogSortOption} onChange={e => setCatalogSortOption(e.target.value)} style={{ padding: '0.4rem', borderRadius: '6px', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)', fontSize: '0.8rem' }}>

                <option value="default">{t.sortDefault}</option>

                <option value="lowHigh">{t.sortLowHigh}</option>

                <option value="highLow">{t.sortHighLow}</option>

              </select>

            </div>

          </div>



          <div className="grid-2col">

            {sortedSearchResults.length === 0 ? (

              <p style={{ color: '#FFF7EE', opacity: 0.6, padding: '2rem 0', gridColumn: 'span 2', textAlign: 'center' }}>{lang === 'ar' ? 'لم يتم العثور على منتجات مطابقة لبحثك.' : 'No matching products found.'}</p>

            ) : (

              sortedSearchResults.map(product => (

                <div key={product.id || product._id} onClick={() => openProductDetails(product)} className="store-card" style={{ position: 'relative' }}>

                  <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 5 }}>

                    <button 

                      onClick={(e) => toggleWishlist(product, e)}

                      style={{ background: 'rgba(45,44,44,0.8)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}

                    >

                      <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlist.some(item => (item.id || item._id) === (product.id || product._id)) ? '#ef4444' : 'none'} stroke={wishlist.some(item => (item.id || item._id) === (product.id || product._id)) ? '#ef4444' : '#FFF7EE'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>

                    </button>

                  </div>

                  <div>

                    <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '6px', marginBottom: '0.6rem', background: '#242323' }}>

                      <img src={product.image || 'https://via.placeholder.com/260'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>

                      <span className="badge-category">{product.category || 'General'}</span>

                      {renderProductBadge(product)}

                    </div>

                    <h4 className="product-title">{product.name}</h4>

                    <p style={{ margin: '0 0 0.8rem 0', fontSize: '1rem', fontWeight: '800', color: '#FD7100' }}>{Number(product.price).toFixed(3)} JD</p>

                  </div>

                  <button onClick={(e) => { e.stopPropagation(); openProductDetails(product); }} className="btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}>{t.viewDetails}</button>

                </div>

              ))

            )}

          </div>

        </div>

      ) : selectedCategoryView ? (

        <div style={{ width: '92%', maxWidth: '1000px', margin: '1.5rem auto' }}>

          <button onClick={() => window.history.back()} style={bigOrangeBackButtonStyle}>{t.backToCatalog}</button>

          

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0 1.2rem 0', flexWrap: 'wrap', gap: '0.8rem' }}>

            <h2 style={{ fontSize: '1.4rem', color: '#FFF7EE', margin: 0, fontWeight: '700' }}>{t.categoryCatalog}: {selectedCategoryView}</h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

              <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t.sortByPrice}</label>

              <select value={catalogSortOption} onChange={e => setCatalogSortOption(e.target.value)} style={{ padding: '0.4rem', borderRadius: '6px', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)', fontSize: '0.8rem' }}>

                <option value="default">{t.sortDefault}</option>

                <option value="lowHigh">{t.sortLowHigh}</option>

                <option value="highLow">{t.sortHighLow}</option>

              </select>

            </div>

          </div>



          <div className="grid-2col">

            {categoryViewProducts.length === 0 ? (

              <p style={{ color: '#FFF7EE', opacity: 0.6, padding: '2rem 0', gridColumn: 'span 2', textAlign: 'center' }}>{lang === 'ar' ? 'لا توجد منتجات في هذه الفئة حالياً.' : 'No products found in this category.'}</p>

            ) : (

              categoryViewProducts.map(product => (

                <div key={product.id || product._id} onClick={() => openProductDetails(product)} className="store-card" style={{ position: 'relative' }}>

                  <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 5 }}>

                    <button 

                      onClick={(e) => toggleWishlist(product, e)}

                      style={{ background: 'rgba(45,44,44,0.8)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}

                    >

                      <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlist.some(item => (item.id || item._id) === (product.id || product._id)) ? '#ef4444' : 'none'} stroke={wishlist.some(item => (item.id || item._id) === (product.id || product._id)) ? '#ef4444' : '#FFF7EE'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>

                    </button>

                  </div>

                  <div>

                    <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '6px', marginBottom: '0.6rem', background: '#242323' }}>

                      <img src={product.image || 'https://via.placeholder.com/260'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>

                      <span className="badge-category">{product.category || 'General'}</span>

                      {renderProductBadge(product)}

                    </div>

                    <h4 className="product-title">{product.name}</h4>

                    <p style={{ margin: '0 0 0.8rem 0', fontSize: '1rem', fontWeight: '800', color: '#FD7100' }}>{Number(product.price).toFixed(3)} JD</p>

                  </div>

                  <button onClick={(e) => { e.stopPropagation(); openProductDetails(product); }} className="btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}>{t.viewDetails}</button>

                </div>

              ))

            )}

          </div>

        </div>

      ) : isMoreCatalogOpen ? (

        <div style={{ width: '92%', maxWidth: '1000px', margin: '1.5rem auto' }}>

          <button onClick={() => window.history.back()} style={bigOrangeBackButtonStyle}>{t.backToCatalog}</button>

          

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0', flexWrap: 'wrap', gap: '0.8rem' }}>

            <h2 style={{ fontSize: '1.4rem', color: '#FFF7EE', margin: 0, fontWeight: '700' }}>{t.completeCatalog}</h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

              <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t.sortByPrice}</label>

              <select value={catalogSortOption} onChange={e => setCatalogSortOption(e.target.value)} style={{ padding: '0.4rem', borderRadius: '6px', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)', fontSize: '0.8rem' }}>

                <option value="default">{t.sortDefault}</option>

                <option value="lowHigh">{t.sortLowHigh}</option>

                <option value="highLow">{t.sortHighLow}</option>

              </select>

            </div>

          </div>



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

                <div key={product.id || product._id} onClick={() => openProductDetails(product)} className="store-card" style={{ position: 'relative' }}>

                  <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 5 }}>

                    <button 

                      onClick={(e) => toggleWishlist(product, e)}

                      style={{ background: 'rgba(45,44,44,0.8)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}

                    >

                      <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlist.some(item => (item.id || item._id) === (product.id || product._id)) ? '#ef4444' : 'none'} stroke={wishlist.some(item => (item.id || item._id) === (product.id || product._id)) ? '#ef4444' : '#FFF7EE'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>

                    </button>

                  </div>

                  <div>

                    <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '6px', marginBottom: '0.6rem', background: '#242323' }}>

                      <img src={product.image || 'https://via.placeholder.com/260'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>

                      <span className="badge-category">{product.category || 'General'}</span>

                      {renderProductBadge(product)}

                    </div>

                    <h4 className="product-title">{product.name}</h4>

                    <p style={{ margin: '0 0 0.8rem 0', fontSize: '1rem', fontWeight: '800', color: '#FD7100' }}>{Number(product.price).toFixed(3)} JD</p>

                  </div>

                  <button onClick={(e) => { e.stopPropagation(); openProductDetails(product); }} className="btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}>{t.viewDetails}</button>

                </div>

              ))

            )}

          </div>

        </div>

      ) : (

        <>

          <div style={{ position: 'relative', width: '100%', minHeight: '320px', overflow: 'hidden', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>

            <img src="/background.jpg" alt="Banner" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} onError={(e) => { e.target.style.display = 'none'; }} />

            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(180deg, rgba(36,35,35,0.3) 0%, rgba(36,35,35,0.9) 100%)', zIndex: 1 }} />



            {featuredProducts.length > 0 && (

              <div style={{ position: 'relative', zIndex: 10, width: '92%', maxWidth: '1000px', margin: '0 auto 15px auto' }}>

                <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>

                  {featuredProducts.map(product => (

                    <div key={`slide-${product.id || product._id}`} onClick={() => openProductDetails(product)} className="store-card" style={{ minWidth: '190px', maxWidth: '190px', flexShrink: 0, background: 'rgba(45, 44, 44, 0.95)', backdropFilter: 'blur(8px)', position: 'relative' }}>

                      <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 5 }}>

                        <button 

                          onClick={(e) => toggleWishlist(product, e)}

                          style={{ background: 'rgba(45,44,44,0.8)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}

                        >

                          <svg width="14" height="14" viewBox="0 0 24 24" fill={wishlist.some(item => (item.id || item._id) === (product.id || product._id)) ? '#ef4444' : 'none'} stroke={wishlist.some(item => (item.id || item._id) === (product.id || product._id)) ? '#ef4444' : '#FFF7EE'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>

                        </button>

                      </div>

                      <div>

                        <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '8px', marginBottom: '0.5rem', background: '#242323' }}>

                          <img src={product.image || 'https://via.placeholder.com/200'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                        </div>

                        <div style={{ marginBottom: '0.2rem' }}>{renderProductBadge(product)}</div>

                        <h4 className="product-title">{product.name}</h4>

                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#FD7100' }}>{Number(product.price).toFixed(3)} JD</p>

                      </div>

                      <button onClick={(e) => { e.stopPropagation(); openProductDetails(product); }} className="btn-primary" style={{ marginTop: '0.6rem', width: '100%', padding: '0.4rem', fontSize: '0.75rem' }}>{t.viewDetails}</button>

                    </div>

                  ))}

                </div>

              </div>

            )}

          </div>



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



          <div style={{ width: '92%', maxWidth: '1000px', margin: '0 auto' }}>

            {checkoutMessage && (

              <div style={{ background: '#2D2C2C', color: '#FD7100', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', border: '1px solid #FD7100' }}>

                {checkoutMessage}

              </div>

            )}



            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>

              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#FFF7EE', fontWeight: '700' }}>{t.completeCatalog}</h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

                <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t.sortByPrice}</label>

                <select value={catalogSortOption} onChange={e => setCatalogSortOption(e.target.value)} style={{ padding: '0.4rem', borderRadius: '6px', background: '#2D2C2C', color: '#FFF7EE', border: '1px solid rgba(255,247,238,0.3)', fontSize: '0.8rem' }}>

                  <option value="default">{t.sortDefault}</option>

                  <option value="lowHigh">{t.sortLowHigh}</option>

                  <option value="highLow">{t.sortHighLow}</option>

                </select>

              </div>

            </div>



            <div className="grid-2col">

              {homeCatalogProducts.map(product => (

                <div key={product.id || product._id} onClick={() => openProductDetails(product)} className="store-card" style={{ position: 'relative' }}>

                  <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 5 }}>

                    <button 

                      onClick={(e) => toggleWishlist(product, e)}

                      style={{ background: 'rgba(45,44,44,0.8)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}

                    >

                      <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlist.some(item => (item.id || item._id) === (product.id || product._id)) ? '#ef4444' : 'none'} stroke={wishlist.some(item => (item.id || item._id) === (product.id || product._id)) ? '#ef4444' : '#FFF7EE'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>

                    </button>

                  </div>

                  <div>

                    <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '6px', marginBottom: '0.6rem', background: '#242323' }}>

                      <img src={product.image || 'https://via.placeholder.com/260'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>

                      <span className="badge-category">{product.category || 'General'}</span>

                      {renderProductBadge(product)}

                    </div>

                    <h4 className="product-title">{product.name}</h4>

                    <p style={{ margin: '0 0 0.8rem 0', fontSize: '1rem', fontWeight: '800', color: '#FD7100' }}>{Number(product.price).toFixed(3)} JD</p>

                  </div>

                  <button onClick={(e) => { e.stopPropagation(); openProductDetails(product); }} className="btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}>{t.viewDetails}</button>

                </div>

              ))}

            </div>

          </div>

        </>

      )}



      {/* FOOTER */}

      <footer style={{

        background: '#FD7100',

        color: '#1c1b1b',

        padding: '3rem 2rem 2rem 2rem',

        textAlign: 'center',

        marginTop: '3rem',

        fontFamily: 'system-ui, sans-serif'

      }}>

        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>

          

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>

            <img 

              src="/logo.jpg" 

              alt="Logo" 

              style={{ width: '75px', height: '75px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #1c1b1b', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }} 

              onError={(e) => { e.target.style.display = 'none'; }} 

            />

            <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: '#1c1b1b', letterSpacing: '-0.5px' }}>

              {t.storeName}

            </h3>

          </div>



          <p style={{ margin: 0, fontSize: '1.05rem', color: '#1c1b1b', opacity: 0.95, fontWeight: '700' }}>

            {t.footerSlogan}

          </p>



          <div style={{ display: 'flex', gap: '1.2rem', margin: '0.5rem 0', justifyContent: 'center', alignItems: 'center' }}>

            <a 

              href="https://www.instagram.com/karamstores.jo?srtk=MnFvODFwdDhsanh0" 

              target="_blank" 

              rel="noopener noreferrer"

              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1c1b1b', padding: '0.6rem 1.2rem', borderRadius: '10px', textDecoration: 'none' }}

            >

              <img src="/instagram.png" alt="Instagram" style={{ width: '24px', height: '24px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />

              <span style={{ color: '#FFF7EE', fontWeight: 'bold', marginLeft: '6px', marginRight: '6px', fontSize: '0.85rem' }}>Instagram</span>

            </a>



            <a 

              href="https://www.facebook.com/share/19XAjcu342/" 

              target="_blank" 

              rel="noopener noreferrer"

              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1c1b1b', padding: '0.6rem 1.2rem', borderRadius: '10px', textDecoration: 'none' }}

            >

              <img src="/facebook.png" alt="Facebook" style={{ width: '24px', height: '24px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />

              <span style={{ color: '#FFF7EE', fontWeight: 'bold', marginLeft: '6px', marginRight: '6px', fontSize: '0.85rem' }}>Facebook</span>

            </a>

          </div>



          <div style={{ width: '100%', height: '1px', background: 'rgba(28,27,27,0.2)', margin: '0.8rem 0' }}></div>



          <div style={{ fontSize: '0.85rem', color: '#1c1b1b', fontWeight: '600', opacity: 0.85 }}>

            Copyright &copy; 2026 {t.storeName}. All rights reserved.

          </div>



        </div>

      </footer>



      {/* MOBILE BOTTOM APP NAVIGATION BAR WITH CLEAN INLINE SVG ICONS */}

      <div className="bottom-nav">

        <button onClick={() => { setSelectedProduct(null); setSelectedCategoryView(null); setIsMoreCatalogOpen(false); setSubmittedSearchQuery(''); setIsSearchOpen(false); setIsWishlistOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="bottom-nav-btn">

          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>

          <span>{t.navHome}</span>

        </button>



        <button onClick={() => { window.history.pushState({ modalOpen: true }, ''); setIsSearchOpen(!isSearchOpen); setIsWishlistOpen(false); }} className="bottom-nav-btn">

          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>

          <span>{t.navSearch}</span>

        </button>



        <button onClick={() => { window.history.pushState({ modalOpen: true }, ''); setIsWishlistOpen(true); }} className="bottom-nav-btn">

          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>

          <span>{t.navWishlist}</span>

        </button>



        <button onClick={() => { window.history.pushState({ modalOpen: true }, ''); setIsCartOpen(true); }} className="bottom-nav-btn">

          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>

          <span>{t.navCart}</span>

        </button>



        <button onClick={() => { window.history.pushState({ modalOpen: true }, ''); setIsOrderHistoryOpen(true); }} className="bottom-nav-btn">

          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>

          <span>{t.navOrders}</span>

        </button>

      </div>



      {/* WISHLIST MODAL */}

      {isWishlistOpen && (

        <div className="modal-overlay" style={{ alignItems: 'flex-end' }}>

          <div dir={isRtl ? 'rtl' : 'ltr'} className="modal-content modal-bottom-sheet">

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,247,238,0.2)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>

              <h3 style={{ margin: 0, color: '#FFF7EE', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>

                <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>

                {t.wishlist} ({wishlist.length})

              </h3>

              <button onClick={() => window.history.back()} style={{ background: 'transparent', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#FFF7EE' }}>✕</button>

            </div>



            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '45vh' }}>

              {wishlist.length === 0 ? (

                <p style={{ color: '#FFF7EE', opacity: 0.6, textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>{t.emptyWishlist}</p>

              ) : (

                wishlist.map((item, idx) => (

                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,247,238,0.1)', paddingBottom: '0.6rem' }}>

                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', cursor: 'pointer', flex: 1 }} onClick={() => openProductDetails(item)}>

                      <div style={{ width: '45px', height: '45px', overflow: 'hidden', borderRadius: '6px', flexShrink: 0, border: '1px solid rgba(255,247,238,0.2)' }}>

                        <img src={item.image || 'https://via.placeholder.com/45'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                      </div>

                      <div>

                        <h4 style={{ margin: '0 0 0.1rem 0', fontSize: '0.85rem', color: '#FFF7EE', fontWeight: '600' }}>{item.name}</h4>

                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#FD7100' }}>{Number(item.price).toFixed(3)} JD</span>

                      </div>

                    </div>



                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>

                      <button 

                        onClick={() => {

                          addToCart(item, 1);

                          triggerToast(lang === 'ar' ? 'تمت إضافة المنتج إلى السلة!' : 'Added to cart!');

                        }} 

                        className="btn-primary" 

                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}

                      >

                        {t.addToCart}

                      </button>

                      <button onClick={(e) => toggleWishlist(item, e)} style={{ background: '#7f1d1d', color: '#FFF7EE', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>

                    </div>

                  </div>

                ))

              )}

            </div>

          </div>

        </div>

      )}



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

                          {item.selectedColor ? `Color: ${item.selectedColor}` : ''}

                        </p>

                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#FD7100' }}>{Number(item.price).toFixed(3)} JD</span>

                      </div>

                    </div>



                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255,247,238,0.3)', borderRadius: '6px' }}>

                        <button onClick={() => updateQuantity(idx, -1)} style={{ background: '#242323', color: '#FFF7EE', border: 'none', padding: '0.4rem 0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>-</button>

                        <span style={{ padding: '0 0.6rem', fontSize: '0.85rem', fontWeight: 'bold', color: '#FFF7EE' }}>{item.quantity}</span>

                        <button onClick={() => updateQuantity(idx, 1)} style={{ background: '#242323', color: '#FFF7EE', border: 'none', padding: '0.4rem 0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>+</button>

                      </div>

                      <button onClick={() => removeFromCart(idx)} style={{ background: '#7f1d1d', color: '#FFF7EE', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>

                    </div>

                  </div>

                ))

              )}

            </div>



            {cart.length > 0 && (

              <div style={{ borderTop: '1px solid rgba(255,247,238,0.2)', paddingTop: '1rem', marginTop: '0.8rem' }}>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>

                  <button onClick={clearEntireCart} style={{ background: '#7f1d1d', color: '#FFF7EE', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>

                    🗑️ {t.clearCart}

                  </button>

                </div>



                <div style={{ background: '#242323', border: '1px solid rgba(255,247,238,0.2)', borderRadius: '8px', padding: '0.8rem', marginBottom: '0.8rem', fontSize: '0.85rem', color: '#FFF7EE' }}>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>

                    <span style={{ opacity: 0.8 }}>{t.subtotal}</span>

                    <span>{cartSubtotal.toFixed(3)} JD</span>

                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>

                    <span style={{ opacity: 0.8 }}>{t.deliveryFeeLabel}</span>

                    <span>{deliveryFee.toFixed(3)} JD</span>

                  </div>

                  {discountValue > 0 && (

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', color: '#4ade80' }}>

                      <span>Discount ({appliedPromoCode}):</span>

                      <span>-{discountValue.toFixed(3)} JD</span>

                    </div>

                  )}



                  <div style={{ display: 'flex', gap: '0.4rem', margin: '0.6rem 0' }}>

                    <input type="text" placeholder={t.discountLabel} value={promoInput} onChange={e => setPromoInput(e.target.value)} className="form-input" style={{ flex: 1, textTransform: 'uppercase', padding: '0.4rem 0.5rem', fontSize: '0.8rem' }} />

                    <button onClick={handleApplyDiscount} className="btn-primary" style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem' }}>{t.applyPromo}</button>

                  </div>



                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1rem', color: '#FFF7EE', borderTop: '1px solid rgba(255,247,238,0.2)', paddingTop: '0.5rem', marginTop: '0.3rem' }}>

                    <span>{t.totalAmount}</span>

                    <span style={{ color: '#FD7100' }}>{grandTotal.toFixed(3)} JD</span>

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

                <select 

                  value={selectedCity} 

                  onChange={e => setSelectedCity(e.target.value)} 

                  className="form-input" 

                  style={{ fontWeight: 'bold' }}

                >

                  {jordanGovernorates.map(gov => (

                    <option key={gov.key} value={gov.key}>

                      {isRtl ? gov.labelAr : gov.labelEn} ({gov.isAmman ? (storeSettings.deliveryFee !== undefined ? storeSettings.deliveryFee : 2.00) : (storeSettings.irbidDeliveryFee !== undefined ? storeSettings.irbidDeliveryFee : 3.50)} JD)

                    </option>

                  ))}

                </select>

              </div>



              <div className="form-group">

                <label className="form-label">{t.manualAddressLabel} <span style={{ color: '#f87171' }}>{t.obligatory}</span></label>

                <textarea placeholder={t.manualAddressPlaceholder} value={manualAddress} onChange={e => setManualAddress(e.target.value)} rows="3" required className="form-input" />

              </div>



              <div className="form-group">

                <label className="form-label">{t.mapCoordinatesLabel}</label>

                <div style={{ display: 'flex', gap: '0.5rem' }}>

                  <input type="text" placeholder={t.mapCoordinatesPlaceholder} value={mapCoordinates} onChange={e => setMapCoordinates(e.target.value)} className="form-input" style={{ flex: 1 }} />

                  <button 

                    type="button" 

                    onClick={() => {

                      if (navigator.geolocation) {

                        navigator.geolocation.getCurrentPosition(

                          (pos) => {

                            const coords = `${pos.coords.latitude}, ${pos.coords.longitude}`;

                            setMapCoordinates(`https://maps.google.com/?q=${coords}`);

                            triggerToast(lang === 'ar' ? 'تم إدراج إحداثيات الموقع بنجاح!' : 'Location coordinates pinned!', 'success');

                          },

                          () => {

                            alert(lang === 'ar' ? 'تعذر الوصول إلى الموقع الجغرافي.' : 'Unable to retrieve location.');

                          }

                        );

                      } else {

                        alert('Geolocation is not supported by your browser');

                      }

                    }} 

                    style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.5rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}

                  >

                    {t.pinLocationBtn}

                  </button>

                </div>

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

                  const statusColor = ord.status === 'Shipped' || ord.status === 'Delivered' ? '#4ade80' : ord.status === 'Processing' ? '#facc15' : '#60a5fa';

                  const isExpanded = expandedReceiptId === oId;

                  const orderDate = new Date(ord.createdAt || Date.now()).toLocaleString();



                  // Visual order milestone progress bar

                  const statusSteps = ['Pending', 'Processing', 'Shipped', 'Delivered'];

                  const currentStatus = ord.status || 'Pending';

                  const currentStepIdx = Math.max(0, statusSteps.indexOf(currentStatus));



                  return (

                    <div key={oId} style={{ border: '1px solid rgba(255,247,238,0.2)', borderRadius: '10px', padding: '1rem', background: '#242323' }}>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>

                        <div>

                          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#FFF7EE' }}>{t.orderId} #{oId}</span>

                          <span style={{ display: 'block', fontSize: '0.7rem', color: '#FFF7EE', opacity: 0.6 }}>{orderDate}</span>

                        </div>

                        <span style={{ border: '1px solid rgba(255,247,238,0.3)', color: statusColor, padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold' }}>{currentStatus}</span>

                      </div>



                      {/* VISUAL ORDER PROGRESS TIMELINE */}

                      <div style={{ margin: '1rem 0 0.8rem 0', background: '#1c1b1b', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,247,238,0.1)' }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>

                          {statusSteps.map((step, sIdx) => {

                            const isPassed = sIdx <= currentStepIdx;

                            return (

                              <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 2 }}>

                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: isPassed ? '#FD7100' : '#444', color: '#fff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: '4px', border: isPassed ? '2px solid #FFF7EE' : 'none' }}>

                                  {sIdx + 1}

                                </div>

                                <span style={{ fontSize: '0.65rem', color: isPassed ? '#FFF7EE' : 'rgba(255,247,238,0.4)', textAlign: 'center', fontWeight: isPassed ? 'bold' : 'normal' }}>

                                  {step}

                                </span>

                              </div>

                            );

                          })}

                        </div>

                      </div>



                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem' }}>

                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#FFF7EE' }}>

                          {t.totalDue} <span style={{ color: '#FD7100' }}>{Number(ord.grandTotal || ord.total || 0).toFixed(3)} JD</span>

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

                                <span>{it.name} {it.selectedColor ? `(${it.selectedColor})` : ''} (×{it.quantity})</span>

                                <span style={{ fontWeight: 'bold', color: '#FD7100' }}>{(it.price * it.quantity).toFixed(3)} JD</span>

                              </div>

                            ))}

                          </div>



                          <div style={{ borderTop: '1px solid rgba(255,247,238,0.2)', paddingTop: '0.5rem', fontSize: '0.8rem', color: '#FFF7EE' }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>

                              <span style={{ opacity: 0.8 }}>{t.subtotal}</span>

                              <span>{Number(ord.total || 0).toFixed(3)} JD</span>

                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>

                              <span style={{ opacity: 0.8 }}>{t.deliveryFee}</span>

                              <span>{Number(ord.deliveryFee || 2.00).toFixed(3)} JD</span>

                            </div>

                            {ord.discountAmount > 0 && (

                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem', color: '#4ade80' }}>

                                <span>Discount:</span>

                                <span>-{Number(ord.discountAmount).toFixed(3)} JD</span>

                              </div>

                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '0.9rem', marginTop: '0.3rem', borderTop: '1px solid rgba(255,247,238,0.2)', paddingTop: '0.3rem' }}>

                              <span>{t.totalToPay}</span>

                              <span style={{ color: '#FD7100' }}>{Number(ord.grandTotal || (ord.total + (ord.deliveryFee || 2.00))).toFixed(3)} JD</span>

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