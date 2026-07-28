import React, { useEffect, useRef, useState } from 'react';
import { X, BookOpen, Bot, Calendar, Briefcase, ArrowRight, Sparkles } from 'lucide-react';

export const AnimatedWelcomeScreen = ({ userName, onDismiss }) => {
  const canvasRef = useRef(null);
  const [animStage, setAnimStage] = useState(0);

  // Staggered entrance animation timer
  useEffect(() => {
    const timer1 = setTimeout(() => setAnimStage(1), 100); // Headline
    const timer2 = setTimeout(() => setAnimStage(2), 250); // Subtext 1
    const timer3 = setTimeout(() => setAnimStage(3), 400); // Subtext 2
    const timer4 = setTimeout(() => setAnimStage(4), 550); // Chips start
    const timer5 = setTimeout(() => setAnimStage(5), 1100); // Button pulse ready

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, []);

  // Full-screen floating particles + initial celebratory confetti/sparkle burst
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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

    // Initial 1.5s celebratory sparkle burst
    const burstParticles = [];
    const burstColors = ['#FFD700', '#FF4D6D', '#38BDF8', '#C084FC', '#4ADE80', '#F59E0B'];
    const centerX = width / 2;
    const centerY = height * 0.35;

    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      burstParticles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        size: Math.random() * 6 + 3,
        color: burstColors[Math.floor(Math.random() * burstColors.length)],
        alpha: 1,
        decay: Math.random() * 0.02 + 0.015
      });
    }

    // Floating background particles (orbs, sparkles)
    const particleCount = 35;
    const floatingParticles = [];

    for (let i = 0; i < particleCount; i++) {
      floatingParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 4 + 1.5,
        color: burstColors[Math.floor(Math.random() * burstColors.length)],
        alpha: Math.random() * 0.6 + 0.2,
        speedY: Math.random() * 0.6 + 0.2,
        speedX: Math.random() * 0.4 - 0.2,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulseVal: Math.random() * Math.PI
      });
    }

    let frameCount = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      frameCount++;

      // 1. Render initial burst particles (fade out in ~1.5s)
      burstParticles.forEach((p) => {
        if (p.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08; // gravity
          p.alpha -= p.decay;
        }
      });

      // 2. Render continuous floating background particles
      floatingParticles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.pulseVal += p.pulseSpeed;

        // Wrap around screen boundaries
        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = Math.sin(p.pulseVal) * 0.25 + p.alpha;

        ctx.save();
        ctx.globalAlpha = Math.max(0.1, Math.min(0.8, currentAlpha));
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const firstName = (userName || 'Student').split(' ')[0];

  const highlights = [
    { icon: BookOpen, label: 'Notes', status: 'unlocked', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
    { icon: Bot, label: 'AI Tools', status: 'unlocked', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' },
    { icon: Calendar, label: 'Your Timetable', status: 'auto-loaded', color: 'text-purple-400 border-purple-500/40 bg-purple-500/10' },
    { icon: Briefcase, label: 'Placement Prep', status: 'ready when you are', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-indigo-950 via-slate-900 to-amber-950/40 overflow-y-auto selection:bg-amber-500 selection:text-slate-950">
      
      {/* Full-screen Background Floating Particles Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 w-full h-full"
      />

      {/* Main Glassmorphic Welcome Card */}
      <div className="relative z-10 w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-slate-900/85 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-indigo-950/60 overflow-hidden my-auto space-y-6">
        
        {/* Top Right Close Button (Always Available) */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-rose-600 text-slate-400 hover:text-white transition-all border border-slate-700/60 flex items-center justify-center group"
          title="Close Welcome Screen"
        >
          <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>

        {/* Content Container */}
        <div className="space-y-4 text-center">
          
          {/* Decorative Top Sparkle Icon */}
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Welcome to IT Resource Hub</span>
          </div>

          {/* Headline with Bounce / Pop Entrance */}
          <div
            className={`transition-all duration-500 ease-out transform ${
              animStage >= 1
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-90 translate-y-3'
            }`}
          >
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Look who finally made it,{' '}
              <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-purple-300 bg-clip-text text-transparent">
                {firstName} 👀
              </span>
            </h1>
          </div>

          {/* Subtext Lines (Sequentially Staggered) */}
          <div className="space-y-1 text-xs sm:text-sm text-slate-300 font-medium">
            <p
              className={`transition-all duration-400 ease-out transform ${
                animStage >= 2
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-2'
              }`}
            >
              The notes were here the whole time. You're welcome.
            </p>
            <p
              className={`transition-all duration-400 ease-out transform ${
                animStage >= 3
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-2'
              }`}
            >
              Nice pick joining today 😌
            </p>
          </div>

          {/* 4 Staggered Highlight Chips */}
          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              const isVisible = animStage >= 4;

              return (
                <div
                  key={item.label}
                  style={{ transitionDelay: `${idx * 140}ms` }}
                  className={`p-3 rounded-2xl border flex items-center space-x-3 text-left transition-all duration-500 ease-out transform ${
                    isVisible
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-4 scale-95'
                  } ${item.color}`}
                >
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm flex-shrink-0">
                    <Icon className="w-4 h-4 animate-bounce" style={{ animationDuration: '2s' }} />
                  </div>
                  <div className="overflow-hidden">
                    <span className="block font-bold text-xs text-white leading-tight">{item.label}</span>
                    <span className="block text-[10px] font-semibold opacity-85 truncate">
                      — {item.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Let's Go Button with Pulse & Glow Animation */}
          <div
            className={`pt-4 transition-all duration-500 ease-out transform ${
              animStage >= 5
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-4 scale-95'
            }`}
          >
            <button
              onClick={onDismiss}
              className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.03] active:scale-[0.98] ring-2 ring-amber-400/50 hover:ring-amber-300 animate-pulse"
              style={{ animationDuration: '3s' }}
            >
              <span>Let's Go</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
