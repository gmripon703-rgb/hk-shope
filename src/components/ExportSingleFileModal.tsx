import React, { useState } from 'react';
import { X, Copy, Check, Download, ExternalLink, Code2, Sparkles, CheckCircle2 } from 'lucide-react';

interface ExportSingleFileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportSingleFileModal: React.FC<ExportSingleFileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [tab, setTab] = useState<'html' | 'php'>('html');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownload = (type: 'html' | 'php') => {
    const filename = type === 'html' ? 'index.html' : 'index.php';
    const filePath = type === 'html' ? '/standalone-store.html' : '/index.php';
    
    // Fetch and download
    fetch(filePath)
      .then((res) => res.text())
      .then((text) => {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error('Failed to download file', err);
      });
  };

  const handleCopyCode = () => {
    const filePath = tab === 'html' ? '/standalone-store.html' : '/index.php';
    fetch(filePath)
      .then((res) => res.text())
      .then((text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <Code2 className="w-5 h-5 text-amber-600" />
              <span>Single-File Static HTML & PHP Version</span>
            </h3>
            <p className="text-xs text-zinc-500">
              Zero dependencies. Self-contained shopping cart, Cash on Delivery, and local payments in 1 single file.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Format selector tabs */}
          <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-xl">
            <button
              onClick={() => setTab('html')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'html'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              index.html (Pure Static HTML/CSS/JS)
            </button>
            <button
              onClick={() => setTab('php')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'php'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              index.php (With PHP Order Storage)
            </button>
          </div>

          {/* Feature Highlights */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 space-y-2 text-xs text-amber-950">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Included in this single file:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-amber-900">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Complete slide-over shopping cart
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Cash on Delivery (COD) order modal
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Local mobile payment option
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Ready to drop into any server or cPanel
              </span>
            </div>
          </div>

          {/* Quick instructions */}
          <div className="space-y-1.5 text-xs text-zinc-600">
            <h4 className="font-bold text-zinc-900">How to use it on your server:</h4>
            <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px]">
              <li>Click <strong>Download {tab === 'html' ? 'index.html' : 'index.php'}</strong> below.</li>
              <li>Upload the file to your public HTML root folder (`public_html` or Apache/Nginx webroot).</li>
              <li>Open your domain in any browser — your dropship storefront & cart are immediately live!</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-zinc-100">
            <button
              onClick={() => handleDownload(tab)}
              className="flex-1 min-w-[170px] py-2.5 px-4 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download {tab === 'html' ? 'index.html' : 'index.php'}</span>
            </button>

            <button
              onClick={handleCopyCode}
              className="py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Source Code'}</span>
            </button>

            <a
              href="/standalone-store.html"
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-3 text-xs text-zinc-600 hover:text-zinc-950 font-medium flex items-center gap-1.5 underline underline-offset-4"
            >
              <span>Preview HTML</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
