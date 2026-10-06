import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  const modalElement = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in touch-manipulation"
      onClick={onClose}
    >
      <div 
        className={`relative w-full ${maxWidth} bg-gradient-to-b from-zinc-950 via-zinc-900 to-black border border-amber-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Golden top decorative bar */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-500/80 to-transparent shadow-[0_0_10px_#f59e0b]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-zinc-800/80 bg-black/90 shrink-0">
          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 truncate pr-2">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 border border-transparent hover:border-amber-500/30 transition touch-manipulation shrink-0 cursor-pointer"
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

  return typeof document !== 'undefined'
    ? createPortal(modalElement, document.body)
    : modalElement;
}
