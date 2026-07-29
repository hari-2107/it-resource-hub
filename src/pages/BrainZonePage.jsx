import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { INITIAL_LEADERBOARD_USERS, INITIAL_IT_FACTS } from '../data/mockData';
import { 
  Brain, 
  Trophy, 
  Sparkles, 
  Flame, 
  Target, 
  Award, 
  Zap, 
  Crown, 
  Gift, 
  Users, 
  CheckCircle2, 
  HelpCircle, 
  Lightbulb, 
  Share2, 
  RotateCcw, 
  Shield, 
  Star, 
  BarChart2, 
  Calendar, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Clock, 
  Check, 
  Lock, 
  Smile,
  ArrowRight,
  TrendingUp,
  Sliders,
  Layers,
  Sparkle,
  Gamepad2
} from 'lucide-react';

export const PROFILE_BORDERS = [
  { id: 'default', name: 'Default Slate', borderClass: 'border-slate-700', shadowClass: 'shadow-md', ringClass: 'ring-0', icon: '👤', desc: 'Clean classic border' },
  { id: 'cyber_neon', name: 'Cyber Neon', borderClass: 'border-cyan-400', shadowClass: 'shadow-lg shadow-cyan-500/40', ringClass: 'ring-2 ring-cyan-400/80 animate-pulse', icon: '⚡', desc: 'Futuristic electric blue glow' },
  { id: 'gold_legend', name: 'Gold Legend', borderClass: 'border-amber-400', shadowClass: 'shadow-lg shadow-amber-500/50', ringClass: 'ring-2 ring-amber-300', icon: '👑', desc: '24k Golden championship ring' },
  { id: 'emerald_hacker', name: 'Emerald Hacker', borderClass: 'border-emerald-400', shadowClass: 'shadow-lg shadow-emerald-500/40', ringClass: 'ring-2 ring-emerald-400/70', icon: '💻', desc: 'Matrix green code aura' },
  { id: 'quantum_violet', name: 'Quantum Violet', borderClass: 'border-purple-400', shadowClass: 'shadow-lg shadow-purple-500/50', ringClass: 'ring-2 ring-purple-400/80', icon: '🌌', desc: 'Cosmic purple space aura' },
  { id: 'crimson_master', name: 'Crimson Flame', borderClass: 'border-rose-500', shadowClass: 'shadow-lg shadow-rose-600/50', ringClass: 'ring-2 ring-rose-500/80', icon: '🔥', desc: 'Blazing red hot streak' }
];

export const ACHIEVEMENTS = [
  { id: 'first_spin', title: 'First Spin', icon: '🎡', desc: 'Spin the BrainZone wheel for the first time', target: 1, reward: '+50 XP' },
  { id: 'poll_voter', title: 'Poll Master', icon: '🤔', desc: 'Vote in 5 Daily This or That polls', target: 5, reward: '+100 XP' },
  { id: 'speed_demon', title: 'Speed Demon', icon: '⚡', desc: 'Complete 60-Second Challenge with >80% score', target: 1, reward: '+150 XP' },
  { id: 'streak_fire', title: 'On Fire', icon: '🔥', desc: 'Maintain a 7-day learning streak', target: 7, reward: '+200 XP & Neon Border' },
  { id: 'mystery_hunter', title: 'Mystery Hunter', icon: '🎁', desc: 'Open 3 Daily Mystery Boxes', target: 3, reward: '+75 XP' },
  { id: 'class_hero', title: 'Class Hero', icon: '🏫', desc: 'Contribute to your Class vs Class Leaderboard', target: 1, reward: '+120 XP' }
];

const DAILY_QUIZ_QUESTIONS = [
  { id: 1, q: "What does API stand for in software engineering?", options: ["Automated Program Interface", "Application Programming Interface", "Advanced Process Integration", "Application Protocol Instruction"], answer: 1 },
  { id: 2, q: "Which data structure follows the Last-In, First-Out (LIFO) principle?", options: ["Queue", "Binary Tree", "Stack", "Linked List"], answer: 2 },
  { id: 3, q: "What default port does HTTPS protocol use?", options: ["80", "21", "8080", "443"], answer: 3 },
  { id: 4, q: "Which Big-O time complexity represents binary search algorithm?", options: ["O(N)", "O(log N)", "O(N^2)", "O(1)"], answer: 1 },
  { id: 5, q: "Which HTTP status code signifies 'Resource Not Found'?", options: ["200", "403", "404", "500"], answer: 2 }
];

