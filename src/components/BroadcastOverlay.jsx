import React, { useEffect, useRef, useState } from 'react';
import { X, ExternalLink, Sparkles, Trophy, Gift, ArrowRight, Clock, ShieldAlert } from 'lucide-react';

export const BroadcastOverlay = ({ broadcast, onDismiss, isPreview = false }) => {
  const canvasRef = useRef(null);

  const {
    id,
    title,
    message,
    bannerImageUrl,
    linkUrl,
    linkLabel,
    isSkippable = true,
    autoCloseSeconds = 5,
    isFestivalMode = false,
    animationType = 'confetti'
  } = broadcast || {};

  const [timeLeft, setTimeLeft] = useState(autoCloseSeconds || 5);

  // Countdown timer for non-skippable broadcasts
  useEffect(() => {
    if (isSkippable || isPreview) return;
    
    setTimeLeft(autoCloseSeconds || 5);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onDismiss) onDismiss(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSkippable, autoCloseSeconds, id, isPreview, onDismiss]);

  // High-performance Lightweight Canvas Animation Loop (Confetti, Petals, Sparkles)
  useEffect(() => {
    if (!isFestivalMode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = animationType === 'petals' ? 45 : animationType === 'sparkles' ? 80 : 70;
    const particles = [];

    const confettiColors = ['#FFD700', '#FF007F', '#00FF7F', '#00E5FF', '#9D00FF', '#FF6B00', '#FF4500'];
    const petalColors = ['#FFB7C5', '#FF4D6D', '#FF9E00', '#E63946', '#FFCCD5'];
    const sparkleColors = ['#FFE600', '#00F0FF', '#FF00D6', '#FFFFFF', '#7000FF'];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        size: animationType === 'sparkles' ? Math.random() * 3 + 1 : Math.random() * 8 + 4,
        color:
          animationType === 'petals'
            ? petalColors[Math.floor(Math.random() * petalColors.length)]
            : animationType === 'sparkles'
            ? sparkleColors[Math.floor(Math.random() * sparkleColors.length)]
            : confettiColors[Math.floor(Math.random() * confettiColors.length)],
        speedY: Math.random() * 2 + 1,
        speedX: Math.random() * 1.5 - 0.75,
        rotation: Math.random() * 360,
        spin: Math.random() * 4 - 2,
        opacity: Math.random() * 0.7 + 0.3,
        pulseSpeed: Math.random() * 0.05 + 0.02
      });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.03;

      particles.forEach((p) => {
        ctx.save();

        if (animationType === 'sparkles') {
          p.opacity = 0.3 + Math.abs(Math.sin(time + p.x)) * 0.7;
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;

          // Draw 4-point star sparkle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Move gently upward/floating
          p.y -= p.speedY * 0.3;
          if (p.y < 0) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        } else if (animationType === 'petals') {
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);

          // Draw petal shape
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size / 2, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();

          p.y += p.speedY * 0.8;
          p.x += Math.sin(time + p.y * 0.01) * 0.8;
          p.rotation += p.spin;

          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        } else {
          // Confetti ribbons
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);

          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);

          p.y += p.speedY * 1.4;
          p.x += Math.sin(time + p.y * 0.02) * 1.2;
          p.rotation += p.spin * 2;

          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isFestivalMode, animationType]);

  const isUrgent = broadcast?.themeMode === 'urgent' || broadcast?.priority === 'High';
  const isFestival = broadcast?.isFestivalMode || broadcast?.themeMode === 'festival';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      
      {/* Full-screen Festive Canvas Background */}
      {isFestival && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-0 w-full h-full"
        />
      )}

      {/* Main Broadcast Modal Box */}
      <div
        className={`relative z-10 w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 overflow-hidden transition-all duration-300 ${
          isUrgent
            ? 'bg-gradient-to-b from-slate-900/95 via-rose-950/90 to-slate-950/95 border-2 border-rose-500 shadow-2xl shadow-rose-500/30'
            : isFestival
            ? 'bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-900/95 border-2 border-amber-500/60 shadow-2xl shadow-amber-500/20'
            : 'bg-slate-900/95 border border-purple-500/40 shadow-2xl shadow-purple-500/20'
        }`}
      >
        {/* Top Header Bar (Badge + Skip/Timer Button) */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center space-x-2">
            {isUrgent ? (
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-rose-500/20 text-rose-300 border border-rose-500/50 flex items-center space-x-1.5 animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>🚨 URGENT EMERGENCY ALERT</span>
              </span>
            ) : isFestival ? (
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-amber-500/30 via-rose-500/30 to-purple-500/30 text-amber-300 border border-amber-500/50 flex items-center space-x-1.5 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>✨ Festival Special Broadcast</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                <span>Department Broadcast</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Auto-Close Countdown Timer Badge */}
            {autoCloseSeconds > 0 && (
              <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-extrabold flex items-center space-x-1">
                <Clock className="w-3 h-3 animate-spin" />
                <span>Closing in {timeLeft}s</span>
              </div>
            )}

            {/* Exit / Close button (If Skippable enabled) */}
            {(isSkippable || isPreview) && (
              <button
                onClick={() => onDismiss && onDismiss(id)}
                className="p-2 rounded-2xl bg-slate-800/90 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors border border-slate-700/60 flex items-center space-x-1 text-xs font-bold"
                title="Dismiss Broadcast"
              >
                <span>Close</span>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Optional Banner Image */}
        {bannerImageUrl && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 max-h-48 shadow-lg">
            <img
              src={bannerImageUrl}
              alt={title || 'Broadcast Banner'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          </div>
        )}

        {/* Celebratory / Urgent Typography & Content */}
        <div className="space-y-3 text-center sm:text-left">
          <h2 className={`text-xl sm:text-2xl font-black leading-tight ${
            isUrgent
              ? 'text-rose-100 drop-shadow-md'
              : 'bg-gradient-to-r from-amber-300 via-rose-300 to-purple-300 bg-clip-text text-transparent'
          }`}>
            {title}
          </h2>

          <p className={`text-sm sm:text-base font-medium leading-relaxed p-4 rounded-2xl border shadow-inner ${
            isUrgent
              ? 'bg-rose-950/50 text-rose-100 border-rose-500/40'
              : 'bg-slate-950/60 text-amber-100/90 border-slate-800/80'
          }`}>
            {message}
          </p>
        </div>

        {/* Optional CTA Link Button */}
        {linkUrl && (
          <div className="pt-2">
            <a
              href={linkUrl}
              target="_blank"
              rel="noreferrer"
              className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm text-white shadow-xl flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                isUrgent
                  ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 shadow-rose-600/30'
                  : 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 shadow-amber-500/25'
              }`}
            >
              <span>{linkLabel || 'Explore Now'}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Footer Note */}
        {!isSkippable && !isPreview && autoCloseSeconds > 0 && (
          <p className="text-[10px] text-center text-slate-400 font-semibold">
            ⚠️ Mandatory overlay: Auto-dismisses when timer reaches 0s.
          </p>
        )}
      </div>
    </div>
  );
};
