import React, { useState, useEffect, useMemo } from 'react';



const API_BASE = process.env.REACT_APP_API_URL || 'https://karamstores.onrender.com';



export default function App() {

  const [products, setProducts] = useState([]);

  const [categories, setCategories] = useState([]);

  const [settings, setSettings] = useState({ deliveryFee: 2.00, irbidDeliveryFee: 3.50, discountCodes: {} });

  const [loading, setLoading] = useState(true);



  // Filters & Navigation

  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const [searchQuery, setSearchQuery] = useState('');

  const [activeTab, setActiveTab] = useState('shop'); // shop | cart | checkout | orders

  

  // Cart State

  const [cart, setCart] = useState(() => {

    try {

      const saved = localStorage.getItem('karam_cart');

      return saved ? JSON.parse(saved) : [];

    } catch (_) { return []; }

  });



  // Promo Code

  const [promoCodeInput, setPromoCodeInput] = useState('');

  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const [promoMessage, setPromoMessage] = useState('');



  // Checkout Form

  const [customerName, setCustomerName] = useState('');

  const [phone1, setPhone1] = useState('');

  const [phone2, setPhone2] = useState('');

  const [region, setRegion] = useState('Amman'); // Amman | Irbid | Other

  const [addressDetails, setAddressDetails] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [completedOrder, setCompletedOrder] = useState(null);



  // Save Cart to LocalStorage

  useEffect(() => {

    localStorage.setItem('karam_cart', JSON.stringify(cart));

  }, [cart]);



  // Fetch Public Store Data

  const fetchData = () => {

    setLoading(true);

    Promise.all([

      fetch(`${API_BASE}/api/products`).then(r => r.json()),

      fetch(`${API_BASE}/api/categories`).then(r => r.json()),

      fetch(`${API_BASE}/api/settings`).then(r => r.json())

    ])

      .then(([prods, cats, sets]) => {

        setProducts(prods || []);

        setCategories(cats || []);

        setSettings(sets || { deliveryFee: 2.00, irbidDeliveryFee: 3.50, discountCodes: {} });

      })

      .catch(err => console.error('Error fetching storefront data:', err))

      .finally(() => setLoading(false));

  };



  useEffect(() => {

    fetchData();

  }, []);



  // Cart Handlers

  const addToCart = (product, size = null) => {

    setCart(prev => {

      const existingIndex = prev.findIndex(item => item.id === product.id && item.selectedSize === size);

      if (existingIndex > -1) {

        const updated = [...prev];

        updated[existingIndex].quantity += 1;

        return updated;

      }

      return [...prev, {

        id: product.id || product._id,

        name: product.name,

        price: Number(product.price),

        image: product.image,

        selectedSize: size,

        quantity: 1

      }];

    });

  };



  const updateCartQty = (id, size, delta) => {

    setCart(prev => {

      return prev.map(item => {

        if (item.id === id && item.selectedSize === size) {

          const newQty = item.quantity + delta;

          return newQty > 0 ? { ...item, quantity: newQty } : null;

        }

        return item;

      }).filter(Boolean);

    });

  };



  const clearCart = () => setCart([]);



  // Price Calculations

  const subtotal = useMemo(() => {

    return cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  }, [cart]);



  const currentDeliveryFee = useMemo(() => {

    if (region === 'Irbid' || region === 'Other') {

      return settings.irbidDeliveryFee !== undefined ? settings.irbidDeliveryFee : 3.50;

    }

    return settings.deliveryFee !== undefined ? settings.deliveryFee : 2.00;

  }, [region, settings]);



  const discountVal = useMemo(() => {

    if (!appliedDiscount) return 0;

    if (appliedDiscount < 1) return subtotal * appliedDiscount; // Percentage

    return Math.min(subtotal, appliedDiscount); // Fixed JD amount

  }, [subtotal, appliedDiscount]);



  const grandTotal = useMemo(() => {

    return Math.max(0, subtotal + currentDeliveryFee - discountVal);

  }, [subtotal, currentDeliveryFee, discountVal]);



  const handleApplyPromo = (e) => {

    e.preventDefault();

    const cleanCode = promoCodeInput.trim().toUpperCase();

    const codes = settings.discountCodes || {};

    if (codes[cleanCode] !== undefined) {

      setAppliedDiscount(codes[cleanCode]);

      setPromoMessage('✅ تم تطبيق كود الخصم بنجاح!');

    } else {

      setPromoMessage('❌ كود الخصم غير صحيح');

    }

  };



  // Submit Order

  const handleCheckoutSubmit = (e) => {

    e.preventDefault();

    if (cart.length === 0) return alert('سلة التسوق فارغة!');

    if (!customerName || !phone1 || !addressDetails) {

      return alert('الرجاء تعبئة جميع الحقول المطلوبة');

    }



    setIsSubmitting(true);

    const orderPayload = {

      items: cart,

      total: subtotal,

      deliveryFee: currentDeliveryFee,

      discountAmount: discountVal,

      grandTotal: grandTotal,

      customer: {

        arabicName: customerName,

        phone1: phone1,

        phone2: phone2,

        manualAddress: `${region} - ${addressDetails}`,

        mapCoordinates: 'Not pinned'

      }

    };



    fetch(`${API_BASE}/api/orders`, {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify(orderPayload)

    })

      .then(res => res.json())

      .then(data => {

        if (data.success) {

          setCompletedOrder(data.order);

          clearCart();

          setActiveTab('success');

        } else {

          alert('تعذر إكمال الطلب، حاول مرة أخرى');

        }

      })

      .catch(() => alert('حدث خطأ في الاتصال بالسيرفر'))

      .finally(() => setIsSubmitting(false));

  };



  // Filtered Products

  const filteredProducts = useMemo(() => {

    return products.filter(p => {

      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;

      const matchSearch = !searchQuery || (p.name || '').toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchSearch;

    });

  }, [products, selectedCategory, searchQuery]);



  return (

    <div dir="rtl" style={{ background: '#121212', color: '#F3F4F6', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Header Bar */}

      <header style={{ background: '#1E1E1E', borderBottom: '1px solid #333', padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => setActiveTab('shop')}>

          <div style={{ background: '#FD7100', color: '#FFF', fontWeight: 'bold', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '1.2rem' }}>K</div>

          <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#FFF' }}>كرم ستورز <span style={{ fontSize: '0.8rem', color: '#FD7100' }}>Karam Stores</span></h1>

        </div>



        {/* Navigation / Cart Badge */}

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>

          <button onClick={() => setActiveTab('shop')} style={{ background: activeTab === 'shop' ? '#333' : 'transparent', color: '#FFF', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>

            🏪 المعرض

          </button>

          <button onClick={() => setActiveTab('cart')} style={{ background: '#FD7100', color: '#FFF', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

            🛒 السلة ({cart.reduce((s, i) => s + i.quantity, 0)})

          </button>

        </div>

      </header>



      {/* Main Body Container */}

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>

        {loading ? (

          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#888' }}>

            <h2>جاري تحميل المنتجات...</h2>

          </div>

        ) : activeTab === 'shop' ? (

          <div>

            {/* Search & Category Filter */}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', justifyContent: 'space-between', alignItems: 'center' }}>

              <input

                type="text"

                placeholder="ابحث عن منتج..."

                value={searchQuery}

                onChange={e => setSearchQuery(e.target.value)}

                style={{ background: '#1E1E1E', border: '1px solid #333', color: '#FFF', padding: '0.7rem 1rem', borderRadius: '8px', width: '280px' }}

              />



              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>

                <button

                  onClick={() => setSelectedCategory('ALL')}

                  style={{ background: selectedCategory === 'ALL' ? '#FD7100' : '#1E1E1E', color: '#FFF', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap' }}

                >

                  الكل

                </button>

                {categories.map(cat => (

                  <button

                    key={cat}

                    onClick={() => setSelectedCategory(cat)}

                    style={{ background: selectedCategory === cat ? '#FD7100' : '#1E1E1E', color: '#FFF', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap' }}

                  >

                    {cat}

                  </button>

                ))}

              </div>

            </div>



            {/* Products Grid */}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>

              {filteredProducts.map(product => (

                <div key={product.id || product._id} style={{ background: '#1E1E1E', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                  <div style={{ height: '200px', background: '#2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

                    {product.image ? (

                      <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                    ) : (

                      <span style={{ fontSize: '3rem', opacity: 0.3 }}>📦</span>

                    )}

                  </div>



                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>

                    <div style={{ fontSize: '0.8rem', color: '#FD7100', fontWeight: 'bold' }}>{product.category}</div>

                    <h3 style={{ margin: '0.4rem 0', fontSize: '1.1rem' }}>{product.name}</h3>

                    <p style={{ color: '#AAA', fontSize: '0.85rem', flexGrow: 1 }}>{product.description || 'منتج عالي الجودة متوفر لدى كرم ستورز'}</p>



                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>

                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10B981' }}>{Number(product.price).toFixed(2)} JD</span>

                      <button

                        onClick={() => addToCart(product)}

                        disabled={product.stock <= 0}

                        style={{

                          background: product.stock > 0 ? '#FD7100' : '#444',

                          color: '#FFF',

                          border: 'none',

                          padding: '0.5rem 1rem',

                          borderRadius: '6px',

                          fontWeight: 'bold',

                          cursor: product.stock > 0 ? 'pointer' : 'not-allowed'

                        }}

                      >

                        {product.stock > 0 ? 'إضافة للسلة' : 'نفذت الكمية'}

                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

        ) : activeTab === 'cart' ? (

          <div style={{ maxWidth: '700px', margin: '0 auto', background: '#1E1E1E', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>

            <h2 style={{ color: '#FD7100', marginTop: 0 }}>🛒 سلة التسوق</h2>



            {cart.length === 0 ? (

              <div style={{ textAlign: 'center', padding: '2rem 0' }}>

                <p style={{ color: '#888' }}>السلة فارغة حالياً</p>

                <button onClick={() => setActiveTab('shop')} style={{ background: '#FD7100', color: '#FFF', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer' }}>تصفح المنتجات</button>

              </div>

            ) : (

              <div>

                {cart.map(item => (

                  <div key={`${item.id}-${item.selectedSize}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #333' }}>

                    <div>

                      <h4 style={{ margin: '0 0 0.3rem 0' }}>{item.name}</h4>

                      <span style={{ color: '#10B981', fontWeight: 'bold' }}>{item.price.toFixed(2)} JD</span>

                    </div>



                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>

                      <button onClick={() => updateCartQty(item.id, item.selectedSize, -1)} style={{ background: '#333', color: '#FFF', border: 'none', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer' }}>-</button>

                      <span>{item.quantity}</span>

                      <button onClick={() => updateCartQty(item.id, item.selectedSize, 1)} style={{ background: '#333', color: '#FFF', border: 'none', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer' }}>+</button>

                    </div>

                  </div>

                ))}



                {/* Promo Code Form */}

                <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>

                  <input

                    type="text"

                    placeholder="كود الخصم (Promo Code)"

                    value={promoCodeInput}

                    onChange={e => setPromoCodeInput(e.target.value)}

                    style={{ flexGrow: 1, background: '#121212', border: '1px solid #333', color: '#FFF', padding: '0.6rem', borderRadius: '6px' }}

                  />

                  <button type="submit" style={{ background: '#333', color: '#FFF', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer' }}>تطبيق</button>

                </form>

                {promoMessage && <p style={{ fontSize: '0.85rem', marginTop: '0.4rem', color: promoMessage.includes('✅') ? '#10B981' : '#EF4444' }}>{promoMessage}</p>}



                {/* Summary */}

                <div style={{ marginTop: '1.5rem', borderTop: '2px dashed #333', paddingTop: '1rem', fontSize: '1rem', lineHeight: '1.8' }}>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>

                    <span>المجموع الفرعي:</span>

                    <span>{subtotal.toFixed(2)} JD</span>

                  </div>

                  {discountVal > 0 && (

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981' }}>

                      <span>الخصم:</span>

                      <span>-{discountVal.toFixed(2)} JD</span>

                    </div>

                  )}

                </div>



                <button onClick={() => setActiveTab('checkout')} style={{ width: '100%', background: '#FD7100', color: '#FFF', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginTop: '1.5rem' }}>

                  الانتقال للشحن والتأكيد ⬅️

                </button>

              </div>

            )}

          </div>

        ) : activeTab === 'checkout' ? (

          <div style={{ maxWidth: '600px', margin: '0 auto', background: '#1E1E1E', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>

            <h2 style={{ color: '#FD7100', marginTop: 0 }}>🚚 معلومات التوصيل والشحن</h2>



            <form onSubmit={handleCheckoutSubmit}>

              <div style={{ marginBottom: '1rem' }}>

                <label style={{ display: 'block', marginBottom: '0.4rem' }}>الاسم الكامل *</label>

                <input

                  type="text"

                  required

                  value={customerName}

                  onChange={e => setCustomerName(e.target.value)}

                  placeholder="مثال: أحمد العبدالله"

                  style={{ width: '100%', background: '#121212', border: '1px solid #333', color: '#FFF', padding: '0.7rem', borderRadius: '6px', boxSizing: 'border-box' }}

                />

              </div>



              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>

                <div>

                  <label style={{ display: 'block', marginBottom: '0.4rem' }}>رقم الهاتف الأساسي *</label>

                  <input

                    type="tel"

                    required

                    value={phone1}

                    onChange={e => setPhone1(e.target.value)}

                    placeholder="079XXXXXXXX"

                    style={{ width: '100%', background: '#121212', border: '1px solid #333', color: '#FFF', padding: '0.7rem', borderRadius: '6px', boxSizing: 'border-box' }}

                  />

                </div>

                <div>

                  <label style={{ display: 'block', marginBottom: '0.4rem' }}>رقم هاتف إضافي</label>

                  <input

                    type="tel"

                    value={phone2}

                    onChange={e => setPhone2(e.target.value)}

                    placeholder="اختياري"

                    style={{ width: '100%', background: '#121212', border: '1px solid #333', color: '#FFF', padding: '0.7rem', borderRadius: '6px', boxSizing: 'border-box' }}

                  />

                </div>

              </div>



              <div style={{ marginBottom: '1rem' }}>

                <label style={{ display: 'block', marginBottom: '0.4rem' }}>المنطقة / المحافظة *</label>

                <select

                  value={region}

                  onChange={e => setRegion(e.target.value)}

                  style={{ width: '100%', background: '#121212', border: '1px solid #333', color: '#FFF', padding: '0.7rem', borderRadius: '6px', boxSizing: 'border-box' }}

                >

                  <option value="Amman">عمان (توصيل {settings.deliveryFee || 2.00} JD)</option>

                  <option value="Irbid">إربد والمحافظات الأخرى (توصيل {settings.irbidDeliveryFee || 3.50} JD)</option>

                </select>

              </div>



              <div style={{ marginBottom: '1.5rem' }}>

                <label style={{ display: 'block', marginBottom: '0.4rem' }}>العنوان التفصيلي (الشارع، البناية)*</label>

                <textarea

                  required

                  rows="3"

                  value={addressDetails}

                  onChange={e => setAddressDetails(e.target.value)}

                  placeholder="اكتب اسم الشارع والمبنى لتسهيل عملية التوصيل..."

                  style={{ width: '100%', background: '#121212', border: '1px solid #333', color: '#FFF', padding: '0.7rem', borderRadius: '6px', boxSizing: 'border-box' }}

                />

              </div>



              {/* Final Breakdown */}

              <div style={{ background: '#121212', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', lineHeight: '1.8' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>

                  <span>المجموع الفرعي:</span>

                  <span>{subtotal.toFixed(2)} JD</span>

                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>

                  <span>رسوم التوصيل:</span>

                  <span>{currentDeliveryFee.toFixed(2)} JD</span>

                </div>

                {discountVal > 0 && (

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981' }}>

                    <span>الخصم:</span>

                    <span>-{discountVal.toFixed(2)} JD</span>

                  </div>

                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', color: '#FD7100', borderTop: '1px solid #333', paddingTop: '0.5rem', marginTop: '0.5rem' }}>

                  <span>المجموع الإجمالي (عند الاستلام):</span>

                  <span>{grandTotal.toFixed(2)} JD</span>

                </div>

              </div>



              <button

                type="submit"

                disabled={isSubmitting}

                style={{ width: '100%', background: '#10B981', color: '#FFF', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}

              >

                {isSubmitting ? 'جاري تأكيد الطلب...' : 'تأكيد الطلب الآن 🛍️'}

              </button>

            </form>

          </div>

        ) : activeTab === 'success' && completedOrder ? (

          <div style={{ maxWidth: '500px', margin: '2rem auto', background: '#1E1E1E', padding: '2rem', borderRadius: '12px', border: '1px solid #10B981', textAlign: 'center' }}>

            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>

            <h2 style={{ color: '#10B981', marginTop: 0 }}>تم تقديم طلبك بنجاح!</h2>

            <p style={{ color: '#AAA' }}>رقم الطلب الخاص بك هو: <strong style={{ color: '#FFF' }}>#{completedOrder.id || completedOrder._id}</strong></p>

            <p style={{ fontSize: '0.9rem', color: '#888' }}>سيقوم فريقنا بالتواصل معك عبر الهاتف لتأكيد موعد التوصيل.</p>



            <button

              onClick={() => { setCompletedOrder(null); setActiveTab('shop'); }}

              style={{ background: '#FD7100', color: '#FFF', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }}

            >

              العودة للرئيسية

            </button>

          </div>

        ) : null}

      </main>

    </div>

  );

}