/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  Banknote, 
  RotateCcw, 
  Star, 
  ArrowRight, 
  Search, 
  Eye, 
  Check, 
  Package, 
  PhoneCall, 
  Clock, 
  FileCode,
  Sparkles,
  LayoutDashboard,
  CheckCircle2,
  Zap,
  TrendingUp,
  Tag
} from 'lucide-react';

import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { QuickViewModal } from './components/QuickViewModal';
import { ExportSingleFileModal } from './components/ExportSingleFileModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { PRODUCTS as INITIAL_PRODUCTS, FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from './data/products';
import { Product, CartItem, OrderDetails, StorePaymentConfig } from './types/store';
import { auth, onAuthStateChanged, loginWithGoogle, logoutUser, type User } from './lib/firebase';
import { 
  subscribeToProducts, 
  subscribeToOrders, 
  updateOrderStatusInFirestore, 
  saveProductToFirestore, 
  deleteProductFromFirestore, 
  saveSettingsToFirestore, 
  saveOrderToFirestore, 
  isUserAdmin 
} from './lib/firestoreService';

const DEFAULT_PAYMENT_CONFIG: StorePaymentConfig = {
  storeName: 'NovaDrop Direct',
  currency: '$',
  codEnabled: true,
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  shippingFee: STANDARD_SHIPPING_FEE,
  bkashNumber: '01712-849201',
  nagadNumber: '01815-920184',
  rocketNumber: '01911-582910',
  bankAccountInfo: 'City Bank Ltd - Acc: 14028391028',
  whatsappSupportNumber: '+8801712849201'
};

const INITIAL_DEMO_ORDERS: OrderDetails[] = [
  {
    orderId: 'ND-92418',
    createdAt: '10:45 AM',
    fullDate: 'Today',
    items: [{ product: INITIAL_PRODUCTS[0], quantity: 1 }],
    subtotal: 49.99,
    shipping: 0,
    discount: 5.0,
    total: 44.99,
    paymentMethod: 'cod',
    paymentStatus: 'unpaid_cod',
    customer: {
      fullName: 'Rashidul Karim',
      phone: '01719283746',
      address: 'House 14, Road 5, Sector 3, Uttara',
      city: 'Dhaka',
      postalCode: '1230',
      notes: 'Please call 15 min before arrival'
    },
    status: 'confirmed'
  },
  {
    orderId: 'ND-88102',
    createdAt: '09:15 AM',
    fullDate: 'Today',
    items: [
      { product: INITIAL_PRODUCTS[1], quantity: 1 },
      { product: INITIAL_PRODUCTS[2], quantity: 1 }
    ],
    subtotal: 64.40,
    shipping: 0,
    discount: 0,
    total: 64.40,
    paymentMethod: 'local_wallet',
    paymentReference: 'bKash TrxID: 9KC82M94P',
    paymentStatus: 'paid_verified',
    customer: {
      fullName: 'Nusrat Jahan',
      phone: '01828394019',
      address: 'Apt 5B, Green Valley, Nasirabad',
      city: 'Chittagong',
      postalCode: '4000',
      notes: 'Leave at front desk if unavailable'
    },
    status: 'shipped'
  }
];

