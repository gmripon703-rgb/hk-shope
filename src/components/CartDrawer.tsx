import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShieldCheck, Truck, ArrowRight, Tag, Check, Sparkles, ShoppingBag } from 'lucide-react';
import { CartItem, StorePaymentConfig } from '../types/store';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  paymentConfig: StorePaymentConfig;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckout: (appliedDiscountPercent: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  paymentConfig,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isFreeShipping = subtotal >= paymentConfig.freeShippingThreshold;
  const shippingFee = items.length === 0 ? 0 : isFreeShipping ? 0 : paymentConfig.shippingFee;
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.percent) / 100 : 0;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const amountNeededForFreeShipping = Math.max(0, paymentConfig.freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / paymentConfig.freeShippingThreshold) * 100);

  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'WELCOME10' || code === 'SAVE10') {
      setAppliedCoupon({ code, percent: 10 });
      setCouponCode('');
    } else if (code === 'VIP20') {
      setAppliedCoupon({ code, percent: 20 });
      setCouponCode('');
    } else if (code === 'FREESHIP') {
      setAppliedCoupon({ code, percent: 5 });
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code. Try WELCOME10');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform ease-out duration-300">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight font-heading flex items-center gap-2">
                  <span>Your Shopping Bag</span>
                  <span className="text-xs bg-amber-400 text-zinc-950 font-mono-num font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                    {items.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                </h2>
                <p className="text-[11px] text-zinc-300">
                  Cash on Delivery & Local Mobile Pay
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free shipping progress bar */}
          {items.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-b border-amber-200/80 px-4 py-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-amber-950 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-700" />
                  {isFreeShipping ? (
                    <span className="text-emerald-700 font-bold">✓ FREE Express Delivery Unlocked!</span>
                  ) : (
                    <span>
                      Add <strong className="font-mono-num font-extrabold text-amber-900">${amountNeededForFreeShipping.toFixed(2)}</strong> more for FREE Shipping!
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-mono-num text-amber-800 font-bold">
                  {freeShippingProgress.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-400 h-2 rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-200">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="text-base font-bold text-zinc-900">Your cart is empty</h3>
                <p className="text-xs text-zinc-500 max-w-xs mt-1 mb-6">
                  Explore our verified winning dropshipping essentials with express doorstep delivery and cash on delivery.
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                  Explore Trending Goods
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3.5 p-3 rounded-2xl border border-zinc-200 hover:border-amber-300 bg-white transition-all shadow-2xs hover:shadow-xs"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 object-cover rounded-xl bg-zinc-100 border border-zinc-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-zinc-900 truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-zinc-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">
                        {item.product.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-100">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-zinc-200 rounded-lg bg-zinc-50 shadow-2xs">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="px-2 py-1 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/70 rounded-l-lg transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-bold text-zinc-950 font-mono-num">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="px-2 py-1 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/70 rounded-r-lg transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-zinc-950 font-mono-num">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-zinc-400 font-mono-num">
                            ${item.product.price.toFixed(2)} ea
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-zinc-200 bg-zinc-50/80 space-y-3.5">
              {/* Coupon box */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-2 rounded-xl">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      Promo Applied: <strong>{appliedCoupon.code}</strong> (-{appliedCoupon.percent}%)
                    </span>
                    <button
                      onClick={() => setAppliedCoupon(null)}
                      className="text-xs text-emerald-700 hover:text-emerald-950 underline font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Coupon code (e.g. WELCOME10)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500 uppercase font-mono-num"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap shadow-xs"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>
                )}
                {!appliedCoupon && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-zinc-500">
                    <span>Discount:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCouponCode('WELCOME10');
                        setAppliedCoupon({ code: 'WELCOME10', percent: 10 });
                      }}
                      className="text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-md font-mono-num font-bold text-[10px] transition-colors"
                    >
                      WELCOME10 (-10%)
                    </button>
                  </div>
                )}
              </div>

              {/* Price Calculations */}
              <div className="space-y-1.5 text-xs text-zinc-600 border-t border-zinc-200 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono-num font-semibold text-zinc-900">${subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="font-mono-num">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Courier Delivery</span>
                  <span className="font-mono-num font-semibold text-zinc-900">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-extrabold uppercase text-[11px]">Free</span>
                    ) : (
                      `$${shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-zinc-950 pt-2 border-t border-zinc-200">
                  <span>Total Amount</span>
                  <span className="font-mono-num text-lg text-amber-700">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Cash On Delivery Assurance */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-2.5 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-950 leading-tight">
                  <strong>Cash on Delivery (COD) Guarantee:</strong> Pay zero advance. Inspect your package when courier arrives, then pay cash or local mobile wallet.
                </div>
              </div>

              {/* Checkout Trigger */}
              <button
                onClick={() => onCheckout(appliedCoupon ? appliedCoupon.percent : 0)}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950 hover:from-zinc-900 hover:to-amber-900 text-white rounded-2xl font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-98"
              >
                <span>Proceed to Cash on Delivery Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  7-Day Replacement
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Doorstep Inspection
                </span>
                <button
                  onClick={onClearCart}
                  className="text-zinc-400 hover:text-rose-600 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
