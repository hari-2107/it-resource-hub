import React, { useEffect, useState } from 'react';
import { X, Sparkles, ArrowRight, BookOpen, Bot, Calendar, Briefcase } from 'lucide-react';

export const SignupWelcomeToast = ({ userName, onDismiss }) => {
  const [isClosing, setIsClosing] = useState(false);
  const firstName = (userName || 'Student').split(' ')[0];

  useEffect(() => {
    // Auto-dismiss after 6 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 6000);

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
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[92%] sm:w-auto transition-all duration-300 transform pointer-events-auto ${
        isClosing
          ? 'opacity-0 -translate-y-4 scale-95'
          : 'opacity-100 translate-y-0 scale-100 animate-in slide-in-from-top-4'
      }`}
    >
      <div className="p-4 rounded-3xl bg-slate-900/95 backdrop-blur-xl border-2 border-amber-500/60 text-slate-100 shadow-2xl shadow-amber-500/25 space-y-3">
        
        {/* Top bar with icon & close */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1 animate-pulse">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Welcome to IT Resource Hub</span>
            </span>
          </div>

          <button
            onClick={handleClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
            title="Dismiss Welcome"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Copy */}
        <div className="space-y-1">
          <h4 className="font-black text-sm sm:text-base text-white leading-tight">
            Look who finally made it,{' '}
            <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-purple-300 bg-clip-text text-transparent">
              {firstName} 👀
            </span>
          </h4>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            The notes were here the whole time. You're welcome. Nice pick joining today 😌
          </p>
        </div>

        {/* Quick highlight badges */}
        <div className="flex items-center space-x-2 text-[11px] font-bold text-amber-300/90 overflow-x-auto pb-1 scrollbar-none">
          <span className="px-2 py-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-1 whitespace-nowrap">
            <BookOpen className="w-3 h-3 text-amber-400" />
            <span>Notes unlocked</span>
          </span>
          <span className="px-2 py-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-1 whitespace-nowrap">
            <Bot className="w-3 h-3 text-cyan-400" />
            <span>AI Tools</span>
          </span>
          <span className="px-2 py-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-1 whitespace-nowrap">
            <Calendar className="w-3 h-3 text-purple-400" />
            <span>Timetable</span>
          </span>
          <span className="px-2 py-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-1 whitespace-nowrap">
            <Briefcase className="w-3 h-3 text-emerald-400" />
            <span>Placement Prep</span>
          </span>
        </div>

        {/* Let's Go Action Button */}
        <div className="pt-1 flex items-center justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-1.5 rounded-xl font-extrabold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 flex items-center space-x-1.5 transition-all transform hover:scale-[1.02]"
          >
            <span>Let's Go</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
