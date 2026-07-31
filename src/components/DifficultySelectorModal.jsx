import React, { useState, useEffect } from 'react';
import { X, Sparkles, Zap, Flame, Shield, Trophy, CheckCircle, ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';

export const DIFFICULTY_LEVELS = [
  {
    id: 'beginner',
    label: 'Beginner',
    emoji: '🟢',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    cardBorder: 'border-emerald-500/40 hover:border-emerald-400 bg-gradient-to-b from-emerald-950/30 to-slate-950',
    activeCard: 'border-emerald-400 bg-emerald-950/60 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/20',
    accentColor: 'emerald',
    icon: Shield,
    defaultMultiplier: 1.0,
    description: 'Fundamental concepts, straightforward questions & syntax basics.'
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    emoji: '🟡',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    cardBorder: 'border-amber-500/40 hover:border-amber-400 bg-gradient-to-b from-amber-950/30 to-slate-950',
    activeCard: 'border-amber-400 bg-amber-950/60 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20',
    accentColor: 'amber',
    icon: Zap,
    defaultMultiplier: 1.5,
    description: 'Multi-step logic, moderate challenge & practical problem solving.'
  },
  {
    id: 'advanced',
    label: 'Advanced',
    emoji: '🔴',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    cardBorder: 'border-rose-500/40 hover:border-rose-400 bg-gradient-to-b from-rose-950/30 to-slate-950',
    activeCard: 'border-rose-400 bg-rose-950/60 ring-2 ring-rose-400/50 shadow-lg shadow-rose-500/20',
    accentColor: 'rose',
    icon: Flame,
    defaultMultiplier: 2.0,
    description: 'Tricky edge cases, complex logic, async behavior & high-speed targets.'
  }
];

export const DifficultySelectorModal = ({
  isOpen,
  onClose,
  onStartGame,
  gameTitle = 'BrainZone Challenge',
  gameIcon = '🎮',
  gameDescription = 'Select your difficulty level to begin the challenge!',
  gameId = 'general',
  baseXp = 50
}) => {
  const { siteConfig } = useData();
  const xpSettings = siteConfig?.xpSettings || {};

  const getMultiplierForDiff = (diffId) => {
    if (diffId === 'beginner') return xpSettings.beginnerMultiplier || 1.0;
    if (diffId === 'advanced') return xpSettings.advancedMultiplier || 2.0;
    return xpSettings.intermediateMultiplier || 1.5;
  };

  const storageKey = `brainzone_last_diff_${gameId}`;
  
  // State for chosen difficulty
  const [selectedDiff, setSelectedDiff] = useState(() => {
    try {
      return localStorage.getItem(storageKey) || 'intermediate';
    } catch (e) {
      return 'intermediate';
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved && ['beginner', 'intermediate', 'advanced'].includes(saved)) {
        setSelectedDiff(saved);
      }
    } catch (e) {}
  }, [gameId, storageKey]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    try {
      localStorage.setItem(storageKey, selectedDiff);
    } catch (e) {}
    
    const mult = getMultiplierForDiff(selectedDiff);
    onStartGame(selectedDiff, mult);
  };

  const currentDiffObj = DIFFICULTY_LEVELS.find(d => d.id === selectedDiff) || DIFFICULTY_LEVELS[1];
  const currentMult = getMultiplierForDiff(selectedDiff);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl border border-purple-500/30 p-6 sm:p-8 bg-slate-950 shadow-2xl shadow-purple-900/40 space-y-6 overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-2xl shadow-inner">
              {gameIcon}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">{gameTitle}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Step 1 / 2
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{gameDescription}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Difficulty Options List */}
        <div className="space-y-3 relative z-10">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Choose Difficulty Level:
          </p>

          <div className="grid grid-cols-1 gap-3">
            {DIFFICULTY_LEVELS.map(diff => {
              const isSelected = selectedDiff === diff.id;
              const IconComponent = diff.icon;
              const mult = getMultiplierForDiff(diff.id);
              const potentialXp = Math.round(baseXp * mult);

              return (
                <div
                  key={diff.id}
                  onClick={() => setSelectedDiff(diff.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected ? diff.activeCard : diff.cardBorder
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className={`p-2.5 rounded-xl border text-xl flex-shrink-0 ${diff.badgeClass}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-extrabold text-white flex items-center gap-1.5">
                          <span>{diff.emoji}</span>
                          <span>{diff.label}</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${diff.badgeClass}`}>
                          {mult}x XP Rate
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-1">{diff.description}</p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 space-y-1">
                    <div className="text-xs font-black text-amber-400 flex items-center justify-end space-x-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>+{potentialXp} XP</span>
                    </div>
                    <div className="flex justify-end">
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center shadow">
                          <CheckCircle className="w-3.5 h-3.5 fill-purple-500 text-slate-950" />
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border border-slate-700 bg-slate-900" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Summary & Start Button */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            <span>Selected: </span>
            <strong className="text-white font-extrabold">{currentDiffObj.emoji} {currentDiffObj.label}</strong>
            <span className="text-amber-400 font-bold ml-1.5">({currentMult}x XP Rate)</span>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-90 text-white shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <span>Start Challenge</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
