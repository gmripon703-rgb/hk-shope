import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  Phone, 
  MapPin, 
  User, 
  Banknote, 
  CreditCard, 
  Wallet, 
  Copy, 
  Check, 
  MessageSquare, 
  Printer, 
  ArrowLeft,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { CartItem, PaymentMethod, OrderDetails, StorePaymentConfig } from '../types/store';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  discountPercent: number;
  paymentConfig: StorePaymentConfig;
  onOrderSuccess: (order: OrderDetails) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  discountPercent,
  paymentConfig,
  onOrderSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [selectedWalletProvider, setSelectedWalletProvider] = useState<'bkash' | 'nagad' | 'rocket' | 'bank'>('bkash');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderDetails | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isFreeShipping = subtotal >= paymentConfig.freeShippingThreshold;
  const shippingFee = items.length === 0 ? 0 : isFreeShipping ? 0 : paymentConfig.shippingFee;
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const getActiveWalletNumber = () => {
    switch (selectedWalletProvider) {
      case 'bkash':
        return paymentConfig.bkashNumber || '01712-345678';
      case 'nagad':
        return paymentConfig.nagadNumber || '01812-345678';
      case 'rocket':
        return paymentConfig.rocketNumber || '01912-345678';
      case 'bank':
        return paymentConfig.bankAccountInfo || 'City Bank: 120593848201';
      default:
        return paymentConfig.bkashNumber;
    }
  };

  const activeWalletNumber = getActiveWalletNumber();

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(activeWalletNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required for courier dispatch';
    } else if (formData.phone.trim().length < 7) {
      errors.phone = 'Please provide a valid contact number';
    }
    if (!formData.address.trim()) errors.address = 'Street address is required';
    if (!formData.city.trim()) errors.city = 'City or district is required';

    if (paymentMethod === 'local_wallet' && !transactionRef.trim()) {
      errors.transactionRef = 'Please enter your Transaction Reference (TrxID) or sender phone';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const now = new Date();
      const generatedOrderId = `ND-${Math.floor(10000 + Math.random() * 90000)}`;
      const order: OrderDetails = {
        orderId: generatedOrderId,
        createdAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullDate: now.toLocaleDateString(),
        items: [...items],
        subtotal,
        shipping: shippingFee,
        discount: discountAmount,
        total,
        paymentMethod,
        paymentReference: paymentMethod === 'local_wallet' ? `${selectedWalletProvider.toUpperCase()}: ${transactionRef}` : undefined,
        paymentStatus: paymentMethod === 'cod' ? 'unpaid_cod' : 'pending_verification',
        customer: { ...formData },
        status: 'confirmed',
      };

      setIsSubmitting(false);
      setCompletedOrder(order);
      onOrderSuccess(order);
    }, 600);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const openWhatsAppConfirmation = () => {
    if (!completedOrder) return;
    const phoneTarget = paymentConfig.whatsappSupportNumber ? paymentConfig.whatsappSupportNumber.replace(/\D/g, '') : '';
    const msg = encodeURIComponent(
      `Hello ${paymentConfig.storeName || 'NovaDrop'}! I placed an order ${completedOrder.orderId} for $${completedOrder.total.toFixed(2)} with ${
        completedOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Local Mobile Payment'
      }. Customer: ${completedOrder.customer.fullName} (${completedOrder.customer.phone}). Please confirm dispatch!`
    );
    window.open(`https://wa.me/${phoneTarget}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        
        {/* Modal Top Header with Colorful Gradient */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950 text-white">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-heading tracking-tight flex items-center gap-2">
              {completedOrder ? (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Order Placed Successfully!
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Doorstep Courier Checkout & Cash on Delivery</span>
                </span>
              )}
            </h3>
            <p className="text-xs text-zinc-300 mt-0.5">
              {completedOrder
                ? `Receipt and real-time delivery tracking for #${completedOrder.orderId}`
                : '100% Free Doorstep Inspection. Pay only when you receive your goods.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6">
          {completedOrder ? (
            /* SUCCESS CONFIRMATION VIEW */
            <div className="space-y-6">
              {/* Order Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-teal-50 border border-emerald-200 text-center shadow-xs">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white mb-2 shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-extrabold text-emerald-950 font-heading">
                  Order Confirmed, {completedOrder.customer.fullName}!
                </h4>
                <p className="text-xs text-emerald-800 mt-1 max-w-md mx-auto leading-relaxed">
                  Your order has been pushed to our warehouse logistics center. Our dispatch agent will call you to verify delivery address.
                </p>
                <div className="mt-3.5 inline-block bg-white px-4 py-1.5 rounded-xl border border-emerald-300 text-xs font-mono-num font-extrabold text-emerald-900 shadow-xs">
                  ORDER TRACKING ID: #{completedOrder.orderId}
                </div>
              </div>

              {/* Delivery Status Timeline */}
              <div className="border border-zinc-200 rounded-2xl p-4 bg-zinc-50/70">
                <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-3 flex items-center justify-between">
                  <span>Live Dispatch Timeline</span>
                  <span className="text-emerald-700 font-semibold font-mono-num">Real-Time Sync</span>
                </h5>
                <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                  <div className="space-y-1">
                    <div className="w-7 h-7 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      ✓
                    </div>
                    <span className="font-bold text-zinc-900 block">Received</span>
                    <span className="text-[10px] text-zinc-400">Recorded</span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-7 h-7 mx-auto rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold animate-pulse shadow-xs">
                      2
                    </div>
                    <span className="font-bold text-zinc-900 block">Packing</span>
                    <span className="text-[10px] text-amber-700 font-medium">Warehouse</span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-7 h-7 mx-auto rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <span className="text-zinc-600 block">Courier Fleet</span>
                    <span className="text-[10px] text-zinc-400">Within 12h</span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-7 h-7 mx-auto rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center text-xs font-bold">
                      4
                    </div>
                    <span className="text-zinc-600 block">Delivered & Paid</span>
                    <span className="text-[10px] text-zinc-400">24-48 Hours</span>
                  </div>
                </div>
              </div>

              {/* Order Summary & Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="border border-zinc-200 rounded-2xl p-4 space-y-2 bg-white shadow-2xs">
                  <h6 className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    Delivery Destination
                  </h6>
                  <p className="text-zinc-800 leading-relaxed">
                    <strong className="text-zinc-950">{completedOrder.customer.fullName}</strong><br />
                    {completedOrder.customer.address}<br />
                    {completedOrder.customer.city} {completedOrder.customer.postalCode ? `- ${completedOrder.customer.postalCode}` : ''}
                  </p>
                  <p className="text-zinc-700 flex items-center gap-1 pt-1 font-mono-num font-medium">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    {completedOrder.customer.phone}
                  </p>
                </div>

                <div className="border border-zinc-200 rounded-2xl p-4 space-y-2 bg-white shadow-2xs">
                  <h6 className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 text-amber-600" />
                    Payment Details
                  </h6>
                  <p className="text-zinc-700">
                    Method:{' '}
                    <strong className="text-zinc-900">
                      {completedOrder.paymentMethod === 'cod'
                        ? 'Cash on Delivery (Pay to Courier)'
                        : completedOrder.paymentMethod === 'local_wallet'
                        ? 'Local Mobile Payment / Transfer'
                        : 'Credit / Debit Card'}
                    </strong>
                  </p>
                  {completedOrder.paymentReference && (
                    <p className="text-zinc-600 font-mono-num text-[11px] bg-zinc-100 p-1.5 rounded-lg">
                      Reference: {completedOrder.paymentReference}
                    </p>
                  )}
                  <div className="pt-2 border-t border-zinc-100 space-y-1">
                    <div className="flex justify-between text-zinc-600">
                      <span>Total to Pay upon Delivery:</span>
                      <strong className="text-zinc-950 font-mono-num text-base text-amber-700">
                        ${completedOrder.total.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-zinc-200 rounded-2xl p-4 bg-white shadow-2xs">
                <h6 className="font-bold text-zinc-900 text-xs mb-2">Package Contents ({completedOrder.items.length} items)</h6>
                <div className="divide-y divide-zinc-100 space-y-2">
                  {completedOrder.items.map((item) => (
                    <div key={item.product.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 object-cover rounded-xl bg-zinc-100 border border-zinc-200"
                        />
                        <div>
                          <p className="font-semibold text-zinc-900">{item.product.name}</p>
                          <p className="text-zinc-400 text-[11px] font-mono-num">
                            Qty: {item.quantity} × ${item.product.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold font-mono-num text-zinc-950">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={openWhatsAppConfirmation}
                  className="flex-1 min-w-[190px] py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Notify Store on WhatsApp</span>
                </button>
                <button
                  onClick={handlePrintReceipt}
                  className="py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl font-semibold text-xs transition-colors flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Invoice</span>
                </button>
                <button
                  onClick={onClose}
                  className="py-3 px-4 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl font-semibold text-xs transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            /* CHECKOUT FORM VIEW */
            <form onSubmit={handleSubmitOrder} className="space-y-5">
              
              {/* Order Cart preview */}
              <div className="bg-gradient-to-r from-amber-50/70 via-orange-50/50 to-amber-50/70 border border-amber-200/90 rounded-2xl p-3.5">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-950 mb-2">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Truck className="w-3.5 h-3.5 text-amber-700" />
                    Doorstep Express Delivery ({items.reduce((a, b) => a + b.quantity, 0)} Items)
                  </span>
                  <span className="font-mono-num text-zinc-950 font-extrabold text-sm">Total: ${total.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {items.map((it) => (
                    <div key={it.product.id} className="relative shrink-0" title={it.product.name}>
                      <img
                        src={it.product.image}
                        alt={it.product.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 object-cover rounded-xl border border-zinc-200 bg-white"
                      />
                      <span className="absolute -top-1.5 -right-1.5 bg-zinc-950 text-white text-[10px] font-mono-num font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {it.quantity}
                      </span>
                    </div>
                  ))}
                  <div className="text-[11px] text-amber-900 pl-2">
                    {items.length === 1 ? items[0].product.name : `${items.length} items packed together`}
                  </div>
                </div>
              </div>

              {/* 1. Payment Method Selection */}
              <div>
                <label className="block text-xs font-extrabold text-zinc-900 uppercase tracking-wider mb-2.5">
                  Select Payment Option:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* COD */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      paymentMethod === 'cod'
                        ? 'border-amber-600 bg-amber-50/50 text-amber-950 ring-2 ring-amber-500 shadow-sm'
                        : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Banknote className="w-5 h-5 text-amber-700" />
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950">
                        0% ADVANCE
                      </span>
                    </div>
                    <div className="font-extrabold text-xs text-zinc-950">Cash on Delivery</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      Pay cash to courier when receiving parcel.
                    </div>
                  </button>

                  {/* Local Mobile Wallet */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('local_wallet')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      paymentMethod === 'local_wallet'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-950 ring-2 ring-blue-500 shadow-sm'
                        : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Smartphone className="w-5 h-5 text-blue-700" />
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        bKash / Nagad
                      </span>
                    </div>
                    <div className="font-extrabold text-xs text-zinc-950">Local Mobile Wallet</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      Instant mobile transfer or bank pay.
                    </div>
                  </button>

                  {/* Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      paymentMethod === 'card'
                        ? 'border-purple-600 bg-purple-50/50 text-purple-950 ring-2 ring-purple-500 shadow-sm'
                        : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <CreditCard className="w-5 h-5 text-purple-700" />
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                        CARD
                      </span>
                    </div>
                    <div className="font-extrabold text-xs text-zinc-950">Debit / Credit Card</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      Visa, MasterCard, Amex instant checkout.
                    </div>
                  </button>
                </div>

                {/* Details for Local Payment */}
                {paymentMethod === 'local_wallet' && (
                  <div className="mt-3 p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-950">Choose Wallet:</span>
                      <div className="flex gap-1.5">
                        {(['bkash', 'nagad', 'rocket', 'bank'] as const).map((prov) => (
                          <button
                            key={prov}
                            type="button"
                            onClick={() => setSelectedWalletProvider(prov)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                              selectedWalletProvider === prov
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50'
                            }`}
                          >
                            {prov}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-blue-200">
                      <div>
                        <span className="text-[11px] text-zinc-500 block uppercase font-semibold">Send Money / Payment To:</span>
                        <span className="text-sm font-bold font-mono-num text-zinc-950">{activeWalletNumber}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyNumber}
                        className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-mono-num font-bold transition-colors"
                      >
                        {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedNumber ? 'Copied!' : 'Copy'}
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-blue-950 mb-1">
                        Enter Transaction ID (TrxID) or Sender Mobile Number:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 9JA7BK28 or 01712345678"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-blue-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500 uppercase font-mono-num"
                      />
                      {formErrors.transactionRef && (
                        <p className="text-[11px] text-rose-600 mt-1">{formErrors.transactionRef}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Details for COD */}
                {paymentMethod === 'cod' && (
                  <div className="mt-2.5 p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex items-center gap-3 text-xs text-amber-950">
                    <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
                    <span>
                      <strong>Zero Risk Cash on Delivery:</strong> Keep{' '}
                      <strong className="font-mono-num text-zinc-950 font-bold">${total.toFixed(2)}</strong> ready in cash or local mobile app when the delivery driver hands you the package.
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Customer Delivery Address Form */}
              <div className="space-y-3 pt-2 border-t border-zinc-100">
                <label className="block text-xs font-extrabold text-zinc-900 uppercase tracking-wider">
                  Customer Shipping Address
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="e.g. Alex Morgan"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className={`w-full pl-9 pr-3 py-2.5 text-xs bg-white border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-zinc-900 ${
                          formErrors.fullName ? 'border-rose-500' : 'border-zinc-300'
                        }`}
                      />
                    </div>
                    {formErrors.fullName && (
                      <p className="text-[11px] text-rose-600 mt-0.5">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Mobile Phone (Required for Courier) *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="tel"
                        placeholder="e.g. +1 555-0199 or 01712345678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full pl-9 pr-3 py-2.5 text-xs bg-white border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-zinc-900 font-mono-num ${
                          formErrors.phone ? 'border-rose-500' : 'border-zinc-300'
                        }`}
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="text-[11px] text-rose-600 mt-0.5">{formErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Street Address & House / Flat / Road *
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="e.g. House 42, Road 11, Block B, Banani"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2.5 text-xs bg-white border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-zinc-900 ${
                        formErrors.address ? 'border-rose-500' : 'border-zinc-300'
                      }`}
                    />
                  </div>
                  {formErrors.address && (
                    <p className="text-[11px] text-rose-600 mt-0.5">{formErrors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      City / District *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dhaka, Chittagong, Sylhet"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className={`w-full px-3 py-2.5 text-xs bg-white border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-zinc-900 ${
                        formErrors.city ? 'border-rose-500' : 'border-zinc-300'
                      }`}
                    />
                    {formErrors.city && (
                      <p className="text-[11px] text-rose-600 mt-0.5">{formErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Postal Code / Zip (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1213"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs bg-white border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-zinc-900 font-mono-num"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Courier Delivery Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Call 10 minutes before arrival, leave with security guard..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs bg-white border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950 hover:from-zinc-900 hover:to-amber-900 text-white rounded-2xl font-extrabold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  {isSubmitting ? (
                    <span>Registering Order...</span>
                  ) : (
                    <span>
                      Confirm Order ({paymentMethod === 'cod' ? 'Cash on Delivery' : 'Pay via Wallet'}) • ${total.toFixed(2)}
                    </span>
                  )}
                </button>
                <p className="text-[11px] text-zinc-500 text-center mt-2">
                  🔒 By confirming, your order will be reserved and immediately routed to the delivery courier.
                </p>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
