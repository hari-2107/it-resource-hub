import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Rocket,
  Lock,
  ShieldAlert,
  EyeOff,
  Clock,
  Home,
  AlertTriangle,
  Sparkles,
  UserX,
  ChevronRight
} from 'lucide-react';

export const PageStatusScreen = ({
  pageControl,
  onGoHome,
  customStatus,
  previewMode = false
}) => {
  const status = customStatus || pageControl?.status || 'maintenance';
  const title = pageControl?.title;
  const message = pageControl?.message;
  const imageUrl = pageControl?.imageUrl;

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetTimeStr = pageControl?.scheduledEndTime || pageControl?.estimatedCompletion;
      if (!targetTimeStr) {
        setTimeLeft(null);
        return;
      }

      const targetTime = new Date(targetTimeStr).getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [pageControl?.scheduledEndTime, pageControl?.estimatedCompletion]);

  // Screen Configuration per status
  const getScreenConfig = () => {
    switch (status) {
      case 'maintenance':
        return {
          icon: Wrench,
          badgeText: '🚧 Under Maintenance',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          gradientBg: 'from-amber-950/30 via-slate-950 to-slate-950',
          accentColor: 'text-amber-400',
          borderColor: 'border-amber-500/30',
          defaultTitle: '🚧 Under Maintenance',
          defaultMessage: 'We are currently upgrading this page with new features and improvements. Please check back shortly.'
        };
      case 'coming_soon':
        return {
          icon: Rocket,
          badgeText: '🚀 Feature Coming Soon',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          gradientBg: 'from-cyan-950/30 via-slate-950 to-slate-950',
          accentColor: 'text-cyan-400',
          borderColor: 'border-cyan-500/30',
          defaultTitle: '🚀 Feature Coming Soon',
          defaultMessage: 'Our engineering team is putting the final touches on this upcoming module. Stay tuned!'
        };
      case 'closed':
        return {
          icon: ShieldAlert,
          badgeText: '🔴 Temporarily Closed',
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          gradientBg: 'from-rose-950/30 via-slate-950 to-slate-950',
          accentColor: 'text-rose-400',
          borderColor: 'border-rose-500/30',
          defaultTitle: '🔴 Temporarily Closed',
          defaultMessage: 'This page has been temporarily closed by admin.'
        };
      case 'hidden':
        return {
          icon: EyeOff,
          badgeText: '⚫ Page Unavailable',
          badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
          gradientBg: 'from-slate-900 via-slate-950 to-slate-950',
          accentColor: 'text-slate-400',
          borderColor: 'border-slate-800',
          defaultTitle: 'This page is currently unavailable',
          defaultMessage: 'The requested module cannot be accessed at this time.'
        };
      case 'admin_only':
        return {
          icon: Lock,
          badgeText: '🔒 Admin Restricted',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          gradientBg: 'from-purple-950/30 via-slate-950 to-slate-950',
          accentColor: 'text-purple-400',
          borderColor: 'border-purple-500/30',
          defaultTitle: '🔒 Administrator Only Access',
          defaultMessage: 'This module is restricted strictly to department faculty and system administrators.'
        };
      case 'student_restricted':
        return {
          icon: UserX,
          badgeText: '👨‍🎓 Student Restricted',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          gradientBg: 'from-blue-950/30 via-slate-950 to-slate-950',
          accentColor: 'text-blue-400',
          borderColor: 'border-blue-500/30',
          defaultTitle: '👨‍🎓 Access Restricted for Your Profile',
          defaultMessage: 'Your current student year or section does not have access to this module.'
        };
      default:
        return {
          icon: Wrench,
          badgeText: '🚧 Page Unavailable',
          badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
          gradientBg: 'from-slate-900 via-slate-950 to-slate-950',
          accentColor: 'text-amber-400',
          borderColor: 'border-slate-800',
          defaultTitle: 'Page Unavailable',
          defaultMessage: 'This page is currently under restriction.'
        };
    }
  };

  const config = getScreenConfig();
  const IconComponent = config.icon;

  return (
    <div className={`min-h-[70vh] flex items-center justify-center p-4 sm:p-8 animate-in fade-in max-w-4xl mx-auto ${previewMode ? 'py-4 min-h-0' : ''}`}>
      <div className={`glass-panel w-full rounded-3xl p-8 sm:p-12 border ${config.borderColor} bg-gradient-to-b ${config.gradientBg} shadow-2xl relative overflow-hidden text-center space-y-8`}>

        {/* Glow ambient background sphere */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Status Badge */}
        <div className="inline-flex items-center space-x-2">
          <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase border shadow-lg ${config.badgeColor}`}>
            {config.badgeText}
          </span>
        </div>

        {/* Custom Icon or Image */}
        <div className="space-y-4 relative z-10">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Page Status"
              className="w-28 h-28 mx-auto object-cover rounded-3xl border border-slate-800 shadow-2xl"
            />
          ) : (
            <div className={`w-24 h-24 mx-auto rounded-3xl bg-slate-900/90 border ${config.borderColor} flex items-center justify-center shadow-2xl ${config.accentColor}`}>
              <IconComponent className="w-12 h-12 animate-pulse" />
            </div>
          )}

          {/* Title & Message */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug">
              {title || config.defaultTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
              {message || config.defaultMessage}
            </p>
          </div>
        </div>

        {/* Live Countdown Timer (if configured) */}
        {timeLeft && (
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-md mx-auto space-y-3 shadow-inner">
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center justify-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              Returning In
            </span>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xl sm:text-2xl font-black text-white block">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Days</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xl sm:text-2xl font-black text-white block">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Hours</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xl sm:text-2xl font-black text-white block">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Mins</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xl sm:text-2xl font-black text-amber-400 block">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Secs</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        {!previewMode && (
          <div className="pt-4 flex justify-center">
            <button
              onClick={onGoHome}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-500 hover:to-brand-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-indigo-600/20 transition-all flex items-center space-x-2 hover:scale-105"
            >
              <Home className="w-4 h-4" />
              <span>Return to Home</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
