import React from 'react';
import { X, Star, Shield, Truck, Check, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '../types/store';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNowCOD: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNowCOD,
}) => {
  if (!isOpen || !product) return null;

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 text-zinc-400 hover:text-zinc-700 bg-white/80 hover:bg-white backdrop-blur-xs rounded-full border border-zinc-200 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto grid grid-cols-1 md:grid-cols-2">
          {/* Left: Product Image */}
          <div className="p-6 bg-zinc-50/80 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-zinc-100">
            <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-white shadow-xs border border-zinc-200/80">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <span className="absolute top-3 left-3 bg-zinc-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Quick trust metrics */}
            <div className="w-full mt-4 grid grid-cols-2 gap-2 text-center text-xs text-zinc-600">
              <div className="p-2 bg-white rounded-lg border border-zinc-200/80 flex items-center gap-1.5 justify-center">
                <Truck className="w-3.5 h-3.5 text-amber-600" />
                <span>24-48h Delivery</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-zinc-200/80 flex items-center gap-1.5 justify-center">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cash On Delivery</span>
              </div>
            </div>
          </div>

          {/* Right: Product Info & Actions */}
          <div className="p-6 sm:p-7 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                <span className="uppercase tracking-wider font-semibold text-zinc-700">
                  {product.category}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 text-amber-600 font-semibold font-mono-num">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight font-heading">
                {product.name}
              </h2>

              <p className="text-xs text-zinc-500 mt-1">
                {product.subtitle}
              </p>

              {/* Price Block */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-extrabold text-zinc-950 font-mono-num">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-sm text-zinc-400 line-through font-mono-num">
                  ${product.originalPrice.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Save {discountPercent}%
                </span>
              </div>

              {/* Stock notice */}
              <div className="mt-2 text-xs text-amber-800 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                <span>Only {product.stockCount} items left in dispatch stock</span>
              </div>

              {/* Description */}
              <p className="mt-4 text-xs sm:text-sm text-zinc-600 leading-relaxed">
                {product.description}
              </p>

              {/* Key Features */}
              <div className="mt-4 space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Key Specifications:
                </h4>
                <ul className="space-y-1 text-xs text-zinc-600">
                  {product.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5 pt-4 border-t border-zinc-100">
              <button
                onClick={() => {
                  onBuyNowCOD(product);
                  onClose();
                }}
                className="w-full py-3 px-4 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <span>Buy Now with Cash on Delivery</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-zinc-600" />
                <span>Add to Shopping Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
