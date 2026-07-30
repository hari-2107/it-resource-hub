import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  Trophy, 
  Flame, 
  Star, 
  RotateCcw, 
  Clock, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  ChevronRight, 
  Share2, 
  Zap, 
  Gamepad2, 
  Brain, 
  Lightbulb, 
  Target, 
  Gift, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  Code, 
  Bug, 
  Terminal, 
  HelpCircle, 
  Crown, 
  Calendar,
  X,
  Sliders,
  CheckCircle,
  Lock
} from 'lucide-react';

import { 
  PROFILE_BORDERS, 
  PROFILE_TITLES, 
  AVATAR_BACKGROUNDS, 
  getBorderObj, 
  getTitleObj, 
  getAvatarBgObj, 
  isCosmeticUnlocked, 
  autoCheckEligibleCosmetics 
} from '../utils/cosmetics';
import { DifficultySelectorModal } from '../components/DifficultySelectorModal';

const shuffleArray = (arr) => {
  if (!arr || !Array.isArray(arr)) return [];
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const getTimerSecondsForDiff = (diff) => {
  if (diff === 'beginner') return 60;
  if (diff === 'advanced') return 25;
  return 40;
};

const ECG_CHALLENGES = [
  { id: 'ecg-1', code: '401', difficulty: 'beginner', name: 'HTTP 401 Unauthorized', desc: 'Request requires authentication headers', options: ['Bad Request', 'Unauthorized', 'Forbidden', 'Internal Server Error'], answer: 1 },
  { id: 'ecg-2', code: '404', difficulty: 'beginner', name: 'HTTP 404 Not Found', desc: 'Requested endpoint or page does not exist', options: ['Not Found', 'Unauthorized', 'Forbidden', 'Server Error'], answer: 0 },
  { id: 'ecg-3', code: '503', difficulty: 'intermediate', name: 'HTTP 503 Service Unavailable', desc: 'Server is overloaded or down for maintenance', options: ['Gateway Timeout', 'Service Unavailable', 'Bad Gateway', 'Method Not Allowed'], answer: 1 },
  { id: 'ecg-4', code: '403', difficulty: 'intermediate', name: 'HTTP 403 Forbidden', desc: 'Server refuses to authorize access to resource', options: ['Forbidden', 'Unauthorized', 'Not Found', 'Bad Request'], answer: 0 },
  { id: 'ecg-5', code: '504', difficulty: 'advanced', name: 'HTTP 504 Gateway Timeout', desc: 'Upstream proxy server failed to respond in time', options: ['Gateway Timeout', 'Service Unavailable', 'Conflict', 'Precondition Failed'], answer: 0 },
  { id: 'ecg-6', code: '409', difficulty: 'advanced', name: 'HTTP 409 Conflict', desc: 'Request conflicts with current state of server resource', options: ['Conflict', 'Locked', 'Payload Too Large', 'Unprocessable Entity'], answer: 0 }
];

const TANGO_PUZZLES = [
  { id: 'tango-1', grid: '4x4', difficulty: 'beginner', desc: 'Equal count of ☀️ and 🌙 symbols per row and column (2 of each)!', size: 4, fixed: { '0-0': 'sun', '1-3': 'moon' } },
  { id: 'tango-2', grid: '6x6', difficulty: 'intermediate', desc: 'Equal count of ☀️ and 🌙 symbols per row and column (3 of each)!', size: 6, fixed: { '0-1': 'sun', '2-4': 'moon', '4-2': 'sun', '5-5': 'moon' } },
  { id: 'tango-3', grid: '8x8', difficulty: 'advanced', desc: 'Equal count of ☀️ and 🌙 symbols per row and column (4 of each)!', size: 8, fixed: { '0-2': 'sun', '1-5': 'moon', '3-3': 'sun', '6-1': 'moon', '7-7': 'sun' } }
];

const SPEED_TYPE_PROMPTS = [
  {
    id: 'type-1',
    difficulty: 'beginner',
    snippet: `const calculateTotal = (price, tax) => {\n  return price + (price * tax);\n};`,
    lang: 'JavaScript',
    targetWpm: 30
  },
  {
    id: 'type-2',
    difficulty: 'intermediate',
    snippet: `function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}`,
    lang: 'JavaScript',
    targetWpm: 45
  },
  {
    id: 'type-3',
    difficulty: 'advanced',
    snippet: `export const useDebounce = (value, delay) => {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const handler = setTimeout(() => {\n      setDebounced(value);\n    }, delay);\n    return () => clearTimeout(handler);\n  }, [value, delay]);\n  return debounced;\n};`,
    lang: 'React',
    targetWpm: 60
  }
];




const INITIAL_ACHIEVEMENT_BADGES = [
  { id: 'first_spin', title: 'First Spin', icon: '🎡', desc: 'Spin the BrainZone wheel for the first time', target: 1, reward: '+50 XP' },
  { id: 'poll_voter', title: 'Poll Master', icon: '🤔', desc: 'Vote in 5 Daily This or That polls', target: 5, reward: '+100 XP' },
  { id: 'speed_demon', title: 'Speed Demon', icon: '⚡', desc: 'Complete 60-Second Challenge with >80% score', target: 1, reward: '+150 XP' },
  { id: 'streak_fire', title: 'On Fire', icon: '🔥', desc: 'Maintain a 7-day learning streak', target: 7, reward: '+200 XP & Neon Border' },
  { id: 'mystery_hunter', title: 'Mystery Hunter', icon: '🎁', desc: 'Open 3 Daily Mystery Boxes', target: 3, reward: '+75 XP' },
  { id: 'class_hero', title: 'Class Hero', icon: '🏫', desc: 'Contribute to your Class vs Class Leaderboard', target: 1, reward: '+120 XP' }
];

const DAILY_QUIZ_QUESTIONS = [
  { id: 1, q: "What does API stand for in software engineering?", options: ["Automated Program Interface", "Application Programming Interface", "Advanced Process Integration", "Application Protocol Instruction"], answer: 1, category: "Web Dev" },
  { id: 2, q: "Which data structure follows the Last-In, First-Out (LIFO) principle?", options: ["Queue", "Binary Tree", "Stack", "Linked List"], answer: 2, category: "Data Structures" },
  { id: 3, q: "What default port does HTTPS protocol use?", options: ["80", "21", "8080", "443"], answer: 3, category: "Networking" },
  { id: 4, q: "Which Big-O time complexity represents binary search algorithm?", options: ["O(N)", "O(log N)", "O(N^2)", "O(1)"], answer: 1, category: "Algorithms" },
  { id: 5, q: "Which HTTP status code signifies 'Resource Not Found'?", options: ["200", "403", "404", "500"], answer: 2, category: "Web Dev" }
];

const WHEEL_SEGMENTS = [
  { id: '10xp', label: '+10 XP', shortLabel: '+10 XP', color: '#10B981', weight: 30, banner: '🎉 You won +10 XP!', xp: 10 },
  { id: '25xp', label: '+25 XP', shortLabel: '+25 XP', color: '#3B82F6', weight: 25, banner: '⚡ You won +25 XP!', xp: 25 },
  { id: 'quiz', label: 'Quiz Question', shortLabel: 'Quiz 🧠', color: '#8B5CF6', weight: 20, banner: '🧠 Quick Quiz Unlocked!', xp: 0 },
  { id: 'fact', label: 'Fun Fact', shortLabel: 'Fact 💡', color: '#F59E0B', weight: 15, banner: '💡 IT Fact Unlocked! (+15 XP)', xp: 15 },
  { id: 'badge', label: 'Badge Boost', shortLabel: 'Badge 🏅', color: '#EC4899', weight: 7, banner: '🏅 Badge Boost! (+50 XP)', xp: 50 },
  { id: 'mystery', label: 'Mystery Box', shortLabel: 'Mystery 🎁', color: '#06B6D4', weight: 3, banner: '🎁 Mystery Box Unlocked!', xp: 0 }
];

const selectWeightedSegment = () => {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
    cumulative += WHEEL_SEGMENTS[i].weight;
    if (rand <= cumulative) {
      return i;
    }
  }
  return 0;
};