export const BrainZonePage = ({ onOpenAdminForm }) => {
  const { currentUser, updateUserProfile, isAdmin } = useAuth();
  const { registeredUsers, thisOrThatPolls, voteThisOrThatPoll } = useData();

  // User Stats state
  const funPoints = currentUser?.funPoints || 450;
  const streak = currentUser?.streak || 5;
  const equippedBorderId = currentUser?.equippedBorder || 'cyber_neon';
  const votedPolls = currentUser?.votedThisOrThatDates || {}; // { [pollId]: 'A' | 'B' }

  // Tabs & Views state
  const [leaderboardTab, setLeaderboardTab] = useState('weekly'); // 'weekly' | 'monthly' | 'class'
  const [factIndex, setFactIndex] = useState(0);
  const [copiedFact, setCopiedFact] = useState(false);

  // Spin Wheel State
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [hasSpunToday, setHasSpunToday] = useState(false);

  // 60-Second Challenge Modal State
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeScore, setChallengeScore] = useState(0);
  const [challengeTimer, setChallengeTimer] = useState(60);
  const [challengeFinished, setChallengeFinished] = useState(false);
  const [challengeActive, setChallengeActive] = useState(false);

  // Mystery Box State
  const [mysteryModalOpen, setMysteryModalOpen] = useState(false);
  const [mysteryReward, setMysteryReward] = useState(null);

  // Equipped Border details
  const currentBorderObj = PROFILE_BORDERS.find(b => b.id === equippedBorderId) || PROFILE_BORDERS[1];

  // Level Calculation (Every 200 XP = 1 Level)
  const currentLevel = Math.floor(funPoints / 200) + 1;
  const levelProgressXP = funPoints % 200;
  const levelTargetXP = 200;
  const levelPercent = Math.min(100, Math.round((levelProgressXP / levelTargetXP) * 100));

  // Current Daily Poll
  const activePoll = (thisOrThatPolls && thisOrThatPolls.length > 0) ? thisOrThatPolls[0] : {
    id: 'tot-1',
    question: 'Which backend tech stack do you prefer for high-scale web apps?',
    optionA: 'Node.js / Express 🚀',
    optionB: 'Python / FastAPI 🐍',
    votesA: 48,
    votesB: 36
  };

  const hasVotedActivePoll = Boolean(votedPolls[activePoll.id]);
  const userVoteChoice = votedPolls[activePoll.id];

  const totalPollVotes = (activePoll.votesA || 0) + (activePoll.votesB || 0);
  const percentA = totalPollVotes > 0 ? Math.round(((activePoll.votesA || 0) / totalPollVotes) * 100) : 50;
  const percentB = 100 - percentA;

  // Handle Voting in This or That
  const handleVotePoll = (option) => {
    if (hasVotedActivePoll) return;
    
    // Update local profile voted state
    const updatedVoted = { ...votedPolls, [activePoll.id]: option };
    updateUserProfile({
      votedThisOrThatDates: updatedVoted,
      funPoints: funPoints + 25
    });

    // Dispatch global vote
    voteThisOrThatPoll(activePoll.id, option);
  };

  // 60-Second Challenge Timer effect
  useEffect(() => {
    let interval = null;
    if (challengeActive && challengeTimer > 0 && !challengeFinished) {
      interval = setInterval(() => {
        setChallengeTimer(prev => prev - 1);
      }, 1000);
    } else if (challengeTimer === 0 && challengeActive && !challengeFinished) {
      finishChallenge();
    }
    return () => clearInterval(interval);
  }, [challengeActive, challengeTimer, challengeFinished]);

  const startChallenge = () => {
    setChallengeIndex(0);
    setChallengeScore(0);
    setChallengeTimer(60);
    setChallengeFinished(false);
    setChallengeActive(true);
    setChallengeOpen(true);
  };

  const handleAnswerChallenge = (optionIndex) => {
    if (optionIndex === DAILY_QUIZ_QUESTIONS[challengeIndex].answer) {
      setChallengeScore(prev => prev + 1);
    }
    if (challengeIndex < DAILY_QUIZ_QUESTIONS.length - 1) {
      setChallengeIndex(prev => prev + 1);
    } else {
      finishChallenge();
    }
  };

  const finishChallenge = () => {
    setChallengeFinished(true);
    setChallengeActive(false);
    const earnedXp = (challengeScore * 30) + (challengeTimer > 20 ? 50 : 20);
    updateUserProfile({
      funPoints: funPoints + earnedXp,
      streak: streak + (hasSpunToday ? 0 : 1)
    });
  };

  // Wheel Spin logic
  const handleSpinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSpinResult(null);

    setTimeout(() => {
      const rewards = [
        { xp: 50, label: '🎉 +50 Bonus XP!' },
        { xp: 100, label: '🌟 Jackpot! +100 XP!' },
        { xp: 25, label: '⚡ +25 Speed Bonus!' },
        { xp: 75, label: '🔥 Streak Boost! +75 XP!' }
      ];
      const selected = rewards[Math.floor(Math.random() * rewards.length)];
      setSpinResult(selected.label);
      setIsSpinning(false);
      setHasSpunToday(true);
      updateUserProfile({ funPoints: funPoints + selected.xp });
    }, 2500);
  };

  // Mystery Box logic
  const handleOpenMysteryBox = () => {
    const rewards = [
      { type: 'xp', text: '💎 +150 Super XP Mystery Bonus!', xp: 150 },
      { type: 'border', text: '🎁 Unlocked Golden Legend Border!', xp: 100 },
      { type: 'streak', text: '🛡️ Earned 1x Streak Freeze Shield!', xp: 50 }
    ];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    setMysteryReward(reward.text);
    setMysteryModalOpen(true);
    updateUserProfile({ funPoints: funPoints + reward.xp });
  };

  // Class vs Class Aggregation
  const combinedLeaderboardUsers = (registeredUsers && registeredUsers.length > 0)
    ? registeredUsers
    : INITIAL_LEADERBOARD_USERS;

  const classAggregates = combinedLeaderboardUsers.reduce((acc, usr) => {
    const sec = usr.classSection || 'IT-A';
    if (!acc[sec]) {
      acc[sec] = { classSection: sec, totalPoints: 0, studentCount: 0, topStudent: usr.name };
    }
    acc[sec].totalPoints += (usr.funPoints || 300);
    acc[sec].studentCount += 1;
    return acc;
  }, {});

  const classLeaderboardList = Object.values(classAggregates)
    .sort((a, b) => b.totalPoints - a.totalPoints);

  const sortedIndividualUsers = [...combinedLeaderboardUsers].sort((a, b) => (b.funPoints || 0) - (a.funPoints || 0));

  const currentFact = INITIAL_IT_FACTS[factIndex % INITIAL_IT_FACTS.length];

  return (
    <div className="space-y-8 pb-16">

      {/* 🧠 BRAINZONE HUB BANNER HEADER */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-6 sm:p-8 border border-purple-500/30 bg-gradient-to-r from-purple-950/80 via-slate-950 to-indigo-950/80 shadow-2xl shadow-purple-500/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/40 shadow-sm">
              <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>THE UNIFIED IT ENGAGEMENT & GAMIFICATION ARCADE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>🧠 BrainZone</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">v4.0</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Earn XP, spin daily wheels, conquer 60-second quiz challenges, vote in tech polls, unlock custom profile borders, and compete for your class in the Class vs Class Leaderboards!
            </p>
          </div>

          {/* User Quick Stats Header Card */}
          <div className="glass-card rounded-2xl p-4 border border-purple-500/40 bg-slate-900/90 space-y-3 min-w-[280px]">
            <div className="flex items-center space-x-3">
              <div className={`relative w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center border ${currentBorderObj.borderClass} ${currentBorderObj.shadowClass} ${currentBorderObj.ringClass}`}>
                <span className="text-xl">{currentBorderObj.icon}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">{currentUser?.name || 'Alex Morgan'}</p>
                <div className="flex items-center space-x-2 text-[10px] text-purple-300 font-semibold">
                  <span>Level {currentLevel} • Code Architect</span>
                </div>
              </div>
            </div>

            {/* Level XP Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400" /> {funPoints} Total XP
                </span>
                <span className="text-slate-400">{levelProgressXP} / {levelTargetXP} XP</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 via-purple-500 to-indigo-400 rounded-full transition-all duration-500" 
                  style={{ width: `${levelPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] font-bold">
              <span className="flex items-center text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">
                <Flame className="w-3.5 h-3.5 mr-1 fill-rose-400" /> {streak} Day Streak
              </span>
              <span className="text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                Border: {currentBorderObj.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: 🎮 GAMES & CHALLENGES */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <Gamepad2 className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">Games & Challenges</h2>
              <p className="text-[11px] text-slate-400">Daily interactive challenges to boost your IT knowledge & XP score</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* 🎡 1. SPIN & LEARN */}
          <div className="glass-card rounded-3xl p-6 border border-purple-500/30 bg-gradient-to-b from-purple-950/30 via-slate-950 to-slate-950 space-y-4 relative overflow-hidden flex flex-col justify-between group hover:border-purple-500/60 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Daily Wheel
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">1 Spin / Day</span>
              </div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>🎡 Spin & Learn</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Test your luck on the daily IT wheel to win bonus XP, streak boosts, and rare rewards!
              </p>
            </div>

            <div className="my-2 py-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-center space-y-3 relative">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 flex items-center justify-center shadow-xl shadow-purple-500/20 border-4 border-slate-900 animate-spin-slow">
                <Brain className={`w-10 h-10 text-white ${isSpinning ? 'animate-spin' : ''}`} />
              </div>
              
              {spinResult && (
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-in fade-in">
                  {spinResult}
                </div>
              )}
            </div>

            <button
              onClick={handleSpinWheel}
              disabled={isSpinning}
              className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
                isSpinning
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-90 text-white shadow-lg shadow-purple-600/30'
              }`}
            >
              <RotateCcw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'Spinning Wheel...' : 'Spin Daily Wheel (+XP)'}</span>
            </button>
          </div>

          {/* 🧠 2. DAILY 60-SECOND CHALLENGE */}
          <div className="glass-card rounded-3xl p-6 border border-cyan-500/30 bg-gradient-to-b from-cyan-950/30 via-slate-950 to-slate-950 space-y-4 relative overflow-hidden flex flex-col justify-between group hover:border-cyan-500/60 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Timed Quiz
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">5 Questions</span>
              </div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>🧠 60-Second Challenge</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Answer 5 quick-fire IT questions in under 60 seconds. Higher speed & accuracy = bigger XP rewards!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-center space-y-2">
              <div className="flex items-center justify-center space-x-2 text-cyan-300 font-mono text-xl font-black">
                <Clock className="w-5 h-5 text-cyan-400 animate-pulse" />
                <span>00:60 SEC</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Topic: CS Fundamentals, Web Dev & Networking</p>
            </div>

            <button
              onClick={startChallenge}
              className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Start 60s Challenge</span>
            </button>
          </div>

          {/* 🤔 3. THIS OR THAT (DAILY POLL) */}
          <div className="glass-card rounded-3xl p-6 border border-amber-500/40 bg-gradient-to-b from-amber-950/30 via-slate-950 to-slate-950 space-y-4 relative overflow-hidden flex flex-col justify-between group hover:border-amber-500/60 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Daily Tech Poll
                </span>
                {isAdmin && (
                  <button
                    onClick={() => onOpenAdminForm && onOpenAdminForm('thisOrThat')}
                    className="text-[10px] font-bold text-amber-400 hover:underline flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Post Poll</span>
                  </button>
                )}
              </div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>🤔 This or That</span>
              </h3>
              <p className="text-xs text-slate-300 font-semibold">
                {activePoll.question}
              </p>
            </div>

            {!hasVotedActivePoll ? (
              <div className="space-y-2.5">
                <button
                  onClick={() => handleVotePoll('A')}
                  className="w-full p-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 font-bold text-xs text-left transition-all flex items-center justify-between group/opt"
                >
                  <span>{activePoll.optionA}</span>
                  <ArrowRight className="w-4 h-4 text-amber-400 opacity-0 group-hover/opt:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => handleVotePoll('B')}
                  className="w-full p-3 rounded-2xl border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-200 font-bold text-xs text-left transition-all flex items-center justify-between group/opt"
                >
                  <span>{activePoll.optionB}</span>
                  <ArrowRight className="w-4 h-4 text-indigo-400 opacity-0 group-hover/opt:opacity-100 transition-opacity" />
                </button>
              </div>
            ) : (
              <div className="space-y-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Vote Cast! (+25 XP)
                  </span>
                  <span className="text-[10px] text-slate-400">{totalPollVotes} votes total</span>
                </div>

                {/* Poll Results Percentage Split Bar */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-300">
                      <span className="truncate max-w-[70%]">{activePoll.optionA} {userVoteChoice === 'A' ? '✓' : ''}</span>
                      <span className="text-amber-400">{percentA}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${percentA}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-300">
                      <span className="truncate max-w-[70%]">{activePoll.optionB} {userVoteChoice === 'B' ? '✓' : ''}</span>
                      <span className="text-indigo-400">{percentB}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${percentB}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-[10px] text-slate-400 text-center font-medium">
              Votes reset daily at 12:00 AM • +25 XP per daily vote
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: 🎯 GOALS & PROGRESS */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
              <Target className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">Goals & Progress</h2>
              <p className="text-[11px] text-slate-400">Track your learning streaks, weekly missions, and level progression</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* 🎯 1. WEEKLY MISSIONS */}
          <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 bg-slate-950 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>🎯 Weekly Mission</span>
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                2/3 Completed
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-200">
                  <span>Spin Daily Wheel 3 Times</span>
                  <span className="text-emerald-400 font-mono">2/3</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '66%' }} />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-200">
                  <span>Vote in 3 This or That Polls</span>
                  <span className="text-emerald-400 font-mono">3/3 ✓</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-200">
                  <span>Score 100+ XP in 60s Challenge</span>
                  <span className="text-emerald-400 font-mono">1/1 ✓</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            <button 
              onClick={() => updateUserProfile({ funPoints: funPoints + 150 })}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition-all flex items-center justify-center space-x-1.5"
            >
              <Award className="w-4 h-4" />
              <span>Claim Weekly Bonus (+150 XP)</span>
            </button>
          </div>

          {/* 🔥 2. LEARNING STREAK */}
          <div className="glass-card rounded-3xl p-6 border border-rose-500/30 bg-slate-950 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>🔥 Learning Streak</span>
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                {streak} Days Active
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-center space-y-2">
              <div className="text-3xl font-black text-rose-400 flex items-center justify-center gap-2">
                <Flame className="w-8 h-8 fill-rose-500 animate-bounce" />
                <span>{streak} DAYS</span>
              </div>
              <p className="text-xs text-slate-300 font-semibold">
                Log in daily & complete any challenge to keep your streak burning!
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Streak Milestones</span>
                <span className="text-rose-400">Next: 7 Days</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-extrabold">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">3D ✓</div>
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">7D</div>
                <div className="p-2 rounded-xl bg-slate-900 text-slate-500 border border-slate-800">14D</div>
                <div className="p-2 rounded-xl bg-slate-900 text-slate-500 border border-slate-800">30D</div>
              </div>
            </div>
          </div>

          {/* ⭐ 3. LEVELS & PROGRESSION */}
          <div className="glass-card rounded-3xl p-6 border border-indigo-500/30 bg-slate-950 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>⭐ Levels & Progression</span>
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Level {currentLevel}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-center space-y-2">
              <div className="text-xl font-black text-indigo-300">
                Level {currentLevel}: Code Architect
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-400">
                  <span>Progress to Level {currentLevel + 1}</span>
                  <span className="text-indigo-400">{levelPercent}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${levelPercent}%` }} />
                </div>
              </div>
            </div>

            <div className="text-xs space-y-1 text-slate-400 font-medium">
              <p>✨ Level {currentLevel + 1} Unlocks: Custom Crimson Profile Border + 200 XP Bonus</p>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: 🏆 LEADERBOARDS (Includes NEW Class vs Class) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">BrainZone Leaderboards</h2>
              <p className="text-[11px] text-slate-400">Compete individually or represent your class section on the department leaderboards</p>
            </div>
          </div>

          {/* Leaderboard Mode Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setLeaderboardTab('weekly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                leaderboardTab === 'weekly'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🏆 Weekly
            </button>
            <button
              onClick={() => setLeaderboardTab('monthly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                leaderboardTab === 'monthly'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📅 Monthly
            </button>
            <button
              onClick={() => setLeaderboardTab('class')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                leaderboardTab === 'class'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>🏫 Class vs Class</span>
            </button>
          </div>
        </div>

        {/* LEADERBOARD CONTENT DISPLAY */}
        {leaderboardTab === 'class' ? (
          /* NEW CLASS VS CLASS LEADERBOARD VIEW */
          <div className="glass-card rounded-3xl p-6 border border-purple-500/30 bg-slate-950 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span>Class Section Leaderboard Rankings</span>
                </h3>
                <p className="text-xs text-slate-400">Total combined BrainZone XP accumulated by all students in each section</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Department Cup
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {classLeaderboardList.map((cls, index) => {
                const isTop1 = index === 0;
                const isTop2 = index === 1;
                const isTop3 = index === 2;

                return (
                  <div
                    key={cls.classSection}
                    className={`glass-card rounded-2xl p-5 border space-y-3 relative overflow-hidden transition-all ${
                      isTop1 ? 'border-amber-500/70 bg-gradient-to-b from-amber-950/30 to-slate-950 shadow-xl shadow-amber-500/10' :
                      isTop2 ? 'border-slate-700 bg-slate-900/90' :
                      'border-slate-800 bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                        isTop1 ? 'bg-amber-400 text-slate-950' :
                        isTop2 ? 'bg-slate-300 text-slate-950' :
                        'bg-amber-700 text-amber-100'
                      }`}>
                        #{index + 1} RANK
                      </span>
                      <span className="text-xs font-bold text-slate-400">{cls.studentCount} Students</span>
                    </div>

                    <div>
                      <h4 className="text-xl font-black text-white">{cls.classSection} Section</h4>
                      <p className="text-xs text-purple-300 font-semibold">Top Contributor: {cls.topStudent}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400">Total Points:</span>
                      <span className="text-amber-400 text-sm font-mono font-black">{cls.totalPoints} XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* INDIVIDUAL STUDENT LEADERBOARD VIEW */
          <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-slate-950 space-y-3">
            {sortedIndividualUsers.map((usr, index) => {
              const borderObj = PROFILE_BORDERS.find(b => b.id === usr.border) || PROFILE_BORDERS[0];
              return (
                <div
                  key={usr.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    index === 0 ? 'bg-amber-950/20 border-amber-500/50 shadow-lg shadow-amber-500/10' :
                    index === 1 ? 'bg-slate-900 border-slate-700' :
                    index === 2 ? 'bg-slate-900/80 border-slate-800' :
                    'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                      index === 0 ? 'bg-amber-400 text-slate-950' :
                      index === 1 ? 'bg-slate-300 text-slate-950' :
                      index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      #{index + 1}
                    </span>

                    <div className={`w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border ${borderObj.borderClass} ${borderObj.shadowClass}`}>
                      <span className="text-sm">{borderObj.icon}</span>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{usr.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{usr.classSection} • 🔥 {usr.streak} Day Streak</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-mono font-black text-amber-400">{usr.funPoints} XP</p>
                    <p className="text-[9px] text-slate-500 font-medium">Rank {index + 1}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: 🎁 REWARDS & COLLECTION */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
              <Gift className="w-4 h-4 text-pink-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">Rewards & Collection</h2>
              <p className="text-[11px] text-slate-400">Open loot boxes, equip profile borders, and unlock achievement badges</p>
            </div>
          </div>
        </div>

        {/* MYSTERY BOX & PROFILE BORDERS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* 🎁 MYSTERY BOX */}
          <div className="glass-card rounded-3xl p-6 border border-pink-500/30 bg-gradient-to-b from-pink-950/20 to-slate-950 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-pink-500/20 text-pink-300 border border-pink-500/40">
                  Loot Box
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">Available Daily</span>
              </div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>🎁 Mystery Box</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Open your daily mystery box for a chance to win bonus XP, streak shields, or exclusive profile borders!
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
              <Gift className="w-12 h-12 text-pink-400 mx-auto animate-bounce" />
              {mysteryReward ? (
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                  {mysteryReward}
                </div>
              ) : (
                <p className="text-xs font-bold text-slate-300">Daily Mystery Box Ready to Open!</p>
              )}
            </div>

            <button
              onClick={handleOpenMysteryBox}
              className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-90 text-white shadow-lg shadow-pink-600/30 transition-all"
            >
              Open Daily Mystery Box ✨
            </button>
          </div>

          {/* 🖼️ PROFILE BORDERS (MY COLLECTION) */}
          <div className="glass-card rounded-3xl p-6 border border-cyan-500/30 bg-slate-950 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>🖼️ Profile Borders (Collection)</span>
              </h3>
              <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/40">
                Equipped: {currentBorderObj.name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
              {PROFILE_BORDERS.map((b) => {
                const isEquipped = b.id === equippedBorderId;
                return (
                  <div
                    key={b.id}
                    onClick={() => updateUserProfile({ equippedBorder: b.id })}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all space-y-2 text-center ${
                      isEquipped
                        ? 'bg-cyan-950/30 border-cyan-400 ring-1 ring-cyan-400/50'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-10 h-10 mx-auto rounded-xl bg-slate-950 flex items-center justify-center border ${b.borderClass} ${b.shadowClass} ${b.ringClass}`}>
                      <span className="text-lg">{b.icon}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white line-clamp-1">{b.name}</p>
                      <p className="text-[9px] text-slate-400 line-clamp-1">{b.desc}</p>
                    </div>
                    <button className={`w-full py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                      isEquipped ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}>
                      {isEquipped ? 'EQUIPPED ✓' : 'Equip Border'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* 🏅 BADGES & ACHIEVEMENTS GRID */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 bg-slate-950 space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <span>🏅 Badges & Achievements</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {ACHIEVEMENTS.map((ach) => (
              <div key={ach.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-2xl flex-shrink-0">
                  {ach.icon}
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white">{ach.title}</p>
                  <p className="text-[10px] text-slate-400 leading-snug">{ach.desc}</p>
                  <span className="inline-block text-[9px] font-extrabold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                    Reward: {ach.reward}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: 💡 DAILY EXTRAS */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
              <Lightbulb className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">Daily Extras</h2>
              <p className="text-[11px] text-slate-400">Fascinating IT facts & tech trivia to expand your computer science knowledge</p>
            </div>
          </div>
        </div>

        {/* 💡 IT FACT OF THE DAY CARD */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-950 to-indigo-950/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                💡 IT Fact of the Day
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">{currentFact.category}</span>
            </div>

            <button
              onClick={() => setFactIndex(prev => prev + 1)}
              className="text-xs font-bold text-brand-400 hover:underline flex items-center space-x-1"
            >
              <span>Next Fact →</span>
            </button>
          </div>

          <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed italic border-l-4 border-amber-400 pl-4 py-1">
            "{currentFact.fact}"
          </p>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(currentFact.fact);
                setCopiedFact(true);
                setTimeout(() => setCopiedFact(false), 2000);
              }}
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedFact ? 'Copied to Clipboard!' : 'Share Fact'}</span>
            </button>

            <span className="text-[10px] text-slate-500 font-medium">Fact #{factIndex + 1} of {INITIAL_IT_FACTS.length}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🧠 60-SECOND CHALLENGE MODAL GAME */}
      {/* ========================================================================= */}
      {challengeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-cyan-500/40 shadow-2xl space-y-6">
            
            {!challengeFinished ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-lg font-black text-white">60-Second IT Challenge</h3>
                    <p className="text-xs text-slate-400">Question {challengeIndex + 1} of {DAILY_QUIZ_QUESTIONS.length}</p>
                  </div>
                  <div className="flex items-center space-x-1 text-amber-400 font-mono text-lg font-black bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
                    <Clock className="w-4 h-4" />
                    <span>{challengeTimer}s</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm sm:text-base font-bold text-white leading-snug">
                    {DAILY_QUIZ_QUESTIONS[challengeIndex].q}
                  </p>

                  <div className="space-y-2.5">
                    {DAILY_QUIZ_QUESTIONS[challengeIndex].options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswerChallenge(idx)}
                        className="w-full p-3.5 rounded-2xl border border-slate-800 bg-slate-900/90 hover:bg-cyan-500/20 hover:border-cyan-500/40 text-slate-200 hover:text-white font-semibold text-xs text-left transition-all flex items-center justify-between group"
                      >
                        <span>{opt}</span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 py-4 animate-in zoom-in-95">
                <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
                <h3 className="text-2xl font-black text-white">Challenge Completed!</h3>
                
                <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 space-y-1">
                  <p className="text-3xl font-black text-cyan-300">{challengeScore} / {DAILY_QUIZ_QUESTIONS.length} Correct</p>
                  <p className="text-xs font-bold text-amber-400">+{(challengeScore * 30) + (challengeTimer > 20 ? 50 : 20)} XP Earned!</p>
                </div>

                <button
                  onClick={() => setChallengeOpen(false)}
                  className="w-full py-3 rounded-2xl font-black text-xs uppercase bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30 transition-all"
                >
                  Return to BrainZone Hub
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