export default function App() {
  // Store Products with LocalStorage persistence
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('novadrop_products');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PRODUCTS;
  });

  // Store Orders with LocalStorage persistence
  const [orders, setOrders] = useState<OrderDetails[]>(() => {
    try {
      const saved = localStorage.getItem('novadrop_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_DEMO_ORDERS;
  });

  // Payment & Store Config with LocalStorage persistence
  const [paymentConfig, setPaymentConfig] = useState<StorePaymentConfig>(() => {
    try {
      const saved = localStorage.getItem('novadrop_payment_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PAYMENT_CONFIG;
  });

  // Cart State with LocalStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('novadrop_cart');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [{ product: products[0] || INITIAL_PRODUCTS[0], quantity: 1 }];
  });

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState<number>(0);

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      const adminStatus = isUserAdmin(user);
      setIsAdminUser(adminStatus);
    });
    return () => unsubscribeAuth();
  }, []);

  // Real-time Firestore Products Sync
  useEffect(() => {
    const unsubscribeProducts = subscribeToProducts((remoteProducts) => {
      if (remoteProducts && remoteProducts.length > 0) {
        setProducts(remoteProducts);
      }
    }, INITIAL_PRODUCTS);
    return () => unsubscribeProducts();
  }, []);

  // Real-time Firestore Orders Sync when Admin is logged in
  useEffect(() => {
    if (!isAdminUser) return;
    const unsubscribeOrders = subscribeToOrders((remoteOrders) => {
      if (remoteOrders && remoteOrders.length > 0) {
        setOrders(remoteOrders);
      }
    });
    return () => unsubscribeOrders();
  }, [isAdminUser]);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('novadrop_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('novadrop_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('novadrop_payment_config', JSON.stringify(paymentConfig));
  }, [paymentConfig]);

  useEffect(() => {
    localStorage.setItem('novadrop_cart', JSON.stringify(cart));
  }, [cart]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Cart Handlers
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added ${product.name} to cart!`);
    setIsCartOpen(true);
  };

  const handleBuyNowCOD = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev;
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleProceedToCheckout = (discountPercent: number) => {
    setAppliedDiscountPercent(discountPercent);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleLoginGoogle = async () => {
    try {
      const user = await loginWithGoogle();
      showToast(`Welcome, ${user.displayName || user.email}!`);
    } catch (err: any) {
      showToast(`Google Sign-In: ${err?.message || 'Cancelled'}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      showToast('Signed out of admin session.');
    } catch {
      showToast('Sign out error.');
    }
  };

  const handleOrderSuccess = (newOrder: OrderDetails) => {
    setOrders((prev) => [newOrder, ...prev]);

    setProducts((prev) =>
      prev.map((prod) => {
        const orderedItem = newOrder.items.find((it) => it.product.id === prod.id);
        if (orderedItem) {
          const updatedStock = Math.max(0, prod.stockCount - orderedItem.quantity);
          return { ...prod, stockCount: updatedStock, inStock: updatedStock > 0 };
        }
        return prod;
      })
    );

    setCart([]);
    showToast(`Order #${newOrder.orderId} placed successfully!`);

    // Real-time Cloud Firestore Persistence
    saveOrderToFirestore(newOrder).catch((err) => {
      console.warn('Firestore order sync warning:', err);
    });
  };

  // Admin Handlers
  const handleUpdateOrderStatus = (orderId: string, status: OrderDetails['status'], paymentStatus?: OrderDetails['paymentStatus']) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.orderId === orderId) {
          return {
            ...ord,
            status,
            paymentStatus: paymentStatus || ord.paymentStatus
          };
        }
        return ord;
      })
    );
    showToast(`Order #${orderId} marked as ${status}!`);

    // Real-time Cloud Firestore update
    updateOrderStatusInFirestore(orderId, status).catch((err) => {
      console.warn('Firestore order status sync warning:', err);
    });
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Product "${newProduct.name}" published to live store!`);

    // Real-time Cloud Firestore product publish
    saveProductToFirestore(newProduct).catch((err) => {
      console.warn('Firestore save product sync warning:', err);
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCart((prev) => prev.filter((it) => it.product.id !== productId));
    showToast('Product removed from store.');

    // Real-time Cloud Firestore delete
    deleteProductFromFirestore(productId).catch((err) => {
      console.warn('Firestore delete product sync warning:', err);
    });
  };

  const handleUpdateProductStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stockCount: newStock, inStock: newStock > 0 } : p))
    );
  };

  const handleSavePaymentConfig = (config: StorePaymentConfig) => {
    setPaymentConfig(config);
    showToast('Payment settings updated.');

    // Real-time Cloud Firestore settings save
    saveSettingsToFirestore(config).catch((err) => {
      console.warn('Firestore settings sync warning:', err);
    });
  };

  // Filtered Products
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col selection:bg-amber-400 selection:text-zinc-950 pb-20 sm:pb-0">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#0E1A38] text-white px-4 py-2.5 rounded-xl shadow-2xl border border-amber-400/50 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3-Zone Top Bar Contract */}
      <Header
        cartCount={cartCount}
        cartTotal={cartSubtotal}
        ordersCount={orders.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenExportModal={() => setIsExportOpen(true)}
        onOpenAdminDashboard={() => setIsAdminOpen(true)}
        currentUser={currentUser}
        isAdminUser={isAdminUser}
      />

      <main className="flex-1">
        {/* HERO SECTION with Luxurious Navy Blue Light Mix */}
        <section className="relative overflow-hidden pt-8 pb-14 sm:pt-14 sm:pb-20 border-b border-blue-900/40">
          
          {/* Ambient Navy Light Glow Layers */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-blue-600/20 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-1/2 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              
              {/* Kicker badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-700/50 text-blue-200 text-xs font-bold mb-5 shadow-inner backdrop-blur-md">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                </span>
                <span className="text-amber-300 font-extrabold">Verified Direct Dropship</span>
                <span className="text-blue-500">·</span>
                <span>Real-Time Cash on Delivery</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-heading leading-[1.1] text-balance">
                Trending Everyday Innovations. <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-300 bg-clip-text text-transparent">
                  Delivered Direct to Your Door.
                </span>
              </h1>

              {/* Body */}
              <p className="mt-4 text-sm sm:text-lg text-slate-300 leading-relaxed text-balance max-w-2xl mx-auto font-normal">
                Discover viral, high-utility lifestyle & tech essentials. Pay only when the courier hands you the package with <strong className="text-amber-300 font-bold">Cash on Delivery (COD)</strong> or <strong className="text-blue-300 font-bold">Local Mobile Pay</strong>.
              </p>

              {/* CTAs */}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="#featured-products"
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-zinc-950 text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-xl transition-all flex items-center gap-2 active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4 text-zinc-950" />
                  <span>Shop Featured Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <button
                  onClick={() => setIsAdminOpen(true)}
                  className="px-5 py-3.5 bg-[#0D1B3E] hover:bg-[#122350] text-amber-300 text-xs sm:text-sm font-bold rounded-2xl border border-blue-700/60 shadow-md transition-all flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-400" />
                  <span>Admin & Sells Track</span>
                </button>
              </div>

              {/* Delivery stats on Navy surfaces */}
              <div className="mt-10 pt-7 border-t border-blue-900/50 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
                <div className="p-3.5 bg-[#0C1736]/80 rounded-2xl border border-blue-900/60 shadow-md backdrop-blur-xs">
                  <div className="text-xl sm:text-2xl font-black text-white font-mono-num">
                    24–48h
                  </div>
                  <div className="text-xs text-blue-300 font-medium mt-0.5">Express Delivery</div>
                </div>
                <div className="p-3.5 bg-[#0C1736]/80 rounded-2xl border border-blue-900/60 shadow-md backdrop-blur-xs">
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono-num">
                    100%
                  </div>
                  <div className="text-xs text-blue-300 font-medium mt-0.5">Doorstep Inspection</div>
                </div>
                <div className="p-3.5 bg-[#0C1736]/80 rounded-2xl border border-blue-900/60 shadow-md backdrop-blur-xs">
                  <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono-num">
                    $0.00
                  </div>
                  <div className="text-xs text-blue-300 font-medium mt-0.5">Advance Payment</div>
                </div>
                <div className="p-3.5 bg-[#0C1736]/80 rounded-2xl border border-blue-900/60 shadow-md backdrop-blur-xs">
                  <div className="text-xl sm:text-2xl font-black text-purple-300 font-mono-num">
                    4.9 ★
                  </div>
                  <div className="text-xs text-blue-300 font-medium mt-0.5">Customer Rating</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* TRUST VALUE BAR on Navy */}
        <section className="bg-[#081126]/90 border-b border-blue-900/40 py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs">
              <div className="flex items-center gap-3 bg-[#0E1A38] p-3.5 rounded-2xl border border-blue-900/60 shadow-sm hover:border-amber-400/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-white font-bold">Cash on Delivery</strong>
                  <span className="text-blue-300 text-[11px]">Pay upon doorstep arrival</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#0E1A38] p-3.5 rounded-2xl border border-blue-900/60 shadow-sm hover:border-emerald-400/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-white font-bold">Fast Courier Fleet</strong>
                  <span className="text-blue-300 text-[11px]">Free delivery over ${paymentConfig.freeShippingThreshold}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#0E1A38] p-3.5 rounded-2xl border border-blue-900/60 shadow-sm hover:border-blue-400/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-white font-bold">7-Day Replacement</strong>
                  <span className="text-blue-300 text-[11px]">Guaranteed exchange</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#0E1A38] p-3.5 rounded-2xl border border-blue-900/60 shadow-sm hover:border-purple-400/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-white font-bold">Local Gateways</strong>
                  <span className="text-blue-300 text-[11px]">bKash, Nagad, Bank, Cash</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED PRODUCT CATALOG */}
        <section id="featured-products" className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-blue-900/50">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30">
                  Curated Catalog ({products.length} Products)
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight mt-2">
                  Trending Dropshipping Essentials
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Direct dispatch from certified inventory. Real photos, verified quality, instant Cash on Delivery.
                </p>
              </div>

              {/* Search & Categories */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search catalog..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#0C1838] border border-blue-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-white placeholder-slate-400 shadow-inner"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 p-1 bg-[#0A1430] border border-blue-900/70 rounded-xl">
                  {['all', 'electronics', 'accessories', 'comfort'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                        selectedCategory === cat
                          ? 'bg-amber-400 text-zinc-950 shadow-sm'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {cat === 'all' ? 'All' : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Grid with Sleek Navy Glass Cards */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-[#0E1A38] rounded-3xl border border-blue-900/60 p-8 shadow-md">
                <Package className="w-12 h-12 mx-auto text-blue-400/40 mb-3" />
                <h3 className="text-base font-bold text-white">No products found</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Try clearing your search query or reset the filter.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const discountPercent = Math.round(
                    ((product.originalPrice - product.price) / product.originalPrice) * 100
                  );

                  return (
                    <div
                      key={product.id}
                      className="group bg-[#0E1B3A]/90 hover:bg-[#12224A] rounded-3xl border border-blue-900/60 hover:border-amber-400/70 shadow-lg hover:shadow-2xl hover:shadow-blue-950/50 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                    >
                      {/* Top Media */}
                      <div>
                        <div className="relative aspect-4/3 bg-slate-900 overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />

                          {/* Badge */}
                          {product.badge && (
                            <span className="absolute top-3 left-3 bg-zinc-950/90 text-amber-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-xs shadow-xs border border-amber-400/30">
                              {product.badge}
                            </span>
                          )}

                          {/* Quick view button overlay */}
                          <button
                            onClick={() => setQuickViewProduct(product)}
                            className="absolute bottom-3 right-3 p-2 bg-[#0A132C]/90 hover:bg-[#0A132C] text-white rounded-xl shadow-md border border-blue-700/50 backdrop-blur-xs transition-transform active:scale-95"
                            title="Quick View Details"
                            aria-label={`Quick view ${product.name}`}
                          >
                            <Eye className="w-4 h-4 text-amber-400" />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-5">
                          {/* Category & Rating */}
                          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                            <span className="uppercase tracking-wider font-extrabold text-[10px] text-blue-300 bg-blue-950/90 px-2 py-0.5 rounded border border-blue-800/40">
                              {product.category}
                            </span>
                            <span className="flex items-center gap-1 text-amber-400 font-bold font-mono-num text-[11px]">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {product.rating} ({product.reviewCount})
                            </span>
                          </div>

                          {/* Title & Subtitle */}
                          <h3 className="font-extrabold text-white text-base group-hover:text-amber-300 transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                            {product.subtitle}
                          </p>

                          {/* Pricing */}
                          <div className="mt-3 flex items-baseline gap-2.5">
                            <span className="text-xl font-black text-amber-300 font-mono-num">
                              ${product.price.toFixed(2)}
                            </span>
                            <span className="text-xs text-slate-400 line-through font-mono-num">
                              ${product.originalPrice.toFixed(2)}
                            </span>
                            <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-700/60">
                              -{discountPercent}%
                            </span>
                          </div>

                          {/* Stock status */}
                          <div className="mt-2.5 text-[11px] text-slate-400 flex items-center justify-between">
                            <span className="text-amber-300 font-semibold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              {product.stockCount} left in stock
                            </span>
                            <span className="text-emerald-400 font-semibold text-[10px] bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                              COD Ready
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="p-4 sm:p-5 pt-0 space-y-2">
                        {/* 1-Click Cash on Delivery Buy */}
                        <button
                          onClick={() => handleBuyNowCOD(product)}
                          className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-zinc-950 rounded-xl text-xs font-black shadow-md shadow-amber-500/15 hover:shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-98"
                        >
                          <Banknote className="w-3.5 h-3.5 text-zinc-950" />
                          <span>Buy with Cash on Delivery</span>
                        </button>

                        {/* Add to Cart */}
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full py-2 px-3 bg-[#0A1430] hover:bg-[#101F48] text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-blue-900/60 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                          <span>Add to Bag</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </section>

        {/* HOW CASH ON DELIVERY & LOCAL PAYMENT WORKS */}
        <section id="how-cod-works" className="py-14 sm:py-20 bg-[#060D20] border-t border-b border-blue-900/50 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                Zero Advance Risk
              </span>
              <h2 className="text-2xl sm:text-4xl font-black font-heading tracking-tight mt-2 text-white">
                How Cash on Delivery (COD) Works
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Order online with zero advance payment. Pay only when the courier hands you the parcel at your doorstep.
              </p>
            </div>

            {/* 3 Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-[#0B1530] border border-blue-900/60 rounded-3xl p-6 hover:border-amber-400/40 transition-colors shadow-lg">
                <div className="w-11 h-11 rounded-2xl bg-amber-400/20 text-amber-300 font-extrabold flex items-center justify-center text-sm font-mono-num mb-4 border border-amber-400/30 shadow-xs">
                  01
                </div>
                <h3 className="text-base font-bold text-white font-heading">
                  Order in 30 Seconds
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Choose your product, click "Buy with Cash on Delivery", and provide your name, shipping address, and mobile number. No credit card required.
                </p>
                <div className="mt-4 pt-3 border-t border-blue-900/50 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>$0 advance payment required</span>
                </div>
              </div>

              <div className="bg-[#0B1530] border border-blue-900/60 rounded-3xl p-6 hover:border-amber-400/40 transition-colors shadow-lg">
                <div className="w-11 h-11 rounded-2xl bg-amber-400/20 text-amber-300 font-extrabold flex items-center justify-center text-sm font-mono-num mb-4 border border-amber-400/30 shadow-xs">
                  02
                </div>
                <h3 className="text-base font-bold text-white font-heading">
                  Courier Dispatches Package
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Our dispatch logistics center packages your item with protective seals and dispatches it to your city courier fleet with express tracking.
                </p>
                <div className="mt-4 pt-3 border-t border-blue-900/50 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Courier verification call before arrival</span>
                </div>
              </div>

              <div className="bg-[#0B1530] border border-blue-900/60 rounded-3xl p-6 hover:border-amber-400/40 transition-colors shadow-lg">
                <div className="w-11 h-11 rounded-2xl bg-amber-400/20 text-amber-300 font-extrabold flex items-center justify-center text-sm font-mono-num mb-4 border border-amber-400/30 shadow-xs">
                  03
                </div>
                <h3 className="text-base font-bold text-white font-heading">
                  Inspect & Pay at Doorstep
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  When the courier arrives, inspect the parcel. Hand cash or make a quick local mobile payment (bKash, Nagad, or bank app) to the driver.
                </p>
                <div className="mt-4 pt-3 border-t border-blue-900/50 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% peace of mind guaranteed</span>
                </div>
              </div>

            </div>

            {/* Local payment badges */}
            <div id="local-payments" className="mt-10 p-6 rounded-3xl bg-[#09132C] border border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">Accepted Local Payment Gateways:</h4>
                <p className="text-xs text-slate-400 mt-0.5">Pay exact amount via cash or instant mobile transfer upon delivery.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="px-3 py-1.5 bg-[#0D1C42] text-amber-300 rounded-xl border border-blue-800 shadow-xs">
                  💵 Physical Cash
                </span>
                <span className="px-3 py-1.5 bg-[#0D1C42] text-pink-300 rounded-xl border border-blue-800 shadow-xs">
                  📱 bKash ({paymentConfig.bkashNumber})
                </span>
                <span className="px-3 py-1.5 bg-[#0D1C42] text-orange-300 rounded-xl border border-blue-800 shadow-xs">
                  📱 Nagad ({paymentConfig.nagadNumber})
                </span>
                <span className="px-3 py-1.5 bg-[#0D1C42] text-purple-300 rounded-xl border border-blue-800 shadow-xs">
                  🏦 Bank Instant Pay
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* SOCIAL PROOF & TESTIMONIALS */}
        <section id="customer-guarantee" className="py-14 sm:py-18">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                Buyer Testimonials
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight mt-2">
                Real Customer Experiences with Cash on Delivery
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Over 1,400+ successful doorstep deliveries nationwide.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-5 rounded-3xl border border-blue-900/60 bg-[#0C1736]/90 flex flex-col justify-between shadow-lg hover:border-amber-400/40 transition-colors">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                    "I ordered the AeroTitan Smartwatch with Cash on Delivery because I was hesitant about paying in advance. The package arrived in 28 hours, rider called me, I checked the box, and handed cash. Fantastic product quality!"
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-blue-900/50 flex items-center justify-between text-xs">
                  <div>
                    <strong className="block text-white font-bold">Tariqul Islam</strong>
                    <span className="text-slate-400 text-[11px]">Verified Buyer · Dhaka</span>
                  </div>
                  <span className="text-[11px] text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-700/60">
                    COD Verified
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-3xl border border-blue-900/60 bg-[#0C1736]/90 flex flex-col justify-between shadow-lg hover:border-amber-400/40 transition-colors">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                    "The MagSafe 3-in-1 dock cleaned up my desk clutter completely. Paid with bKash right to the delivery rider when he came. The entire process took less than a minute. Highly recommend this store!"
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-blue-900/50 flex items-center justify-between text-xs">
                  <div>
                    <strong className="block text-white font-bold">Sarah Jenkins</strong>
                    <span className="text-slate-400 text-[11px]">Verified Buyer · Chittagong</span>
                  </div>
                  <span className="text-[11px] text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-700/60">
                    COD Verified
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-3xl border border-blue-900/60 bg-[#0C1736]/90 flex flex-col justify-between shadow-lg hover:border-amber-400/40 transition-colors">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                    "My neck pain had been unbearable until I bought the OrthoRest cervical pillow. Delivered right to my apartment. Cash on delivery gives you 100% confidence. Very happy with the support."
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-blue-900/50 flex items-center justify-between text-xs">
                  <div>
                    <strong className="block text-white font-bold">David K.</strong>
                    <span className="text-slate-400 text-[11px]">Verified Buyer · Sylhet</span>
                  </div>
                  <span className="text-[11px] text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-700/60">
                    COD Verified
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section id="store-faq" className="py-14 sm:py-18 bg-[#060D20] border-t border-blue-900/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                Got Questions?
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight mt-2">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              <div className="bg-[#0C1736] rounded-2xl border border-blue-900/60 p-4 sm:p-5 shadow-sm">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  How does Cash on Delivery (COD) work on this store?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  You add items to your cart, fill in your delivery name, address, and mobile number, and submit. You do not need to enter credit cards or make advance payments. When our courier arrives at your location, you inspect the parcel and pay cash or local mobile wallet directly to the courier.
                </p>
              </div>

              <div className="bg-[#0C1736] rounded-2xl border border-blue-900/60 p-4 sm:p-5 shadow-sm">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Can I inspect the parcel before paying?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Yes, absolutely! The delivery courier will let you verify the outer packaging and ensure the product matches your order before you hand over payment.
                </p>
              </div>

              <div className="bg-[#0C1736] rounded-2xl border border-blue-900/60 p-4 sm:p-5 shadow-sm">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  How do I use the Admin Dashboard to track sales and add products?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Click the <strong>"Admin Panel"</strong> button in the top navigation bar. You can view total sales revenue, manage placed orders (and update their dispatch status), add or delete products from the live catalog, and configure local mobile wallet numbers.
                </p>
              </div>

              <div className="bg-[#0C1736] rounded-2xl border border-blue-900/60 p-4 sm:p-5 shadow-sm">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Can I publish this to GitHub and deploy to Cloudflare Pages / Workers?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Yes! The project includes ready-to-deploy configuration: <code className="text-amber-300">wrangler.toml</code> and GitHub Actions workflows. Follow the steps in <code className="text-amber-300">README.md</code> to connect your GitHub repository to Cloudflare Pages for instant worldwide CDN deployment with zero hosting costs.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER on Navy */}
      <footer className="bg-[#060D20] border-t border-blue-900/50 py-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-base text-white font-heading">NovaDrop</span>
            <span>·</span>
            <span>Luxury Navy Edition Dropship Store with Cash on Delivery</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#featured-products" className="hover:text-white transition-colors">Catalog</a>
            <a href="#how-cod-works" className="hover:text-white transition-colors">How COD Works</a>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-bold"
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => setIsExportOpen(true)}
              className="text-blue-300 hover:text-white font-bold underline"
            >
              Export Single File
            </button>
          </div>
          <div>
            © {new Date().getFullYear()} NovaDrop Direct. All rights reserved.
          </div>
        </div>
      </footer>

      {/* MOBILE STICKY BOTTOM ACTION BAR */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0A132C]/95 backdrop-blur-md border-t border-blue-800/80 px-4 py-2.5 flex items-center justify-between gap-3 shadow-2xl">
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex-1 py-2.5 px-3 bg-[#0E1A38] text-slate-100 rounded-xl text-xs font-bold border border-blue-800/60 flex items-center justify-center gap-1.5"
        >
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span>Cart ({cartCount})</span>
          {cartSubtotal > 0 && <span className="font-mono-num font-extrabold text-amber-300">${cartSubtotal.toFixed(2)}</span>}
        </button>

        <button
          onClick={() => {
            if (cart.length === 0 && products.length > 0) {
              handleAddToCart(products[0]);
            }
            setIsCheckoutOpen(true);
          }}
          className="flex-1 py-2.5 px-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-zinc-950 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Banknote className="w-4 h-4 text-zinc-950" />
          <span>Quick COD Checkout</span>
        </button>
      </div>

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        paymentConfig={paymentConfig}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onCheckout={handleProceedToCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        discountPercent={appliedDiscountPercent}
        paymentConfig={paymentConfig}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={quickViewProduct !== null}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNowCOD={handleBuyNowCOD}
      />

      {/* Admin Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        orders={orders}
        products={products}
        paymentConfig={paymentConfig}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onAddProduct={handleAddProduct}
        onDeleteProduct={handleDeleteProduct}
        onUpdateProductStock={handleUpdateProductStock}
        onSavePaymentConfig={handleSavePaymentConfig}
        currentUser={currentUser}
        isAdminUser={isAdminUser}
        onLoginWithGoogle={handleLoginGoogle}
        onLogout={handleLogout}
      />

      {/* Export Single File Modal */}
      <ExportSingleFileModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

    </div>
  );
}
