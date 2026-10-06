import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
      <div 
        className={`relative w-full ${maxWidth} bg-gradient-to-b from-zinc-950 to-black border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Golden top decorative bar */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-zinc-800 bg-black/80 shrink-0">
          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 truncate pr-2">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 border border-transparent hover:border-amber-500/30 transition touch-manipulation shrink-0"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