export const BrainZonePage = ({ onOpenAdminForm }) => {
  const { currentUser, updateUserProfile, isAdmin } = useAuth();
  const { 
    registeredUsers, 
    thisOrThatPolls, 
    voteThisOrThatPoll, 
    itFacts, 
    quizQuestions,
    guessOutputChallenges,
    addOrUpdateGuessOutputChallenge,
    removeGuessOutputChallenge,
    findBugChallenges,
    addOrUpdateFindBugChallenge,
    removeFindBugChallenge,
    addOrUpdateQuizQuestion,
    removeQuizQuestion,
    addThisOrThatPoll
  } = useData();

  // Active Main Tab state: 'games' | 'goals' | 'leaderboard'
  const [activeTab, setActiveTab] = useState('games');

  // User Stats state
  const funPoints = currentUser?.funPoints || 450;
  const streak = currentUser?.streak || 5;
  const equippedBorderId = currentUser?.equippedBorder || currentUser?.equippedBorderId || 'cyber_neon';
  const equippedTitleId = currentUser?.equippedTitleId || currentUser?.equippedTitle || 'title_novice';
  const equippedAvatarBgId = currentUser?.equippedAvatarBgId || currentUser?.equippedAvatarBackgroundId || 'bg_slate';
  
  const unlockedBorderIds = currentUser?.unlockedBorderIds || ['default', 'cyber_neon'];
  const unlockedTitleIds = currentUser?.unlockedTitleIds || ['title_novice'];
  const unlockedAvatarBgIds = currentUser?.unlockedAvatarBgIds || ['bg_slate'];
  const userBadges = currentUser?.unlockedBadges || ['first_spin', 'poll_voter'];

  const votedPolls = currentUser?.votedThisOrThatDates || {}; // { [pollId]: 'A' | 'B' }

  // Cosmetic Customization Tab state: 'borders' | 'titles' | 'avatarBgs'
  const [cosmeticTab, setCosmeticTab] = useState('borders');
  const [unlockedBanner, setUnlockedBanner] = useState(null);

  // Auto-unlock eligible cosmetics effect when user XP or badges update
  useEffect(() => {
    if (!currentUser) return;
    const { changed, newlyUnlockedNames, updatedUserDoc } = autoCheckEligibleCosmetics(currentUser);
    if (changed) {
      updateUserProfile(updatedUserDoc);
      if (newlyUnlockedNames && newlyUnlockedNames.length > 0) {
        setUnlockedBanner(`🎉 New cosmetic unlocked: ${newlyUnlockedNames.join(', ')}`);
        const timer = setTimeout(() => setUnlockedBanner(null), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [funPoints, streak, currentUser?.unlockedBadges]);


  const todayDateStr = new Date().toISOString().split('T')[0];
  const hasSpunToday = currentUser?.lastSpinDate === todayDateStr;

  // Spin Wheel State
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [wheelRotation, setWheelRotation] = useState(0);

  // Spin Outcome Modals
  const [spinQuizModalOpen, setSpinQuizModalOpen] = useState(false);
  const [spinQuizQ, setSpinQuizQ] = useState(null);
  const [spinQuizSelectedOpt, setSpinQuizSelectedOpt] = useState(null);
  const [spinQuizAnswered, setSpinQuizAnswered] = useState(false);

  const [spinFactModalOpen, setSpinFactModalOpen] = useState(false);
  const [spinFactData, setSpinFactData] = useState(null);

  // Standardized Difficulty Selector & Timer State
  const [diffModalOpen, setDiffModalOpen] = useState(false);
  const [activeGameTarget, setActiveGameTarget] = useState(null);
  const [gameDifficulty, setGameDifficulty] = useState('intermediate');
  const [gameXpMultiplier, setGameXpMultiplier] = useState(1.5);

  // Per-Round Difficulty Countdown Timer
  const [roundTimer, setRoundTimer] = useState(40);
  const [roundTimerMax, setRoundTimerMax] = useState(40);
  const [roundTimerActive, setRoundTimerActive] = useState(false);

  // 60-Second Challenge Modal State
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeScore, setChallengeScore] = useState(0);
  const [challengeTimer, setChallengeTimer] = useState(60);
  const [challengeFinished, setChallengeFinished] = useState(false);
  const [challengeActive, setChallengeActive] = useState(false);

  // Quick Quiz Modal State
  const [quickQuizOpen, setQuickQuizOpen] = useState(false);
  const [selectedQuizCategory, setSelectedQuizCategory] = useState('All');
  const [activeQuizList, setActiveQuizList] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);

  // Guess Output Modal State
  const [guessOutputOpen, setGuessOutputOpen] = useState(false);
  const [activeGuessList, setActiveGuessList] = useState([]);
  const [guessIndex, setGuessIndex] = useState(0);
  const [guessSelectedOpt, setGuessSelectedOpt] = useState(null);
  const [guessSubmitted, setGuessSubmitted] = useState(false);

  // Find Bug Modal State
  const [findBugOpen, setFindBugOpen] = useState(false);
  const [activeBugList, setActiveBugList] = useState([]);
  const [bugIndex, setBugIndex] = useState(0);
  const [bugSelectedOpt, setBugSelectedOpt] = useState(null);
  const [bugSubmitted, setBugSubmitted] = useState(false);

  // ECG (Error Code Guessing) Modal State
  const [ecgModalOpen, setEcgModalOpen] = useState(false);
  const [activeEcgList, setActiveEcgList] = useState([]);
  const [ecgIndex, setEcgIndex] = useState(0);
  const [ecgSelectedOpt, setEcgSelectedOpt] = useState(null);
  const [ecgSubmitted, setEcgSubmitted] = useState(false);

  // Interactive Tango Logic Grid Engine State
  const [tangoModalOpen, setTangoModalOpen] = useState(false);
  const [tangoSize, setTangoSize] = useState(4);
  const [tangoGrid, setTangoGrid] = useState([]); // 2D Array: 'empty' | 'sun' | 'moon'
  const [tangoFixedCells, setTangoFixedCells] = useState([]); // List of 'r-c' strings
  const [tangoFeedback, setTangoFeedback] = useState(null);
  const [tangoSolved, setTangoSolved] = useState(false);

  // Speed Type Real-Time Typing Engine State
  const [speedTypeModalOpen, setSpeedTypeModalOpen] = useState(false);
  const [speedTypePrompt, setSpeedTypePrompt] = useState(SPEED_TYPE_PROMPTS[0]);
  const [speedTypeInput, setSpeedTypeInput] = useState('');
  const [speedTypeStartTime, setSpeedTypeStartTime] = useState(null);
  const [speedTypeFinished, setSpeedTypeFinished] = useState(false);
  const [speedTypeWpm, setSpeedTypeWpm] = useState(0);
  const [speedTypeAccuracy, setSpeedTypeAccuracy] = useState(100);



  // Leaderboard Filters State: 'weekly' | 'monthly' | 'class'
  const [leaderboardFilter, setLeaderboardFilter] = useState('weekly');

  // Weekly Mission State
  const [weeklyMissions, setWeeklyMissions] = useState([
    { id: 'm-1', title: 'Complete 3 Quick Quizzes', target: 3, progress: 2, reward: 75 },
    { id: 'm-2', title: 'Play Spin & Learn 3 times', target: 3, progress: 2, reward: 50 },
    { id: 'm-3', title: 'Complete 2 Coding Challenges', target: 2, progress: 1, reward: 100 }
  ]);
  const [claimedWeeklyBonus, setClaimedWeeklyBonus] = useState(false);

  // Admin Management Modal State inside BrainZone
  const [adminManagerOpen, setAdminManagerOpen] = useState(false);
  const [adminTab, setAdminTab] = useState('quiz'); // 'quiz' | 'guess' | 'bug' | 'polls'

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
    
    const updatedVoted = { ...votedPolls, [activePoll.id]: option };
    updateUserProfile({
      votedThisOrThatDates: updatedVoted,
      funPoints: funPoints + 25
    });

    if (voteThisOrThatPoll) {
      voteThisOrThatPoll(activePoll.id, option);
    }
  };

  // 60s Challenge Countdown Timer Effect
  useEffect(() => {
    let timerId;
    if (challengeActive && challengeTimer > 0) {
      timerId = setInterval(() => {
        setChallengeTimer(prev => prev - 1);
      }, 1000);
    } else if (challengeTimer === 0 && challengeActive) {
      finishChallenge();
    }
    return () => clearInterval(timerId);
  }, [challengeActive, challengeTimer]);

  // Per-round difficulty countdown timer effect
  useEffect(() => {
    let intervalId;
    if (roundTimerActive && roundTimer > 0) {
      intervalId = setInterval(() => {
        setRoundTimer(prev => prev - 1);
      }, 1000);
    } else if (roundTimerActive && roundTimer === 0) {
      setRoundTimerActive(false);
    }
    return () => clearInterval(intervalId);
  }, [roundTimerActive, roundTimer]);

  // Tango Interactive Board Engine
  const initTangoBoard = (size, fixedObj = {}) => {
    const grid = [];
    const fixedKeys = Object.keys(fixedObj);
    setTangoFixedCells(fixedKeys);
    setTangoSize(size);
    setTangoFeedback(null);
    setTangoSolved(false);

    for (let r = 0; r < size; r++) {
      const row = [];
      for (let c = 0; c < size; c++) {
        const key = `${r}-${c}`;
        if (fixedObj[key]) {
          row.push(fixedObj[key]);
        } else {
          row.push('empty');
        }
      }
      grid.push(row);
    }
    setTangoGrid(grid);
  };

  const toggleTangoCell = (r, c) => {
    if (tangoFixedCells.includes(`${r}-${c}`)) return;
    setTangoGrid(prevGrid => {
      const newGrid = prevGrid.map(row => [...row]);
      const current = newGrid[r][c];
      if (current === 'empty') newGrid[r][c] = 'sun';
      else if (current === 'sun') newGrid[r][c] = 'moon';
      else newGrid[r][c] = 'empty';
      return newGrid;
    });
    setTangoFeedback(null);
  };

  const validateTangoBoard = () => {
    const size = tangoSize;
    const half = size / 2;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (tangoGrid[r][c] === 'empty') {
          setTangoFeedback({ success: false, msg: `⚠️ Please fill all grid cells before checking solution!` });
          return false;
        }
      }
    }

    for (let r = 0; r < size; r++) {
      let suns = 0, moons = 0;
      for (let c = 0; c < size; c++) {
        if (tangoGrid[r][c] === 'sun') suns++;
        else if (tangoGrid[r][c] === 'moon') moons++;

        if (c >= 2) {
          if (tangoGrid[r][c] === tangoGrid[r][c-1] && tangoGrid[r][c-1] === tangoGrid[r][c-2]) {
            setTangoFeedback({ success: false, msg: `⚠️ Row ${r + 1} has 3 consecutive identical symbols!` });
            return false;
          }
        }
      }
      if (suns !== half || moons !== half) {
        setTangoFeedback({ success: false, msg: `⚠️ Row ${r + 1} must contain exactly ${half} ☀️ and ${half} 🌙!` });
        return false;
      }
    }

    for (let c = 0; c < size; c++) {
      let suns = 0, moons = 0;
      for (let r = 0; r < size; r++) {
        if (tangoGrid[r][c] === 'sun') suns++;
        else if (tangoGrid[r][c] === 'moon') moons++;

        if (r >= 2) {
          if (tangoGrid[r][c] === tangoGrid[r-1][c] && tangoGrid[r-1][c] === tangoGrid[r-2][c]) {
            setTangoFeedback({ success: false, msg: `⚠️ Column ${c + 1} has 3 consecutive identical symbols!` });
            return false;
          }
        }
      }
      if (suns !== half || moons !== half) {
        setTangoFeedback({ success: false, msg: `⚠️ Column ${c + 1} must contain exactly ${half} ☀️ and ${half} 🌙!` });
        return false;
      }
    }

    setTangoSolved(true);
    const earned = Math.round(50 * gameXpMultiplier);
    updateUserProfile({ funPoints: funPoints + earned });
    setTangoFeedback({ success: true, msg: `🎉 Perfect! Tango Grid Legitimly Solved (+${earned} XP)!` });
    return true;
  };

  const start60SecChallenge = () => {
    setChallengeIndex(0);
    setChallengeScore(0);
    setChallengeTimer(60);
    setChallengeFinished(false);
    setChallengeActive(true);
    setChallengeOpen(true);
  };

  const handleAnswerChallenge = (optionIndex) => {
    const qList = (quizQuestions && quizQuestions.length > 0) ? quizQuestions : DAILY_QUIZ_QUESTIONS;
    if (optionIndex === qList[challengeIndex % qList.length].answer) {
      setChallengeScore(prev => prev + 1);
    }
    if (challengeIndex < qList.length - 1) {
      setChallengeIndex(prev => prev + 1);
    } else {
      finishChallenge();
    }
  };

  // Universal Difficulty Selector Launcher
  const triggerDifficultySelector = (config) => {
    setActiveGameTarget(config);
    setDiffModalOpen(true);
  };

  const handleStartWithDifficulty = (selectedDiff, multiplier) => {
    setGameDifficulty(selectedDiff);
    setGameXpMultiplier(multiplier);
    setDiffModalOpen(false);

    if (activeGameTarget && typeof activeGameTarget.onStart === 'function') {
      activeGameTarget.onStart(selectedDiff, multiplier);
    }
  };

  const finishChallenge = () => {
    setChallengeFinished(true);
    setChallengeActive(false);
    const baseEarned = (challengeScore * 30) + (challengeTimer > 20 ? 50 : 20);
    const earnedXp = Math.round(baseEarned * gameXpMultiplier);
    updateUserProfile({
      funPoints: funPoints + earnedXp,
      streak: currentUser?.lastSpinDate !== todayDateStr ? streak + 1 : streak
    });
  };

  // Wheel Spin logic with weighted odds and dynamic outcomes
  const handleSpinWheel = () => {
    if (isSpinning || hasSpunToday) return;

    setIsSpinning(true);
    setSpinResult(null);

    const winIdx = selectWeightedSegment();
    const winningSeg = WHEEL_SEGMENTS[winIdx];

    const currentModulo = wheelRotation % 360;
    const targetModulo = (360 - (winIdx * 60 + 30)) % 360;
    let delta = targetModulo - currentModulo;
    if (delta < 0) delta += 360;
    const totalSpinDegrees = wheelRotation + 1800 + delta;

    setWheelRotation(totalSpinDegrees);

    setTimeout(() => {
      setIsSpinning(false);
      setSpinResult(winningSeg.banner);

      const nextProfile = {
        lastSpinDate: todayDateStr,
        streak: currentUser?.lastSpinDate !== todayDateStr ? streak + 1 : streak
      };

      if (winningSeg.id === '10xp' || winningSeg.id === '25xp' || winningSeg.id === 'badge') {
        nextProfile.funPoints = funPoints + winningSeg.xp;
        updateUserProfile(nextProfile);
      } else if (winningSeg.id === 'fact') {
        nextProfile.funPoints = funPoints + 15;
        updateUserProfile(nextProfile);
        const factList = (itFacts && itFacts.length > 0) ? itFacts : [{ fact: "First electronic computer ENIAC weighed 27 tons!", category: "CS History" }];
        const randomFact = factList[Math.floor(Math.random() * factList.length)];
        setSpinFactData(randomFact);
        setSpinFactModalOpen(true);
      } else if (winningSeg.id === 'quiz') {
        updateUserProfile(nextProfile);
        const qList = (quizQuestions && quizQuestions.length > 0) ? quizQuestions : DAILY_QUIZ_QUESTIONS;
        const randomQ = qList[Math.floor(Math.random() * qList.length)];
        setSpinQuizQ(randomQ);
        setSpinQuizSelectedOpt(null);
        setSpinQuizAnswered(false);
        setSpinQuizModalOpen(true);
      } else if (winningSeg.id === 'mystery') {
        updateUserProfile(nextProfile);
        const rewards = ['💎 +150 Super XP Bonus!', '🎁 Unlocked Golden Legend Border!', '🛡️ Earned 1x Streak Shield!'];
        setSpinResult(`🎁 Mystery Loot: ${rewards[Math.floor(Math.random() * rewards.length)]}`);
      }
    }, 3600);
  };

  // Guess Output Challenge list
  const guessList = (guessOutputChallenges && guessOutputChallenges.length > 0) ? guessOutputChallenges : [
    {
      id: 'go-1',
      title: 'JavaScript Type Coercion',
      language: 'javascript',
      code: 'console.log(1 + "2" + 3);',
      options: ['"123"', '"6"', '"15"', 'NaN'],
      answer: 0,
      explanation: 'In JavaScript, numbers added to strings are converted to strings: 1 + "2" = "12", then "12" + 3 = "123".'
    }
  ];

  // Find Bug Challenge list
  const bugList = (findBugChallenges && findBugChallenges.length > 0) ? findBugChallenges : [
    {
      id: 'fb-1',
      title: 'Infinite Decrement Loop',
      language: 'javascript',
      code: 'function countToTen() {\n  for (let i = 0; i < 10; i--) {\n    console.log(i);\n  }\n}',
      options: ['Line 2: i-- causes infinite loop', 'Line 1: Missing const keyword', 'Line 3: Syntax error in console.log', 'Line 2: Missing semicolon'],
      answer: 0,
      explanation: 'i-- decrements i away from 10, causing an infinite loop. It should be i++.'
    }
  ];

  // Leaderboard Aggregates & Users (Merged with currentUser and rich cosmetics)
  const baseRoster = (registeredUsers && registeredUsers.length > 0)
    ? registeredUsers
    : [
        { uid: 'u1', name: 'Alex Morgan', classSection: 'IT-A', funPoints: 1420, streak: 14, equippedBorder: 'cyber_neon', equippedTitleId: 'title_code_architect', equippedAvatarBgId: 'bg_indigo', role: 'student' },
        { uid: 'u2', name: 'Priya Sharma', classSection: 'IT-B', funPoints: 1280, streak: 11, equippedBorder: 'golden_legend', equippedTitleId: 'title_quiz_master', equippedAvatarBgId: 'bg_emerald', role: 'student' },
        { uid: 'u3', name: 'Rahul Verma', classSection: 'IT-A', funPoints: 1150, streak: 8, equippedBorder: 'emerald_shield', equippedTitleId: 'title_bug_hunter', equippedAvatarBgId: 'bg_amber', role: 'student' },
        { uid: 'u4', name: 'Karthik Raja', classSection: 'IT-C', funPoints: 1040, streak: 7, equippedBorder: 'quantum_violet', equippedTitleId: 'title_algorithm_boss', equippedAvatarBgId: 'bg_sunset', role: 'student' },
        { uid: 'u5', name: 'Sneha Patel', classSection: 'IT-B', funPoints: 980, streak: 6, equippedBorder: 'crimson_master', equippedTitleId: 'title_cyber_hero', equippedAvatarBgId: 'bg_galaxy', role: 'student' },
        { uid: 'u6', name: 'Vikas Kumar', classSection: 'IT-C', funPoints: 890, streak: 5, equippedBorder: 'default', equippedTitleId: 'title_novice', equippedAvatarBgId: 'bg_slate', role: 'student' },
        { uid: 'u7', name: 'Ananya Reddy', classSection: 'IT-A', funPoints: 810, streak: 4, equippedBorder: 'default', equippedTitleId: 'title_novice', equippedAvatarBgId: 'bg_slate', role: 'student' },
        { uid: 'u8', name: 'Gokul Krishna', classSection: 'IT-B', funPoints: 750, streak: 3, equippedBorder: 'default', equippedTitleId: 'title_novice', equippedAvatarBgId: 'bg_slate', role: 'student' }
      ];

  // Merge logged-in user to guarantee user presence on leaderboard with correct live XP/cosmetics
  const activeUserRoster = [...baseRoster];
  if (currentUser) {
    const existingIdx = activeUserRoster.findIndex(u => 
      (u.uid && u.uid === currentUser.uid) || 
      (u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      (u.name && currentUser.name && u.name.toLowerCase() === currentUser.name.toLowerCase())
    );
    if (existingIdx !== -1) {
      activeUserRoster[existingIdx] = { 
        ...activeUserRoster[existingIdx], 
        ...currentUser, 
        funPoints: funPoints, 
        streak: streak,
        equippedBorder: equippedBorderId,
        equippedTitleId: equippedTitleId,
        equippedAvatarBgId: equippedAvatarBgId
      };
    } else {
      activeUserRoster.push({ 
        ...currentUser, 
        funPoints: funPoints, 
        streak: streak,
        equippedBorder: equippedBorderId,
        equippedTitleId: equippedTitleId,
        equippedAvatarBgId: equippedAvatarBgId
      });
    }
  }

  // Sort descending by funPoints to yield continuous ranks: Rank 1, Rank 2, Rank 3...
  const sortedLeaderboardUsers = [...activeUserRoster].sort((a, b) => (b.funPoints || 0) - (a.funPoints || 0));

  // Current Logged-in user rank index
  const myRankIndex = sortedLeaderboardUsers.findIndex(u => 
    (currentUser && u.uid === currentUser.uid) || 
    (currentUser && u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase()) ||
    (currentUser && u.name && currentUser.name && u.name.toLowerCase() === currentUser.name.toLowerCase())
  );
  const myRankPosition = myRankIndex !== -1 ? myRankIndex + 1 : 1;

  // Surrounding ranks context slice (1 rank above, user position, 1-2 ranks below)
  const surroundingStart = Math.max(0, myRankIndex - 1);
  const surroundingEnd = Math.min(sortedLeaderboardUsers.length, myRankIndex + 3);
  const surroundingRanks = sortedLeaderboardUsers.slice(surroundingStart, surroundingEnd);


  // Class vs Class Aggregation
  const classAggregates = activeUserRoster.reduce((acc, usr) => {
    const sec = usr.classSection || 'IT-A';
    if (!acc[sec]) {
      acc[sec] = { classSection: sec, totalPoints: 0, studentCount: 0, topStudent: usr.name };
    }
    acc[sec].totalPoints += (usr.funPoints || 300);
    acc[sec].studentCount += 1;
    return acc;
  }, {});

  const classLeaderboardList = Object.values(classAggregates).sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="space-y-8 pb-16">
      
      {/* ========================================================================= */}
      {/* PAGE HEADER & TOP NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-purple-600/30">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                  <span>🧠 BrainZone</span>
                  <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Arcade v4.0
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300">
                  Learn, challenge yourself, earn XP, and compete with your classmates!
                </p>
              </div>
            </div>
          </div>

          {/* User Score Stats Pill */}
          <div className="flex items-center space-x-3 self-start lg:self-auto">
            <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center space-x-2 text-xs font-bold">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-white">{funPoints} XP</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center space-x-2 text-xs font-bold text-rose-400">
              <Flame className="w-4 h-4 fill-rose-400" />
              <span>{streak} Day Streak</span>
            </div>

            {isAdmin && (
              <button
                onClick={() => setAdminManagerOpen(true)}
                className="px-3.5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-lg shadow-purple-600/30 flex items-center space-x-1.5"
              >
                <Sliders className="w-4 h-4" />
                <span>Content Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* THREE MAIN SECTION NAVIGATION TABS */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('games')}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center space-x-2.5 whitespace-nowrap ${
              activeTab === 'games'
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white shadow-xl shadow-purple-600/30'
                : 'bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>🎮 GAMES & CHALLENGES</span>
          </button>

          <button
            onClick={() => setActiveTab('goals')}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center space-x-2.5 whitespace-nowrap ${
              activeTab === 'goals'
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xl shadow-emerald-600/30'
                : 'bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>🎯 GOALS & PROGRESS</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center space-x-2.5 whitespace-nowrap ${
              activeTab === 'leaderboard'
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 shadow-xl shadow-amber-500/30'
                : 'bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>🏆 LEADERBOARD</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 🎮 GAMES & CHALLENGES (DEFAULT VIEW) */}
      {/* ========================================================================= */}
      {activeTab === 'games' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* CARD 1: 🎡 SPIN & LEARN */}
            <div className="glass-card rounded-3xl p-6 border border-purple-500/30 bg-gradient-to-b from-purple-950/30 via-slate-950 to-slate-950 space-y-4 relative overflow-hidden flex flex-col justify-between group hover:border-purple-500/60 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    Daily Wheel
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {hasSpunToday ? '✓ Spun Today' : '1 Spin / Day'}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span>🎡 Spin & Learn</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Test your luck on the 6-segment wheel to win XP bonuses, quiz questions, trivia & mystery loot!
                </p>
              </div>

              {/* Visual 6-Segment SVG Wheel & Pointer */}
              <div className="my-2 py-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-center space-y-3 relative overflow-hidden">
                
                {/* Top Pointer Indicator Needle */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[14px] border-t-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.9)] animate-pulse" />

                {/* Wheel Graphic Container */}
                <div className="relative w-44 h-44 mx-auto pt-2">
                  <div className="w-full h-full rounded-full p-1 bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 shadow-xl shadow-purple-500/20 border-2 border-slate-900">
                    
                    <div 
                      className="w-full h-full rounded-full overflow-hidden relative shadow-inner"
                      style={{
                        transform: `rotate(${wheelRotation}deg)`,
                        transition: isSpinning ? 'transform 3.5s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none'
                      }}
                    >
                      <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                        {WHEEL_SEGMENTS.map((seg, idx) => {
                          const startAngle = idx * 60;
                          const endAngle = (idx + 1) * 60;
                          const x1 = 100 + 100 * Math.cos((Math.PI * startAngle) / 180);
                          const y1 = 100 + 100 * Math.sin((Math.PI * startAngle) / 180);
                          const x2 = 100 + 100 * Math.cos((Math.PI * endAngle) / 180);
                          const y2 = 100 + 100 * Math.sin((Math.PI * endAngle) / 180);
                          const pathData = `M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`;

                          const midAngle = (startAngle + endAngle) / 2;
                          const labelX = 100 + 64 * Math.cos((Math.PI * midAngle) / 180);
                          const labelY = 100 + 64 * Math.sin((Math.PI * midAngle) / 180);

                          return (
                            <g key={seg.id}>
                              <path d={pathData} fill={seg.color} stroke="#0f172a" strokeWidth="2.5" />
                              <text
                                x={labelX}
                                y={labelY}
                                fill="#ffffff"
                                fontSize="9"
                                fontWeight="900"
                                textAnchor="middle"
                                dominantBaseline="central"
                                transform={`rotate(${midAngle + 90}, ${labelX}, ${labelY})`}
                              >
                                {seg.shortLabel}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    {/* Center Hub */}
                    <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center shadow-lg z-10">
                      <Brain className={`w-5 h-5 text-amber-400 ${isSpinning ? 'animate-spin' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Dynamic Result Banner */}
                {spinResult && (
                  <div className="mx-2 p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-200 text-xs font-black animate-in fade-in shadow-lg">
                    {spinResult}
                  </div>
                )}
              </div>

              <button
                onClick={handleSpinWheel}
                disabled={isSpinning || hasSpunToday}
                className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
                  hasSpunToday
                    ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                    : isSpinning
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-90 text-white shadow-lg shadow-purple-600/30'
                }`}
              >
                <RotateCcw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>
                  {hasSpunToday
                    ? 'Spun Today (Check Back Tomorrow)'
                    : isSpinning
                    ? 'Spinning Wheel...'
                    : 'Spin Daily Wheel'}
                </span>
              </button>
            </div>

            {/* CARD 2: ⏱️ 60-SECOND CHALLENGE */}
            <div className="glass-card rounded-3xl p-6 border border-cyan-500/30 bg-gradient-to-b from-cyan-950/30 via-slate-950 to-slate-950 space-y-4 relative overflow-hidden flex flex-col justify-between group hover:border-cyan-500/60 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Timed Sprint
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">60 Seconds</span>
                </div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span>⏱️ 60-Second Challenge</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Answer 5 rapid-fire questions under 60 seconds. Faster accuracy earns bonus multiplier XP!
                </p>
              </div>

              <div className="my-2 p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-center space-y-2">
                <div className="flex items-center justify-center space-x-2 text-cyan-400">
                  <Clock className="w-8 h-8 animate-pulse" />
                  <span className="text-2xl font-black font-mono">60s</span>
                </div>
                <p className="text-[11px] text-slate-400">Speed Multiplier: Up to +150 Bonus XP</p>
              </div>

              <button
                onClick={() => triggerDifficultySelector({
                  gameId: '60sec',
                  title: '60-Second Sprint',
                  icon: '⏱️',
                  description: 'Answer 5 rapid questions under 60 seconds. Select difficulty for higher bonus XP payouts!',
                  baseXp: 150,
                  onStart: () => {
                    setChallengeIndex(0);
                    setChallengeScore(0);
                    setChallengeTimer(60);
                    setChallengeFinished(false);
                    setChallengeActive(true);
                    setChallengeOpen(true);
                  }
                })}
                className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:opacity-90 text-white shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Start Sprint Challenge</span>
              </button>
            </div>

            {/* CARD 3: 🗳️ THIS OR THAT (DAILY POLL) */}
            <div className="glass-card rounded-3xl p-6 border border-amber-500/30 bg-gradient-to-b from-amber-950/30 via-slate-950 to-slate-950 space-y-4 relative overflow-hidden flex flex-col justify-between group hover:border-amber-500/60 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Daily Poll
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{totalPollVotes} Votes</span>
                </div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span>🗳️ This or That</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  "{activePoll.question}"
                </p>
              </div>

              <div className="space-y-2 my-1">
                {!hasVotedActivePoll ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleVotePoll('A')}
                      className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500 text-xs font-bold text-slate-200 hover:text-white transition-all text-center"
                    >
                      {activePoll.optionA}
                    </button>
                    <button
                      onClick={() => handleVotePoll('B')}
                      className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500 text-xs font-bold text-slate-200 hover:text-white transition-all text-center"
                    >
                      {activePoll.optionB}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-amber-300">
                        <span>{activePoll.optionA} {userVoteChoice === 'A' ? '✓ Your Vote' : ''}</span>
                        <span>{percentA}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percentA}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-cyan-300">
                        <span>{activePoll.optionB} {userVoteChoice === 'B' ? '✓ Your Vote' : ''}</span>
                        <span>{percentB}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${percentB}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-center text-slate-400 font-semibold">
                {hasVotedActivePoll ? '✓ Voted (+25 XP Claimed)' : 'Vote to earn +25 XP!'}
              </div>
            </div>

            {/* CARD 4: 🧠 QUICK QUIZ */}
            <div className="glass-card rounded-3xl p-6 border border-purple-500/30 bg-gradient-to-b from-purple-950/30 via-slate-950 to-slate-950 space-y-4 relative overflow-hidden flex flex-col justify-between group hover:border-purple-500/60 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    Category Quiz
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">7 Categories</span>
                </div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span>🧠 Quick Quiz</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Choose your topic and test your core IT knowledge across Web Dev, AI/ML, Networks & Security!
                </p>
              </div>

              <div className="my-2 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Select Category</p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {['All', 'Web Dev', 'AI/ML', 'Security'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedQuizCategory(cat)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                        selectedQuizCategory === cat ? 'bg-purple-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => triggerDifficultySelector({
                  gameId: 'quiz',
                  title: 'Quick Quiz',
                  icon: '🧠',
                  description: 'Choose your preferred difficulty to test your core IT knowledge & earn XP!',
                  baseXp: 100,
                  onStart: (diff) => {
                    const rawList = quizQuestions.length > 0 ? quizQuestions : DAILY_QUIZ_QUESTIONS;
                    const filtered = rawList.filter(q => !q.difficulty || q.difficulty === diff);
                    setActiveQuizList(shuffleArray(filtered.length > 0 ? filtered : rawList));
                    setQuizIndex(0);
                    setQuizScore(0);
                    setQuizFinished(false);
                    setSelectedQuizOption(null);
                    const secs = getTimerSecondsForDiff(diff);
                    setRoundTimer(secs);
                    setRoundTimerMax(secs);
                    setRoundTimerActive(true);
                    setQuickQuizOpen(true);
                  }
                })}
                className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <Brain className="w-4 h-4" />
                <span>Play Quick Quiz (+XP)</span>
              </button>
            </div>

            {/* CARD 5: 💻 GUESS THE OUTPUT */}
            <div className="glass-card rounded-3xl p-6 border border-blue-500/30 bg-gradient-to-b from-blue-950/30 via-slate-950 to-slate-950 space-y-4 relative overflow-hidden flex flex-col justify-between group hover:border-blue-500/60 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    Code Output
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{guessList.length} Snippets</span>
                </div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span>💻 Guess the Output</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Analyze code logic snippets in JS, Python & C++ to predict the exact terminal output!
                </p>
              </div>

              <div className="my-2 p-3 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[11px] text-cyan-300 space-y-1">
                <div className="text-[9px] text-slate-500 font-sans uppercase">Snippet Preview</div>
                <code>{guessList[0].code}</code>
              </div>

              <button
                onClick={() => triggerDifficultySelector({
                  gameId: 'guess',
                  title: 'Guess the Output',
                  icon: '💻',
                  description: 'Analyze code logic snippets. Advanced difficulty includes closures, coercion, and async edge cases!',
                  baseXp: 80,
                  onStart: (diff) => {
                    const filtered = guessList.filter(g => !g.difficulty || g.difficulty === diff);
                    setActiveGuessList(shuffleArray(filtered.length > 0 ? filtered : guessList));
                    setGuessIndex(0);
                    setGuessSelectedOpt(null);
                    setGuessSubmitted(false);
                    const secs = getTimerSecondsForDiff(diff);
                    setRoundTimer(secs);
                    setRoundTimerMax(secs);
                    setRoundTimerActive(true);
                    setGuessOutputOpen(true);
                  }
                })}
                className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:opacity-90 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <Code className="w-4 h-4" />
                <span>Launch Output Challenge</span>
              </button>
            </div>

            {/* CARD 6: 🐞 FIND THE BUG */}
            <div className="glass-card rounded-3xl p-6 border border-rose-500/30 bg-gradient-to-b from-rose-950/30 via-slate-950 to-slate-950 space-y-4 relative overflow-hidden flex flex-col justify-between group hover:border-rose-500/60 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Debugging
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{bugList.length} Bug Hunts</span>
                </div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span>🐞 Find the Bug</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Spot syntax errors, infinite loops, and logical bugs hidden inside real-world code!
                </p>
              </div>

              <div className="my-2 p-3 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[11px] text-rose-300 space-y-1">
                <div className="text-[9px] text-slate-500 font-sans uppercase">Bug Hunt Preview</div>
                <code>{bugList[0].code.split('\n')[1]}</code>
              </div>

              <button
                onClick={() => triggerDifficultySelector({
                  gameId: 'bug',
                  title: 'Find the Bug',
                  icon: '🐞',
                  description: 'Spot syntax errors, infinite loops, and logical bugs. Choose difficulty level for higher XP rewards!',
                  baseXp: 90,
                  onStart: (diff) => {
                    const filtered = bugList.filter(b => !b.difficulty || b.difficulty === diff);
                    setActiveBugList(shuffleArray(filtered.length > 0 ? filtered : bugList));
                    setBugIndex(0);
                    setBugSelectedOpt(null);
                    setBugSubmitted(false);
                    const secs = getTimerSecondsForDiff(diff);
                    setRoundTimer(secs);
                    setRoundTimerMax(secs);
                    setRoundTimerActive(true);
                    setFindBugOpen(true);
                  }
                })}
                className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:opacity-90 text-white shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <Bug className="w-4 h-4" />
                <span>Start Bug Hunt</span>
              </button>
            </div>

            {/* CARD 7: ⚡ ERROR CODE GUESSING (ECG) */}
            <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 via-slate-950 to-slate-950 space-y-4 relative overflow-hidden flex flex-col justify-between group hover:border-emerald-500/60 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    System Codes
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{ECG_CHALLENGES.length} Codes</span>
                </div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span>⚡ ECG (Error Code Guessing)</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Identify HTTP status codes, Linux system signals, and database error messages!
                </p>
              </div>

              <div className="my-2 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center font-mono text-lg font-black text-emerald-400">
                HTTP {ECG_CHALLENGES[0].code}
              </div>

              <button
                onClick={() => triggerDifficultySelector({
                  gameId: 'ecg',
                  title: 'Error Code Guessing (ECG)',
                  icon: '⚡',
                  description: 'Guess HTTP codes and system error messages across Beginner, Intermediate, or Advanced levels!',
                  baseXp: 70,
                  onStart: (diff) => {
                    const filtered = ECG_CHALLENGES.filter(c => !c.difficulty || c.difficulty === diff);
                    setActiveEcgList(shuffleArray(filtered.length > 0 ? filtered : ECG_CHALLENGES));
                    setEcgIndex(0);
                    setEcgSelectedOpt(null);
                    setEcgSubmitted(false);
                    const secs = getTimerSecondsForDiff(diff);
                    setRoundTimer(secs);
                    setRoundTimerMax(secs);
                    setRoundTimerActive(true);
                    setEcgModalOpen(true);
                  }
                })}
                className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:opacity-90 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Play Error Code Challenge</span>
              </button>
            </div>

            {/* CARD 8: 🧩 TANGO LOGIC GRID */}
            <div className="glass-card rounded-3xl p-6 border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 via-slate-950 to-slate-950 space-y-4 relative overflow-hidden flex flex-col justify-between group hover:border-indigo-500/60 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    Logic Grid
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{TANGO_PUZZLES.length} Grids</span>
                </div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span>🧩 Tango Logic Grid</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Fill grid rows and columns with equal counts of Sun ☀️ and Moon 🌙 symbols!
                </p>
              </div>

              <div className="my-2 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center space-x-2 text-base">
                <span>☀️</span> <span>🌙</span> <span>☀️</span> <span>🌙</span>
              </div>

              <button
                onClick={() => triggerDifficultySelector({
                  gameId: 'tango',
                  title: 'Tango Logic Grid',
                  icon: '🧩',
                  description: 'Fill grid rows and columns with Sun and Moon symbols. Beginner = 4x4, Intermediate = 6x6, Advanced = 8x8 grid!',
                  baseXp: 100,
                  onStart: (diff) => {
                    const puzzle = TANGO_PUZZLES.find(p => p.difficulty === diff) || TANGO_PUZZLES[0];
                    initTangoBoard(puzzle.size, puzzle.fixed || {});
                    const secs = getTimerSecondsForDiff(diff) * 2; // Extra time for grid puzzle
                    setRoundTimer(secs);
                    setRoundTimerMax(secs);
                    setRoundTimerActive(true);
                    setTangoModalOpen(true);
                  }
                })}
                className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <Brain className="w-4 h-4" />
                <span>Start Tango Grid</span>
              </button>
            </div>

            {/* CARD 9: ⌨️ SPEED TYPE CHALLENGE */}
            <div className="glass-card rounded-3xl p-6 border border-amber-500/30 bg-gradient-to-b from-amber-950/30 via-slate-950 to-slate-950 space-y-4 relative overflow-hidden flex flex-col justify-between group hover:border-amber-500/60 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Typing Speed
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">60 WPM Target</span>
                </div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span>⌨️ Speed Type Challenge</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Type code syntax snippets with high accuracy and speed to earn WPM multiplier XP!
                </p>
              </div>

              <div className="my-2 p-3 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[11px] text-amber-300 line-clamp-1">
                <code>{SPEED_TYPE_PROMPTS[0].snippet}</code>
              </div>

              <button
                onClick={() => triggerDifficultySelector({
                  gameId: 'speedtype',
                  title: 'Speed Type Challenge',
                  icon: '⌨️',
                  description: 'Type code snippets fast. Higher difficulty requires higher WPM targets and longer code snippets!',
                  baseXp: 90,
                  onStart: (diff) => {
                    const promptObj = SPEED_TYPE_PROMPTS.find(p => p.difficulty === diff) || SPEED_TYPE_PROMPTS[0];
                    setSpeedTypePrompt(promptObj);
                    setSpeedTypeInput('');
                    setSpeedTypeStartTime(null);
                    setSpeedTypeFinished(false);
                    setSpeedTypeWpm(0);
                    setSpeedTypeAccuracy(100);
                    const secs = getTimerSecondsForDiff(diff);
                    setRoundTimer(secs);
                    setRoundTimerMax(secs);
                    setRoundTimerActive(true);
                    setSpeedTypeModalOpen(true);
                  }
                })}
                className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:opacity-90 text-white shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <Terminal className="w-4 h-4" />
                <span>Start Typing Challenge</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 🎯 GOALS & PROGRESS (USER PROFILE & ACHIEVEMENTS) */}
      {/* ========================================================================= */}
      {activeTab === 'goals' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT COLUMN: XP & LEVEL + STREAK */}
            <div className="space-y-6 lg:col-span-1">
              
              {/* ⭐ XP & LEVEL PROGRESS CARD */}
              <div className="glass-card rounded-3xl p-6 border border-purple-500/30 bg-gradient-to-b from-purple-950/20 to-slate-950 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-purple-300 uppercase tracking-wider">Level Progression</span>
                  <Award className="w-5 h-5 text-purple-400" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-white">Level {currentLevel} — Code Architect</h3>
                  <p className="text-xs text-slate-400">Total Score: {funPoints} XP</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-purple-300">Level {currentLevel}</span>
                    <span className="text-slate-400">{levelProgressXP} / {levelTargetXP} XP</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-500" style={{ width: `${levelPercent}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 leading-relaxed">
                  🚀 <strong>Next Level Unlocks:</strong> Level {currentLevel + 1} unlocks Cyber Legend Avatar Frame & Exclusive Badge!
                </div>
              </div>

              {/* 🔥 LEARNING STREAK CARD */}
              <div className="glass-card rounded-3xl p-6 border border-rose-500/30 bg-gradient-to-b from-rose-950/20 to-slate-950 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-rose-300 uppercase tracking-wider">Daily Activity Streak</span>
                  <Flame className="w-5 h-5 text-rose-400 fill-rose-400" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-black text-white">{streak} Day Streak</h3>
                    <p className="text-xs text-slate-400">Personal Best: 14 Days</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                    <Flame className="w-6 h-6 fill-rose-400 animate-bounce" />
                  </div>
                </div>

                {/* 7-Day Activity Calendar */}
                <div className="pt-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">7-Day Activity Tracker</p>
                  <div className="grid grid-cols-7 gap-1.5 text-center">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                      const isActiveDay = i < (streak % 7 || 5);
                      return (
                        <div key={day} className="space-y-1">
                          <div className={`h-9 rounded-xl flex items-center justify-center text-xs font-bold border ${
                            isActiveDay ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' : 'bg-slate-950 border-slate-800 text-slate-600'
                          }`}>
                            {isActiveDay ? <Flame className="w-4 h-4 fill-rose-400" /> : '•'}
                          </div>
                          <span className="text-[9px] text-slate-500">{day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: WEEKLY MISSIONS + BADGES & REWARDS */}
            <div className="space-y-6 lg:col-span-2">
              
              {/* 🎯 WEEKLY MISSIONS */}
              <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-slate-950 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <Target className="w-5 h-5 text-emerald-400" />
                      <span>Weekly Missions</span>
                    </h3>
                    <p className="text-xs text-slate-400">Complete all weekly goals to claim +200 XP bonus reward</p>
                  </div>

                  <button
                    disabled={claimedWeeklyBonus}
                    onClick={() => {
                      updateUserProfile({ funPoints: funPoints + 200 });
                      setClaimedWeeklyBonus(true);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      claimedWeeklyBonus
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                    }`}
                  >
                    {claimedWeeklyBonus ? '✓ Bonus Claimed (+200 XP)' : 'Claim Weekly Bonus (+200 XP)'}
                  </button>
                </div>

                <div className="space-y-3">
                  {weeklyMissions.map(m => (
                    <div key={m.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white flex items-center gap-2">
                          <CheckCircle2 className={`w-4 h-4 ${m.progress >= m.target ? 'text-emerald-400' : 'text-slate-600'}`} />
                          {m.title}
                        </span>
                        <span className="text-slate-400 font-mono font-bold">{m.progress} / {m.target} Completed</span>
                      </div>

                      <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (m.progress / m.target) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🏅 BADGES & ACHIEVEMENTS */}
              <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
                <h3 className="text-base font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>Badges & Achievements</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {INITIAL_ACHIEVEMENT_BADGES.map((b, i) => {
                    const isUnlocked = i < 4; // Mock status
                    return (
                      <div
                        key={b.id}
                        className={`p-4 rounded-2xl border text-center space-y-2 transition-all ${
                          isUnlocked
                            ? 'bg-slate-950 border-amber-500/40 shadow-lg shadow-amber-500/10'
                            : 'bg-slate-950/40 border-slate-800 opacity-60 grayscale'
                        }`}
                      >
                        <div className="text-3xl mx-auto">{b.icon}</div>
                        <div>
                          <p className="text-xs font-bold text-white">{b.title}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-2">{b.desc}</p>
                        </div>
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                          isUnlocked ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {isUnlocked ? 'Unlocked ✓' : 'Locked 🔒'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 🎁 PROFILE CUSTOMIZATION REWARDS & COSMETICS */}
              <div className="glass-card rounded-3xl p-6 border border-purple-500/30 bg-gradient-to-b from-purple-950/20 to-slate-950 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <Gift className="w-5 h-5 text-purple-400" />
                      <span>Profile Customization Hub</span>
                    </h3>
                    <p className="text-xs text-slate-400">Unlock & equip exclusive borders, titles, & avatar backgrounds!</p>
                  </div>

                  {/* Cosmetic Type Sub-Tabs */}
                  <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto">
                    <button
                      onClick={() => setCosmeticTab('borders')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        cosmeticTab === 'borders' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🖼️ Borders
                    </button>
                    <button
                      onClick={() => setCosmeticTab('titles')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        cosmeticTab === 'titles' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🏷️ Titles
                    </button>
                    <button
                      onClick={() => setCosmeticTab('avatarBgs')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        cosmeticTab === 'avatarBgs' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🎨 Avatar BGs
                    </button>
                  </div>
                </div>

                {/* Auto-Unlock Notification Banner */}
                {unlockedBanner && (
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-extrabold flex items-center justify-between shadow-lg animate-in fade-in">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                      {unlockedBanner}
                    </span>
                    <button onClick={() => setUnlockedBanner(null)} className="p-1 text-emerald-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* SUB-TAB 1: PROFILE BORDERS */}
                {cosmeticTab === 'borders' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PROFILE_BORDERS.map(b => {
                      const isUnlocked = isCosmeticUnlocked(b, unlockedBorderIds, currentLevel, userBadges, currentUser?.role);
                      const isEquipped = equippedBorderId === b.id;

                      return (
                        <div
                          key={b.id}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            isUnlocked
                              ? isEquipped
                                ? 'bg-purple-950/40 border-purple-500/80 shadow-lg shadow-purple-500/10'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                              : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className={`w-9 h-9 rounded-xl border-2 flex-shrink-0 ${b.color} ${b.bg}`} />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{b.name}</p>
                              <p className={`text-[10px] font-semibold flex items-center gap-1 ${
                                isUnlocked ? 'text-emerald-400' : 'text-slate-400'
                              }`}>
                                {!isUnlocked && <Lock className="w-3 h-3 text-slate-400 inline-block" />}
                                <span>{isUnlocked ? '✓ Unlocked' : b.unlockRequirement.label}</span>
                              </p>
                            </div>
                          </div>

                          {isUnlocked ? (
                            <button
                              onClick={() => updateUserProfile({ equippedBorder: b.id })}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                                isEquipped
                                  ? 'bg-purple-600 text-white shadow-md'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                              }`}
                            >
                              {isEquipped ? 'Equipped ✓' : 'Equip'}
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900/80 text-slate-500 border border-slate-800 flex items-center space-x-1 cursor-not-allowed flex-shrink-0">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Locked</span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* SUB-TAB 2: EQUIPPABLE TITLES */}
                {cosmeticTab === 'titles' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PROFILE_TITLES.map(t => {
                      const isUnlocked = isCosmeticUnlocked(t, unlockedTitleIds, currentLevel, userBadges, currentUser?.role);
                      const isEquipped = equippedTitleId === t.id;


                      return (
                        <div
                          key={t.id}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            isUnlocked
                              ? isEquipped
                                ? 'bg-purple-950/40 border-purple-500/80 shadow-lg shadow-purple-500/10'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                              : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                          }`}
                        >
                          <div className="space-y-1 min-w-0">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${t.badgeBg}`}>
                              🏷️ {t.title}
                            </span>
                            <p className={`text-[10px] font-semibold flex items-center gap-1 ${
                              isUnlocked ? 'text-emerald-400' : 'text-slate-400'
                            }`}>
                              {!isUnlocked && <Lock className="w-3 h-3 text-slate-400 inline-block" />}
                              <span>{isUnlocked ? '✓ Unlocked' : t.unlockRequirement.label}</span>
                            </p>
                          </div>

                          {isUnlocked ? (
                            <button
                              onClick={() => updateUserProfile({ equippedTitleId: t.id, equippedTitle: t.id })}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                                isEquipped
                                  ? 'bg-purple-600 text-white shadow-md'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                              }`}
                            >
                              {isEquipped ? 'Equipped ✓' : 'Equip'}
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900/80 text-slate-500 border border-slate-800 flex items-center space-x-1 cursor-not-allowed flex-shrink-0">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Locked</span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* SUB-TAB 3: AVATAR BACKGROUND GRADIENTS */}
                {cosmeticTab === 'avatarBgs' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AVATAR_BACKGROUNDS.map(bg => {
                      const isUnlocked = isCosmeticUnlocked(bg, unlockedAvatarBgIds, currentLevel, userBadges, currentUser?.role);
                      const isEquipped = equippedAvatarBgId === bg.id;


                      return (
                        <div
                          key={bg.id}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            isUnlocked
                              ? isEquipped
                                ? 'bg-purple-950/40 border-purple-500/80 shadow-lg shadow-purple-500/10'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                              : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className={`w-9 h-9 rounded-xl ${bg.gradient} border border-slate-700 flex items-center justify-center font-bold text-white text-xs flex-shrink-0`}>
                              ⚡
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{bg.name}</p>
                              <p className={`text-[10px] font-semibold flex items-center gap-1 ${
                                isUnlocked ? 'text-emerald-400' : 'text-slate-400'
                              }`}>
                                {!isUnlocked && <Lock className="w-3 h-3 text-slate-400 inline-block" />}
                                <span>{isUnlocked ? '✓ Unlocked' : bg.unlockRequirement.label}</span>
                              </p>
                            </div>
                          </div>

                          {isUnlocked ? (
                            <button
                              onClick={() => updateUserProfile({ equippedAvatarBgId: bg.id, equippedAvatarBackgroundId: bg.id })}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                                isEquipped
                                  ? 'bg-purple-600 text-white shadow-md'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                              }`}
                            >
                              {isEquipped ? 'Equipped ✓' : 'Equip'}
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900/80 text-slate-500 border border-slate-800 flex items-center space-x-1 cursor-not-allowed flex-shrink-0">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Locked</span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>


            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: 🏆 LEADERBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* LEADERBOARD FILTER HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-black text-white flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-amber-400" />
                <span>Department XP Leaderboard</span>
              </h3>
              <p className="text-xs text-slate-400">Calculated live from active IT student XP points & learning streaks</p>
            </div>

            <div className="flex items-center space-x-2">
              {['weekly', 'monthly', 'class'].map(f => (
                <button
                  key={f}
                  onClick={() => setLeaderboardFilter(f)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold capitalize transition-all ${
                    leaderboardFilter === f
                      ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {f === 'class' ? 'Class vs Class' : `${f} Rankings`}
                </button>
              ))}
            </div>
          </div>

          {/* YOUR RANKING HIGHLIGHT CARD WITH SURROUNDING CONTEXT */}
          <div className="glass-card rounded-3xl p-5 border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-950 to-slate-950 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-500/20 pb-3">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-lg shadow-inner">
                  #{myRankPosition}
                </div>
                <div>
                  <p className="text-xs text-amber-300 font-extrabold uppercase tracking-wider">Your Position</p>
                  <h4 className="text-base font-black text-white flex items-center gap-2 flex-wrap">
                    <span>{currentUser?.name || 'Alex Student'} ({currentUser?.classSection || 'IT-A'})</span>
                    {(() => {
                      const myTitle = getTitleObj(equippedTitleId);
                      return myTitle ? (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${myTitle.badgeBg}`}>
                          🏷️ {myTitle.title}
                        </span>
                      ) : null;
                    })()}
                  </h4>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs font-bold">
                <div className="text-right">
                  <p className="text-amber-400 font-black text-base">{funPoints} XP</p>
                  <p className="text-[10px] text-slate-400">Level {currentLevel} • 🔥 {streak} Day Streak</p>
                </div>
              </div>
            </div>

            {/* Surrounding Ranks Context Slice */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                📊 Rankings Around You (Positions #{surroundingStart + 1} – #{surroundingEnd})
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {surroundingRanks.map((usr) => {
                  const actualIdx = sortedLeaderboardUsers.findIndex(u => u === usr);
                  const actualRank = actualIdx + 1;
                  const isMe = actualIdx === myRankIndex;
                  const usrBorder = getBorderObj(usr.equippedBorder || usr.equippedBorderId || 'default');
                  const usrAvatarBg = getAvatarBgObj(usr.equippedAvatarBgId || usr.equippedAvatarBackgroundId || 'bg_slate');
                  const usrTitle = getTitleObj(usr.equippedTitleId || usr.equippedTitle || 'title_novice');

                  return (
                    <div
                      key={usr.uid || usr.name || actualRank}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                        isMe 
                          ? 'bg-amber-500/20 border-amber-500/60 ring-1 ring-amber-400/50 shadow-md' 
                          : 'bg-slate-900/80 border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <span className={`text-[11px] font-mono font-black px-2 py-0.5 rounded-lg flex-shrink-0 ${
                          isMe ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}>
                          #{actualRank}
                        </span>
                        
                        <div className={`w-8 h-8 rounded-lg p-0.5 border ${usrBorder.color} flex-shrink-0`}>
                          <div className={`w-full h-full rounded-[6px] ${usrAvatarBg.gradient} flex items-center justify-center text-[10px] font-bold text-white`}>
                            {usr.name?.charAt(0) || 'S'}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 min-w-0 flex-wrap">
                          <span className={`font-bold truncate ${isMe ? 'text-amber-300' : 'text-white'}`}>{usr.name}</span>
                          {isMe && <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-emerald-500/20 text-emerald-300">YOU</span>}
                          {usrTitle && <span className={`hidden sm:inline-block text-[9px] px-1.5 py-0.2 rounded border ${usrTitle.badgeBg}`}>🏷️ {usrTitle.title}</span>}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-[11px] font-bold flex-shrink-0">
                        <span className="text-rose-400 flex items-center"><Flame className="w-3 h-3 mr-0.5 fill-rose-400" />{usr.streak || 5}d</span>
                        <span className="text-amber-400 font-mono font-black">{usr.funPoints || 300} XP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* INDIVIDUAL RANKINGS LIST (CONTINUOUS RANKS 1..N) */}
          {leaderboardFilter !== 'class' ? (
            <div className="space-y-3">
              {sortedLeaderboardUsers.map((user, index) => {
                const rank = index + 1; // Strict continuous 1-based rank
                const isMe = index === myRankIndex;

                const borderObj = getBorderObj(user.equippedBorder || user.equippedBorderId || 'default');
                const avatarBgObj = getAvatarBgObj(user.equippedAvatarBgId || user.equippedAvatarBackgroundId || 'bg_slate');
                const titleObj = getTitleObj(user.equippedTitleId || user.equippedTitle || 'title_novice');

                let rankBadge = `#${rank}`;
                let borderClass = 'border-slate-800 bg-slate-950';

                if (rank === 1) {
                  rankBadge = '🥇 Rank 1';
                  borderClass = 'border-amber-500/50 bg-gradient-to-r from-amber-950/20 to-slate-950';
                } else if (rank === 2) {
                  rankBadge = '🥈 Rank 2';
                  borderClass = 'border-slate-400/50 bg-gradient-to-r from-slate-900/60 to-slate-950';
                } else if (rank === 3) {
                  rankBadge = '🥉 Rank 3';
                  borderClass = 'border-amber-700/50 bg-gradient-to-r from-amber-950/10 to-slate-950';
                }

                if (isMe) {
                  borderClass += ' border-emerald-500/80 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/20';
                }

                return (
                  <div key={user.uid || user.name || index} className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${borderClass}`}>
                    <div className="flex items-center space-x-4">
                      <span className={`text-xs font-black px-3 py-1 rounded-xl ${
                        rank === 1 ? 'bg-amber-500 text-slate-950 font-black' : rank === 2 ? 'bg-slate-300 text-slate-950 font-black' : rank === 3 ? 'bg-amber-700 text-white font-black' : 'bg-slate-900 text-slate-300 border border-slate-800'
                      }`}>
                        {rankBadge}
                      </span>

                      <div className="flex items-center space-x-3">
                        {/* Equipped Border ring + Equipped Avatar Background */}
                        <div className={`w-11 h-11 rounded-xl p-0.5 border-2 transition-all ${borderObj.color}`}>
                          <div className={`w-full h-full rounded-[8px] ${avatarBgObj.gradient} flex items-center justify-center font-bold text-white text-sm shadow-md`}>
                            {user.name?.charAt(0) || 'S'}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                            <span>{user.name}</span>
                            {isMe && <span className="px-2 py-0.2 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-300">YOU</span>}
                            {titleObj && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-sm ${titleObj.badgeBg}`}>
                                🏷️ {titleObj.title}
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400">{user.classSection || 'IT-A'} • {user.year || '3rd Year'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-xs font-bold self-end sm:self-auto">
                      <span className="flex items-center text-rose-400">
                        <Flame className="w-3.5 h-3.5 mr-1 fill-rose-400" /> {user.streak || 5}d
                      </span>
                      <span className="text-amber-400 font-black text-sm">
                        {user.funPoints || 300} XP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (

            /* CLASS VS CLASS LEADERBOARD */
            <div className="space-y-4">
              {classLeaderboardList.map((cls, idx) => (
                <div key={cls.classSection} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-black text-amber-400 font-mono">#{idx + 1}</span>
                    <div>
                      <h4 className="text-base font-black text-white">{cls.classSection} Section</h4>
                      <p className="text-xs text-slate-400">{cls.studentCount} Students • Top Contributor: {cls.topStudent}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-emerald-400">{cls.totalPoints.toLocaleString()} Total XP</p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ⏱️ 60-SECOND CHALLENGE MODAL */}
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
                    {DAILY_QUIZ_QUESTIONS[challengeIndex % DAILY_QUIZ_QUESTIONS.length].q}
                  </p>

                  <div className="space-y-2.5">
                    {DAILY_QUIZ_QUESTIONS[challengeIndex % DAILY_QUIZ_QUESTIONS.length].options.map((opt, idx) => (
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

      {/* ========================================================================= */}
      {/* MODAL 2: 🧠 QUICK QUIZ MODAL */}
      {/* ========================================================================= */}
      {quickQuizOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel rounded-3xl max-w-lg w-full p-6 border border-purple-500/40 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <span>Quick Quiz Challenge ({selectedQuizCategory})</span>
              </h3>
              <button onClick={() => setQuickQuizOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!quizFinished ? (
              <div className="space-y-4">
                <p className="text-sm font-bold text-white">
                  {DAILY_QUIZ_QUESTIONS[quizIndex % DAILY_QUIZ_QUESTIONS.length].q}
                </p>

                <div className="space-y-2">
                  {DAILY_QUIZ_QUESTIONS[quizIndex % DAILY_QUIZ_QUESTIONS.length].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedQuizOption(idx);
                        if (idx === DAILY_QUIZ_QUESTIONS[quizIndex % DAILY_QUIZ_QUESTIONS.length].answer) {
                          setQuizScore(prev => prev + 1);
                        }
                        if (quizIndex < DAILY_QUIZ_QUESTIONS.length - 1) {
                          setQuizIndex(prev => prev + 1);
                        } else {
                          setQuizFinished(true);
                          updateUserProfile({ funPoints: funPoints + 80 });
                        }
                      }}
                      className="w-full p-3 rounded-2xl border border-slate-800 bg-slate-900 text-xs font-semibold text-left text-slate-200 hover:bg-purple-500/20 hover:border-purple-500/40 transition-all"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 py-3">
                <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">Quiz Complete!</h4>
                <p className="text-2xl font-black text-purple-300">{quizScore} / {DAILY_QUIZ_QUESTIONS.length} Correct</p>
                <p className="text-xs font-bold text-amber-400">+80 XP Awarded!</p>
                <button onClick={() => setQuickQuizOpen(false)} className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs">
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: 💻 GUESS THE OUTPUT MODAL */}
      {/* ========================================================================= */}
      {guessOutputOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel rounded-3xl max-w-lg w-full p-6 border border-blue-500/40 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-400" />
                <span>Guess The Output ({guessList[guessIndex].title})</span>
              </h3>
              <button onClick={() => setGuessOutputOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-cyan-300">
              <pre>{guessList[guessIndex].code}</pre>
            </div>

            <p className="text-xs font-bold text-slate-300">What will be the output?</p>

            <div className="grid grid-cols-2 gap-2">
              {guessList[guessIndex].options.map((opt, idx) => {
                const isCorrect = idx === guessList[guessIndex].answer;
                const isSelected = guessSelectedOpt === idx;
                let btnStyle = "p-3 rounded-xl text-xs font-mono font-bold border border-slate-800 bg-slate-900 text-slate-200";

                if (guessSubmitted) {
                  if (isCorrect) btnStyle = "p-3 rounded-xl text-xs font-mono font-bold border border-emerald-500 bg-emerald-500/20 text-emerald-300";
                  else if (isSelected) btnStyle = "p-3 rounded-xl text-xs font-mono font-bold border border-rose-500 bg-rose-500/20 text-rose-300";
                }

                return (
                  <button
                    key={idx}
                    disabled={guessSubmitted}
                    onClick={() => {
                      setGuessSelectedOpt(idx);
                      setGuessSubmitted(true);
                      if (idx === guessList[guessIndex].answer) {
                        updateUserProfile({ funPoints: funPoints + 40 });
                      }
                    }}
                    className={btnStyle}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {guessSubmitted && (
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
                <p className={`font-bold ${guessSelectedOpt === guessList[guessIndex].answer ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {guessSelectedOpt === guessList[guessIndex].answer ? '🎉 Correct! +40 XP Earned!' : '❌ Incorrect!'}
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>Explanation:</strong> {guessList[guessIndex].explanation}
                </p>
                <button onClick={() => setGuessOutputOpen(false)} className="w-full py-2 rounded-xl bg-blue-600 text-white font-bold text-xs mt-2">
                  Continue
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: 🐞 FIND THE BUG MODAL */}
      {/* ========================================================================= */}
      {findBugOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel rounded-3xl max-w-lg w-full p-6 border border-rose-500/40 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bug className="w-5 h-5 text-rose-400" />
                <span>Find The Bug ({bugList[bugIndex].title})</span>
              </h3>
              <button onClick={() => setFindBugOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-rose-300">
              <pre>{bugList[bugIndex].code}</pre>
            </div>

            <p className="text-xs font-bold text-slate-300">Identify the issue in this code:</p>

            <div className="space-y-2">
              {bugList[bugIndex].options.map((opt, idx) => {
                const isCorrect = idx === bugList[bugIndex].answer;
                const isSelected = bugSelectedOpt === idx;
                let btnStyle = "w-full p-3 rounded-xl text-xs font-semibold text-left border border-slate-800 bg-slate-900 text-slate-200";

                if (bugSubmitted) {
                  if (isCorrect) btnStyle = "w-full p-3 rounded-xl text-xs font-semibold text-left border border-emerald-500 bg-emerald-500/20 text-emerald-300";
                  else if (isSelected) btnStyle = "w-full p-3 rounded-xl text-xs font-semibold text-left border border-rose-500 bg-rose-500/20 text-rose-300";
                }

                return (
                  <button
                    key={idx}
                    disabled={bugSubmitted}
                    onClick={() => {
                      setBugSelectedOpt(idx);
                      setBugSubmitted(true);
                      if (idx === bugList[bugIndex].answer) {
                        updateUserProfile({ funPoints: funPoints + 45 });
                      }
                    }}
                    className={btnStyle}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {bugSubmitted && (
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
                <p className={`font-bold ${bugSelectedOpt === bugList[bugIndex].answer ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {bugSelectedOpt === bugList[bugIndex].answer ? '🎉 Correct Bug Identified! +45 XP Earned!' : '❌ Incorrect!'}
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>Explanation:</strong> {bugList[bugIndex].explanation}
                </p>
                <button onClick={() => setFindBugOpen(false)} className="w-full py-2 rounded-xl bg-rose-600 text-white font-bold text-xs mt-2">
                  Continue
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* SPIN WHEEL OUTCOME: QUICK QUIZ MODAL */}
      {spinQuizModalOpen && spinQuizQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel rounded-3xl max-w-md w-full p-6 border border-purple-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span>Spin Wheel Quiz Bonus</span>
              </h3>
              <button onClick={() => setSpinQuizModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm font-bold text-white">{spinQuizQ.q || spinQuizQ.question}</p>

            <div className="space-y-2">
              {spinQuizQ.options?.map((opt, idx) => {
                const isCorrect = idx === spinQuizQ.answer;
                const isSelected = spinQuizSelectedOpt === idx;

                let btnClass = "w-full p-3 rounded-xl text-xs font-bold text-left border border-slate-800 bg-slate-900 text-slate-200 hover:bg-purple-500/20";
                if (spinQuizAnswered) {
                  if (isCorrect) btnClass = "w-full p-3 rounded-xl text-xs font-bold text-left border border-emerald-500 bg-emerald-500/20 text-emerald-300";
                  else if (isSelected) btnClass = "w-full p-3 rounded-xl text-xs font-bold text-left border border-rose-500 bg-rose-500/20 text-rose-300";
                }

                return (
                  <button
                    key={idx}
                    disabled={spinQuizAnswered}
                    onClick={() => {
                      setSpinQuizSelectedOpt(idx);
                      setSpinQuizAnswered(true);
                      if (idx === spinQuizQ.answer) {
                        updateUserProfile({ funPoints: funPoints + 50 });
                      }
                    }}
                    className={btnClass}
                  >
                    {opt} {spinQuizAnswered && isCorrect ? '✓ (+50 XP)' : ''}
                  </button>
                );
              })}
            </div>

            {spinQuizAnswered && (
              <div className="pt-2 text-center space-y-3">
                <p className={`text-xs font-black ${spinQuizSelectedOpt === spinQuizQ.answer ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {spinQuizSelectedOpt === spinQuizQ.answer ? '🎉 Correct! +50 Bonus XP Earned!' : '❌ Incorrect! Better luck next spin!'}
                </p>
                <button onClick={() => setSpinQuizModalOpen(false)} className="w-full py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white">
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SPIN WHEEL OUTCOME: IT FACT MODAL */}
      {spinFactModalOpen && spinFactData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel rounded-3xl max-w-md w-full p-6 border border-amber-500/40 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
              <Lightbulb className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                {spinFactData.category || 'Tech Trivia'}
              </span>
              <h3 className="text-base font-bold text-white">Daily IT Trivia Unlocked</h3>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed italic bg-slate-950 p-4 rounded-2xl border border-slate-800">
              "{spinFactData.fact || spinFactData.text}"
            </p>

            <p className="text-xs font-bold text-amber-400">+15 XP Reader Bonus Awarded! 🌟</p>

            <button onClick={() => setSpinFactModalOpen(false)} className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md">
              Got It!
            </button>
          </div>
        </div>
      )}

      {/* ECG (ERROR CODE GUESSING) GAME MODAL */}
      {ecgModalOpen && activeEcgList.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel rounded-3xl max-w-lg w-full p-6 border border-emerald-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">⚡</span>
                <h3 className="text-base font-extrabold text-white">Error Code Guessing (ECG)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  {gameDifficulty} ({gameXpMultiplier}x XP)
                </span>
              </div>
              <button onClick={() => { setEcgModalOpen(false); setRoundTimerActive(false); }} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Per-Round Timer Bar */}
            <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono">
              <div className="flex items-center space-x-1.5 text-amber-400">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>Time Remaining: <strong className={roundTimer <= 10 ? "text-rose-400 font-black animate-ping" : "text-amber-300"}>{roundTimer}s</strong></span>
              </div>
              <div className="w-24 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div className={`h-full transition-all duration-1000 ${roundTimer <= 10 ? 'bg-rose-500' : 'bg-emerald-400'}`} style={{ width: `${(roundTimer / roundTimerMax) * 100}%` }} />
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Identify Code ({ecgIndex + 1}/{activeEcgList.length}):</span>
              <div className="text-3xl font-mono font-black text-emerald-400">
                HTTP {activeEcgList[ecgIndex % activeEcgList.length].code}
              </div>
              <p className="text-xs text-slate-300 italic">{activeEcgList[ecgIndex % activeEcgList.length].desc}</p>
            </div>

            <div className="space-y-2">
              {activeEcgList[ecgIndex % activeEcgList.length].options.map((opt, idx) => {
                const isCorrect = idx === activeEcgList[ecgIndex % activeEcgList.length].answer;
                const isSelected = ecgSelectedOpt === idx;
                let btnStyle = "w-full p-3 rounded-xl text-xs font-semibold text-left border border-slate-800 bg-slate-900 text-slate-200 hover:bg-emerald-500/20";
                if (ecgSubmitted) {
                  if (isCorrect) btnStyle = "w-full p-3 rounded-xl text-xs font-semibold text-left border border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold";
                  else if (isSelected) btnStyle = "w-full p-3 rounded-xl text-xs font-semibold text-left border border-rose-500 bg-rose-500/20 text-rose-300 font-bold";
                }

                return (
                  <button
                    key={idx}
                    disabled={ecgSubmitted || roundTimer === 0}
                    onClick={() => {
                      setEcgSelectedOpt(idx);
                      setEcgSubmitted(true);
                      setRoundTimerActive(false);
                      if (isCorrect) {
                        const earned = Math.round(35 * gameXpMultiplier);
                        updateUserProfile({ funPoints: funPoints + earned });
                      }
                    }}
                    className={btnStyle}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {ecgSubmitted && (
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-center">
                <p className={`text-xs font-bold ${ecgSelectedOpt === activeEcgList[ecgIndex % activeEcgList.length].answer ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {ecgSelectedOpt === activeEcgList[ecgIndex % activeEcgList.length].answer ? `🎉 Correct Code! +${Math.round(35 * gameXpMultiplier)} XP Earned!` : '❌ Incorrect!'}
                </p>
                <button onClick={() => { setEcgModalOpen(false); setRoundTimerActive(false); }} className="w-full py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs">
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TANGO LOGIC GRID INTERACTIVE PUZZLE MODAL */}
      {tangoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel rounded-3xl max-w-xl w-full p-6 border border-indigo-500/40 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🧩</span>
                <h3 className="text-base font-extrabold text-white">Tango Logic Grid ({tangoSize}x{tangoSize})</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  {gameDifficulty} ({gameXpMultiplier}x XP)
                </span>
              </div>
              <button onClick={() => { setTangoModalOpen(false); setRoundTimerActive(false); }} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Per-Round Timer Bar */}
            <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono">
              <div className="flex items-center space-x-1.5 text-amber-400">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>Puzzle Timer: <strong className={roundTimer <= 10 ? "text-rose-400 font-black animate-ping" : "text-amber-300"}>{roundTimer}s</strong></span>
              </div>
              <div className="w-28 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div className={`h-full transition-all duration-1000 ${roundTimer <= 10 ? 'bg-rose-500' : 'bg-indigo-400'}`} style={{ width: `${(roundTimer / roundTimerMax) * 100}%` }} />
              </div>
            </div>

            {/* Rules Guidance Header */}
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="font-bold text-indigo-300 flex items-center gap-1">
                <span>💡 Rules:</span>
                <span>Each row & col must contain equal ☀️ & 🌙 ({tangoSize / 2} each). Max 2 consecutive identical symbols!</span>
              </div>
              <p className="text-[10px] text-slate-400">Click any empty square to cycle: ☀️ (Sun) ➔ 🌙 (Moon) ➔ Empty</p>
            </div>

            {/* Feedback Alert Banner */}
            {tangoFeedback && (
              <div className={`p-3 rounded-2xl text-xs font-bold border text-center animate-in fade-in ${
                tangoFeedback.success ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
              }`}>
                {tangoFeedback.msg}
              </div>
            )}

            {/* Interactive Grid Rendering */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center">
              <div
                className="grid gap-2 justify-center"
                style={{ gridTemplateColumns: `repeat(${tangoSize}, minmax(0, 1fr))` }}
              >
                {tangoGrid.map((row, r) =>
                  row.map((val, c) => {
                    const isFixed = tangoFixedCells.includes(`${r}-${c}`);
                    let cellStyle = "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-lg font-black transition-all border shadow-sm ";
                    if (isFixed) {
                      cellStyle += "bg-slate-900 text-slate-300 border-indigo-500/40 opacity-90 cursor-not-allowed";
                    } else if (val === 'sun') {
                      cellStyle += "bg-amber-500/20 border-amber-500/60 text-amber-300 hover:scale-105 shadow-amber-500/10";
                    } else if (val === 'moon') {
                      cellStyle += "bg-indigo-500/20 border-indigo-500/60 text-indigo-300 hover:scale-105 shadow-indigo-500/10";
                    } else {
                      cellStyle += "bg-slate-900/60 border-slate-800 text-slate-600 hover:border-indigo-500/50 hover:bg-slate-900";
                    }

                    return (
                      <button
                        key={`${r}-${c}`}
                        disabled={isFixed || tangoSolved || roundTimer === 0}
                        onClick={() => toggleTangoCell(r, c)}
                        className={cellStyle}
                      >
                        {val === 'sun' ? '☀️' : val === 'moon' ? '🌙' : ''}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Grid Action Controls */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  const puzzle = TANGO_PUZZLES.find(p => p.size === tangoSize) || TANGO_PUZZLES[0];
                  initTangoBoard(tangoSize, puzzle.fixed || {});
                }}
                disabled={tangoSolved}
                className="py-2.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
              >
                Reset Grid
              </button>

              <button
                onClick={validateTangoBoard}
                disabled={tangoSolved || roundTimer === 0}
                className="py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white shadow-lg shadow-indigo-600/30 transition-all"
              >
                {tangoSolved ? '✓ Grid Solved' : 'Check Solution'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SPEED TYPE CHALLENGE REAL-TIME MONKEYTYPE-STYLE ENGINE MODAL */}
      {speedTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel rounded-3xl max-w-2xl w-full p-6 border border-amber-500/40 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">⌨️</span>
                <h3 className="text-base font-extrabold text-white">Speed Type Challenge ({speedTypePrompt.lang})</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  {gameDifficulty} ({gameXpMultiplier}x XP)
                </span>
              </div>
              <button onClick={() => { setSpeedTypeModalOpen(false); setRoundTimerActive(false); }} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Timer & Stats Header */}
            <div className="grid grid-cols-3 gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center font-mono">
              <div className="space-y-0.5">
                <span className="text-[9px] text-slate-400 uppercase font-sans font-bold">Timer</span>
                <div className={`text-sm font-black ${roundTimer <= 10 ? 'text-rose-400 animate-ping' : 'text-amber-400'}`}>{roundTimer}s</div>
              </div>
              <div className="space-y-0.5 border-x border-slate-800">
                <span className="text-[9px] text-slate-400 uppercase font-sans font-bold">Live WPM</span>
                <div className="text-sm font-black text-cyan-400">{speedTypeWpm} WPM</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] text-slate-400 uppercase font-sans font-bold">Accuracy</span>
                <div className="text-sm font-black text-emerald-400">{speedTypeAccuracy}%</div>
              </div>
            </div>

            {/* Code Character Highlight Display Box */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs leading-relaxed space-y-2 select-none overflow-x-auto">
              <div className="text-[9px] text-slate-500 font-sans uppercase font-bold tracking-wider">
                Type the snippet accurately below:
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 whitespace-pre-wrap tracking-wide font-mono text-sm leading-relaxed">
                {speedTypePrompt.snippet.split('').map((char, i) => {
                  const typedChar = speedTypeInput[i];
                  let charStyle = "text-slate-500";
                  if (typedChar !== undefined) {
                    if (typedChar === char) {
                      charStyle = "text-emerald-400 bg-emerald-500/10 font-bold";
                    } else {
                      charStyle = "text-rose-400 bg-rose-500/30 font-bold underline decoration-rose-500";
                    }
                  } else if (i === speedTypeInput.length) {
                    charStyle = "bg-amber-400/40 text-white font-black underline animate-pulse";
                  }

                  return (
                    <span key={i} className={charStyle}>
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Interactive Real-Time Typing Textarea */}
            <textarea
              rows={4}
              disabled={speedTypeFinished || roundTimer === 0}
              placeholder="Start typing the code snippet here..."
              value={speedTypeInput}
              onChange={(e) => {
                const val = e.target.value;
                setSpeedTypeInput(val);

                if (!speedTypeStartTime) {
                  setSpeedTypeStartTime(Date.now());
                }

                // Live WPM & Accuracy calculation
                const promptStr = speedTypePrompt.snippet;
                let correctChars = 0;
                for (let i = 0; i < val.length; i++) {
                  if (val[i] === promptStr[i]) correctChars++;
                }

                const typedLen = Math.max(1, val.length);
                const acc = Math.round((correctChars / typedLen) * 100);
                setSpeedTypeAccuracy(acc);

                const elapsedSeconds = Math.max(1, (Date.now() - (speedTypeStartTime || Date.now())) / 1000);
                const calcWpm = Math.round((correctChars / 5) / (elapsedSeconds / 60));
                setSpeedTypeWpm(calcWpm);

                // Completion check
                if (val.trim() === promptStr.trim()) {
                  setSpeedTypeFinished(true);
                  setRoundTimerActive(false);
                  const earned = Math.round(45 * gameXpMultiplier);
                  updateUserProfile({ funPoints: funPoints + earned });
                }
              }}
              className="w-full p-3 bg-slate-900 text-xs text-amber-300 rounded-xl border border-slate-800 font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />

            {speedTypeFinished && (
              <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-center space-y-2 animate-in fade-in">
                <p className="text-sm font-black text-emerald-400">⚡ Code Typed Perfectly!</p>
                <div className="flex justify-center gap-4 text-xs font-mono text-slate-300">
                  <span>Speed: <strong className="text-cyan-300">{speedTypeWpm} WPM</strong></span>
                  <span>Accuracy: <strong className="text-emerald-300">{speedTypeAccuracy}%</strong></span>
                  <span>XP Awarded: <strong className="text-amber-300">+{Math.round(45 * gameXpMultiplier)} XP</strong></span>
                </div>
                <button onClick={() => { setSpeedTypeModalOpen(false); setRoundTimerActive(false); }} className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs mt-2">
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* UNIVERSAL 3-LEVEL DIFFICULTY SELECTOR MODAL */}
      <DifficultySelectorModal
        isOpen={diffModalOpen}
        onClose={() => setDiffModalOpen(false)}
        onStartGame={handleStartWithDifficulty}
        gameTitle={activeGameTarget?.title}
        gameIcon={activeGameTarget?.icon}
        gameDescription={activeGameTarget?.description}
        gameId={activeGameTarget?.gameId}
        baseXp={activeGameTarget?.baseXp}
      />

    </div>
  );
};
