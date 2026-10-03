import React from 'react';
import { type User } from 'firebase/auth';
import { ShoppingBag, FileCode, CheckCircle2, LayoutDashboard, Sparkles, User as UserIcon, Flame } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  cartTotal: number;
  ordersCount: number;
  onOpenCart: () => void;
  onOpenExportModal: () => void;
  onOpenAdminDashboard: () => void;
  currentUser?: User | null;
  isAdminUser?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  cartTotal,
  ordersCount,
  onOpenCart,
  onOpenExportModal,
  onOpenAdminDashboard,
  currentUser,
  isAdminUser,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A132C]/90 backdrop-blur-md border-b border-blue-900/50 shadow-lg">
      {/* Top Navy Announcement Micro-Bar */}
      <div className="bg-gradient-to-r from-[#060D20] via-[#0E1A38] to-[#060D20] text-blue-200 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-3 border-b border-blue-900/30">
        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Cash on Delivery (COD) Nationwide</span>
        </span>
        <span className="hidden sm:inline text-blue-800">|</span>
        <span className="hidden sm:inline text-amber-300 font-medium">Pay 0% advance • Inspect goods with courier</span>
        <span className="hidden md:inline text-blue-800">|</span>
        <span className="hidden md:inline text-blue-300">Fast 24-48h Doorstep Dispatch</span>
      </div>

      {/* Main Top Bar Contract: Zone 1, Zone 2, Zone 3 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text wordmark with attractive glowing mark */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-zinc-950 flex items-center justify-center font-black text-sm shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-heading">
              NovaDrop
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full shadow-xs">
              Navy Edition
            </span>
          </div>
        </a>

        {/* Zone 2: Clean nav links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-300">
          <a href="#featured-products" className="hover:text-amber-400 transition-colors">
            Trending Goods
          </a>
          <a href="#how-cod-works" className="hover:text-amber-400 transition-colors">
            Cash On Delivery
          </a>
          <a href="#local-payments" className="hover:text-amber-400 transition-colors">
            Local Payments
          </a>
          <a href="#customer-guarantee" className="hover:text-amber-400 transition-colors">
            Buyer Protection
          </a>
          <a href="#store-faq" className="hover:text-amber-400 transition-colors">
            FAQ
          </a>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Admin Dashboard Trigger */}
          <button
            onClick={onOpenAdminDashboard}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-bold rounded-xl transition-all border shadow-xs active:scale-95 ${
              isAdminUser 
                ? 'text-amber-300 bg-amber-500/20 border-amber-400/50 ring-1 ring-amber-400/30' 
                : 'text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30'
            }`}
            title="Open Admin Dashboard (Sales Tracking, Orders & Product Manager)"
          >
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Admin" className="w-4 h-4 rounded-full border border-amber-400" />
            ) : (
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline">{isAdminUser ? 'Admin' : 'Admin Panel'}</span>
            <span className="sm:hidden">Admin</span>
            {ordersCount > 0 && (
              <span className="bg-amber-500 text-zinc-950 font-mono-num text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {ordersCount}
              </span>
            )}
          </button>

          {/* Standalone code export modal button */}
          <button
            onClick={onOpenExportModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-blue-950/60 hover:bg-blue-900/60 rounded-xl transition-colors border border-blue-800/60"
            title="Download pure HTML/PHP single-page version"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            <span>Export (PHP/HTML)</span>
          </button>

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            aria-label="View shopping cart"
            className="relative flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 rounded-xl shadow-md shadow-amber-500/15 hover:shadow-lg transition-all active:scale-95 border border-amber-400/40"
          >
            <ShoppingBag className="w-4 h-4 text-zinc-950" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 ? (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-black text-white bg-zinc-950 rounded-full font-mono-num shadow-xs animate-pulse">
                {cartCount}
              </span>
            ) : (
              <span className="inline-flex items-center justify-center min-w-[18px] h-4.5 px-1 text-[11px] font-bold text-zinc-900 bg-amber-300 rounded-full font-mono-num">
                0
              </span>
            )}
            {cartTotal > 0 && (
              <span className="hidden md:inline text-zinc-950 font-mono-num pl-1 font-extrabold border-l border-amber-600/40">
                ${cartTotal.toFixed(2)}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
