import React, { useState } from 'react';
import { type User } from 'firebase/auth';
import { 
  X, 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  Truck, 
  AlertCircle, 
  Phone, 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Save, 
  RefreshCw,
  Search,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Flame,
  LogIn,
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { Product, OrderDetails, StorePaymentConfig } from '../types/store';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderDetails[];
  products: Product[];
  paymentConfig: StorePaymentConfig;
  onUpdateOrderStatus: (orderId: string, status: OrderDetails['status'], paymentStatus?: OrderDetails['paymentStatus']) => void;
  onAddProduct: (newProduct: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateProductStock: (productId: string, newStock: number) => void;
  onSavePaymentConfig: (config: StorePaymentConfig) => void;
  currentUser?: User | null;
  isAdminUser?: boolean;
  onLoginWithGoogle?: () => void;
  onLogout?: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  orders,
  products,
  paymentConfig,
  onUpdateOrderStatus,
  onAddProduct,
  onDeleteProduct,
  onUpdateProductStock,
  onSavePaymentConfig,
  currentUser,
  isAdminUser = false,
  onLoginWithGoogle,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'products' | 'payments'>('analytics');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // New Product Form State
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdSubtitle, setNewProdSubtitle] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdOrigPrice, setNewProdOrigPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<'electronics' | 'lifestyle' | 'comfort' | 'accessories'>('electronics');
  const [newProdStock, setNewProdStock] = useState('25');
  const [newProdBadge, setNewProdBadge] = useState('Hot Dropship');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=60');
  const [newProdDesc, setNewProdDesc] = useState('');

  // Payment Config Local State
  const [configForm, setConfigForm] = useState<StorePaymentConfig>({ ...paymentConfig });
  const [configSavedNotice, setConfigSavedNotice] = useState(false);

  if (!isOpen) return null;

  // Analytics Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const totalOrdersCount = orders.length;
  const codOrdersCount = orders.filter((o) => o.paymentMethod === 'cod').length;
  const localWalletOrdersCount = orders.filter((o) => o.paymentMethod === 'local_wallet').length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'delivered').length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'confirmed' || o.status === 'processing').length;
  const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  // Filtered Orders
  const filteredOrders = orders.filter((ord) => {
    const matchesFilter = orderStatusFilter === 'all' || ord.status === orderStatusFilter;
    const matchesSearch =
      ord.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.customer.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.customer.phone.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.customer.city.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice) return;

    const priceNum = parseFloat(newProdPrice);
    const origPriceNum = newProdOrigPrice ? parseFloat(newProdOrigPrice) : priceNum * 1.5;

    const createdProduct: Product = {
      id: `prod-${Date.now()}`,
      name: newProdName.trim(),
      subtitle: newProdSubtitle.trim() || 'Premium dropshipping grade quality · Express courier shipping',
      price: priceNum,
      originalPrice: origPriceNum,
      rating: 4.9,
      reviewCount: Math.floor(20 + Math.random() * 80),
      category: newProdCategory,
      inStock: true,
      stockCount: parseInt(newProdStock, 10) || 20,
      badge: newProdBadge.trim() || 'New Arrival',
      image: newProdImage.trim() || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=60',
      description: newProdDesc.trim() || 'High demand dropship verified item with tested durability, fast courier dispatch and cash on delivery guarantee.',
      features: [
        'Direct factory inspected for 100% quality guarantee',
        'Doorstep Cash on Delivery supported with full inspection',
        'Fast courier dispatch within 24-48 hours',
        '7-Day hassle-free return and exchange guarantee'
      ],
      specs: {
        'Quality Standard': 'Grade A+ Certified',
        'Packaging': 'Retail Gift Box with Tamper-proof Seal',
        'Dispatch Hub': 'Local Express Courier Fleet'
      },
      isHotDropship: true
    };

    onAddProduct(createdProduct);
    setShowAddProductForm(false);
    // Reset form
    setNewProdName('');
    setNewProdSubtitle('');
    setNewProdPrice('');
    setNewProdOrigPrice('');
    setNewProdDesc('');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePaymentConfig(configForm);
    setConfigSavedNotice(true);
    setTimeout(() => setConfigSavedNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 lg:p-6">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-zinc-950 flex items-center justify-center font-bold shadow-md">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-heading tracking-tight">
                  NovaDrop Store Control Center
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Sales tracking, cash on delivery order dispatch, local payments & product manager
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            aria-label="Close dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Firebase Authentication & Live Sync Status Bar */}
        <div className="bg-gradient-to-r from-[#0B1530] to-[#060D20] text-white px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-blue-900/60 text-xs">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-slate-200">Firebase Firestore:</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live (asia-southeast1)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                {currentUser.photoURL && (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Admin'}
                    className="w-5 h-5 rounded-full border border-amber-400"
                  />
                )}
                <span className="text-slate-300 font-mono-num text-[11px] truncate max-w-[160px]">
                  {currentUser.email}
                </span>
                {isAdminUser ? (
                  <span className="bg-amber-400 text-zinc-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    Admin Verified
                  </span>
                ) : (
                  <span className="bg-zinc-700 text-zinc-300 text-[10px] font-medium px-2 py-0.5 rounded-full">
                    Viewer
                  </span>
                )}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-slate-400 hidden sm:inline">Sign in to manage remote orders:</span>
                {onLoginWithGoogle && (
                  <button
                    onClick={onLoginWithGoogle}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all shadow-xs active:scale-95"
                  >
                    <LogIn className="w-3.5 h-3.5 text-zinc-950" />
                    <span>Sign In with Google</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 pt-3 border-b border-zinc-200 bg-zinc-50 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 py-2.5 px-3.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-amber-600 text-amber-900 font-bold bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-600" />
            <span>Sales & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 py-2.5 px-3.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-amber-600 text-amber-900 font-bold bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-amber-600" />
            <span>Live Orders ({orders.length})</span>
            {pendingOrdersCount > 0 && (
              <span className="bg-amber-500 text-zinc-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                {pendingOrdersCount} new
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 py-2.5 px-3.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-amber-600 text-amber-900 font-bold bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Package className="w-4 h-4 text-amber-600" />
            <span>Products & Stock ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 py-2.5 px-3.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'payments'
                ? 'border-amber-600 text-amber-900 font-bold bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <CreditCard className="w-4 h-4 text-amber-600" />
            <span>Local Payment Settings</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 bg-[#FAFAFA]">
          
          {/* TAB 1: ANALYTICS & SALES TRACKING */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
                  <div className="flex items-center justify-between text-zinc-500 text-xs mb-1">
                    <span>Total Sales Revenue</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 font-mono-num">
                    ${totalRevenue.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Live track active</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
                  <div className="flex items-center justify-between text-zinc-500 text-xs mb-1">
                    <span>Total Placed Orders</span>
                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 font-mono-num">
                    {totalOrdersCount}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">
                    {pendingOrdersCount} pending dispatch
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
                  <div className="flex items-center justify-between text-zinc-500 text-xs mb-1">
                    <span>Cash on Delivery (COD)</span>
                    <Truck className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 font-mono-num">
                    {codOrdersCount} <span className="text-xs font-normal text-zinc-400">({totalOrdersCount > 0 ? Math.round((codOrdersCount / totalOrdersCount) * 100) : 0}%)</span>
                  </div>
                  <div className="text-[11px] text-amber-700 font-medium mt-1">
                    Most preferred local choice
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
                  <div className="flex items-center justify-between text-zinc-500 text-xs mb-1">
                    <span>Average Order Value (AOV)</span>
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 font-mono-num">
                    ${averageOrderValue.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">
                    {localWalletOrdersCount} mobile wallet pays
                  </div>
                </div>
              </div>

              {/* Conversion and COD Flow Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-2xs space-y-3">
                  <h4 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    Delivery Fulfillment Breakdown
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-zinc-600">
                      <span>Confirmed / Processing:</span>
                      <strong className="font-mono-num text-amber-600">{pendingOrdersCount}</strong>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full"
                        style={{ width: `${totalOrdersCount > 0 ? (pendingOrdersCount / totalOrdersCount) * 100 : 0}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-zinc-600 pt-2">
                      <span>Delivered & Paid:</span>
                      <strong className="font-mono-num text-emerald-600">{deliveredOrdersCount}</strong>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${totalOrdersCount > 0 ? (deliveredOrdersCount / totalOrdersCount) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-2xs space-y-3">
                  <h4 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    Local Payment Method Distribution
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-100">
                      <span className="font-semibold text-zinc-800">Cash on Delivery (Courier)</span>
                      <span className="font-mono-num font-bold text-zinc-900">{codOrdersCount} orders</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-100">
                      <span className="font-semibold text-zinc-800">Local Mobile Wallet (bKash/Nagad)</span>
                      <span className="font-mono-num font-bold text-zinc-900">{localWalletOrdersCount} orders</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-100">
                      <span className="font-semibold text-zinc-800">Credit / Debit Card</span>
                      <span className="font-mono-num font-bold text-zinc-900">
                        {orders.filter((o) => o.paymentMethod === 'card').length} orders
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Recent Activity list */}
              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-2xs">
                <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
                  <h4 className="font-bold text-sm text-zinc-900">Recent Customer Orders</h4>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-amber-700 hover:text-amber-900 font-bold"
                  >
                    View All Orders →
                  </button>
                </div>
                {orders.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-400">
                    No orders placed yet. Place an order on the storefront to see it here!
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 text-xs">
                    {orders.slice(0, 4).map((ord) => (
                      <div key={ord.orderId} className="p-3.5 flex items-center justify-between hover:bg-zinc-50/80">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-900 font-mono-num">{ord.orderId}</span>
                            <span className="text-zinc-500">· {ord.customer.fullName} ({ord.customer.phone})</span>
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">
                            {ord.items.length} item(s) · {ord.customer.city} · {ord.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Mobile Wallet'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold font-mono-num text-zinc-950">${ord.total.toFixed(2)}</div>
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-zinc-200">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search by order ID, name, phone, city..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
                  {['all', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((statusKey) => (
                    <button
                      key={statusKey}
                      onClick={() => setOrderStatusFilter(statusKey)}
                      className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap font-medium transition-colors ${
                        orderStatusFilter === statusKey
                          ? 'bg-zinc-900 text-white font-bold'
                          : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      {statusKey}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-xl border border-zinc-200">
                  <ShoppingBag className="w-10 h-10 mx-auto text-zinc-300 mb-2" />
                  <h4 className="text-sm font-bold text-zinc-700">No matching orders found</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Try adjusting the search filter or place an order from the store.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((ord) => (
                    <div
                      key={ord.orderId}
                      className="bg-white rounded-xl border border-zinc-200 p-4 shadow-2xs hover:shadow-sm transition-all"
                    >
                      {/* Top Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-extrabold text-sm text-zinc-900 font-mono-num">
                            #{ord.orderId}
                          </span>
                          <span className="text-xs text-zinc-400 font-mono-num">
                            {ord.createdAt} ({ord.fullDate || 'Today'})
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            ord.paymentMethod === 'cod' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                          }`}>
                            {ord.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Mobile Wallet'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500">Status:</span>
                          <select
                            value={ord.status}
                            onChange={(e) => onUpdateOrderStatus(ord.orderId, e.target.value as any)}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-zinc-200 bg-zinc-50 focus:outline-hidden"
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing / Packing</option>
                            <option value="shipped">Courier Dispatched</option>
                            <option value="delivered">Delivered & Paid</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Middle Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-3 text-xs text-zinc-700">
                        {/* Customer Info */}
                        <div className="space-y-1">
                          <strong className="block text-zinc-900 font-semibold">{ord.customer.fullName}</strong>
                          <div className="flex items-center gap-1.5 text-zinc-600">
                            <Phone className="w-3 h-3 text-zinc-400" />
                            <a href={`tel:${ord.customer.phone}`} className="hover:underline font-mono-num">
                              {ord.customer.phone}
                            </a>
                            <a
                              href={`https://wa.me/?text=Hello%20${encodeURIComponent(ord.customer.fullName)},%20this%20is%20NovaDrop%20regarding%20your%20Order%20${ord.orderId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 hover:text-emerald-800 p-0.5"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <div className="text-zinc-500">
                            {ord.customer.address}, {ord.customer.city}
                          </div>
                          {ord.customer.notes && (
                            <div className="text-[11px] text-amber-800 italic bg-amber-50 p-1.5 rounded mt-1">
                              Note: {ord.customer.notes}
                            </div>
                          )}
                        </div>

                        {/* Items */}
                        <div>
                          <div className="font-semibold text-zinc-900 mb-1">Ordered Items ({ord.items.length}):</div>
                          <div className="space-y-1">
                            {ord.items.map((it) => (
                              <div key={it.product.id} className="flex items-center justify-between text-[11px]">
                                <span className="truncate max-w-[170px] text-zinc-700">{it.product.name}</span>
                                <span className="font-mono-num text-zinc-500">{it.quantity} × ${it.product.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Payment & Total */}
                        <div className="space-y-1 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Subtotal:</span>
                              <span className="font-mono-num">${ord.subtotal.toFixed(2)}</span>
                            </div>
                            {ord.discount > 0 && (
                              <div className="flex justify-between text-emerald-700">
                                <span>Discount:</span>
                                <span className="font-mono-num">-${ord.discount.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Shipping:</span>
                              <span className="font-mono-num">{ord.shipping === 0 ? 'FREE' : `$${ord.shipping.toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between text-sm font-extrabold text-zinc-950 pt-1 border-t border-zinc-200">
                              <span>Total Due:</span>
                              <span className="font-mono-num">${ord.total.toFixed(2)}</span>
                            </div>
                          </div>

                          {ord.paymentReference && (
                            <div className="text-[11px] font-mono-num text-amber-900 bg-amber-100/70 p-1 rounded mt-1">
                              Trx Ref: {ord.paymentReference}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Quick Actions */}
                      <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="text-[11px] text-zinc-500">
                          Payment Status:{' '}
                          <strong className={ord.paymentStatus === 'paid_verified' ? 'text-emerald-700' : 'text-amber-800'}>
                            {ord.paymentStatus === 'paid_verified' ? 'Paid & Verified' : 'COD Payment on Doorstep'}
                          </strong>
                        </div>

                        <div className="flex items-center gap-2">
                          {ord.paymentStatus !== 'paid_verified' && (
                            <button
                              onClick={() => onUpdateOrderStatus(ord.orderId, ord.status, 'paid_verified')}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Mark Payment Received</span>
                            </button>
                          )}
                          <a
                            href={`https://wa.me/?text=Hello%20${encodeURIComponent(ord.customer.fullName)},%20your%20NovaDrop%20order%20${ord.orderId}%20is%20currently%20${ord.status}.%20Total:%20$${ord.total.toFixed(2)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3 text-zinc-600" />
                            <span>WhatsApp Customer</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRODUCTS & INVENTORY MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-zinc-200">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900">Catalog Inventory</h4>
                  <p className="text-xs text-zinc-500">Add, edit stock, or update live storefront goods in real time.</p>
                </div>
                <button
                  onClick={() => setShowAddProductForm(!showAddProductForm)}
                  className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddProductForm ? 'Cancel' : 'Add New Product'}</span>
                </button>
              </div>

              {/* Add Product Form Drawer */}
              {showAddProductForm && (
                <form
                  onSubmit={handleCreateProduct}
                  className="bg-white p-4 sm:p-5 rounded-xl border border-amber-300 shadow-md space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <h5 className="font-bold text-sm text-zinc-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      Add New Dropship Product
                    </h5>
                    <button
                      type="button"
                      onClick={() => setShowAddProductForm(false)}
                      className="text-xs text-zinc-400 hover:text-zinc-700"
                    >
                      Close
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">Product Title *</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Ultra Sonic Cleaner Pro"
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        className="w-full p-2 border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">Catchy Subtitle</label>
                      <input
                        type="text"
                        placeholder="e.g. 45kHz High Frequency · Glasses & Jewelry"
                        value={newProdSubtitle}
                        onChange={(e) => setNewProdSubtitle(e.target.value)}
                        className="w-full p-2 border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">Selling Price ($) *</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        placeholder="29.99"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        className="w-full p-2 border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">Original Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="49.99"
                        value={newProdOrigPrice}
                        onChange={(e) => setNewProdOrigPrice(e.target.value)}
                        className="w-full p-2 border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">Category</label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value as any)}
                        className="w-full p-2 border border-zinc-300 rounded-lg focus:outline-hidden"
                      >
                        <option value="electronics">Electronics & Tech</option>
                        <option value="accessories">Accessories & Gear</option>
                        <option value="comfort">Comfort & Sleep</option>
                        <option value="lifestyle">Lifestyle & EDC</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">Stock Quantity</label>
                      <input
                        type="number"
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(e.target.value)}
                        className="w-full p-2 border border-zinc-300 rounded-lg focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-zinc-700 mb-1">Image URL</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={newProdImage}
                        onChange={(e) => setNewProdImage(e.target.value)}
                        className="w-full p-2 border border-zinc-300 rounded-lg focus:outline-hidden text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-zinc-700 mb-1">Short Description</label>
                      <textarea
                        rows={2}
                        placeholder="Compelling dropshipping product description..."
                        value={newProdDesc}
                        onChange={(e) => setNewProdDesc(e.target.value)}
                        className="w-full p-2 border border-zinc-300 rounded-lg focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                    <button
                      type="button"
                      onClick={() => setShowAddProductForm(false)}
                      className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                    >
                      Publish to Live Store
                    </button>
                  </div>
                </form>
              )}

              {/* Product Cards List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-xl border border-zinc-200 p-3 shadow-2xs flex flex-col justify-between"
                  >
                    <div className="flex gap-3">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 object-cover rounded-lg border border-zinc-100 bg-zinc-50 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h5 className="font-bold text-xs text-zinc-900 truncate">{prod.name}</h5>
                          <button
                            onClick={() => onDeleteProduct(prod.id)}
                            className="text-zinc-400 hover:text-rose-600 p-1"
                            title="Remove product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-zinc-500 line-clamp-1">{prod.subtitle}</p>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="font-bold font-mono-num text-xs text-zinc-950">${prod.price.toFixed(2)}</span>
                          <span className="text-[10px] text-zinc-400 line-through font-mono-num">${prod.originalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500 text-[11px]">Stock:</span>
                        <input
                          type="number"
                          value={prod.stockCount}
                          onChange={(e) => onUpdateProductStock(prod.id, parseInt(e.target.value, 10) || 0)}
                          className="w-14 px-1.5 py-0.5 text-xs font-mono-num border border-zinc-300 rounded font-semibold text-center"
                        />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                        {prod.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: LOCAL PAYMENT GATEWAY CONFIGURATION */}
          {activeTab === 'payments' && (
            <form onSubmit={handleSaveSettings} className="max-w-2xl bg-white p-5 rounded-xl border border-zinc-200 shadow-2xs space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-sm text-zinc-900">Local Payment Gateway & COD Setup</h4>
                <p className="text-xs text-zinc-500">Configure your local mobile numbers, COD options, and customer WhatsApp alerts.</p>
              </div>

              {configSavedNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Settings updated! Storefront and checkout are now using the updated details.</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Store Brand Name</label>
                  <input
                    type="text"
                    value={configForm.storeName}
                    onChange={(e) => setConfigForm({ ...configForm, storeName: e.target.value })}
                    className="w-full p-2 border border-zinc-300 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">bKash Merchant / Personal Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 01712345678"
                      value={configForm.bkashNumber}
                      onChange={(e) => setConfigForm({ ...configForm, bkashNumber: e.target.value })}
                      className="w-full p-2 border border-zinc-300 rounded-lg text-xs font-mono-num"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">Nagad Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 01812345678"
                      value={configForm.nagadNumber}
                      onChange={(e) => setConfigForm({ ...configForm, nagadNumber: e.target.value })}
                      className="w-full p-2 border border-zinc-300 rounded-lg text-xs font-mono-num"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">Rocket / Other Wallet Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 01912345678"
                      value={configForm.rocketNumber}
                      onChange={(e) => setConfigForm({ ...configForm, rocketNumber: e.target.value })}
                      className="w-full p-2 border border-zinc-300 rounded-lg text-xs font-mono-num"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">WhatsApp Order Dispatch Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +8801712345678"
                      value={configForm.whatsappSupportNumber}
                      onChange={(e) => setConfigForm({ ...configForm, whatsappSupportNumber: e.target.value })}
                      className="w-full p-2 border border-zinc-300 rounded-lg text-xs font-mono-num"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">Free Shipping Threshold ($)</label>
                    <input
                      type="number"
                      value={configForm.freeShippingThreshold}
                      onChange={(e) => setConfigForm({ ...configForm, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border border-zinc-300 rounded-lg text-xs font-mono-num"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">Standard Courier Shipping Fee ($)</label>
                    <input
                      type="number"
                      value={configForm.shippingFee}
                      onChange={(e) => setConfigForm({ ...configForm, shippingFee: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border border-zinc-300 rounded-lg text-xs font-mono-num"
                    />
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
                  <div>
                    <strong className="block text-zinc-900">Enable Cash on Delivery (COD) Checkout</strong>
                    <span className="text-zinc-500 text-[11px]">Allows customers to place orders with $0 advance payment.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={configForm.codEnabled}
                    onChange={(e) => setConfigForm({ ...configForm, codEnabled: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Payment Configuration</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
