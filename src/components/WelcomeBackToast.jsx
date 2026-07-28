import React, { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';

export const WelcomeBackToast = ({ userName, onDismiss }) => {
  const [isClosing, setIsClosing] = useState(false);
  const firstName = (userName || 'Student').split(' ')[0];

  useEffect(() => {
    // Auto-dismiss after 4.5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[92%] sm:w-auto transition-all duration-300 transform pointer-events-auto ${
        isClosing
          ? 'opacity-0 -translate-y-4 scale-95'
          : 'opacity-100 translate-y-0 scale-100 animate-in slide-in-from-top-4'
      }`}
    >
      <div className="p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-amber-500/50 text-slate-100 shadow-2xl shadow-amber-500/20 flex items-center space-x-3 text-xs">
        
        {/* Left Decorative Icon */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 flex-shrink-0 animate-bounce" style={{ animationDuration: '2s' }}>
          <Sparkles className="w-4.5 h-4.5 text-amber-300" />
        </div>

        {/* Copy text */}
        <div className="flex-1 overflow-hidden space-y-0.5">
          <h5 className="font-extrabold text-xs text-white leading-tight">
            Back again, {firstName}? 👀
          </h5>
          <p className="text-[11px] text-slate-300 font-medium leading-snug">
            Couldn't stay away, huh. We get it.
          </p>
        </div>

        {/* Top-Right Manual Close Button */}
        <button
          onClick={handleClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
          title="Dismiss Greeting"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
