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
  ChevronLeft,
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
  Lock,
  ShieldAlert,
  Coffee,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Medal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { JavaLearningPage } from './JavaLearningPage';
import { 
  LEVEL_SYSTEM,
  getLevelFromXP,
  getCurrentLevel,
  getCurrentLevelTitle,
  getCurrentLevelXP,
  getNextLevelXP,
  getXPRequiredForNextLevel,
  getProgressPercentage,
  getNextLevelReward
} from '../data/mockData';

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

class BrainZoneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("BrainZone error boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel p-8 rounded-3xl border border-amber-500/40 text-center space-y-4 max-w-lg mx-auto my-12 animate-in zoom-in">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto text-2xl font-black">
            ⚠️
          </div>
          <h3 className="text-xl font-black text-white">Something went wrong.</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black shadow-lg hover:scale-105 transition-all"
          >
            🔄 Refresh / Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const getTimerSecondsForDiff = (diff) => {
  if (diff === 'beginner') return 60;
  if (diff === 'advanced') return 25;
  return 40;
};

const getISOWeekId = (date = new Date()) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

const getFilteredContentForCurrentWeek = (contentList = [], currentWeekBatch = getISOWeekId()) => {
  if (!Array.isArray(contentList) || contentList.length === 0) return [];
  
  const exactMatches = contentList.filter(item => item.weekBatch === currentWeekBatch);
  if (exactMatches.length > 0) return exactMatches;

  const pastMatches = contentList
    .filter(item => item.weekBatch && item.weekBatch <= currentWeekBatch)
    .sort((a, b) => b.weekBatch.localeCompare(a.weekBatch));

  if (pastMatches.length > 0) {
    const mostRecentWeek = pastMatches[0].weekBatch;
    return pastMatches.filter(item => item.weekBatch === mostRecentWeek);
  }

  return contentList;
};

const isGameLevelCompletedThisWeek = (userDoc, gameId, level, weekBatch = getISOWeekId()) => {
  if (!userDoc) return false;
  
  const newStructureVal = userDoc?.completedGameLevels?.[gameId]?.[weekBatch]?.[level];
  if (typeof newStructureVal === 'boolean') {
    return newStructureVal;
  }

  const legacyMaps = {
    ecg: userDoc?.ecgWeeklyCompletions,
    guess: userDoc?.guessWeeklyCompletions,
    bug: userDoc?.bugWeeklyCompletions,
    tango: userDoc?.tangoWeeklyCompletions,
    type: userDoc?.typeWeeklyCompletions,
    sprint: userDoc?.sprintWeeklyCompletions,
    quiz: userDoc?.quizWeeklyCompletions
  };

  if (legacyMaps[gameId] && legacyMaps[gameId][level] === weekBatch) {
    return true;
  }

  return false;
};

const markGameLevelCompleted = (userDoc, gameId, level, weekBatch = getISOWeekId()) => {
  const currentMap = userDoc?.completedGameLevels || {};
  const gameMap = currentMap[gameId] || {};
  const weekMap = gameMap[weekBatch] || {};

  return {
    ...currentMap,
    [gameId]: {
      ...gameMap,
      [weekBatch]: {
        ...weekMap,
        [level]: true
      }
    }
  };
};

const ECG_CHALLENGES = [
  // BEGINNER LEVEL (5 Questions)
  { id: 'ecg-b1', code: '404', difficulty: 'beginner', name: 'HTTP 404 Not Found', desc: 'Requested URL or resource does not exist on server', options: ['Not Found', 'Unauthorized', 'Forbidden', 'Server Error'], answer: 0 },
  { id: 'ecg-b2', code: '401', difficulty: 'beginner', name: 'HTTP 401 Unauthorized', desc: 'Request requires valid authentication credentials', options: ['Bad Request', 'Unauthorized', 'Forbidden', 'Internal Server Error'], answer: 1 },
  { id: 'ecg-b3', code: '400', difficulty: 'beginner', name: 'HTTP 400 Bad Request', desc: 'Server cannot process request due to client syntax error', options: ['Forbidden', 'Not Found', 'Bad Request', 'Service Unavailable'], answer: 2 },
  { id: 'ecg-b4', code: '500', difficulty: 'beginner', name: 'HTTP 500 Internal Server Error', desc: 'Unexpected condition encountered on server', options: ['Gateway Timeout', 'Bad Gateway', 'Unauthorized', 'Internal Server Error'], answer: 3 },
  { id: 'ecg-b5', code: '200', difficulty: 'beginner', name: 'HTTP 200 OK', desc: 'Standard response for successful HTTP requests', options: ['OK', 'Created', 'Accepted', 'No Content'], answer: 0 },

  // INTERMEDIATE LEVEL (8 Questions)
  { id: 'ecg-i1', code: '403', difficulty: 'intermediate', name: 'HTTP 403 Forbidden', desc: 'Server understands request but refuses to authorize access', options: ['Forbidden', 'Unauthorized', 'Not Found', 'Bad Request'], answer: 0 },
  { id: 'ecg-i2', code: '503', difficulty: 'intermediate', name: 'HTTP 503 Service Unavailable', desc: 'Server is currently unable to handle request (maintenance/overload)', options: ['Gateway Timeout', 'Service Unavailable', 'Bad Gateway', 'Method Not Allowed'], answer: 1 },
  { id: 'ecg-i3', code: '502', difficulty: 'intermediate', name: 'HTTP 502 Bad Gateway', desc: 'Upstream server returned an invalid response to proxy', options: ['Gateway Timeout', 'Bad Gateway', 'Service Unavailable', 'Conflict'], answer: 1 },
  { id: 'ecg-i4', code: '405', difficulty: 'intermediate', name: 'HTTP 405 Method Not Allowed', desc: 'Request method is known by server but not supported by target resource', options: ['Not Acceptable', 'Unsupported Media Type', 'Method Not Allowed', 'Bad Request'], answer: 2 },
  { id: 'ecg-i5', code: '301', difficulty: 'intermediate', name: 'HTTP 301 Moved Permanently', desc: 'Target resource has been assigned a new permanent URI', options: ['Found', 'Moved Permanently', 'Temporary Redirect', 'See Other'], answer: 1 },
  { id: 'ecg-i6', code: '429', difficulty: 'intermediate', name: 'HTTP 429 Too Many Requests', desc: 'User has sent too many requests in a given amount of time (Rate limit)', options: ['Request Timeout', 'Payload Too Large', 'Too Many Requests', 'Locked'], answer: 2 },
  { id: 'ecg-i7', code: '408', difficulty: 'intermediate', name: 'HTTP 408 Request Timeout', desc: 'Server timed out waiting for client to complete request', options: ['Gateway Timeout', 'Request Timeout', 'Service Unavailable', 'Conflict'], answer: 1 },
  { id: 'ecg-i8', code: '504', difficulty: 'intermediate', name: 'HTTP 504 Gateway Timeout', desc: 'Proxy server did not receive timely response from upstream server', options: ['Bad Gateway', 'Gateway Timeout', 'Service Unavailable', 'Internal Server Error'], answer: 1 },

  // ADVANCED LEVEL (10 Questions)
  { id: 'ecg-a1', code: '409', difficulty: 'advanced', name: 'HTTP 409 Conflict', desc: 'Request conflicts with current state of target resource', options: ['Conflict', 'Locked', 'Payload Too Large', 'Unprocessable Entity'], answer: 0 },
  { id: 'ecg-a2', code: '422', difficulty: 'advanced', name: 'HTTP 422 Unprocessable Entity', desc: 'Request syntax is correct but semantic instructions are invalid', options: ['Precondition Failed', 'Unprocessable Entity', 'Bad Request', 'Conflict'], answer: 1 },
  { id: 'ecg-a3', code: '418', difficulty: 'advanced', name: "HTTP 418 I'm a teapot", desc: 'HTCPCP server refuses to brew coffee because it is a teapot', options: ['Bad Request', 'Precondition Failed', "I'm a teapot", 'Unsupported Media Type'], answer: 2 },
  { id: 'ecg-a4', code: '413', difficulty: 'advanced', name: 'HTTP 413 Payload Too Large', desc: 'Request entity body is larger than limits defined by server', options: ['Payload Too Large', 'URI Too Long', 'Range Not Satisfiable', 'Expectation Failed'], answer: 0 },
  { id: 'ecg-a5', code: '415', difficulty: 'advanced', name: 'HTTP 415 Unsupported Media Type', desc: 'Media format of requested data is not supported by server', options: ['Not Acceptable', 'Unsupported Media Type', 'Bad Request', 'Unprocessable Entity'], answer: 1 },
  { id: 'ecg-a6', code: '451', difficulty: 'advanced', name: 'HTTP 451 Unavailable For Legal Reasons', desc: 'Access to resource is denied due to legal demand or censorship', options: ['Forbidden', 'Unavailable For Legal Reasons', 'Payment Required', 'Gone'], answer: 1 },
  { id: 'ecg-a7', code: '507', difficulty: 'advanced', name: 'HTTP 507 Insufficient Storage', desc: 'Server cannot store representation needed to complete request', options: ['Insufficient Storage', 'Loop Detected', 'Not Extended', 'Variant Also Negotiates'], answer: 0 },
  { id: 'ecg-a8', code: '508', difficulty: 'advanced', name: 'HTTP 508 Loop Detected', desc: 'Server detected an infinite loop while processing request', options: ['Loop Detected', 'Insufficient Storage', 'Network Authentication Required', 'Bandwidth Limit Exceeded'], answer: 0 },
  { id: 'ecg-a9', code: '304', difficulty: 'advanced', name: 'HTTP 304 Not Modified', desc: 'Cached copy is still valid and does not need re-transmission', options: ['Not Modified', 'Use Proxy', 'Temporary Redirect', 'Permanent Redirect'], answer: 0 },
  { id: 'ecg-a10', code: '505', difficulty: 'advanced', name: 'HTTP 505 HTTP Version Not Supported', desc: 'HTTP protocol version used in request is not supported by server', options: ['HTTP Version Not Supported', 'Bad Gateway', 'Service Unavailable', 'Variant Also Negotiates'], answer: 0 }
];

const getFunnyEcgResult = (score, total) => {
  const ratio = total > 0 ? score / total : 0;
  if (ratio === 1) {
    return {
      title: "🤖 Server Whisperer / Senior DevOps God",
      emoji: "🏆",
      message: "Holy 200 OK! You know HTTP status codes better than Chrome DevTools. Are you secretly an NGINX reverse proxy in disguise?",
      suggestion: "💡 Recommendation: Apply for AWS Principal Architect today, or go outside and touch some grass, you 404-fixing legend!"
    };
  } else if (ratio >= 0.75) {
    return {
      title: "🌐 StackOverflow Copy-Paste Ninja",
      emoji: "⚡",
      message: "Solid performance! You only got 502 Bad Gateway-ed once or twice. Your browser console is quietly weeping with joy.",
      suggestion: "💡 Recommendation: Keep drinking coffee ☕. You are only 1 Google search away from a $120k Remote Senior Dev job!"
    };
  } else if (ratio >= 0.5) {
    return {
      title: "🐛 Junior Dev on Friday at 4:59 PM",
      emoji: "☕",
      message: "Not bad, but you mixed up HTTP 403 Forbidden with 401 Unauthorized... Your security team is currently crying in the server closet.",
      suggestion: "💡 Recommendation: Pro tip: Restarting your Wi-Fi router won't fix HTTP 422. Read the backend docs or blame QA!"
    };
  } else if (ratio >= 0.25) {
    return {
      title: "🫖 HTTP 418: I'm a Teapot",
      emoji: "🍵",
      message: "Oops! You guessed 500 Internal Server Error for almost everything. To be fair, most production backend servers DO crash like that...",
      suggestion: "💡 Recommendation: Sip some chamomile tea, close your 94 open Chrome tabs, and review basic codes before git push master!"
    };
  } else {
    return {
      title: "💀 HTTP 503: Service Completely Broken",
      emoji: "💥",
      message: "Yikes! Your answers caused a cascading cluster outage across 4 global cloud data centers. AWS us-east-1 crashed because of you!",
      suggestion: "💡 Recommendation: Uninstall your code editor, call your internet provider, and ask if Wi-Fi causes 404 errors. Try Beginner mode!"
    };
  }
};

const GUESS_OUTPUT_CHALLENGES = [
  // BEGINNER LEVEL (10 Questions)
  {
    id: 'go-b1',
    difficulty: 'beginner',
    title: 'JavaScript String Coercion',
    language: 'javascript',
    code: 'console.log(1 + "2" + 3);',
    options: ['"123"', '"6"', '"15"', 'NaN'],
    answer: 0,
    explanation: 'Numbers added to strings are converted to strings: 1 + "2" = "12", then "12" + 3 = "123".'
  },
  {
    id: 'go-b2',
    difficulty: 'beginner',
    title: 'Typeof NaN Operator',
    language: 'javascript',
    code: 'console.log(typeof NaN);',
    options: ['"number"', '"nan"', '"undefined"', '"object"'],
    answer: 0,
    explanation: 'In JavaScript, NaN stands for "Not a Number" but its typeof evaluation is surprisingly "number".'
  },
  {
    id: 'go-b3',
    difficulty: 'beginner',
    title: 'Array Length Property',
    language: 'javascript',
    code: 'const arr = [10, 20, 30];\narr.length = 0;\nconsole.log(arr[0]);',
    options: ['undefined', '10', 'null', 'ReferenceError'],
    answer: 0,
    explanation: 'Setting array length to 0 empties all elements from the array, making arr[0] evaluate to undefined.'
  },
  {
    id: 'go-b4',
    difficulty: 'beginner',
    title: 'Boolean Double Negation',
    language: 'javascript',
    code: 'console.log(!!"Code");',
    options: ['true', 'false', '"Code"', 'undefined'],
    answer: 0,
    explanation: 'Double negation !! coerces truthy values (like non-empty strings) into true boolean.'
  },
  {
    id: 'go-b5',
    difficulty: 'beginner',
    title: 'Loose vs Strict Equality',
    language: 'javascript',
    code: 'console.log(0 == "0", 0 === "0");',
    options: ['true false', 'true true', 'false false', 'false true'],
    answer: 0,
    explanation: 'Loose equality (==) coerces string "0" to number 0 (true), but strict equality (===) checks types (false).'
  },
  {
    id: 'go-b6',
    difficulty: 'beginner',
    title: 'Array Destructuring Default Value',
    language: 'javascript',
    code: 'const [a = 1, b = 2] = [10];\nconsole.log(a, b);',
    options: ['10 2', '1 2', '10 undefined', '1 10'],
    answer: 0,
    explanation: 'a takes 10 from array. b has no matching item in [10], so it uses its default value 2.'
  },
  {
    id: 'go-b7',
    difficulty: 'beginner',
    title: 'Math.max Empty Arguments',
    language: 'javascript',
    code: 'console.log(Math.max());',
    options: ['-Infinity', '0', 'Infinity', 'NaN'],
    answer: 0,
    explanation: 'Math.max() with no arguments returns -Infinity because any number compared to it is greater.'
  },
  {
    id: 'go-b8',
    difficulty: 'beginner',
    title: 'String Negative Index Slice',
    language: 'javascript',
    code: 'const str = "JavaScript";\nconsole.log(str.slice(-4));',
    options: ['"ript"', '"Java"', '"Script"', '"pt"'],
    answer: 0,
    explanation: 'Negative index -4 in slice extracts the last 4 characters of the string: "ript".'
  },
  {
    id: 'go-b9',
    difficulty: 'beginner',
    title: 'Template Literal Expression',
    language: 'javascript',
    code: 'const a = 5;\nconsole.log(`Val: ${a + 5}`);',
    options: ['"Val: 10"', '"Val: 55"', '"Val: a + 5"', 'SyntaxError'],
    answer: 0,
    explanation: 'Template literals evaluate JS expressions inside ${}. 5 + 5 = 10, producing "Val: 10".'
  },
  {
    id: 'go-b10',
    difficulty: 'beginner',
    title: 'Array Includes Strict Type Check',
    language: 'javascript',
    code: 'console.log([1, 2, 3].includes("2"));',
    options: ['false', 'true', 'undefined', 'TypeError'],
    answer: 0,
    explanation: 'Array.prototype.includes uses strict equality (SameValueZero). Number 2 !== String "2", returning false.'
  },

  // INTERMEDIATE LEVEL (12 Questions)
  {
    id: 'go-i1',
    difficulty: 'intermediate',
    title: 'Array Map & parseInt Trick',
    language: 'javascript',
    code: 'console.log(["10", "10", "10"].map(parseInt));',
    options: ['[10, NaN, 2]', '[10, 10, 10]', '[NaN, NaN, NaN]', '[10, 0, 1]'],
    answer: 0,
    explanation: 'map passes (element, index). parseInt("10", 0)=10, parseInt("10", 1)=NaN, parseInt("10", 2)=2 (binary).'
  },
  {
    id: 'go-i2',
    difficulty: 'intermediate',
    title: 'Variable Hoisting with var',
    language: 'javascript',
    code: 'console.log(a);\nvar a = 5;',
    options: ['undefined', '5', 'ReferenceError', 'null'],
    answer: 0,
    explanation: 'var declarations are hoisted to the top with an initial value of undefined.'
  },
  {
    id: 'go-i3',
    difficulty: 'intermediate',
    title: 'Object Key Stringification',
    language: 'javascript',
    code: 'const a = {}, b = { key: "b" }, c = { key: "c" };\na[b] = 123;\na[c] = 456;\nconsole.log(a[b]);',
    options: ['456', '123', 'undefined', 'TypeError'],
    answer: 0,
    explanation: 'Object keys are stringified to "[object Object]". So a[b] and a[c] both reference key "[object Object]".'
  },
  {
    id: 'go-i4',
    difficulty: 'intermediate',
    title: 'Closure State Retention',
    language: 'javascript',
    code: 'function outer() {\n  let count = 0;\n  return () => ++count;\n}\nconst fn = outer();\nfn();\nconsole.log(fn());',
    options: ['2', '1', '0', 'undefined'],
    answer: 0,
    explanation: 'The returned inner arrow function forms a closure over count. First call makes count=1, second call returns 2.'
  },
  {
    id: 'go-i5',
    difficulty: 'intermediate',
    title: 'Promise Microtask Execution',
    language: 'javascript',
    code: 'console.log("A");\nPromise.resolve().then(() => console.log("B"));\nconsole.log("C");',
    options: ['A C B', 'A B C', 'B A C', 'C A B'],
    answer: 0,
    explanation: 'Synchronous code prints "A" and "C" first. Promise callback is queued in microtask queue and runs next ("B").'
  },
  {
    id: 'go-i6',
    difficulty: 'intermediate',
    title: 'Array Spread Shallow Copy',
    language: 'javascript',
    code: 'const a = [1, [2]];\nconst b = [...a];\nb[1][0] = 99;\nconsole.log(a[1][0]);',
    options: ['99', '2', 'undefined', 'TypeError'],
    answer: 0,
    explanation: 'Spread operator perform shallow copies. Nested array references remain shared, so mutating b[1] mutates a[1].'
  },
  {
    id: 'go-i7',
    difficulty: 'intermediate',
    title: 'Function Default Parameters',
    language: 'javascript',
    code: 'const f = (x = 1, y = x + 2) => x + y;\nconsole.log(f(5));',
    options: ['12', '8', 'NaN', 'undefined'],
    answer: 0,
    explanation: 'x is passed as 5, so default for y evaluates to x + 2 = 7. Returning 5 + 7 = 12.'
  },
  {
    id: 'go-i8',
    difficulty: 'intermediate',
    title: 'Logical OR Assignment Operator',
    language: 'javascript',
    code: 'let name = "";\nname ||= "Default";\nconsole.log(name);',
    options: ['"Default"', '""', 'true', 'null'],
    answer: 0,
    explanation: 'Empty string "" is falsy, so Logical OR assignment name ||= "Default" assigns "Default".'
  },
  {
    id: 'go-i9',
    difficulty: 'intermediate',
    title: 'Array Fill Shared Reference Trap',
    language: 'javascript',
    code: 'const arr = new Array(2).fill({});\narr[0].x = 99;\nconsole.log(arr[1].x);',
    options: ['99', 'undefined', '0', 'TypeError'],
    answer: 0,
    explanation: 'Array.prototype.fill({}) populates every slot with the exact same object reference. Mutating arr[0] mutates arr[1].'
  },
  {
    id: 'go-i10',
    difficulty: 'intermediate',
    title: 'Object Destructuring Property Renaming',
    language: 'javascript',
    code: 'const user = { name: "Sam", age: 22 };\nconst { name: username } = user;\nconsole.log(username);',
    options: ['"Sam"', 'undefined', 'ReferenceError', '22'],
    answer: 0,
    explanation: 'Destructuring syntax { name: username } renames property name to local variable username ("Sam").'
  },
  {
    id: 'go-i11',
    difficulty: 'intermediate',
    title: 'Generator Function Yield Output',
    language: 'javascript',
    code: 'function* numGen() {\n  yield 10;\n  yield 20;\n}\nconst g = numGen();\nconsole.log(g.next().value);',
    options: ['10', '20', 'undefined', '{ value: 10, done: false }'],
    answer: 0,
    explanation: 'g.next() returns object { value: 10, done: false }. Accessing .value yields 10.'
  },
  {
    id: 'go-i12',
    difficulty: 'intermediate',
    title: 'Rest Parameter Array Type',
    language: 'javascript',
    code: 'function check(...items) {\n  return Array.isArray(items);\n}\nconsole.log(check(1, 2, 3));',
    options: ['true', 'false', 'undefined', 'TypeError'],
    answer: 0,
    explanation: 'Rest parameters (...items) gather all remaining arguments into a true JavaScript Array object.'
  },

  // ADVANCED LEVEL (14 Questions)
  {
    id: 'go-a1',
    difficulty: 'advanced',
    title: 'Event Loop Microtask vs Macrotask',
    language: 'javascript',
    code: 'setTimeout(() => console.log("Timeout"), 0);\nPromise.resolve().then(() => console.log("Promise"));\nconsole.log("Sync");',
    options: ['Sync Promise Timeout', 'Sync Timeout Promise', 'Promise Sync Timeout', 'Timeout Sync Promise'],
    answer: 0,
    explanation: 'Synchronous code runs first ("Sync"), then microtasks run ("Promise"), then macrotasks run ("Timeout").'
  },
  {
    id: 'go-a2',
    difficulty: 'advanced',
    title: 'Arrow Function this Context',
    language: 'javascript',
    code: 'const obj = {\n  val: 42,\n  getVal: () => this.val\n};\nconsole.log(obj.getVal());',
    options: ['undefined', '42', 'TypeError', '42 in strict mode'],
    answer: 0,
    explanation: 'Arrow functions do not bind their own "this". They inherit "this" from enclosing global scope where val is undefined.'
  },
  {
    id: 'go-a3',
    difficulty: 'advanced',
    title: 'Async/Await Execution Flow',
    language: 'javascript',
    code: 'async function foo() {\n  console.log(1);\n  await null;\n  console.log(2);\n}\nfoo();\nconsole.log(3);',
    options: ['1 3 2', '1 2 3', '3 1 2', '2 1 3'],
    answer: 0,
    explanation: 'foo runs synchronously up to await null (prints 1), pauses for microtask, prints 3 synchronously, then prints 2.'
  },
  {
    id: 'go-a4',
    difficulty: 'advanced',
    title: 'Prototype Chain Property Override',
    language: 'javascript',
    code: 'function Dog() {}\nDog.prototype.bark = "Woof";\nconst d = new Dog();\nDog.prototype = { bark: "Arf" };\nconsole.log(d.bark);',
    options: ['"Woof"', '"Arf"', 'undefined', 'TypeError'],
    answer: 0,
    explanation: 'd holds a direct internal link (__proto__) to the original prototype. Replacing Dog.prototype does not alter existing instances.'
  },
  {
    id: 'go-a5',
    difficulty: 'advanced',
    title: 'Symbol Property Iteration',
    language: 'javascript',
    code: 'const s = Symbol("id");\nconst obj = { [s]: 100, name: "User" };\nconsole.log(Object.keys(obj).length);',
    options: ['1', '2', '0', 'TypeError'],
    answer: 0,
    explanation: 'Object.keys ignores Symbol properties, so only "name" is counted (length = 1).'
  },
  {
    id: 'go-a6',
    difficulty: 'advanced',
    title: 'Array Reduce Initial Value Accumulation',
    language: 'javascript',
    code: 'const res = [1, 2, 3].reduce((acc, curr) => acc + curr, 10);\nconsole.log(res);',
    options: ['16', '6', '10', '15'],
    answer: 0,
    explanation: '10 is provided as initial accumulator value. 10 + 1 + 2 + 3 = 16.'
  },
  {
    id: 'go-a7',
    difficulty: 'advanced',
    title: 'Set Unique Value Deduplication',
    language: 'javascript',
    code: 'const set = new Set([1, "1", true, 1]);\nconsole.log(set.size);',
    options: ['3', '4', '2', '1'],
    answer: 0,
    explanation: 'Set holds unique values using SameValueZero equality. 1, "1", and true are all distinct types, but second 1 is duplicate. Size = 3.'
  },
  {
    id: 'go-a8',
    difficulty: 'advanced',
    title: 'Temporal Dead Zone (TDZ) with let',
    language: 'javascript',
    code: 'let x = 10;\nfunction test() {\n  console.log(x);\n  let x = 20;\n}\ntest();',
    options: ['ReferenceError', '10', '20', 'undefined'],
    answer: 0,
    explanation: 'The inner let x hoists to top of block scope test() but stays in Temporal Dead Zone until initialized. Accessing x throws ReferenceError.'
  },
  {
    id: 'go-a9',
    difficulty: 'advanced',
    title: 'Object.freeze Mutation Prevention',
    language: 'javascript',
    code: 'const user = Object.freeze({ meta: { age: 25 } });\nuser.meta.age = 30;\nconsole.log(user.meta.age);',
    options: ['30', '25', 'TypeError', 'undefined'],
    answer: 0,
    explanation: 'Object.freeze is shallow! Nested objects remain mutable, so user.meta.age changes to 30.'
  },
  {
    id: 'go-a10',
    difficulty: 'advanced',
    title: 'Function Currying Output',
    language: 'javascript',
    code: 'const multiply = a => b => c => a * b * c;\nconsole.log(multiply(2)(3)(4));',
    options: ['24', '9', '64', 'undefined'],
    answer: 0,
    explanation: 'Curried function multiplies 2 * 3 * 4 = 24.'
  },
  {
    id: 'go-a11',
    difficulty: 'advanced',
    title: 'JS Proxy Get Trap Handler',
    language: 'javascript',
    code: 'const p = new Proxy({}, {\n  get: () => 42\n});\nconsole.log(p.foo);',
    options: ['42', 'undefined', 'TypeError', 'null'],
    answer: 0,
    explanation: 'Proxy get handler traps all property reads and returns 42 regardless of the key name accessed.'
  },
  {
    id: 'go-a12',
    difficulty: 'advanced',
    title: 'Async IIFE Return Promise',
    language: 'javascript',
    code: '(async () => 100)().then(val => console.log(val));',
    options: ['100', 'Promise { 100 }', 'undefined', 'TypeError'],
    answer: 0,
    explanation: 'Async IIFE wraps the returned 100 in a resolved Promise, which passes 100 into .then() callback.'
  },
  {
    id: 'go-a13',
    difficulty: 'advanced',
    title: 'Array Flat Depth Flattening',
    language: 'javascript',
    code: 'const arr = [1, [2, [3]]];\nconsole.log(arr.flat(1).length);',
    options: ['3', '2', '4', '1'],
    answer: 0,
    explanation: 'arr.flat(1) flattens 1 level deep: [1, 2, [3]]. Its length is 3.'
  },
  {
    id: 'go-a14',
    difficulty: 'advanced',
    title: 'Class Static Field Inheritance',
    language: 'javascript',
    code: 'class Parent {\n  static count = 10;\n}\nclass Child extends Parent {}\nconsole.log(Child.count);',
    options: ['10', 'undefined', 'TypeError', '0'],
    answer: 0,
    explanation: 'Subclasses in JavaScript inherit static properties and methods from their parent class prototype.'
  }
];

const FIND_BUG_CHALLENGES = [
  // BEGINNER LEVEL (10 Questions)
  {
    id: 'fb-b1',
    difficulty: 'beginner',
    title: 'Infinite Decrement Loop',
    language: 'javascript',
    code: 'function countToTen() {\n  for (let i = 0; i < 10; i--) {\n    console.log(i);\n  }\n}',
    options: ['Line 2: i-- causes infinite loop', 'Line 1: Missing const keyword', 'Line 3: Syntax error in console.log', 'Line 2: Missing semicolon'],
    answer: 0,
    explanation: 'i-- decrements i away from 10, causing an infinite loop. It should be i++.'
  },
  {
    id: 'fb-b2',
    difficulty: 'beginner',
    title: 'Assignment inside Condition',
    language: 'javascript',
    code: 'let isLoggedIn = false;\nif (isLoggedIn = true) {\n  console.log("Welcome back!");\n}',
    options: ['Line 2: Single = assigns value instead of comparing (== or ===)', 'Line 1: Must use const for booleans', 'Line 3: Missing quotes', 'Line 2: Syntax error'],
    answer: 0,
    explanation: 'Using single = in condition assigns true to isLoggedIn and evaluates to true. Should use === for comparison.'
  },
  {
    id: 'fb-b3',
    difficulty: 'beginner',
    title: 'Missing Return Statement in Function',
    language: 'javascript',
    code: 'function sum(a, b) {\n  const total = a + b;\n}\nconst result = sum(5, 10);',
    options: ['Line 2: Missing return total statement', 'Line 4: Cannot call sum with const', 'Line 1: Parameters require data types', 'Line 2: Cannot add a and b'],
    answer: 0,
    explanation: 'sum function calculates total but does not return it, so result receives undefined.'
  },
  {
    id: 'fb-b4',
    difficulty: 'beginner',
    title: 'Uninitialized Variable Addition',
    language: 'javascript',
    code: 'let score;\nscore += 50;\nconsole.log(score);',
    options: ['Line 1: score is uninitialized (undefined + 50 = NaN)', 'Line 2: Cannot use += operator', 'Line 3: Missing quotes around score', 'Line 1: Must use const'],
    answer: 0,
    explanation: 'score is declared without initial value (undefined). undefined + 50 results in NaN.'
  },
  {
    id: 'fb-b5',
    difficulty: 'beginner',
    title: 'String Quote Mismatch',
    language: 'javascript',
    code: 'const greeting = "Hello World\';\nconsole.log(greeting);',
    options: ['Line 1: Mismatched quotes (double quote closed with single quote)', 'Line 2: greeting cannot be logged', 'Line 1: Missing semicolon', 'Line 2: Missing parentheses'],
    answer: 0,
    explanation: 'String starts with double quote " but ends with single quote \', causing a SyntaxError.'
  },
  {
    id: 'fb-b6',
    difficulty: 'beginner',
    title: 'Array Length Truncation Bug',
    language: 'javascript',
    code: 'const arr = [10, 20, 30];\narr.length = 0;\nconsole.log(arr[0]);',
    options: ['Line 2: Setting length to 0 empties the array; arr[0] evaluates to undefined', 'Line 1: Const arrays cannot change length', 'Line 3: arr[0] throws a ReferenceError', 'Line 2: Length property is read-only'],
    answer: 0,
    explanation: 'Setting array length property to 0 deletes all elements, making arr[0] return undefined.'
  },
  {
    id: 'fb-b7',
    difficulty: 'beginner',
    title: 'Function Scope Variable Shadowing',
    language: 'javascript',
    code: 'let user = "Alice";\nfunction setGuest() {\n  let user = "Guest";\n}\nsetGuest();\nconsole.log(user);',
    options: ['Line 3: Local let user shadows outer variable, so global user remains "Alice"', 'Line 4: Function setGuest cannot be executed', 'Line 5: User variable is undefined', 'Line 1: User must be const'],
    answer: 0,
    explanation: 'Declaring let user inside function creates a local variable instead of updating the outer variable.'
  },
  {
    id: 'fb-b8',
    difficulty: 'beginner',
    title: 'String Concatenation Addition Bug',
    language: 'javascript',
    code: 'const price = "100";\nconst total = price + 50;\nconsole.log(total);',
    options: ['Line 2: Adding string "100" to number 50 results in string "10050" instead of 150', 'Line 1: String cannot contain numbers', 'Line 3: Total is unprintable', 'Line 2: Type error is thrown'],
    answer: 0,
    explanation: 'The + operator with a string performs string concatenation. Use Number(price) + 50.'
  },
  {
    id: 'fb-b9',
    difficulty: 'beginner',
    title: 'Reassigning Constant Variable',
    language: 'javascript',
    code: 'const count = 5;\ncount = count + 1;\nconsole.log(count);',
    options: ['Line 2: Cannot reassign variable declared with const keyword (TypeError)', 'Line 1: const cannot hold numbers', 'Line 3: count is private', 'Line 2: Missing let keyword'],
    answer: 0,
    explanation: 'Variables declared with const cannot be reassigned. Use let if value needs to change.'
  },
  {
    id: 'fb-b10',
    difficulty: 'beginner',
    title: 'Property Access on Null Object',
    language: 'javascript',
    code: 'const profile = null;\nconsole.log(profile.name);',
    options: ['Line 2: Accessing property on null throws TypeError (Cannot read properties of null)', 'Line 1: profile must be object', 'Line 2: .name is reserved', 'Line 1: null is undefined'],
    answer: 0,
    explanation: 'Attempting to access a property on null throws TypeError. Should use optional chaining profile?.name.'
  },

  // INTERMEDIATE LEVEL (12 Questions)
  {
    id: 'fb-i1',
    difficulty: 'intermediate',
    title: 'Off-By-One Array Indexing',
    language: 'javascript',
    code: 'const items = ["Apple", "Banana", "Cherry"];\nfor (let i = 0; i <= items.length; i++) {\n  console.log(items[i].toUpperCase());\n}',
    options: ['Line 2: i <= items.length accesses out-of-bounds undefined at items[3]', 'Line 3: toUpperCase does not exist on strings', 'Line 1: Const arrays cannot be iterated', 'Line 2: i should start at 1'],
    answer: 0,
    explanation: 'items.length is 3. i <= 3 causes i=3 access items[3] (undefined), throwing TypeError on .toUpperCase(). Use i < items.length.'
  },
  {
    id: 'fb-i2',
    difficulty: 'intermediate',
    title: 'Array Push Mutating Filter',
    language: 'javascript',
    code: 'const nums = [1, 2, 3, 4, 5];\nconst evens = nums.filter(n => {\n  if (n % 2 === 0) return true;\n  nums.push(n * 2);\n});',
    options: ['Line 4: Mutating array nums while iterating leads to infinite / corrupt execution', 'Line 2: Filter must return strings', 'Line 3: % 2 does not check even numbers', 'Line 1: Nums must be let'],
    answer: 0,
    explanation: 'Pushing items into nums inside filter callback mutates the array during iteration, leading to logic bugs or memory overflow.'
  },
  {
    id: 'fb-i3',
    difficulty: 'intermediate',
    title: 'Object Reference Mutation Bug',
    language: 'javascript',
    code: 'const user1 = { name: "Alice", role: "admin" };\nconst user2 = user1;\nuser2.role = "student";\nconsole.log(user1.role);',
    options: ['Line 2: user2 references user1 object directly without cloning', 'Line 3: Const objects cannot have properties updated', 'Line 4: user1.role throws error', 'Line 1: Missing JSON.stringify'],
    answer: 0,
    explanation: 'user2 = user1 copies the reference, not the object. Modifying user2.role mutates user1. Should use { ...user1 }.'
  },
  {
    id: 'fb-i4',
    difficulty: 'intermediate',
    title: 'Async Function Missing await',
    language: 'javascript',
    code: 'async function fetchUser() {\n  return { name: "Bob" };\n}\nconst user = fetchUser();\nconsole.log(user.name);',
    options: ['Line 4: fetchUser() returns a Promise, missing await keyword', 'Line 1: Async functions cannot return objects', 'Line 5: user.name is illegal', 'Line 2: Missing JSON parse'],
    answer: 0,
    explanation: 'Async functions always return a Promise. Calling fetchUser() without await leaves user as Promise { <pending> }, so user.name is undefined.'
  },
  {
    id: 'fb-i5',
    difficulty: 'intermediate',
    title: 'Missing Break in Switch Case',
    language: 'javascript',
    code: 'let role = "admin";\nswitch(role) {\n  case "admin":\n    console.log("Full Access");\n  case "user":\n    console.log("Limited Access");\n}',
    options: ['Line 4: Missing break statement causes fallthrough to next case', 'Line 2: Switch cannot check strings', 'Line 5: Duplicate case name', 'Line 3: Colon should be semicolon'],
    answer: 0,
    explanation: 'Without break statement, execution falls through to case "user" and prints both "Full Access" and "Limited Access".'
  },
  {
    id: 'fb-i6',
    difficulty: 'intermediate',
    title: 'Incorrect Array Method Usage',
    language: 'javascript',
    code: 'const scores = [80, 95, 60];\nscores.sort();\nconsole.log(scores);',
    options: ['Line 2: Array.prototype.sort() sorts elements as strings alphabetically by default', 'Line 1: const arrays cannot be sorted', 'Line 3: scores cannot be printed', 'Line 2: sort() requires array length parameter'],
    answer: 0,
    explanation: 'Default sort() converts elements to strings. [100, 25, 5].sort() yields [100, 25, 5]. Must provide compare function (a, b) => a - b.'
  },
  {
    id: 'fb-i7',
    difficulty: 'intermediate',
    title: 'Event Listener Scope Leak',
    language: 'javascript',
    code: 'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}',
    options: ['Line 1: var i is function-scoped; all callbacks log 3 instead of 0, 1, 2', 'Line 2: setTimeout cannot accept arrow function', 'Line 1: i < 3 is invalid', 'Line 2: 100ms is too short'],
    answer: 0,
    explanation: 'var i is shared across loop iterations. By the time 100ms timer fires, loop has completed and i is 3. Use let i.'
  },
  {
    id: 'fb-i8',
    difficulty: 'intermediate',
    title: 'JSON Parse Unhandled Exception',
    language: 'javascript',
    code: 'function parseData(raw) {\n  return JSON.parse(raw);\n}\nparseData("invalid json");',
    options: ['Line 2: JSON.parse throws SyntaxError on bad input without try/catch block', 'Line 1: Raw parameter is reserved', 'Line 4: JSON strings must be arrays', 'Line 2: Must use JSON.stringify instead'],
    answer: 0,
    explanation: 'Invalid JSON string passed to JSON.parse throws unhandled SyntaxError crash. Should wrap in try/catch.'
  },
  {
    id: 'fb-i9',
    difficulty: 'intermediate',
    title: 'Missing Return in Array Map Body',
    language: 'javascript',
    code: 'const nums = [1, 2, 3];\nconst doubled = nums.map(n => {\n  n * 2;\n});\nconsole.log(doubled);',
    options: ['Line 3: Missing return statement inside curly block returns [undefined, undefined, undefined]', 'Line 2: Map cannot double numbers', 'Line 1: nums must be let', 'Line 4: Doubled array cannot be logged'],
    answer: 0,
    explanation: 'Arrow functions with curly braces require an explicit return statement. Otherwise, it returns undefined for each element.'
  },
  {
    id: 'fb-i10',
    difficulty: 'intermediate',
    title: 'forEach Parameter Reassignment Bug',
    language: 'javascript',
    code: 'const users = [{ name: "Alice" }];\nusers.forEach(u => {\n  u = { name: "Bob" };\n});',
    options: ['Line 3: Reassigning parameter u does not mutate the original object inside array', 'Line 2: forEach cannot iterate objects', 'Line 1: Array cannot hold objects', 'Line 4: Missing return value'],
    answer: 0,
    explanation: 'Reassigning local variable u changes local binding only. To modify object, update property directly (u.name = "Bob").'
  },
  {
    id: 'fb-i11',
    difficulty: 'intermediate',
    title: 'Floating Point Strict Equality Trap',
    language: 'javascript',
    code: 'function isPointThree(a, b) {\n  return (a + b) === 0.3;\n}\nconsole.log(isPointThree(0.1, 0.2));',
    options: ['Line 2: 0.1 + 0.2 equals 0.30000000000000004 in binary float arithmetic (returns false)', 'Line 1: Function cannot return boolean', 'Line 4: Function is undefined', 'Line 2: === must be =='],
    answer: 0,
    explanation: '0.1 + 0.2 evaluates to 0.30000000000000004, so === 0.3 returns false. Use Math.abs((a + b) - 0.3) < Number.EPSILON.'
  },
  {
    id: 'fb-i12',
    difficulty: 'intermediate',
    title: 'Unbound Method Passing Bug',
    language: 'javascript',
    code: 'const user = {\n  name: "Alex",\n  getName() { return this.name; }\n};\nconst fn = user.getName;\nconsole.log(fn());',
    options: ['Line 5: Extracting method loses its object context (this becomes undefined/window)', 'Line 3: getName must be arrow function', 'Line 1: Const object cannot have methods', 'Line 6: fn is not a function'],
    answer: 0,
    explanation: 'Assigning a method to a standalone variable detaches it from its parent object, causing this to lose reference. Use user.getName.bind(user).'
  },

  // ADVANCED LEVEL (14 Questions)
  {
    id: 'fb-a1',
    difficulty: 'advanced',
    title: 'Promise Race Condition in Loop',
    language: 'javascript',
    code: 'async function processItems(items) {\n  items.forEach(async (item) => {\n    await saveToDb(item);\n  });\n  console.log("All Saved!");\n}',
    options: ['Line 2: forEach does not await async callbacks; console.log runs before saves finish', 'Line 3: saveToDb cannot be awaited inside loop', 'Line 1: processItems must be sync', 'Line 5: console.log is missing await'],
    answer: 0,
    explanation: 'Array.prototype.forEach ignores returned Promises. Use for...of or Promise.all(items.map(...)) to await completions.'
  },
  {
    id: 'fb-a2',
    difficulty: 'advanced',
    title: 'Stale Closure in React Hook',
    language: 'javascript',
    code: 'const [count, setCount] = useState(0);\nuseEffect(() => {\n  const id = setInterval(() => {\n    setCount(count + 1);\n  }, 1000);\n  return () => clearInterval(id);\n}, []);',
    options: ['Line 4: count in closure is stale (0); count stays stuck at 1. Use setCount(c => c + 1)', 'Line 6: Cleanup function is illegal', 'Line 7: Empty dependency array causes memory leak', 'Line 1: useState requires initial string'],
    answer: 0,
    explanation: 'Empty dependency array [] captures initial count = 0. Every second setCount(0 + 1) sets count to 1. Use functional updater setCount(c => c + 1).'
  },
  {
    id: 'fb-a3',
    difficulty: 'advanced',
    title: 'Mutating State Directly in Redux/React',
    language: 'javascript',
    code: 'function reducer(state, action) {\n  if (action.type === "ADD") {\n    state.list.push(action.payload);\n    return state;\n  }\n}',
    options: ['Line 3: Mutating state directly prevents re-renders due to identical object reference', 'Line 4: Reducer must return null', 'Line 1: State must be array', 'Line 2: === is invalid'],
    answer: 0,
    explanation: 'Directly mutating state.list modifies existing reference. Component shallow equality checks see no state change and skip re-rendering.'
  },
  {
    id: 'fb-a4',
    difficulty: 'advanced',
    title: 'Uncaught Unhandled Rejection in Promise.all',
    language: 'javascript',
    code: 'async function fetchAll(urls) {\n  const results = await Promise.all(urls.map(url => fetch(url)));\n  return results;\n}',
    options: ['Line 2: Promise.all rejects immediately if any single fetch fails, ignoring others', 'Line 1: Async functions cannot use Promise.all', 'Line 3: Return type is invalid', 'Line 2: Map cannot be used with fetch'],
    answer: 0,
    explanation: 'Promise.all has all-or-nothing behavior. If 1 request fails, all fail. Use Promise.allSettled for resilient batch fetching.'
  },
  {
    id: 'fb-a5',
    difficulty: 'advanced',
    title: 'Memory Leak via Global Event Listener',
    language: 'javascript',
    code: 'function Component() {\n  useEffect(() => {\n    window.addEventListener("resize", handleResize);\n  }, []);\n}',
    options: ['Line 3: Missing cleanup return () => window.removeEventListener("resize", handleResize)', 'Line 3: Window resize cannot be listened to', 'Line 4: Dependency array must contain window', 'Line 1: Component name must be lowercase'],
    answer: 0,
    explanation: 'Adding global event listeners inside useEffect without returning cleanup function causes memory leaks and duplicate triggers.'
  },
  {
    id: 'fb-a6',
    difficulty: 'advanced',
    title: 'Object Key Prototype Pollution',
    language: 'javascript',
    code: 'function merge(target, source) {\n  for (let key in source) {\n    target[key] = source[key];\n  }\n  return target;\n}',
    options: ['Line 2: for...in iterates prototype properties unless guarded by hasOwnProperty', 'Line 3: Assignment requires Object.assign', 'Line 1: Target cannot be object', 'Line 4: Merge must return array'],
    answer: 0,
    explanation: 'for...in iterates over inherited prototype properties of source, causing unexpected property leaks or security vulnerabilities.'
  },
  {
    id: 'fb-a7',
    difficulty: 'advanced',
    title: 'Float Point Precision Equality Bug',
    language: 'javascript',
    code: 'function checkPrice(a, b) {\n  if (a + b === 0.3) {\n    return "Exact!";\n  }\n}\ncheckPrice(0.1, 0.2);',
    options: ['Line 2: 0.1 + 0.2 equals 0.30000000000000004 in IEEE-754 floating point arithmetic', 'Line 5: Function parameters must be numbers', 'Line 1: checkPrice is invalid function name', 'Line 2: === must be =='],
    answer: 0,
    explanation: '0.1 + 0.2 === 0.3 evaluates to false due to binary floating point representation. Should use Math.abs((a + b) - 0.3) < Number.EPSILON.'
  },
  {
    id: 'fb-a8',
    difficulty: 'advanced',
    title: 'Recursion Missing Base Case',
    language: 'javascript',
    code: 'function factorial(n) {\n  return n * factorial(n - 1);\n}',
    options: ['Line 2: Missing base case (if n <= 1 return 1), causing RangeError maximum call stack size exceeded', 'Line 1: Factorial cannot accept n', 'Line 2: Multiplication is invalid', 'Line 1: Function needs async keyword'],
    answer: 0,
    explanation: 'Without a base case, factorial continues recursing into negative numbers until call stack overflows.'
  },
  {
    id: 'fb-a9',
    difficulty: 'advanced',
    title: 'NaN Comparison Trap',
    language: 'javascript',
    code: 'function isInvalid(val) {\n  if (val === NaN) {\n    return true;\n  }\n}',
    options: ['Line 2: NaN === NaN evaluates to false. Must use Number.isNaN(val)', 'Line 1: val cannot be checked', 'Line 2: Strict equality is illegal for numbers', 'Line 3: Return statement needs brackets'],
    answer: 0,
    explanation: 'NaN is the only value in JavaScript that is not equal to itself (NaN === NaN is false). Must use Number.isNaN(val).'
  },
  {
    id: 'fb-a10',
    difficulty: 'advanced',
    title: 'Strict Mode Arguments Callee Usage',
    language: 'javascript',
    code: '"use strict";\nfunction recurse() {\n  arguments.callee();\n}',
    options: ['Line 3: arguments.callee is forbidden in strict mode and throws TypeError', 'Line 1: "use strict" is invalid', 'Line 2: recurse cannot be empty', 'Line 3: arguments is reserved variable'],
    answer: 0,
    explanation: 'ES5 strict mode disallows arguments.callee for security and optimization reasons. Named function expressions should be used instead.'
  },
  {
    id: 'fb-a11',
    difficulty: 'advanced',
    title: 'React Asynchronous State Batching Bug',
    language: 'javascript',
    code: 'function incrementTwice() {\n  setCount(count + 1);\n  setCount(count + 1);\n}',
    options: ['Line 3: Sequential state setters use same stale count reference, resulting in single increment. Use setCount(prev => prev + 1)', 'Line 2: setCount cannot be called twice', 'Line 1: Function must be async', 'Line 3: count + 1 is illegal'],
    answer: 0,
    explanation: 'State updates in React are batched asynchronously. Calling setCount(count + 1) twice in the same tick uses the same captured count value.'
  },
  {
    id: 'fb-a12',
    difficulty: 'advanced',
    title: 'React Hook Uncleaned Interval Memory Leak',
    language: 'javascript',
    code: 'useEffect(() => {\n  const id = setInterval(updateData, 1000);\n}, []);',
    options: ['Line 2: Missing cleanup return () => clearInterval(id), causing memory leak & duplicate timers on re-render', 'Line 3: Empty dependency array is forbidden', 'Line 1: useEffect must return promise', 'Line 2: 1000ms is too fast'],
    answer: 0,
    explanation: 'Intervals started inside useEffect persist in background unless cleaned up with return () => clearInterval(id).'
  },
  {
    id: 'fb-a13',
    difficulty: 'advanced',
    title: 'Global Prototype Pollution Mutation',
    language: 'javascript',
    code: 'Array.prototype.last = function() {\n  return this[this.length - 1];\n};',
    options: ['Line 1: Modifying built-in Array prototype causes global side-effects and library conflicts', 'Line 2: this.length - 1 is out of bounds', 'Line 3: Prototype functions must return arrays', 'Line 1: Array is a const object'],
    answer: 0,
    explanation: 'Extending built-in prototypes globally polluted object interfaces and can break third-party scripts or future JS specifications.'
  },
  {
    id: 'fb-a14',
    difficulty: 'advanced',
    title: 'Uncaught Exception in Promise Executor',
    language: 'javascript',
    code: 'new Promise((resolve, reject) => {\n  setTimeout(() => {\n    throw new Error("Failed!");\n  }, 1000);\n});',
    options: ['Line 3: Errors thrown inside async setTimeout callbacks bypass Promise catch handlers and crash as uncaught exceptions', 'Line 1: Promise executor cannot use arrow function', 'Line 2: setTimeout is forbidden in promises', 'Line 4: Reject parameter must be used'],
    answer: 0,
    explanation: 'Synchronous try/catch inside Promise constructor cannot catch errors thrown inside asynchronous event loops like setTimeout. Must call reject(err) instead.'
  }
];

const getFunnyGuessResult = (score, total) => {
  const ratio = total > 0 ? score / total : 0;
  if (ratio === 1) {
    return {
      title: "🔮 The V8 Compiler Prophet",
      emoji: "👑",
      message: "Holy Chrome V8! You predict JavaScript outputs better than the JS execution engine itself. Are you written in C++?",
      suggestion: "💡 Recommendation: Go compile the Linux kernel from source or start building your own JS runtime like Ryan Dahl!"
    };
  } else if (ratio >= 0.75) {
    return {
      title: "💻 Console Log Addict",
      emoji: "⚡",
      message: "Solid performance! You only got bamboozled by typeof NaN once. Your dev tools console is proud of you.",
      suggestion: "💡 Recommendation: Stop spamming console.log('here 123') and start using a real debugger!"
    };
  } else if (ratio >= 0.5) {
    return {
      title: "⚠️ Undefined Is Not A Function",
      emoji: "☕",
      message: "Not bad! Type coercion got the best of you on a couple of questions, but you survived the event loop.",
      suggestion: "💡 Recommendation: Remember: 1 + '1' is '11' because JavaScript loves chaos and dynamic typing!"
    };
  } else if (ratio >= 0.25) {
    return {
      title: "🤡 [object Object] Guesser",
      emoji: "🍵",
      message: "Oops! You guessed [object Object] or NaN for almost every question... To be fair, JS IS weird like that.",
      suggestion: "💡 Recommendation: Sip some tea, close your 40 open browser tabs, and review basic scope and coercion rules!"
    };
  } else {
    return {
      title: "💥 Fatal Heap Out of Memory",
      emoji: "💥",
      message: "Yikes! Your output guesses caused a stack overflow and crashed Node.js! V8 engine is crying.",
      suggestion: "💡 Recommendation: Turn off your laptop, take a deep breath, and restart from Beginner level!"
    };
  }
};

const getFunnyBugResult = (score, total) => {
  const ratio = total > 0 ? score / total : 0;
  if (ratio === 1) {
    return {
      title: "🦟 The Ultimate Bug Exterminator",
      emoji: "🏆",
      message: "Absolute perfection! You exterminated memory leaks, infinite loops, and race conditions faster than a Senior QA Lead!",
      suggestion: "💡 Recommendation: Inspect your production codebase right now—you might save your team from a 3 AM weekend callout!"
    };
  } else if (ratio >= 0.75) {
    return {
      title: "🔍 Inspector Gadget",
      emoji: "⚡",
      message: "Great eye! You caught almost every infinite loop before the browser tab completely froze.",
      suggestion: "💡 Recommendation: Always double-check your loop counter condition before hitting git push!"
    };
  } else if (ratio >= 0.5) {
    return {
      title: "🍌 Banana in the Exhaust Pipe",
      emoji: "☕",
      message: "Not bad! You spotted the obvious syntax error, but missed the sneaky off-by-one array boundary bug.",
      suggestion: "💡 Recommendation: Don't code at 3 AM without coffee! Read compiler error tracebacks carefully."
    };
  } else if (ratio >= 0.25) {
    return {
      title: "🐛 Bug Breeding Farm",
      emoji: "🍵",
      message: "Oops! You called an infinite loop a 'feature'... Your tech lead is currently hyperventilating.",
      suggestion: "💡 Recommendation: If code compiles, don't just pray—test it with edge cases!"
    };
  } else {
    return {
      title: "🔥 Production Server Burning",
      emoji: "💥",
      message: "Yikes! Your bug hunting accidentally pushed 4 broken loops to production on a Friday at 4:59 PM!",
      suggestion: "💡 Recommendation: Apologize to your server room, grab a coffee, and start over in Beginner mode!"
    };
  }
};

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
  { id: 'qq-1', q: "What does API stand for in software engineering?", options: ["Automated Program Interface", "Application Programming Interface", "Advanced Process Integration", "Application Protocol Instruction"], answer: 1, category: "Web Dev", difficulty: "beginner" },
  { id: 'qq-2', q: "Which data structure follows the Last-In, First-Out (LIFO) principle?", options: ["Queue", "Binary Tree", "Stack", "Linked List"], answer: 2, category: "Data Structures", difficulty: "beginner" },
  { id: 'qq-3', q: "What default port does HTTPS protocol use?", options: ["80", "21", "8080", "443"], answer: 3, category: "Networking", difficulty: "beginner" },
  { id: 'qq-4', q: "Which Big-O time complexity represents binary search algorithm?", options: ["O(N)", "O(log N)", "O(N^2)", "O(1)"], answer: 1, category: "Algorithms", difficulty: "intermediate" },
  { id: 'qq-5', q: "Which HTTP status code signifies 'Resource Not Found'?", options: ["200", "403", "404", "500"], answer: 2, category: "Web Dev", difficulty: "beginner" },
  { id: 'qq-6', q: "What is a closure in JavaScript?", options: ["A function retaining access to its outer scope", "Closing a database connection", "Private class constructor", "Asynchronous promise completion"], answer: 0, category: "Web Dev", difficulty: "advanced" },
  { id: 'qq-7', q: "Which sorting algorithm guarantees O(N log N) worst-case time complexity?", options: ["Quick Sort", "Bubble Sort", "Merge Sort", "Insertion Sort"], answer: 2, category: "Algorithms", difficulty: "advanced" },
  { id: 'qq-8', q: "Which SQL clause filters aggregated query results after GROUP BY?", options: ["WHERE", "HAVING", "FILTER", "ORDER BY"], answer: 1, category: "Databases", difficulty: "intermediate" },
  { id: 'qq-9', q: "What protocol handles domain name to IP address resolution?", options: ["DHCP", "DNS", "ARP", "BGP"], answer: 1, category: "Networking", difficulty: "beginner" },
  { id: 'qq-10', q: "What is the primary function of a mutex in concurrent programming?", options: ["Memory allocation", "Prevent race conditions via mutual exclusion", "Task scheduling", "Cache invalidation"], answer: 1, category: "OS & Systems", difficulty: "advanced" },
  { id: 'qq-11', q: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Multi Language", "Hyperlink Text Management Language", "Home Tool Markup Language"], answer: 0, category: "Web Dev", difficulty: "beginner" },
  { id: 'qq-12', q: "Which Git command creates a new branch and switches to it in one step?", options: ["git branch -new", "git checkout -b", "git switch -create", "git merge -b"], answer: 1, category: "DevOps", difficulty: "beginner" },
  { id: 'qq-13', q: "Which keyword is used to declare a block-scoped reassignable variable in JS?", options: ["var", "let", "const", "static"], answer: 1, category: "Web Dev", difficulty: "beginner" },
  { id: 'qq-14', q: "What is the worst-case time complexity of inserting into a Hashtable?", options: ["O(1)", "O(N)", "O(log N)", "O(N^2)"], answer: 1, category: "Data Structures", difficulty: "intermediate" },
  { id: 'qq-15', q: "Which SQL join returns all records from the left table and matched records from the right?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], answer: 1, category: "Databases", difficulty: "beginner" },
  { id: 'qq-16', q: "What does CSS property 'display: flex' establish?", options: ["A Flexbox formatting context for children", "Grid layout system", "Absolute positioning container", "Inline inline-block flow"], answer: 0, category: "Web Dev", difficulty: "beginner" },
  { id: 'qq-17', q: "In OOP, what principle allows a subclass to provide a specific implementation of a superclass method?", options: ["Encapsulation", "Polymorphism / Method Overriding", "Abstraction", "Multiple Inheritance"], answer: 1, category: "OOP", difficulty: "intermediate" },
  { id: 'qq-18', q: "Which OSI model layer is responsible for routing IP packets across networks?", options: ["Data Link Layer", "Network Layer", "Transport Layer", "Session Layer"], answer: 1, category: "Networking", difficulty: "intermediate" },
  { id: 'qq-19', q: "What is the main benefit of Virtual DOM in React?", options: ["Replaces Real DOM completely", "Minimizes expensive direct Real DOM updates via diffing", "Enables multithreaded JavaScript", "Stores application data in localStorage"], answer: 1, category: "Web Dev", difficulty: "intermediate" },
  { id: 'qq-20', q: "Which component of an OS manages memory space allocations for processes?", options: ["CPU Scheduler", "Memory Management Unit (MMU)", "File System", "I/O Controller"], answer: 1, category: "OS & Systems", difficulty: "advanced" },
  { id: 'qq-21', q: "What is the default port for HTTP traffic?", options: ["443", "80", "22", "3000"], answer: 1, category: "Networking", difficulty: "beginner" },
  { id: 'qq-22', q: "Which data structure is typically used for Breadth-First Search (BFS) in a graph?", options: ["Stack", "Queue", "Heap", "Hash Set"], answer: 1, category: "Algorithms", difficulty: "intermediate" },
  { id: 'qq-23', q: "What does REST stand for in web architecture?", options: ["Representational State Transfer", "Remote Execution System Task", "Relational Entity Service Protocol", "Responsive Enterprise Software Transfer"], answer: 0, category: "Web Dev", difficulty: "intermediate" },
  { id: 'qq-24', q: "Which hash algorithm is considered cryptographically broken and insecure for passwords?", options: ["SHA-256", "MD5", "Bcrypt", "Argon2"], answer: 1, category: "Cybersecurity", difficulty: "intermediate" },
  { id: 'qq-25', q: "In Docker, what file defines instructions for building a container image?", options: ["docker-compose.yml", "Dockerfile", "package.json", "Container.config"], answer: 1, category: "DevOps", difficulty: "beginner" },
  { id: 'qq-26', q: "What algorithm is used by React to compare two Virtual DOM trees?", options: ["Dijkstra's Algorithm", "Heuristic O(N) Reconciliation Diffing", "Binary Search", "A* Pathfinding"], answer: 1, category: "Web Dev", difficulty: "advanced" },
  { id: 'qq-27', q: "What is a Deadlock in operating systems?", options: ["Infinite loop in process code", "Processes permanently blocked waiting for resources held by each other", "CPU overheating shutdown", "Memory leak overflow"], answer: 1, category: "OS & Systems", difficulty: "advanced" },
  { id: 'qq-28', q: "Which Git command downloads changes from remote and immediately merges into current branch?", options: ["git fetch", "git pull", "git push", "git clone"], answer: 1, category: "DevOps", difficulty: "beginner" },
  { id: 'qq-29', q: "What is ACID in database transactions?", options: ["Atomicity, Consistency, Isolation, Durability", "Asynchronous, Concurrent, Indexed, Distributed", "Automated, Certified, Integrated, Data", "Array, Column, Index, Document"], answer: 0, category: "Databases", difficulty: "advanced" },
  { id: 'qq-30', q: "Which HTTP method is idempotent and intended to update/replace an existing resource?", options: ["POST", "PUT", "DELETE", "GET"], answer: 1, category: "Web Dev", difficulty: "intermediate" }
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

export const BrainZonePage = ({ onOpenAdminForm, defaultSubTab = 'games' }) => {
  const { currentUser, updateUserProfile, completeBrainZoneChallenge, isAdmin } = useAuth();
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
    ecgChallenges,
    tangoPuzzles,
    speedTypePrompts,
    addOrUpdateQuizQuestion,
    removeQuizQuestion,
    addThisOrThatPoll,
    weeklyMissions: contextMissions,
    badges: contextBadges,
    mysteryRewards,
    siteConfig
  } = useData();

  // Active Main Tab state: 'games' | 'learnjava' | 'goals' | 'leaderboard'
  const [activeTab, setActiveTab] = useState(defaultSubTab);

  useEffect(() => {
    if (defaultSubTab) {
      setActiveTab(defaultSubTab);
    }
  }, [defaultSubTab]);

  // User Stats state
  const funPoints = currentUser?.funPoints ?? 0;
  const currentStreak = currentUser?.currentStreak ?? currentUser?.streak ?? 0;
  const longestStreak = currentUser?.longestStreak ?? currentStreak;
  const totalChallengesCompleted = currentUser?.totalChallengesCompleted ?? 0;
  const streakHistory = currentUser?.streakHistory || [];
  const streak = currentStreak;
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
  const [challengeQuizPool, setChallengeQuizPool] = useState([]);
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
  const [guessScore, setGuessScore] = useState(0);
  const [guessFinished, setGuessFinished] = useState(false);

  // Find Bug Modal State
  const [findBugOpen, setFindBugOpen] = useState(false);
  const [activeBugList, setActiveBugList] = useState([]);
  const [bugIndex, setBugIndex] = useState(0);
  const [bugSelectedOpt, setBugSelectedOpt] = useState(null);
  const [bugSubmitted, setBugSubmitted] = useState(false);
  const [bugScore, setBugScore] = useState(0);
  const [bugFinished, setBugFinished] = useState(false);

  // ECG (Error Code Guessing) Modal State
  const [ecgModalOpen, setEcgModalOpen] = useState(false);
  const [activeEcgList, setActiveEcgList] = useState([]);
  const [ecgIndex, setEcgIndex] = useState(0);
  const [ecgSelectedOpt, setEcgSelectedOpt] = useState(null);
  const [ecgSubmitted, setEcgSubmitted] = useState(false);
  const [ecgScore, setEcgScore] = useState(0);
  const [ecgFinished, setEcgFinished] = useState(false);

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

  // Copy-Paste Protection Toast State & Active Session Engine
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isGameSessionActive = Boolean(
    challengeActive || 
    quickQuizOpen || 
    guessOutputOpen || 
    findBugOpen || 
    ecgModalOpen || 
    tangoModalOpen || 
    speedTypeModalOpen
  );

  // Copy-Paste Prevention Global Event Listeners Effect (Only during active game sessions)
  useEffect(() => {
    if (!isGameSessionActive) return;

    const handleBlockedAction = (e, actionName) => {
      e.preventDefault();
      triggerToast(`🚫 ${actionName} is disabled during active tests`);
    };

    const onCtx = (e) => handleBlockedAction(e, "Right-click context menu");
    const onCopy = (e) => handleBlockedAction(e, "Copying text");
    const onCut = (e) => handleBlockedAction(e, "Cut text");
    const onPaste = (e) => handleBlockedAction(e, "Pasting");

    window.addEventListener('contextmenu', onCtx);
    window.addEventListener('copy', onCopy);
    window.addEventListener('cut', onCut);
    window.addEventListener('paste', onPaste);

    return () => {
      window.removeEventListener('contextmenu', onCtx);
      window.removeEventListener('copy', onCopy);
      window.removeEventListener('cut', onCut);
      window.removeEventListener('paste', onPaste);
    };
  }, [isGameSessionActive]);



  // Enhanced Leaderboard State
  const [lbActiveTab, setLbActiveTab] = useState('department'); // 'department' | 'weekly' | 'monthly' | 'class'
  const [lbSearchQuery, setLbSearchQuery] = useState('');
  const [lbYearFilter, setLbYearFilter] = useState('All'); // 'All' | '1st Year' | '2nd Year' | '3rd Year' | '4th Year'
  const [lbSectionFilter, setLbSectionFilter] = useState('All'); // 'All' | 'IT-A' | 'IT-B' | 'IT-C' | 'IT-D'
  const [selectedClassSec, setSelectedClassSec] = useState('IT-A');
  const [hoveredUser, setHoveredUser] = useState(null);
  const [countdownWeekly, setCountdownWeekly] = useState('');
  const [countdownMonthly, setCountdownMonthly] = useState('');

  // Live Reset Countdown Timers
  useEffect(() => {
    const calcWeekly = () => {
      const now = new Date();
      const nextSun = new Date(now);
      const day = now.getDay();
      const diffToSun = day === 0 ? 0 : 7 - day;
      nextSun.setDate(now.getDate() + diffToSun);
      nextSun.setHours(23, 59, 59, 999);
      const diffMs = Math.max(0, nextSun - now);
      const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const h = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diffMs / (1000 * 60)) % 60);
      const s = Math.floor((diffMs / 1000) % 60);
      return `${d}d ${h}h ${m}m ${s}s`;
    };

    const calcMonthly = () => {
      const now = new Date();
      const nextMo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      const diffMs = Math.max(0, nextMo - now);
      const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const h = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diffMs / (1000 * 60)) % 60);
      const s = Math.floor((diffMs / 1000) % 60);
      return `${d}d ${h}h ${m}m ${s}s`;
    };

    const updateTimers = () => {
      setCountdownWeekly(calcWeekly());
      setCountdownMonthly(calcMonthly());
    };
    updateTimers();
    const timerInterval = setInterval(updateTimers, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  // Weekly Mission State & Dynamic ISO Week Tracking
  const currentWeekBatch = getISOWeekId();
  const activeWeeklyMissions = (contextMissions && contextMissions.length > 0) ? contextMissions : [
    { id: 'm-1', title: 'Complete 3 Quick Quizzes', target: 3, reward: 75, category: 'quiz' },
    { id: 'm-2', title: 'Play Spin & Learn 3 times', target: 3, reward: 50, category: 'spin' },
    { id: 'm-3', title: 'Complete 2 Arcade Challenges', target: 2, reward: 100, category: 'game' }
  ];
  const activeBadges = (contextBadges && contextBadges.length > 0) ? contextBadges : INITIAL_ACHIEVEMENT_BADGES;

  // Retrieve user's weekly mission progress for current week (auto-resets when week changes!)
  const userWeeklyData = currentUser?.weeklyMissionsData?.[currentWeekBatch] || {
    progress: {},
    claimed: {},
    claimedBonus: false
  };

  const currentMissionProgress = userWeeklyData.progress || {};
  const currentMissionClaimed = userWeeklyData.claimed || {};
  const isWeeklyBonusClaimed = Boolean(userWeeklyData.claimedBonus);

  // Check if ALL active weekly missions are completed
  const areAllMissionsCompleted = activeWeeklyMissions.length > 0 && activeWeeklyMissions.every(m => {
    const userProg = currentMissionProgress[m.id] || 0;
    return userProg >= (m.target || 1);
  });

  // Record Mission Progress Event
  const recordMissionProgress = (categoryOrId, count = 1) => {
    if (!currentUser) return;
    const weekKey = getISOWeekId();
    const allData = currentUser.weeklyMissionsData || {};
    const weekData = allData[weekKey] || { progress: {}, claimed: {}, claimedBonus: false };
    const newProgress = { ...(weekData.progress || {}) };

    activeWeeklyMissions.forEach(m => {
      const matchCat = m.category ? m.category === categoryOrId : false;
      const matchId = m.id === categoryOrId;
      const matchKeyword = 
        (categoryOrId === 'quiz' && (m.title.toLowerCase().includes('quiz') || m.id === 'm-1')) ||
        (categoryOrId === 'spin' && (m.title.toLowerCase().includes('spin') || m.id === 'm-2')) ||
        (categoryOrId === 'game' && (m.title.toLowerCase().includes('challenge') || m.title.toLowerCase().includes('coding') || m.title.toLowerCase().includes('game') || m.id === 'm-3')) ||
        (categoryOrId === 'poll' && (m.title.toLowerCase().includes('poll') || m.id === 'm-4'));

      if (matchCat || matchId || matchKeyword) {
        newProgress[m.id] = (newProgress[m.id] || 0) + count;
      }
    });

    updateUserProfile({
      weeklyMissionsData: {
        ...allData,
        [weekKey]: {
          ...weekData,
          progress: newProgress
        }
      }
    });
  };

  // Claim Individual Mission Reward (Strictly enabled ONLY when user completed tasks!)
  const handleClaimMissionReward = (mission) => {
    const weekKey = getISOWeekId();
    const allData = currentUser?.weeklyMissionsData || {};
    const weekData = allData[weekKey] || { progress: {}, claimed: {}, claimedBonus: false };

    const userProg = weekData.progress?.[mission.id] || 0;
    if (userProg < mission.target) return; // Strict Lock
    if (weekData.claimed?.[mission.id]) return; // Already claimed

    const rewardXP = mission.reward || 50;

    updateUserProfile({
      funPoints: funPoints + rewardXP,
      weeklyMissionsData: {
        ...allData,
        [weekKey]: {
          ...weekData,
          claimed: {
            ...(weekData.claimed || {}),
            [mission.id]: true
          }
        }
      }
    });
  };

  // Claim Weekly Bonus (+200 XP)
  const handleClaimWeeklyBonus = () => {
    if (!areAllMissionsCompleted || isWeeklyBonusClaimed) return;
    const weekKey = getISOWeekId();
    const allData = currentUser?.weeklyMissionsData || {};
    const weekData = allData[weekKey] || { progress: {}, claimed: {}, claimedBonus: false };

    updateUserProfile({
      funPoints: funPoints + 200,
      weeklyMissionsData: {
        ...allData,
        [weekKey]: {
          ...weekData,
          claimedBonus: true
        }
      }
    });
  };

  // Admin Management Modal State inside BrainZone
  const [adminManagerOpen, setAdminManagerOpen] = useState(false);
  const [adminTab, setAdminTab] = useState('quiz'); // 'quiz' | 'guess' | 'bug' | 'polls'

  // Equipped Border details
  const currentBorderObj = PROFILE_BORDERS.find(b => b.id === equippedBorderId) || PROFILE_BORDERS[1];

  // Single Source of Truth Level & Progression Calculation (v5.0)
  const levelInfo = getLevelFromXP(funPoints);
  const {
    currentLevel,
    currentLevelTitle,
    xpIntoCurrentLevel,
    xpNeededForNextLevel,
    progressPercent,
    nextLevelReward,
    isMaxLevel
  } = levelInfo;

  // Current Daily Poll List (multi-question game support)
  const [currentPollIndex, setCurrentPollIndex] = useState(0);
  const [localVotedPolls, setLocalVotedPolls] = useState({});

  const defaultPollList = [
    {
      id: 'tot-1',
      question: 'Which backend tech stack do you prefer for high-scale web apps?',
      optionA: 'Node.js / Express 🚀',
      optionB: 'Python / FastAPI 🐍',
      votesA: 48,
      votesB: 36,
      category: 'Backend Dev'
    },
    {
      id: 'tot-2',
      question: 'Frontend Styling Philosophy:',
      optionA: 'Tailwind CSS Utility-First 🎨',
      optionB: 'Vanilla CSS / Custom Modules 💎',
      votesA: 72,
      votesB: 28,
      category: 'UI Engineering'
    },
    {
      id: 'tot-3',
      question: 'Ideal Database Choice for Social Media Platforms:',
      optionA: 'PostgreSQL Relational 🐘',
      optionB: 'MongoDB Document NoSQL 🍃',
      votesA: 55,
      votesB: 45,
      category: 'Database'
    },
    {
      id: 'tot-4',
      question: 'Primary Code Editor & Development IDE:',
      optionA: 'VS Code Studio 💻',
      optionB: 'JetBrains IntelliJ / Neovim ⚡',
      votesA: 84,
      votesB: 32,
      category: 'Developer Tools'
    }
  ];

  const activePollList = (thisOrThatPolls && thisOrThatPolls.length > 0) ? thisOrThatPolls : defaultPollList;
  const activePoll = activePollList[currentPollIndex] || activePollList[0];

  const userVotedStore = (typeof currentUser?.votedThisOrThatDates === 'object' && currentUser?.votedThisOrThatDates !== null)
    ? currentUser.votedThisOrThatDates
    : {};

  const mergedVotedPolls = { ...userVotedStore, ...localVotedPolls };

  const hasVotedActivePoll = Boolean(mergedVotedPolls[activePoll?.id]);
  const userVoteChoice = mergedVotedPolls[activePoll?.id];

  const totalPollVotes = (activePoll?.votesA || 0) + (activePoll?.votesB || 0);
  const percentA = totalPollVotes > 0 ? Math.round(((activePoll?.votesA || 0) / totalPollVotes) * 100) : 50;
  const percentB = 100 - percentA;

  const totalUserPollVotesCount = Object.keys(mergedVotedPolls || {}).length;

  // Handle Voting in This or That
  const handleVotePoll = (option) => {
    if (!activePoll || hasVotedActivePoll) return;
    
    // 1. Immediately update local state for instant re-render!
    const newVoted = { ...mergedVotedPolls, [activePoll.id]: option };
    setLocalVotedPolls(newVoted);

    // 2. Increment activePoll votes locally for immediate percentage calculation
    if (option === 'A') {
      activePoll.votesA = (activePoll.votesA || 0) + 1;
    } else if (option === 'B') {
      activePoll.votesB = (activePoll.votesB || 0) + 1;
    }

    // 3. Save to user profile & data store via completeBrainZoneChallenge
    if (typeof completeBrainZoneChallenge === 'function') {
      completeBrainZoneChallenge('Daily Poll', 25, { votedThisOrThatDates: newVoted });
    } else {
      updateUserProfile({
        votedThisOrThatDates: newVoted,
        funPoints: funPoints + 25
      });
    }

    recordMissionProgress('poll', 1);

    if (typeof voteThisOrThatPoll === 'function') {
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
      if (speedTypeModalOpen && !speedTypeFinished) {
        handleFinishSpeedType(speedTypeInput, true);
      }
    }
    return () => clearInterval(intervalId);
  }, [roundTimerActive, roundTimer, speedTypeModalOpen, speedTypeFinished, speedTypeInput, speedTypePrompt, speedTypeStartTime, roundTimerMax, gameDifficulty]);

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
    setRoundTimerActive(false);
    const timeSpent = (roundTimerMax || 180) - roundTimer;

    const result = processGameAttemptCompletion({
      gameId: 'tango',
      level: gameDifficulty,
      score: 100,
      maxScore: 100,
      timeTakenSec: timeSpent,
      accuracyPercent: 100,
      isPerfect: true,
      isFastSpeed: timeSpent < 60
    });

    if (result.isAlreadyCompleted) {
      setTangoFeedback({ success: true, msg: `🎉 Tango Grid Solved! (Practice Mode • Leaderboard Updated)` });
    } else {
      setTangoFeedback({ success: true, msg: `🎉 Perfect! Tango Grid Solved (+${result.earnedXp} XP)!` });
    }
    return true;
  };

  const handleFinishSpeedType = (overrideInput, isTimeUp = false) => {
    if (speedTypeFinished) return;
    setSpeedTypeFinished(true);
    setRoundTimerActive(false);

    const inputVal = overrideInput !== undefined ? overrideInput : speedTypeInput;
    const promptStr = speedTypePrompt?.snippet || '';

    let correctChars = 0;
    for (let i = 0; i < inputVal.length; i++) {
      if (inputVal[i] === promptStr[i]) correctChars++;
    }

    const typedLen = Math.max(1, inputVal.length);
    const acc = Math.round((correctChars / typedLen) * 100);
    const elapsedSeconds = isTimeUp
      ? (roundTimerMax || 60)
      : Math.max(1, (Date.now() - (speedTypeStartTime || Date.now())) / 1000);

    const calcWpm = Math.round((correctChars / 5) / (elapsedSeconds / 60));

    setSpeedTypeAccuracy(acc);
    setSpeedTypeWpm(calcWpm);

    processGameAttemptCompletion({
      gameId: 'type',
      level: gameDifficulty,
      score: calcWpm,
      maxScore: 100,
      timeTakenSec: Math.round(elapsedSeconds),
      accuracyPercent: acc,
      isPerfect: acc >= 100 && inputVal.length >= promptStr.length,
      isFastSpeed: calcWpm >= 60
    });
  };

  const start60SecChallenge = (diffLevel = gameDifficulty || 'intermediate') => {
    const allQuestions = (quizQuestions && quizQuestions.length > 0) ? quizQuestions : DAILY_QUIZ_QUESTIONS;
    const diffQuestions = allQuestions.filter(q => {
      if (diffLevel === 'beginner') return q.difficulty === 'beginner';
      if (diffLevel === 'advanced') return q.difficulty === 'advanced';
      return !q.difficulty || q.difficulty === 'intermediate';
    });
    
    // Build a pool prioritizing selected difficulty, capped at 15 unique questions max
    let pool = diffQuestions;
    if (pool.length < 15) {
      const remaining = allQuestions.filter(q => !pool.some(pq => pq.id === q.id));
      pool = [...pool, ...remaining];
    }
    // Take max 15 unique questions for this sprint session
    const shuffledPool = shuffleArray(pool).slice(0, 15);

    setChallengeQuizPool(shuffledPool);
    setChallengeIndex(0);
    setChallengeScore(0);
    setChallengeTimer(60);
    setChallengeFinished(false);
    setChallengeActive(true);
    setChallengeOpen(true);
  };

  const handleAnswerChallenge = (optionIndex) => {
    const pool = challengeQuizPool.length > 0 ? challengeQuizPool : ((quizQuestions && quizQuestions.length > 0) ? quizQuestions : DAILY_QUIZ_QUESTIONS);
    const currentQ = pool[challengeIndex];

    if (currentQ && optionIndex === currentQ.answer) {
      setChallengeScore(prev => prev + 1);
    }

    const nextIdx = challengeIndex + 1;
    const maxQuestions = Math.min(15, pool.length);

    if (nextIdx >= maxQuestions) {
      finishChallenge();
    } else {
      setChallengeIndex(nextIdx);
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

  // Universal Game Attempt & Reward Logic (No XP farming, per-difficulty single XP claim, practice replays)
  const processGameAttemptCompletion = ({
    gameId,
    level,
    score = 0,
    maxScore = 100,
    timeTakenSec = 0,
    accuracyPercent = 100,
    isPerfect = false,
    isFastSpeed = false
  }) => {
    const normGameId = (gameId === 'speedtype') ? 'type' : gameId;
    const levelKey = (level || gameDifficulty || 'intermediate').toLowerCase();

    const gameStats = currentUser?.gameStats || {};
    const gameData = gameStats[normGameId] || {};
    const completedMap = currentUser?.completedGameLevels?.[normGameId] || {};

    const isAlreadyCompleted = Boolean(
      gameData[`${levelKey}Completed`] || 
      completedMap[levelKey]
    );

    const baseLevelXp = levelKey === 'beginner' ? 80 : levelKey === 'intermediate' ? 120 : 160;

    let earnedXp = 0;
    let messages = [];

    // 1. XP AWARDED ONLY THE FIRST TIME A DIFFICULTY IS COMPLETED
    if (!isAlreadyCompleted) {
      earnedXp += baseLevelXp;
      messages.push(`+${baseLevelXp} XP (${levelKey.toUpperCase()} First Completion)`);
    } else {
      messages.push(`${levelKey.charAt(0).toUpperCase() + levelKey.slice(1)} already completed. Practice mode active. No additional level XP awarded.`);
    }

    // 2. DAILY FIRST PLAY BONUS (+10 XP)
    const todayStr = new Date().toISOString().split('T')[0];
    const dailyDates = gameData.dailyFirstPlayDates || {};
    if (dailyDates[todayStr] !== true) {
      earnedXp += 10;
      messages.push(`+10 XP (Daily First Play Bonus)`);
    }

    // 3. ONE-TIME SPECIAL BONUSES
    const unlockedBonuses = gameData.unlockedBonuses || {};
    let newUnlockedBonuses = { ...unlockedBonuses };

    if (isPerfect && !unlockedBonuses[`${levelKey}_perfect`]) {
      earnedXp += 25;
      newUnlockedBonuses[`${levelKey}_perfect`] = true;
      messages.push(`+25 XP (One-time Perfect Score Bonus)`);
    }

    if (isFastSpeed && !unlockedBonuses[`${levelKey}_speed`]) {
      earnedXp += 20;
      newUnlockedBonuses[`${levelKey}_speed`] = true;
      messages.push(`+20 XP (One-time Speed Bonus)`);
    }

    if (!isAlreadyCompleted && !unlockedBonuses[`${levelKey}_firstTry`]) {
      earnedXp += 30;
      newUnlockedBonuses[`${levelKey}_firstTry`] = true;
      messages.push(`+30 XP (One-time First Try Bonus)`);
    }

    // 4. UPDATE BEST STATS & LEADERBOARD SCORE
    const capKey = levelKey.charAt(0).toUpperCase() + levelKey.slice(1);
    const prevBestScore = Number(gameData[`best${capKey}Score`] || 0);
    const prevBestTime = Number(gameData[`best${capKey}Time`] || 9999);
    const prevBestAccuracy = Number(gameData[`best${capKey}Accuracy`] || 0);
    const prevAttempts = Number(gameData[`attempts${capKey}`] || 0);

    const newBestScore = Math.max(prevBestScore, score);
    const newBestTime = (timeTakenSec > 0) ? Math.min(prevBestTime, timeTakenSec) : (prevBestTime < 9999 ? prevBestTime : timeTakenSec);
    const newBestAccuracy = Math.max(prevBestAccuracy, accuracyPercent);

    const updatedGameData = {
      ...gameData,
      gameId: normGameId,
      [`${levelKey}Completed`]: true,
      [`best${capKey}Score`]: newBestScore,
      [`best${capKey}Time`]: newBestTime < 9999 ? newBestTime : timeTakenSec,
      [`best${capKey}Accuracy`]: newBestAccuracy,
      [`attempts${capKey}`]: prevAttempts + 1,
      lastPlayed: new Date().toISOString(),
      completedDates: {
        ...(gameData.completedDates || {}),
        [levelKey]: gameData.completedDates?.[levelKey] || todayStr
      },
      dailyFirstPlayDates: {
        ...dailyDates,
        [todayStr]: true
      },
      unlockedBonuses: newUnlockedBonuses
    };

    const updatedCompletedMap = {
      ...(currentUser?.completedGameLevels || {}),
      [normGameId]: {
        ...(currentUser?.completedGameLevels?.[normGameId] || {}),
        [levelKey]: true
      }
    };

    const challengeLabel = normGameId === 'quiz' ? 'Quick Quiz' : normGameId === 'type' ? 'Speed Typing' : `${normGameId.toUpperCase()} Challenge`;

    if (typeof completeBrainZoneChallenge === 'function') {
      completeBrainZoneChallenge(challengeLabel, earnedXp, {
        gameStats: {
          ...gameStats,
          [normGameId]: updatedGameData
        },
        completedGameLevels: updatedCompletedMap
      });
    } else {
      updateUserProfile({
        gameStats: {
          ...gameStats,
          [normGameId]: updatedGameData
        },
        completedGameLevels: updatedCompletedMap,
        addXp: earnedXp
      });
    }
    recordMissionProgress(normGameId === 'quiz' ? 'quiz' : 'game', 1);

    return {
      earnedXp,
      isAlreadyCompleted,
      messages,
      levelKey,
      score,
      timeTakenSec,
      accuracyPercent,
      isNewBestScore: score > prevBestScore,
      isNewBestTime: timeTakenSec < prevBestTime
    };
  };

  const renderGameCardProgress = (gId) => {
    const normId = (gId === 'speedtype') ? 'type' : gId;
    const gameStats = currentUser?.gameStats || {};
    const gameData = gameStats[normId] || {};
    const completedMap = currentUser?.completedGameLevels?.[normId] || {};

    const bComp = Boolean(gameData.beginnerCompleted || completedMap.beginner);
    const iComp = Boolean(gameData.intermediateCompleted || completedMap.intermediate);
    const aComp = Boolean(gameData.advancedCompleted || completedMap.advanced);

    const completedCount = (bComp ? 1 : 0) + (iComp ? 1 : 0) + (aComp ? 1 : 0);

    return (
      <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
          <span className="uppercase tracking-wider text-[10px] text-slate-400">Difficulty Progress</span>
          <span className="text-amber-400 font-mono font-extrabold">{completedCount}/3 Completed</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
          <div className={`p-1.5 rounded-xl border flex flex-col items-center justify-center text-center ${
            bComp ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'
          }`}>
            <span>🟢 Beginner</span>
            <span className="text-[9px] font-extrabold">{bComp ? '✓ Done' : 'XP Available'}</span>
          </div>

          <div className={`p-1.5 rounded-xl border flex flex-col items-center justify-center text-center ${
            iComp ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'
          }`}>
            <span>🟡 Intermed</span>
            <span className="text-[9px] font-extrabold">{iComp ? '✓ Done' : 'XP Available'}</span>
          </div>

          <div className={`p-1.5 rounded-xl border flex flex-col items-center justify-center text-center ${
            aComp ? 'bg-rose-500/15 border-rose-500/40 text-rose-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'
          }`}>
            <span>🔴 Advanced</span>
            <span className="text-[9px] font-extrabold">{aComp ? '✓ Done' : 'XP Available'}</span>
          </div>
        </div>
      </div>
    );
  };

  const finishChallenge = () => {
    setChallengeFinished(true);
    setChallengeActive(false);

    const accuracy = Math.round((challengeScore / Math.max(1, challengeIndex + 1)) * 100);
    const timeSpent = 60 - challengeTimer;

    processGameAttemptCompletion({
      gameId: '60sec',
      level: gameDifficulty,
      score: challengeScore * 10,
      maxScore: 150,
      timeTakenSec: timeSpent,
      accuracyPercent: accuracy,
      isPerfect: challengeScore >= 15,
      isFastSpeed: challengeTimer > 20
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
    recordMissionProgress('spin', 1);

    setTimeout(() => {
      setIsSpinning(false);
      setSpinResult(winningSeg.banner);

      const nextProfile = {
        lastSpinDate: todayDateStr
      };

      const triggerSpinComplete = (earnedXp = 0, extraFields = {}) => {
        if (typeof completeBrainZoneChallenge === 'function') {
          completeBrainZoneChallenge('Spin & Learn', earnedXp, { ...nextProfile, ...extraFields });
        } else {
          updateUserProfile({ ...nextProfile, ...extraFields, funPoints: funPoints + earnedXp });
        }
      };

      if (winningSeg.id === '10xp' || winningSeg.id === '25xp' || winningSeg.id === 'badge') {
        triggerSpinComplete(winningSeg.xp);
      } else if (winningSeg.id === 'fact') {
        triggerSpinComplete(15);
        const factList = (itFacts && itFacts.length > 0) ? itFacts : [{ fact: "First electronic computer ENIAC weighed 27 tons!", category: "CS History" }];
        const randomFact = factList[Math.floor(Math.random() * factList.length)];
        setSpinFactData(randomFact);
        setSpinFactModalOpen(true);
      } else if (winningSeg.id === 'quiz') {
        triggerSpinComplete(0);
        const qList = (quizQuestions && quizQuestions.length > 0) ? quizQuestions : DAILY_QUIZ_QUESTIONS;
        const randomQ = qList[Math.floor(Math.random() * qList.length)];
        setSpinQuizQ(randomQ);
        setSpinQuizSelectedOpt(null);
        setSpinQuizAnswered(false);
        setSpinQuizModalOpen(true);
      } else if (winningSeg.id === 'mystery') {
        const pool = (mysteryRewards && mysteryRewards.length > 0) ? mysteryRewards : [
          { id: 'mr-1', title: '+150 Super XP Bonus', rewardType: 'xp', value: 150 },
          { id: 'mr-2', title: 'Golden Legend Border', rewardType: 'cosmetic', value: 'golden_legend' },
          { id: 'mr-3', title: '1x Streak Shield', rewardType: 'shield', value: 1 }
        ];
        const loot = pool[Math.floor(Math.random() * pool.length)];

        let bonusXp = 0;
        const extraData = {};

        if (loot.rewardType === 'xp') {
          bonusXp = Number(loot.value);
        } else if (loot.rewardType === 'cosmetic') {
          const unlockedBorders = currentUser?.unlockedBorderIds || ['default', 'cyber_neon'];
          if (!unlockedBorders.includes(loot.value)) {
            extraData.unlockedBorderIds = [...unlockedBorders, loot.value];
          }
        }
        triggerSpinComplete(bonusXp, extraData);
        setSpinResult(`🎁 Mystery Loot: ${loot.title}!`);
      }
    }, 3600);
  };

  // Guess Output Challenge list
  const guessList = (guessOutputChallenges && guessOutputChallenges.length > 0) ? guessOutputChallenges : GUESS_OUTPUT_CHALLENGES;

  // Find Bug Challenge list
  const bugList = (findBugChallenges && findBugChallenges.length > 0) ? findBugChallenges : FIND_BUG_CHALLENGES;

  // Error Code Guessing list
  const ecgList = (ecgChallenges && ecgChallenges.length > 0) ? ecgChallenges : ECG_CHALLENGES;

  // Tango Logic Grid list
  const tangoList = (tangoPuzzles && tangoPuzzles.length > 0) ? tangoPuzzles : TANGO_PUZZLES;

  // Speed Type Prompt list
  const typeList = (speedTypePrompts && speedTypePrompts.length > 0) ? speedTypePrompts : SPEED_TYPE_PROMPTS;

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
    <BrainZoneErrorBoundary>
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
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <div className="px-3.5 py-2 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center space-x-2 text-xs font-bold text-purple-300 shadow-md shadow-purple-500/10">
              <Award className="w-4 h-4 text-purple-400" />
              <span>Level {currentLevel} • {currentLevelTitle}</span>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center space-x-2 text-xs font-bold">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-white">{funPoints} XP</span>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center space-x-2 text-xs font-bold text-rose-400">
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
                  Answer up to 15 rapid-fire questions in 60 seconds. Faster accuracy earns bonus multiplier XP!
                </p>
              </div>

              {renderGameCardProgress('60sec')}

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
                  description: 'Answer as many rapid questions as possible in 60 seconds. Select difficulty level for higher XP multipliers!',
                  baseXp: 150,
                  onStart: (diff) => {
                    start60SecChallenge(diff);
                  }
                })}
                className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:opacity-90 text-white shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Start Sprint Challenge</span>
              </button>
            </div>

            {/* CARD 3: 🗳️ THIS OR THAT (MULTI-QUESTION DAILY POLL GAME) */}
            <div className="glass-card rounded-3xl p-6 border border-amber-500/30 bg-gradient-to-b from-amber-950/30 via-slate-950 to-slate-950 space-y-4 relative overflow-hidden flex flex-col justify-between group hover:border-amber-500/60 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Poll Q{currentPollIndex + 1} of {activePollList.length}
                    </span>
                    {activePoll?.category && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-900 text-slate-400 border border-slate-800">
                        {activePoll.category}
                      </span>
                    )}
                  </div>

                  {/* Question Navigation Arrows */}
                  <div className="flex items-center space-x-1">
                    <button
                      disabled={currentPollIndex === 0}
                      onClick={() => setCurrentPollIndex(prev => Math.max(0, prev - 1))}
                      className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 transition-colors"
                      title="Previous Question"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      disabled={currentPollIndex >= activePollList.length - 1}
                      onClick={() => setCurrentPollIndex(prev => Math.min(activePollList.length - 1, prev + 1))}
                      className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 transition-colors"
                      title="Next Question"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-extrabold text-white flex items-center justify-between">
                  <span>🗳️ This or That</span>
                  <span className="text-xs text-amber-400 font-mono font-bold">
                    {hasVotedActivePoll ? `✓ Voted` : `+25 XP`}
                  </span>
                </h3>
                
                <p className="text-xs text-slate-300 leading-relaxed font-medium min-h-[36px]">
                  "{activePoll?.question || 'Which tech stack do you prefer?'}"
                </p>
              </div>

              <div className="space-y-3 my-1">
                {!hasVotedActivePoll ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVotePoll('A');
                        }}
                        className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/60 hover:bg-amber-500/10 text-xs font-bold text-slate-200 hover:text-white transition-all text-center flex items-center justify-center cursor-pointer active:scale-95 shadow-md hover:shadow-amber-500/10"
                      >
                        <span className="text-white font-extrabold text-sm">{activePoll?.optionA}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVotePoll('B');
                        }}
                        className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/60 hover:bg-cyan-500/10 text-xs font-bold text-slate-200 hover:text-white transition-all text-center flex items-center justify-center cursor-pointer active:scale-95 shadow-md hover:shadow-cyan-500/10"
                      >
                        <span className="text-white font-extrabold text-sm">{activePoll?.optionB}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 animate-in fade-in">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-amber-300">
                        <span>{activePoll?.optionA} {userVoteChoice === 'A' ? '✓ Your Choice' : ''}</span>
                        <span>{activePoll?.votesA || 0} votes ({percentA}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500" style={{ width: `${percentA}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-cyan-300">
                        <span>{activePoll?.optionB} {userVoteChoice === 'B' ? '✓ Your Choice' : ''}</span>
                        <span>{activePoll?.votesB || 0} votes ({percentB}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-500" style={{ width: `${percentB}%` }} />
                      </div>
                    </div>

                    {currentPollIndex < activePollList.length - 1 && (
                      <button
                        onClick={() => setCurrentPollIndex(prev => prev + 1)}
                        className="w-full py-1.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all mt-1"
                      >
                        <span>Next Question ({currentPollIndex + 2}/{activePollList.length})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-between border-t border-slate-800/80 pt-2">
                <span>Voted: {totalUserPollVotesCount} / {activePollList.length} Polls</span>
                <span className="text-amber-400 font-bold">
                  {hasVotedActivePoll ? `✓ +25 XP Awarded` : `Vote to reveal %`}
                </span>
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

              {renderGameCardProgress('quiz')}

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

              {renderGameCardProgress('guess')}

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
                    const filtered = guessList.filter(g => g.difficulty === diff);
                    const questions = shuffleArray(filtered.length > 0 ? filtered : guessList);
                    setActiveGuessList(questions);
                    setGuessIndex(0);
                    setGuessScore(0);
                    setGuessSelectedOpt(null);
                    setGuessSubmitted(false);
                    setGuessFinished(false);
                    const secs = diff === 'beginner' ? 60 : diff === 'advanced' ? 120 : 90;
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

              {renderGameCardProgress('bug')}

              <div className="my-2 p-3 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[11px] text-rose-300 space-y-1">
                <div className="text-[9px] text-slate-500 font-sans uppercase">Bug Hunt Preview</div>
                <code>{bugList[0].code.split('\n')[0]}</code>
              </div>

              <button
                onClick={() => triggerDifficultySelector({
                  gameId: 'bug',
                  title: 'Find the Bug',
                  icon: '🐞',
                  description: 'Spot syntax errors, infinite loops, and logical bugs. Choose difficulty level for higher XP rewards!',
                  baseXp: 90,
                  onStart: (diff) => {
                    const filtered = bugList.filter(b => b.difficulty === diff);
                    const questions = shuffleArray(filtered.length > 0 ? filtered : bugList);
                    setActiveBugList(questions);
                    setBugIndex(0);
                    setBugScore(0);
                    setBugSelectedOpt(null);
                    setBugSubmitted(false);
                    setBugFinished(false);
                    const secs = diff === 'beginner' ? 60 : diff === 'advanced' ? 120 : 90;
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
                  <span className="text-[10px] text-slate-400 font-semibold">{ecgList.length} Codes</span>
                </div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span>⚡ ECG (Error Code Guessing)</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Identify HTTP status codes, Linux system signals, and database error messages!
                </p>
              </div>

              {renderGameCardProgress('ecg')}

              <div className="my-2 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center font-mono text-lg font-black text-emerald-400">
                HTTP {ecgList[0]?.code || '404'}
              </div>

              <button
                onClick={() => triggerDifficultySelector({
                  gameId: 'ecg',
                  title: 'Error Code Guessing (ECG)',
                  icon: '⚡',
                  description: 'Guess HTTP codes and system error messages across Beginner, Intermediate, or Advanced levels!',
                  baseXp: 70,
                  onStart: (diff) => {
                    const filtered = ecgList.filter(c => c.difficulty === diff);
                    const questions = shuffleArray(filtered.length > 0 ? filtered : ecgList);
                    setActiveEcgList(questions);
                    setEcgIndex(0);
                    setEcgScore(0);
                    setEcgSelectedOpt(null);
                    setEcgSubmitted(false);
                    setEcgFinished(false);
                    const secs = diff === 'beginner' ? 60 : diff === 'advanced' ? 120 : 90;
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
                  <span className="text-[10px] text-slate-400 font-semibold">{tangoList.length} Grids</span>
                </div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span>🧩 Tango Logic Grid</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Fill grid rows and columns with equal counts of Sun ☀️ and Moon 🌙 symbols!
                </p>
              </div>

              {renderGameCardProgress('tango')}

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
                    const puzzle = tangoList.find(p => p.difficulty === diff) || tangoList[0];
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
                  <span className="text-[10px] text-slate-400 font-semibold">{typeList.length} Prompts</span>
                </div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span>⌨️ Speed Type Challenge</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Type code syntax snippets with high accuracy and speed to earn WPM multiplier XP!
                </p>
              </div>

              {renderGameCardProgress('type')}

              <div className="my-2 p-3 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[11px] text-amber-300 line-clamp-1">
                <code>{typeList[0]?.snippet || 'console.log("Type fast!");'}</code>
              </div>

              <button
                onClick={() => triggerDifficultySelector({
                  gameId: 'speedtype',
                  title: 'Speed Type Challenge',
                  icon: '⌨️',
                  description: 'Type code snippets fast. Higher difficulty requires higher WPM targets and longer code snippets!',
                  baseXp: 90,
                  onStart: (diff) => {
                    const promptObj = typeList.find(p => p.difficulty === diff) || typeList[0];
                    setSpeedTypePrompt(promptObj);
                    setSpeedTypeInput('');
                    setSpeedTypeStartTime(null);
                    setSpeedTypeFinished(false);
                    setSpeedTypeWpm(0);
                    setSpeedTypeAccuracy(100);
                    const secs = diff === 'beginner' ? 60 : diff === 'advanced' ? 90 : 75;
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
      {/* SUB-GROUP TAB: ☕ LEARN JAVA ACADEMY */}
      {/* ========================================================================= */}
      {activeTab === 'learnjava' && (
        <div className="space-y-6 animate-in fade-in">
          <JavaLearningPage />
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
                  <h3 className="text-xl font-black text-white">
                    Level {currentLevel} — {currentLevelTitle}
                  </h3>
                </div>

                {currentLevel < 20 ? (
                  <>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-purple-300">Progress to Level {currentLevel + 1}</span>
                        <span className="text-slate-400 font-mono font-bold">{xpIntoCurrentLevel} / {xpNeededForNextLevel} XP</span>
                      </div>
                      <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-500 shadow-md shadow-purple-500/30" 
                          style={{ width: `${progressPercent}%` }} 
                        />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 leading-relaxed space-y-1">
                      <div className="font-extrabold text-purple-300 flex items-center space-x-1.5">
                        <span>🚀 Next Level Unlock</span>
                      </div>
                      <p className="text-xs text-slate-200 font-semibold">{nextLevelReward}</p>
                    </div>
                  </>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1 text-amber-300 font-extrabold text-sm animate-in zoom-in">
                    <span>🏆 Maximum Level Achieved</span>
                    <p className="text-xs text-slate-300 font-normal">You have reached the ultimate rank in IT Department Student Resource Hub!</p>
                  </div>
                )}
              </div>

              {/* 🔥 LEARNING STREAK CARD */}
              <div className="glass-card rounded-3xl p-6 border border-rose-500/30 bg-gradient-to-b from-rose-950/20 to-slate-950 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-rose-300 uppercase tracking-wider">Daily Activity Streak</span>
                  <Flame className="w-5 h-5 text-rose-400 fill-rose-400" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-black text-white">{currentStreak} Day Streak</h3>
                    <p className="text-xs text-rose-300/80 font-bold flex items-center gap-1 mt-0.5">
                      <span>🏆 Longest Streak: <strong>{longestStreak} Days</strong></span>
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-lg shadow-rose-500/20">
                    <Flame className="w-6 h-6 fill-rose-400 animate-bounce" />
                  </div>
                </div>

                {/* Dashboard Stats Row: Total Challenges & XP */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
                  <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">🎮 Total Challenges</span>
                    <span className="text-sm font-black text-cyan-300">{totalChallengesCompleted} Completed</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">⭐ Total XP</span>
                    <span className="text-sm font-black text-amber-300">{funPoints} XP</span>
                  </div>
                </div>

                {/* 7-Day Activity Calendar */}
                <div className="pt-2 border-t border-slate-800/80">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">7-Day Activity Tracker</p>
                  <div className="grid grid-cols-7 gap-1.5 text-center">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                      // Calculate date string for day of current week
                      const now = new Date();
                      const currentDayIdx = (now.getDay() + 6) % 7; // 0 for Mon, 6 for Sun
                      const dayOffset = i - currentDayIdx;
                      const targetDate = new Date();
                      targetDate.setDate(now.getDate() + dayOffset);
                      const dateStr = targetDate.toISOString().split('T')[0];

                      const isActiveDay = streakHistory.includes(dateStr) || (i <= currentDayIdx && (currentDayIdx - i) < currentStreak);
                      return (
                        <div key={day} className="space-y-1">
                          <div className={`h-9 rounded-xl flex items-center justify-center text-xs font-bold border transition-all ${
                            isActiveDay ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-md shadow-rose-500/10' : 'bg-slate-950 border-slate-800 text-slate-600'
                          }`}>
                            {isActiveDay ? <Flame className="w-4 h-4 fill-rose-400" /> : '•'}
                          </div>
                          <span className="text-[9px] text-slate-500 font-medium">{day}</span>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <Target className="w-5 h-5 text-emerald-400" />
                      <span>Weekly Missions</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-slate-400 border border-slate-800">
                        {currentWeekBatch}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">Complete tasks to unlock claimable rewards. Resets every week!</p>
                  </div>

                  <button
                    disabled={!areAllMissionsCompleted || isWeeklyBonusClaimed}
                    onClick={handleClaimWeeklyBonus}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap ${
                      isWeeklyBonusClaimed
                        ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                        : areAllMissionsCompleted
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black shadow-lg shadow-emerald-500/30 animate-pulse'
                        : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${areAllMissionsCompleted && !isWeeklyBonusClaimed ? 'fill-slate-950' : 'text-slate-500'}`} />
                    <span>
                      {isWeeklyBonusClaimed
                        ? '✓ Bonus Claimed (+200 XP)'
                        : areAllMissionsCompleted
                        ? 'Claim Weekly Bonus (+200 XP)'
                        : 'Complete All Missions for Bonus (+200 XP)'}
                    </span>
                  </button>
                </div>

                <div className="space-y-3">
                  {activeWeeklyMissions.map(m => {
                    const userProg = currentMissionProgress[m.id] || 0;
                    const isCompleted = userProg >= m.target;
                    const isClaimed = Boolean(currentMissionClaimed[m.id]);

                    return (
                      <div key={m.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${isCompleted ? 'text-emerald-400' : 'text-slate-600'}`} />
                            <span className="font-bold text-white">{m.title}</span>
                          </div>

                          <div className="flex items-center space-x-3 self-start sm:self-auto">
                            <span className="text-slate-400 font-mono font-bold text-[11px]">
                              {Math.min(userProg, m.target)} / {m.target} Completed
                            </span>

                            {isClaimed ? (
                              <button
                                disabled
                                className="px-3 py-1 rounded-lg text-[11px] font-bold bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed"
                              >
                                ✓ Claimed (+{m.reward || 50} XP)
                              </button>
                            ) : isCompleted ? (
                              <button
                                onClick={() => handleClaimMissionReward(m)}
                                className="px-3 py-1 rounded-lg text-[11px] font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 animate-pulse transition-all"
                              >
                                Claim +{m.reward || 50} XP
                              </button>
                            ) : (
                              <span className="px-3 py-1 rounded-lg text-[11px] font-semibold bg-slate-900 text-slate-500 border border-slate-800/80">
                                In Progress
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isCompleted
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                            }`}
                            style={{ width: `${Math.min(100, (userProg / m.target) * 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 🏅 BADGES & ACHIEVEMENTS */}
              <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
                <h3 className="text-base font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>Badges & Achievements</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {activeBadges.map((b, i) => {
                    const isUnlocked = userBadges.includes(b.id) || i < 2;
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

              {/* 🎮 GAME MASTERY & PER-DIFFICULTY STATS (PER USER) */}
              <div className="glass-card rounded-3xl p-6 border border-indigo-500/30 bg-gradient-to-b from-indigo-950/20 to-slate-950 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <Gamepad2 className="w-5 h-5 text-indigo-400" />
                      <span>Game Mastery & Difficulty Stats</span>
                    </h3>
                    <p className="text-xs text-slate-400">Track per-difficulty completion, best scores, accuracy & completion times</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: '60sec', name: '60-Second Challenge', icon: '⏱️' },
                    { id: 'quiz', name: 'Quick Quiz', icon: '🧠' },
                    { id: 'guess', name: 'Guess the Output', icon: '💻' },
                    { id: 'bug', name: 'Find the Bug', icon: '🐞' },
                    { id: 'ecg', name: 'Error Code Guessing (ECG)', icon: '⚡' },
                    { id: 'tango', name: 'Tango Logic Grid', icon: '🧩' },
                    { id: 'type', name: 'Speed Type Challenge', icon: '⌨️' }
                  ].map(g => {
                    const gStats = currentUser?.gameStats?.[g.id] || {};
                    const cMap = currentUser?.completedGameLevels?.[g.id] || {};

                    const bDone = Boolean(gStats.beginnerCompleted || cMap.beginner);
                    const iDone = Boolean(gStats.intermediateCompleted || cMap.intermediate);
                    const aDone = Boolean(gStats.advancedCompleted || cMap.advanced);

                    const bScore = gStats.bestBeginnerScore || 0;
                    const iScore = gStats.bestIntermediateScore || 0;
                    const aScore = gStats.bestAdvancedScore || 0;

                    const bTime = gStats.bestBeginnerTime ? `${gStats.bestBeginnerTime}s` : '--';
                    const iTime = gStats.bestIntermediateTime ? `${gStats.bestIntermediateTime}s` : '--';
                    const aTime = gStats.bestAdvancedTime ? `${gStats.bestAdvancedTime}s` : '--';

                    const totalAttempts = (gStats.attemptsBeginner || 0) + (gStats.attemptsIntermediate || 0) + (gStats.attemptsAdvanced || 0);

                    return (
                      <div key={g.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-white text-xs flex items-center gap-2">
                            <span>{g.icon}</span>
                            <span>{g.name}</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Attempts: <strong className="text-amber-400">{totalAttempts}</strong>
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-[10px]">
                          <div className={`p-2 rounded-xl border text-center space-y-1 ${bDone ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                            <div className="font-bold flex items-center justify-center gap-1">
                              <span>🟢</span>
                              <span>{bDone ? '✓ Done' : 'Beginner'}</span>
                            </div>
                            <p className="text-[9px] text-slate-300">Best: {bScore} pts</p>
                            <p className="text-[9px] text-slate-400">Time: {bTime}</p>
                          </div>

                          <div className={`p-2 rounded-xl border text-center space-y-1 ${iDone ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                            <div className="font-bold flex items-center justify-center gap-1">
                              <span>🟡</span>
                              <span>{iDone ? '✓ Done' : 'Intermed'}</span>
                            </div>
                            <p className="text-[9px] text-slate-300">Best: {iScore} pts</p>
                            <p className="text-[9px] text-slate-400">Time: {iTime}</p>
                          </div>

                          <div className={`p-2 rounded-xl border text-center space-y-1 ${aDone ? 'bg-rose-500/10 border-rose-500/40 text-rose-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                            <div className="font-bold flex items-center justify-center gap-1">
                              <span>🔴</span>
                              <span>{aDone ? '✓ Done' : 'Advanced'}</span>
                            </div>
                            <p className="text-[9px] text-slate-300">Best: {aScore} pts</p>
                            <p className="text-[9px] text-slate-400">Time: {aTime}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: 🏆 LEADERBOARD CONTROL CENTER */}
      {/* ========================================================================= */}
      {activeTab === 'leaderboard' && (() => {
        // Pre-process roster with derived stats & ranks
        const enrichedRoster = activeUserRoster.map((u, idx) => {
          const funP = u.funPoints || 300;
          const wXp = u.weeklyXp || Math.floor(funP * 0.38);
          const mXp = u.monthlyXp || Math.floor(funP * 0.82);
          const lvlInfo = getLevelFromXP(funP);
          const lvl = lvlInfo.currentLevel;
          const curInLvl = lvlInfo.xpIntoCurrentLevel;
          const targetInLvl = lvlInfo.xpNeededForNextLevel;
          const move = idx === 0 ? '↑ +3' : idx === 1 ? '↑ +1' : idx === 2 ? '→' : idx === 3 ? '↓ -1' : idx === 4 ? '↓ -2' : 'NEW';
          const badgeList = [
            funP > 1200 ? '👑 BrainZone Legend' : null,
            funP > 1000 ? '🏆 Champion' : null,
            lvl >= 6 ? '⚡ Speed Demon' : null,
            (u.streak || 1) >= 7 ? '🔥 Streak Master' : null,
            '🧠 Quiz Master'
          ].filter(Boolean);

          return {
            ...u,
            funPoints: funP,
            weeklyXp: wXp,
            monthlyXp: mXp,
            level: lvl,
            xpInLevel: curInLvl,
            xpTarget: targetInLvl,
            rankChange: move,
            earnedBadges: badgeList,
            highestRank: `#${Math.max(1, idx)}`,
            highestWeeklyRank: `#${Math.max(1, idx)}`,
            highestMonthlyRank: `#${Math.max(1, idx)}`,
            highestXp: funP + 180,
            longestStreak: (u.streak || 1) + 4,
            accuracyPercent: Math.min(99, 82 + (idx * 3 % 15)) + '%',
            challengesSolved: 24 + (idx * 5)
          };
        });

        // 1. Department Sort (Total XP)
        const sortedDept = [...enrichedRoster].sort((a, b) => b.funPoints - a.funPoints);
        
        // 2. Weekly Sort
        const sortedWeekly = [...enrichedRoster].sort((a, b) => b.weeklyXp - a.weeklyXp);

        // 3. Monthly Sort
        const sortedMonthly = [...enrichedRoster].sort((a, b) => b.monthlyXp - a.monthlyXp);

        // Active List based on Tab Selection
        let currentSortList = sortedDept;
        if (lbActiveTab === 'weekly') currentSortList = sortedWeekly;
        if (lbActiveTab === 'monthly') currentSortList = sortedMonthly;

        // Filter Logic
        const filteredList = currentSortList.filter(u => {
          if (lbSearchQuery.trim()) {
            const q = lbSearchQuery.toLowerCase().trim();
            const nMatch = (u.name || '').toLowerCase().includes(q);
            const rMatch = (u.registerNumber || '').toLowerCase().includes(q);
            if (!nMatch && !rMatch) return false;
          }
          if (lbYearFilter !== 'All') {
            const yStr = (u.year || '3rd Year').toLowerCase();
            const targetY = lbYearFilter.toLowerCase().replace('year', '').trim();
            if (!yStr.includes(targetY)) return false;
          }
          if (lbSectionFilter !== 'All') {
            const sStr = (u.classSection || 'IT-A').toUpperCase();
            if (sStr !== lbSectionFilter) return false;
          }
          return true;
        });

        // Current User Position calculation
        const userDeptIndex = sortedDept.findIndex(u => 
          (currentUser && u.uid === currentUser.uid) || 
          (currentUser && u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase()) ||
          (currentUser && u.name && currentUser.name && u.name.toLowerCase() === currentUser.name.toLowerCase())
        );
        const userDeptRank = userDeptIndex !== -1 ? userDeptIndex + 1 : 1;
        const userAboveXp = userDeptIndex > 0 ? (sortedDept[userDeptIndex - 1].funPoints - (currentUser?.funPoints || funPoints)) + 15 : 0;

        const userWeeklyIndex = sortedWeekly.findIndex(u => 
          (currentUser && u.uid === currentUser.uid) || 
          (currentUser && u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase()) ||
          (currentUser && u.name && currentUser.name && u.name.toLowerCase() === currentUser.name.toLowerCase())
        );
        const userWeeklyRank = userWeeklyIndex !== -1 ? userWeeklyIndex + 1 : 1;

        const userMonthlyIndex = sortedMonthly.findIndex(u => 
          (currentUser && u.uid === currentUser.uid) || 
          (currentUser && u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase()) ||
          (currentUser && u.name && currentUser.name && u.name.toLowerCase() === currentUser.name.toLowerCase())
        );
        const userMonthlyRank = userMonthlyIndex !== -1 ? userMonthlyIndex + 1 : 1;

        // Overall Department Statistics
        const totalDeptPlayers = enrichedRoster.length;
        const totalDeptXp = enrichedRoster.reduce((sum, u) => sum + u.funPoints, 0);
        const avgDeptXp = Math.round(totalDeptXp / Math.max(1, totalDeptPlayers));
        const maxDeptStreak = Math.max(...enrichedRoster.map(u => u.streak || 1));
        const totalChallengesCount = enrichedRoster.reduce((sum, u) => sum + u.challengesSolved, 0);

        // Class vs Class Data
        const allSections = ['IT-A', 'IT-B', 'IT-C'];
        const classStatsMap = allSections.map(sec => {
          const secStudents = enrichedRoster.filter(u => (u.classSection || 'IT-A').toUpperCase() === sec);
          const tXp = secStudents.reduce((acc, u) => acc + u.funPoints, 0);
          const sCount = secStudents.length || 1;
          const aXp = Math.round(tXp / sCount);
          const topSt = secStudents.sort((a, b) => b.funPoints - a.funPoints)[0] || { name: 'N/A' };

          return {
            section: sec,
            totalXp: tXp,
            studentCount: secStudents.length,
            avgXp: aXp,
            topStudent: topSt.name,
            students: secStudents
          };
        }).sort((a, b) => b.totalXp - a.totalXp);

        // Live Feed Ticker Mock Items
        const liveFeedItems = [
          { id: 1, user: 'Hari', action: 'completed Bug Hunt Sprint', xp: '+80 XP', time: '2m ago', icon: '🐞' },
          { id: 2, user: 'Priya Sharma', action: 'reached Level 12', xp: 'New Badge', time: '5m ago', icon: '⭐' },
          { id: 3, user: 'Alex Morgan', action: 'achieved 14-Day Streak', xp: '+150 XP', time: '12m ago', icon: '🔥' },
          { id: 4, user: 'Section IT-A', action: 'moved to 1st Place in Class vs Class', xp: 'Top Class', time: '18m ago', icon: '🏫' }
        ];

        return (
          <div className="space-y-6 animate-in fade-in transition-all duration-300">
            
            {/* ========================================================================= */}
            {/* 1. TOP HEADER & NAVIGATION TAB BUTTONS */}
            {/* ========================================================================= */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center space-x-2">
                    <Trophy className="w-6 h-6 text-amber-400" />
                    <span>BrainZone Department Leaderboard</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time rankings calculated live from student XP points, daily quiz streaks, and coding challenges
                  </p>
                </div>

                {/* 4 TAB SWITCHER BUTTONS */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { id: 'department', label: '🏢 Department', desc: 'Wall of Honor' },
                    { id: 'weekly', label: '⚡ Weekly', desc: 'Weekly Sprint' },
                    { id: 'monthly', label: '🌙 Monthly', desc: 'Monthly Race' },
                    { id: 'class', label: '🏫 Class vs Class', desc: 'Section Warfare' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setLbActiveTab(tab.id)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                        lbActiveTab === tab.id
                          ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 scale-[1.02]'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* TOP STATISTICS CARDS (5 CARDS) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Active Players</span>
                  </span>
                  <p className="text-lg font-black text-white">{totalDeptPlayers}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Total XP Earned</span>
                  </span>
                  <p className="text-lg font-black text-amber-300">{totalDeptXp.toLocaleString()} XP</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
                    <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Average XP</span>
                  </span>
                  <p className="text-lg font-black text-indigo-300">{avgDeptXp.toLocaleString()} XP</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
                    <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    <span>Highest Streak</span>
                  </span>
                  <p className="text-lg font-black text-rose-400">🔥 {maxDeptStreak} Days</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Challenges Solved</span>
                  </span>
                  <p className="text-lg font-black text-emerald-400">{totalChallengesCount}</p>
                </div>
              </div>

              {/* LIVE ACTIVITY TICKER */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center space-x-3 text-xs overflow-x-auto">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1 flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live Feed</span>
                </span>
                <div className="flex items-center space-x-6 text-slate-300 font-medium whitespace-nowrap">
                  {liveFeedItems.map(item => (
                    <span key={item.id} className="flex items-center space-x-1.5">
                      <span>{item.icon}</span>
                      <strong className="text-white">{item.user}</strong>
                      <span className="text-slate-400">{item.action}</span>
                      <span className="text-amber-400 font-bold">{item.xp}</span>
                      <span className="text-[10px] text-slate-500">({item.time})</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 2. STICKY YOUR POSITION CARD */}
            {/* ========================================================================= */}
            <div className="sticky top-20 z-30 glass-card rounded-3xl p-5 border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-950 space-y-3 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-lg shadow-inner">
                    #{lbActiveTab === 'weekly' ? userWeeklyRank : lbActiveTab === 'monthly' ? userMonthlyRank : userDeptRank}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                      Your Position ({lbActiveTab.toUpperCase()} LEADERBOARD)
                    </span>
                    <h4 className="text-base font-black text-white flex items-center space-x-2 flex-wrap">
                      <span>{currentUser?.name || 'Alex Student'} ({currentUser?.classSection || 'IT-A'})</span>
                      {(() => {
                        const myT = getTitleObj(equippedTitleId);
                        return myT ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${myT.badgeBg}`}>
                            🏷️ {myT.title}
                          </span>
                        ) : null;
                      })()}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs font-bold self-end sm:self-auto">
                  <div className="text-right">
                    <p className="text-base font-black text-amber-300">{funPoints} Total XP</p>
                    <p className="text-[10px] text-slate-400">
                      {userAboveXp > 0 ? `Need ${userAboveXp} XP to reach Rank #${userDeptRank - 1}` : '👑 Grand Champion #1'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Player History Badges Bar */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium text-slate-300">
                <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                  <span>🏆 Best Rank: <strong className="text-white">#{userDeptRank}</strong></span>
                  <span>⚡ Weekly: <strong className="text-amber-300">{Math.floor(funPoints * 0.35)} XP</strong></span>
                  <span>🌙 Monthly: <strong className="text-indigo-300">{Math.floor(funPoints * 0.78)} XP</strong></span>
                  <span>🔥 Longest Streak: <strong className="text-rose-400">{streak + 4}d</strong></span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Rank Updates Live</span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* TAB VIEW 1: 🏢 DEPARTMENT LEADERBOARD (DEFAULT) */}
            {/* ========================================================================= */}
            {lbActiveTab === 'department' && (
              <div className="space-y-6 animate-in fade-in">
                
                {/* 👑 HALL OF FAME PODIUM CARD (ONLY ON DEFAULT DEPARTMENT TAB!) */}
                <div className="glass-card rounded-3xl p-6 border border-amber-500/40 bg-gradient-to-b from-amber-950/40 via-purple-950/20 to-slate-950 space-y-6 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                    <div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        👑 Department Wall of Honor
                      </span>
                      <h3 className="text-xl font-black text-white mt-1 flex items-center space-x-2">
                        <Crown className="w-6 h-6 text-amber-400" />
                        <span>BrainZone Hall of Fame</span>
                      </h3>
                    </div>
                  </div>

                  {/* Top 3 Hall of Fame Podium Display */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 🥈 2ND PLACE */}
                    {sortedDept[1] && (() => {
                      const u2 = sortedDept[1];
                      const b2 = getBorderObj(u2.equippedBorder || 'default');
                      const bg2 = getAvatarBgObj(u2.equippedAvatarBgId || 'bg_slate');
                      const t2 = getTitleObj(u2.equippedTitleId || 'title_novice');
                      return (
                        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex flex-col justify-between items-center text-center space-y-3 shadow-lg relative overflow-hidden group hover:border-slate-400 transition-all">
                          <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-slate-300 text-slate-950 flex items-center space-x-1">
                            <span>🥈 2nd Place</span>
                          </div>
                          <div className="pt-4">
                            <div className={`w-14 h-14 rounded-2xl p-0.5 border-2 ${b2.color} shadow-lg mx-auto`}>
                              {u2.avatar ? (
                                <img src={u2.avatar} alt={u2.name} className="w-full h-full rounded-[12px] object-cover" />
                              ) : (
                                <div className={`w-full h-full rounded-[12px] ${bg2.gradient} flex items-center justify-center font-black text-lg text-white`}>
                                  {u2.name?.charAt(0) || '2'}
                                </div>
                              )}
                            </div>
                            <h4 className="text-sm font-extrabold text-white mt-2">{u2.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold">{u2.classSection || 'IT-B'} • Level {u2.level}</p>
                          </div>
                          <div className="w-full pt-2 border-t border-slate-800 space-y-1">
                            <div className="text-xs font-black text-slate-200 font-mono">{u2.funPoints} XP</div>
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border ${t2.badgeBg}`}>
                              🏷️ {t2.title}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* 👑 1ST PLACE */}
                    {sortedDept[0] && (() => {
                      const u1 = sortedDept[0];
                      const b1 = getBorderObj(u1.equippedBorder || 'default');
                      const bg1 = getAvatarBgObj(u1.equippedAvatarBgId || 'bg_slate');
                      const t1 = getTitleObj(u1.equippedTitleId || 'title_novice');
                      return (
                        <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-950/60 to-slate-900 border-2 border-amber-500/60 flex flex-col justify-between items-center text-center space-y-3 shadow-xl shadow-amber-500/10 relative overflow-hidden group hover:border-amber-400 transition-all md:-translate-y-2">
                          <div className="absolute top-2 left-2 px-3 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 shadow-md flex items-center space-x-1 animate-pulse">
                            <Crown className="w-3 h-3 text-slate-950" />
                            <span>👑 1st Champion</span>
                          </div>
                          <div className="pt-4">
                            <div className={`w-16 h-16 rounded-2xl p-0.5 border-2 ${b1.color} shadow-xl shadow-amber-500/20 mx-auto ring-4 ring-amber-500/30`}>
                              {u1.avatar ? (
                                <img src={u1.avatar} alt={u1.name} className="w-full h-full rounded-[12px] object-cover" />
                              ) : (
                                <div className={`w-full h-full rounded-[12px] ${bg1.gradient} flex items-center justify-center font-black text-xl text-white`}>
                                  {u1.name?.charAt(0) || '1'}
                                </div>
                              )}
                            </div>
                            <h4 className="text-base font-black text-amber-300 mt-2.5">{u1.name}</h4>
                            <p className="text-[10px] text-amber-400/80 font-bold">{u1.classSection || 'IT-A'} • Grand Champion</p>
                          </div>
                          <div className="w-full pt-2 border-t border-amber-500/30 space-y-1">
                            <div className="text-sm font-black text-amber-300 font-mono">{u1.funPoints} XP</div>
                            <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold border ${t1.badgeBg}`}>
                              🏷️ {t1.title}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* 🥉 3RD PLACE */}
                    {sortedDept[2] && (() => {
                      const u3 = sortedDept[2];
                      const b3 = getBorderObj(u3.equippedBorder || 'default');
                      const bg3 = getAvatarBgObj(u3.equippedAvatarBgId || 'bg_slate');
                      const t3 = getTitleObj(u3.equippedTitleId || 'title_novice');
                      return (
                        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex flex-col justify-between items-center text-center space-y-3 shadow-lg relative overflow-hidden group hover:border-amber-700 transition-all">
                          <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-amber-700 text-white flex items-center space-x-1">
                            <span>🥉 3rd Place</span>
                          </div>
                          <div className="pt-4">
                            <div className={`w-14 h-14 rounded-2xl p-0.5 border-2 ${b3.color} shadow-lg mx-auto`}>
                              {u3.avatar ? (
                                <img src={u3.avatar} alt={u3.name} className="w-full h-full rounded-[12px] object-cover" />
                              ) : (
                                <div className={`w-full h-full rounded-[12px] ${bg3.gradient} flex items-center justify-center font-black text-lg text-white`}>
                                  {u3.name?.charAt(0) || '3'}
                                </div>
                              )}
                            </div>
                            <h4 className="text-sm font-extrabold text-white mt-2">{u3.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold">{u3.classSection || 'IT-C'} • Level {u3.level}</p>
                          </div>
                          <div className="w-full pt-2 border-t border-slate-800 space-y-1">
                            <div className="text-xs font-black text-amber-400 font-mono">{u3.funPoints} XP</div>
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border ${t3.badgeBg}`}>
                              🏷️ {t3.title}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* SEARCH & FILTERS BAR */}
                <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search student name or reg no..."
                      value={lbSearchQuery}
                      onChange={(e) => setLbSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 text-white rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="flex items-center space-x-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-400 font-bold">Year:</span>
                      <select
                        value={lbYearFilter}
                        onChange={(e) => setLbYearFilter(e.target.value)}
                        className="bg-transparent text-white font-bold focus:outline-none"
                      >
                        <option value="All" className="bg-slate-900 text-white">All Years</option>
                        <option value="1st Year" className="bg-slate-900 text-white">1st Year</option>
                        <option value="2nd Year" className="bg-slate-900 text-white">2nd Year</option>
                        <option value="3rd Year" className="bg-slate-900 text-white">3rd Year</option>
                        <option value="4th Year" className="bg-slate-900 text-white">4th Year</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-bold">Section:</span>
                      <select
                        value={lbSectionFilter}
                        onChange={(e) => setLbSectionFilter(e.target.value)}
                        className="bg-transparent text-white font-bold focus:outline-none"
                      >
                        <option value="All" className="bg-slate-900 text-white">All Sections</option>
                        <option value="IT-A" className="bg-slate-900 text-white">IT-A</option>
                        <option value="IT-B" className="bg-slate-900 text-white">IT-B</option>
                        <option value="IT-C" className="bg-slate-900 text-white">IT-C</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* FULL DEPARTMENT RANKINGS LIST */}
                <div className="space-y-3">
                  {filteredList.map((usr, idx) => {
                    const actualRank = sortedDept.findIndex(u => u === usr) + 1;
                    const isMe = currentUser && (usr.uid === currentUser.uid || usr.email === currentUser.email);
                    const bObj = getBorderObj(usr.equippedBorder || 'default');
                    const bgObj = getAvatarBgObj(usr.equippedAvatarBgId || 'bg_slate');
                    const tObj = getTitleObj(usr.equippedTitleId || 'title_novice');
                    const xpPct = getProgressPercentage(usr.funPoints);

                    return (
                      <div
                        key={usr.uid || usr.name || idx}
                        onMouseEnter={() => setHoveredUser(usr)}
                        onMouseLeave={() => setHoveredUser(null)}
                        className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 relative group ${
                          isMe
                            ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-400/40 shadow-xl'
                            : 'bg-slate-950 border-slate-800 hover:border-amber-500/40'
                        }`}
                      >
                        <div className="flex items-center space-x-3.5 min-w-0">
                          {/* Rank + Movement Badge */}
                          <div className="flex flex-col items-center justify-center flex-shrink-0 w-12 text-center">
                            <span className={`text-xs font-black px-2.5 py-1 rounded-xl w-full ${
                              actualRank === 1 ? 'bg-amber-400 text-slate-950' :
                              actualRank === 2 ? 'bg-slate-300 text-slate-950' :
                              actualRank === 3 ? 'bg-amber-700 text-white' :
                              'bg-slate-900 text-slate-300 border border-slate-800'
                            }`}>
                              #{actualRank}
                            </span>
                            <span className={`text-[10px] font-extrabold mt-0.5 ${
                              usr.rankChange.includes('↑') ? 'text-emerald-400' :
                              usr.rankChange.includes('↓') ? 'text-rose-400' :
                              usr.rankChange === 'NEW' ? 'text-cyan-300' : 'text-slate-500'
                            }`}>
                              {usr.rankChange}
                            </span>
                          </div>

                          {/* Avatar */}
                          <div className={`w-11 h-11 rounded-xl p-0.5 border-2 ${bObj.color} flex-shrink-0 shadow-md`}>
                            {usr.avatar ? (
                              <img src={usr.avatar} alt={usr.name} className="w-full h-full rounded-[8px] object-cover" />
                            ) : (
                              <div className={`w-full h-full rounded-[8px] ${bgObj.gradient} flex items-center justify-center font-bold text-white text-sm`}>
                                {usr.name?.charAt(0) || 'S'}
                              </div>
                            )}
                          </div>

                          {/* Student Details */}
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-0.5">
                              <h5 className="font-bold text-sm text-white truncate flex items-center space-x-1.5">
                                <span>{usr.name}</span>
                                {isMe && <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-300">YOU</span>}
                              </h5>
                              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                Level {usr.level}
                              </span>
                              {tObj && (
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${tObj.badgeBg}`}>
                                  🏷️ {tObj.title}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-400">
                              {usr.classSection || 'IT-A'} • {usr.year || '3rd Year'} {usr.registerNumber ? `(${usr.registerNumber})` : ''}
                            </p>

                            {/* Earned Badges Row */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              {usr.earnedBadges.map((b, bIdx) => (
                                <span key={bIdx} className="text-[9px] font-bold text-slate-300 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                                  {b}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* XP Progress Bar & Streak */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs flex-shrink-0">
                          <div className="flex items-center space-x-1.5 text-rose-400 font-bold">
                            <Flame className="w-4 h-4 fill-rose-400" />
                            <span>{usr.streak || 1}d Streak</span>
                          </div>

                          <div className="w-full sm:w-44 space-y-1 text-right">
                            <div className="flex justify-between items-center text-[10px] font-mono">
                              <span className="text-slate-400 font-bold">XP Level {usr.level}</span>
                              <span className="text-amber-300 font-black">{usr.funPoints} XP</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                                style={{ width: `${xpPct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB VIEW 2: ⚡ WEEKLY RANKINGS */}
            {/* ========================================================================= */}
            {lbActiveTab === 'weekly' && (
              <div className="space-y-6 animate-in fade-in">
                {/* WEEKLY RESET COUNTDOWN BANNER */}
                <div className="p-4 rounded-3xl bg-slate-950 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2 text-amber-300 font-bold">
                    <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>⚡ Weekly Leaderboard resets in:</span>
                    <span className="font-mono text-sm text-white font-black bg-amber-500/20 px-2.5 py-0.5 rounded border border-amber-500/30">
                      {countdownWeekly}
                    </span>
                  </div>
                  <span className="text-slate-400">Weekly Winner Reward: <strong className="text-amber-300">+300 XP + Exclusive Badge</strong></span>
                </div>

                {/* WEEKLY TOP 3 WINNERS PODIUM */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {sortedWeekly.slice(0, 3).map((u, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                      <span className="text-xs font-black text-amber-300">
                        {idx === 0 ? '🥇 Weekly Champion' : idx === 1 ? '🥈 Runner-Up' : '🥉 Third Place'}
                      </span>
                      <h4 className="font-bold text-white text-sm">{u.name}</h4>
                      <p className="text-xs font-mono font-black text-amber-400">{u.weeklyXp} Weekly XP</p>
                    </div>
                  ))}
                </div>

                {/* WEEKLY RANKINGS LIST */}
                <div className="space-y-3">
                  {filteredList.map((usr, idx) => {
                    const rank = sortedWeekly.findIndex(u => u === usr) + 1;
                    return (
                      <div key={usr.uid || idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          <span className="font-black text-amber-300 font-mono">#{rank}</span>
                          <div>
                            <p className="font-bold text-white">{usr.name}</p>
                            <p className="text-[10px] text-slate-400">{usr.classSection} • {usr.year}</p>
                          </div>
                        </div>
                        <span className="font-mono font-black text-amber-300 text-sm">{usr.weeklyXp} Weekly XP</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB VIEW 3: 🌙 MONTHLY RANKINGS */}
            {/* ========================================================================= */}
            {lbActiveTab === 'monthly' && (
              <div className="space-y-6 animate-in fade-in">
                {/* MONTHLY RESET COUNTDOWN BANNER */}
                <div className="p-4 rounded-3xl bg-slate-950 border border-indigo-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2 text-indigo-300 font-bold">
                    <Calendar className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span>🌙 Monthly Leaderboard resets in:</span>
                    <span className="font-mono text-sm text-white font-black bg-indigo-500/20 px-2.5 py-0.5 rounded border border-indigo-500/30">
                      {countdownMonthly}
                    </span>
                  </div>
                  <span className="text-slate-400">Monthly Champion Reward: <strong className="text-indigo-300">Golden Border + 500 XP</strong></span>
                </div>

                {/* MONTHLY TOP 3 WINNERS PODIUM */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {sortedMonthly.slice(0, 3).map((u, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                      <span className="text-xs font-black text-indigo-300">
                        {idx === 0 ? '🥇 Monthly Champion' : idx === 1 ? '🥈 Runner-Up' : '🥉 Third Place'}
                      </span>
                      <h4 className="font-bold text-white text-sm">{u.name}</h4>
                      <p className="text-xs font-mono font-black text-indigo-400">{u.monthlyXp} Monthly XP</p>
                    </div>
                  ))}
                </div>

                {/* MONTHLY RANKINGS LIST */}
                <div className="space-y-3">
                  {filteredList.map((usr, idx) => {
                    const rank = sortedMonthly.findIndex(u => u === usr) + 1;
                    return (
                      <div key={usr.uid || idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          <span className="font-black text-indigo-300 font-mono">#{rank}</span>
                          <div>
                            <p className="font-bold text-white">{usr.name}</p>
                            <p className="text-[10px] text-slate-400">{usr.classSection} • {usr.year}</p>
                          </div>
                        </div>
                        <span className="font-mono font-black text-indigo-300 text-sm">{usr.monthlyXp} Monthly XP</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB VIEW 4: 🏫 CLASS VS CLASS RANKINGS */}
            {/* ========================================================================= */}
            {lbActiveTab === 'class' && (
              <div className="space-y-6 animate-in fade-in">
                {/* 3 CLASS SECTION CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {classStatsMap.map((cls, idx) => {
                    const isSelected = selectedClassSec === cls.section;
                    return (
                      <div
                        key={cls.section}
                        onClick={() => setSelectedClassSec(cls.section)}
                        className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 ${
                          isSelected
                            ? 'bg-gradient-to-br from-amber-950/40 to-slate-950 border-amber-500/80 shadow-xl ring-2 ring-amber-500/40'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-amber-300 font-mono">Rank #{idx + 1}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-800">
                            {cls.studentCount} Students
                          </span>
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-white">{cls.section} Section</h4>
                          <p className="text-xs text-amber-400 font-black font-mono mt-1">{cls.totalXp.toLocaleString()} Total XP</p>
                        </div>
                        <div className="text-[11px] text-slate-400 space-y-0.5 pt-2 border-t border-slate-800">
                          <div>Avg XP/Student: <strong className="text-slate-200">{cls.avgXp}</strong></div>
                          <div>Top Student: <strong className="text-emerald-400">{cls.topStudent}</strong></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* SELECTED CLASS ROSTER */}
                {(() => {
                  const targetClass = classStatsMap.find(c => c.section === selectedClassSec) || classStatsMap[0];
                  return (
                    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                      <h4 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-2">
                        <span>Students in Section {targetClass.section} ({targetClass.students.length} Total)</span>
                        <span className="text-xs text-slate-400">Sorted by Total XP</span>
                      </h4>

                      <div className="space-y-3">
                        {targetClass.students.map((usr, idx) => (
                          <div key={usr.uid || idx} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-3">
                              <span className="font-bold text-slate-400 font-mono">#{idx + 1}</span>
                              <div>
                                <p className="font-bold text-white">{usr.name}</p>
                                <p className="text-[10px] text-slate-400">Level {usr.level} • 🔥 {usr.streak || 1}d</p>
                              </div>
                            </div>
                            <span className="font-mono font-black text-amber-300 text-sm">{usr.funPoints} XP</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* HOVER TOOLTIP PREVIEW CARD */}
            {hoveredUser && (
              <div className="fixed bottom-6 right-6 z-50 p-5 rounded-3xl bg-slate-950/95 border-2 border-amber-500/60 shadow-2xl backdrop-blur-xl space-y-3 max-w-xs animate-in fade-in">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-amber-500/40 flex items-center justify-center text-white font-bold text-lg">
                    {hoveredUser.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-white">{hoveredUser.name}</h5>
                    <p className="text-[11px] text-slate-400">{hoveredUser.classSection} • {hoveredUser.year}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block">Level</span>
                    <span className="text-amber-300 text-xs">Level {hoveredUser.level}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block">Accuracy</span>
                    <span className="text-emerald-400 text-xs">{hoveredUser.accuracyPercent}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block">Longest Streak</span>
                    <span className="text-rose-400 text-xs">🔥 {hoveredUser.longestStreak}d</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block">Challenges</span>
                    <span className="text-cyan-300 text-xs">{hoveredUser.challengesSolved} Solved</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        );
      })()}



      {/* ========================================================================= */}
      {/* MODAL 1: ⏱️ 60-SECOND CHALLENGE MODAL */}
      {/* ========================================================================= */}
      {challengeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-cyan-500/40 shadow-2xl space-y-6">
            
            {(() => {
              const pool = challengeQuizPool.length > 0 ? challengeQuizPool : ((quizQuestions && quizQuestions.length > 0) ? quizQuestions : DAILY_QUIZ_QUESTIONS);
              const currentQ = pool[challengeIndex];

              return !challengeFinished ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-lg font-black text-white flex items-center space-x-2">
                        <span>60-Second IT Challenge</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          gameDifficulty === 'advanced' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          gameDifficulty === 'beginner' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {gameDifficulty || 'intermediate'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">Question #{challengeIndex + 1} of {Math.min(15, pool.length)} • 60s Sprint</p>
                    </div>
                    <div className="flex items-center space-x-1 text-amber-400 font-mono text-lg font-black bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
                      <Clock className="w-4 h-4 animate-pulse" />
                      <span>{challengeTimer}s</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm sm:text-base font-bold text-white leading-snug">
                      {currentQ?.q}
                    </p>

                    <div className="space-y-2.5">
                      {currentQ?.options?.map((opt, idx) => (
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
                    <p className="text-3xl font-black text-cyan-300">{challengeScore} Correct Answers</p>
                    <p className="text-xs font-bold text-amber-400">+{Math.round(((challengeScore * 30) + (challengeTimer > 20 ? 50 : 20)) * gameXpMultiplier)} XP Earned ({gameXpMultiplier}x Multiplier)!</p>
                  </div>

                  <button
                    onClick={() => setChallengeOpen(false)}
                    className="w-full py-3 rounded-2xl font-black text-xs uppercase bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30 transition-all"
                  >
                    Return to BrainZone Hub
                  </button>
                </div>
              );
            })()}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: 🧠 QUICK QUIZ MODAL */}
      {/* ========================================================================= */}
      {quickQuizOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel rounded-3xl max-w-lg w-full p-6 border border-purple-500/40 shadow-2xl space-y-4">
            
            {(() => {
              const pool = (activeQuizList && activeQuizList.length > 0) ? activeQuizList : ((quizQuestions && quizQuestions.length > 0) ? quizQuestions : DAILY_QUIZ_QUESTIONS);
              const currentQ = pool[quizIndex % pool.length];

              return (
                <>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-400" />
                      <span>Quick Quiz ({selectedQuizCategory || 'General'})</span>
                    </h3>
                    <button onClick={() => setQuickQuizOpen(false)} className="p-1 text-slate-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {!quizFinished ? (
                    <div className="space-y-4">
                      <div className="flex justify-between text-xs text-slate-400 font-semibold">
                        <span>Question {quizIndex + 1} of {pool.length}</span>
                        <span className="text-purple-400 font-mono">Score: {quizScore}</span>
                      </div>
                      <p className="text-sm font-bold text-white">
                        {currentQ?.q}
                      </p>

                      <div className="space-y-2">
                        {currentQ?.options?.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              const isCorrect = idx === currentQ?.answer;
                              const nextScore = isCorrect ? quizScore + 1 : quizScore;
                              if (isCorrect) {
                                setQuizScore(prev => prev + 1);
                              }
                              if (quizIndex < pool.length - 1) {
                                setQuizIndex(prev => prev + 1);
                              } else {
                                setQuizFinished(true);
                                setRoundTimerActive(false);
                                const accuracy = Math.round((nextScore / Math.max(1, pool.length)) * 100);
                                const timeSpent = roundTimerMax - roundTimer;
                                processGameAttemptCompletion({
                                  gameId: 'quiz',
                                  level: gameDifficulty,
                                  score: nextScore * 10,
                                  maxScore: pool.length * 10,
                                  timeTakenSec: timeSpent,
                                  accuracyPercent: accuracy,
                                  isPerfect: nextScore === pool.length,
                                  isFastSpeed: timeSpent < 30
                                });
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
                      <p className="text-2xl font-black text-purple-300">{quizScore} / {pool.length} Correct</p>
                      
                      {currentUser?.gameStats?.quiz?.[`${gameDifficulty}Completed`] ? (
                        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                          <p className="font-extrabold">ℹ️ {gameDifficulty.toUpperCase()} Completed • Practice Mode</p>
                          <p className="text-[11px] text-slate-300">Best Score, Accuracy & Leaderboard stats updated!</p>
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-amber-400">+{gameDifficulty === 'beginner' ? 80 : gameDifficulty === 'intermediate' ? 120 : 160} XP Awarded!</p>
                      )}

                      <button onClick={() => setQuickQuizOpen(false)} className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs">
                        Done
                      </button>
                    </div>
                  )}
                </>
              );
            })()}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: 💻 GUESS THE OUTPUT MODAL */}
      {/* ========================================================================= */}
      {guessOutputOpen && activeGuessList.length > 0 && (() => {
        const currentWeekId = getISOWeekId();
        const guessWeeklyCompletions = currentUser?.guessWeeklyCompletions || {};
        const alreadyClaimedThisWeek = guessWeeklyCompletions[gameDifficulty] === currentWeekId;
        const currentQ = activeGuessList[guessIndex % activeGuessList.length];
        const funnyResult = getFunnyGuessResult(guessScore, activeGuessList.length);

        const baseQXp = siteConfig?.xpSettings?.guessQuestionXP ?? 20;
        const baseBonusXp = siteConfig?.xpSettings?.guessWeeklyBonusXP ?? 50;
        const qXpAmount = Math.round(baseQXp * gameXpMultiplier);
        const weeklyBonusAmount = Math.round(baseBonusXp * gameXpMultiplier);

        const handleFinishGuess = () => {
          setGuessFinished(true);
          setRoundTimerActive(false);

          const accuracy = Math.round((guessScore / Math.max(1, activeGuessList.length)) * 100);
          const timeSpent = roundTimerMax - roundTimer;

          processGameAttemptCompletion({
            gameId: 'guess',
            level: gameDifficulty,
            score: guessScore * 10,
            maxScore: activeGuessList.length * 10,
            timeTakenSec: timeSpent,
            accuracyPercent: accuracy,
            isPerfect: guessScore === activeGuessList.length,
            isFastSpeed: timeSpent < 45
          });
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
            <div className="glass-panel rounded-3xl max-w-lg w-full p-6 border border-blue-500/40 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">💻</span>
                  <h3 className="text-base font-extrabold text-white">Guess The Output</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                    {gameDifficulty} ({activeGuessList.length} Qs)
                  </span>
                </div>
                <button onClick={() => { setGuessOutputOpen(false); setRoundTimerActive(false); }} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Weekly XP Status Banner */}
              {alreadyClaimedThisWeek ? (
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between text-purple-300 text-[11px] font-semibold">
                  <span>ℹ️ Weekly Completion Bonus Claimed</span>
                  <span className="text-[10px] text-purple-300/80">+{qXpAmount} XP per correct option active</span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between text-blue-300 text-[11px] font-semibold">
                  <span>🎯 Weekly XP Active (+{qXpAmount} XP/correct +{weeklyBonusAmount} XP Level Bonus)</span>
                  <span className="text-[10px] text-blue-400">First play of the week</span>
                </div>
              )}

              {/* Timer Bar */}
              <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono">
                <div className="flex items-center space-x-1.5 text-amber-400">
                  <Clock className="w-4 h-4 animate-pulse" />
                  <span>Time: <strong className={roundTimer <= 10 ? "text-rose-400 font-black animate-ping" : "text-amber-300"}>{roundTimer}s</strong></span>
                </div>
                <div className="w-24 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className={`h-full transition-all duration-1000 ${roundTimer <= 10 ? 'bg-rose-500' : 'bg-blue-400'}`} style={{ width: `${(roundTimer / roundTimerMax) * 100}%` }} />
                </div>
              </div>

              {!guessFinished && currentQ ? (
                <>
                  {/* Code Snippet Box */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
                    <div className="text-[10px] text-slate-500 font-sans uppercase mb-1 flex items-center justify-between">
                      <span>Snippet ({guessIndex + 1}/{activeGuessList.length}) - {currentQ.title}</span>
                      <span className="text-blue-400 font-bold uppercase">{currentQ.language || 'JS'}</span>
                    </div>
                    <pre>{currentQ.code}</pre>
                  </div>

                  <p className="text-xs font-bold text-slate-300">What will be the output of this code?</p>

                  {/* Options */}
                  <div className="grid grid-cols-2 gap-2">
                    {currentQ.options.map((opt, idx) => {
                      const isCorrect = idx === currentQ.answer;
                      const isSelected = guessSelectedOpt === idx;
                      let btnStyle = "p-3 rounded-xl text-xs font-mono font-bold border border-slate-800 bg-slate-900 text-slate-200 hover:bg-blue-500/20 transition-all text-left";

                      if (guessSubmitted) {
                        if (isCorrect) btnStyle = "p-3 rounded-xl text-xs font-mono font-bold border border-emerald-500 bg-emerald-500/20 text-emerald-300 text-left";
                        else if (isSelected) btnStyle = "p-3 rounded-xl text-xs font-mono font-bold border border-rose-500 bg-rose-500/20 text-rose-300 text-left";
                      }

                      return (
                        <button
                          key={idx}
                          disabled={guessSubmitted || roundTimer === 0}
                          onClick={() => {
                            setGuessSelectedOpt(idx);
                            setGuessSubmitted(true);

                            if (isCorrect) {
                              setGuessScore(prev => prev + 1);
                              updateUserProfile({
                                addXp: qXpAmount
                              });
                            }
                          }}
                          className={btnStyle}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Banner */}
                  {guessSubmitted && (
                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 animate-in fade-in">
                      <p className={`text-xs font-bold ${guessSelectedOpt === currentQ.answer ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {guessSelectedOpt === currentQ.answer 
                          ? `🎉 Correct Output! +${qXpAmount} XP Earned!` 
                          : '❌ Incorrect Output!'}
                      </p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        <strong>Explanation:</strong> {currentQ.explanation}
                      </p>
                    </div>
                  )}

                  {/* Next / Finish Button */}
                  {guessSubmitted && (
                    <div className="pt-1">
                      {guessIndex < activeGuessList.length - 1 ? (
                        <button
                          onClick={() => {
                            setGuessIndex(prev => prev + 1);
                            setGuessSelectedOpt(null);
                            setGuessSubmitted(false);
                          }}
                          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
                        >
                          Next Question ➔
                        </button>
                      ) : (
                        <button
                          onClick={handleFinishGuess}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all"
                        >
                          Finish Level & See Results 🏁
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Level Results Screen with Funny Ranking & Custom Suggestions */
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4 animate-in fade-in">
                  <div className="space-y-2">
                    <div className="text-4xl">{funnyResult.emoji}</div>
                    <h4 className="text-lg font-black text-blue-400">
                      {funnyResult.title}
                    </h4>
                    <p className="text-xs text-slate-300 italic bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      "{funnyResult.message}"
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/30 text-xs text-blue-200 text-left space-y-1">
                    <p className="font-bold text-blue-300">📊 Your Performance Breakdown:</p>
                    <p className="text-slate-300">
                      Score: <strong className="text-white">{guessScore}</strong> / <strong className="text-white">{activeGuessList.length}</strong> correct ({Math.round((guessScore / (activeGuessList.length || 1)) * 100)}% accuracy)
                    </p>
                    <p className="text-amber-300 font-semibold">
                      Total XP Earned: +{(qXpAmount * guessScore) + (!alreadyClaimedThisWeek ? weeklyBonusAmount : 0)} XP
                    </p>
                  </div>

                  {/* Funny Custom Suggestion Box */}
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 font-semibold leading-relaxed">
                    {funnyResult.suggestion}
                  </div>

                  {!alreadyClaimedThisWeek && (
                    <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-[11px] font-bold text-blue-300">
                      🎉 First Weekly Completion Bonus (+{weeklyBonusAmount} XP) Unlocked!
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setGuessOutputOpen(false);
                      setRoundTimerActive(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                  >
                    Close & Play Again
                  </button>
                </div>
              )}

            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL 4: 🐞 FIND THE BUG MODAL */}
      {/* ========================================================================= */}
      {findBugOpen && activeBugList.length > 0 && (() => {
        const currentWeekId = getISOWeekId();
        const bugWeeklyCompletions = currentUser?.bugWeeklyCompletions || {};
        const alreadyClaimedThisWeek = bugWeeklyCompletions[gameDifficulty] === currentWeekId;
        const currentQ = activeBugList[bugIndex % activeBugList.length];
        const funnyResult = getFunnyBugResult(bugScore, activeBugList.length);

        const baseQXp = siteConfig?.xpSettings?.bugQuestionXP ?? 20;
        const baseBonusXp = siteConfig?.xpSettings?.bugWeeklyBonusXP ?? 50;
        const qXpAmount = Math.round(baseQXp * gameXpMultiplier);
        const weeklyBonusAmount = Math.round(baseBonusXp * gameXpMultiplier);

        const handleFinishBug = () => {
          setBugFinished(true);
          setRoundTimerActive(false);

          const accuracy = Math.round((bugScore / Math.max(1, activeBugList.length)) * 100);
          const timeSpent = roundTimerMax - roundTimer;

          processGameAttemptCompletion({
            gameId: 'bug',
            level: gameDifficulty,
            score: bugScore * 10,
            maxScore: activeBugList.length * 10,
            timeTakenSec: timeSpent,
            accuracyPercent: accuracy,
            isPerfect: bugScore === activeBugList.length,
            isFastSpeed: timeSpent < 45
          });
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
            <div className="glass-panel rounded-3xl max-w-lg w-full p-6 border border-rose-500/40 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🐞</span>
                  <h3 className="text-base font-extrabold text-white">Find The Bug</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                    {gameDifficulty} ({activeBugList.length} Qs)
                  </span>
                </div>
                <button onClick={() => { setFindBugOpen(false); setRoundTimerActive(false); }} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Weekly XP Status Banner */}
              {alreadyClaimedThisWeek ? (
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between text-purple-300 text-[11px] font-semibold">
                  <span>ℹ️ Weekly Completion Bonus Claimed</span>
                  <span className="text-[10px] text-purple-300/80">+{qXpAmount} XP per correct option active</span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-rose-300 text-[11px] font-semibold">
                  <span>🎯 Weekly XP Active (+{qXpAmount} XP/correct +{weeklyBonusAmount} XP Level Bonus)</span>
                  <span className="text-[10px] text-rose-400">First play of the week</span>
                </div>
              )}

              {/* Timer Bar */}
              <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono">
                <div className="flex items-center space-x-1.5 text-amber-400">
                  <Clock className="w-4 h-4 animate-pulse" />
                  <span>Time: <strong className={roundTimer <= 10 ? "text-rose-400 font-black animate-ping" : "text-amber-300"}>{roundTimer}s</strong></span>
                </div>
                <div className="w-24 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className={`h-full transition-all duration-1000 ${roundTimer <= 10 ? 'bg-rose-500' : 'bg-rose-400'}`} style={{ width: `${(roundTimer / roundTimerMax) * 100}%` }} />
                </div>
              </div>

              {!bugFinished && currentQ ? (
                <>
                  {/* Code Snippet Box */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-rose-300 overflow-x-auto">
                    <div className="text-[10px] text-slate-500 font-sans uppercase mb-1 flex items-center justify-between">
                      <span>Bug Hunt ({bugIndex + 1}/{activeBugList.length}) - {currentQ.title}</span>
                      <span className="text-rose-400 font-bold uppercase">{currentQ.language || 'JS'}</span>
                    </div>
                    <pre>{currentQ.code}</pre>
                  </div>

                  <p className="text-xs font-bold text-slate-300">Identify the bug in this code snippet:</p>

                  {/* Options */}
                  <div className="space-y-2">
                    {currentQ.options.map((opt, idx) => {
                      const isCorrect = idx === currentQ.answer;
                      const isSelected = bugSelectedOpt === idx;
                      let btnStyle = "w-full p-3 rounded-xl text-xs font-semibold text-left border border-slate-800 bg-slate-900 text-slate-200 hover:bg-rose-500/20 transition-all";

                      if (bugSubmitted) {
                        if (isCorrect) btnStyle = "w-full p-3 rounded-xl text-xs font-semibold text-left border border-emerald-500 bg-emerald-500/20 text-emerald-300";
                        else if (isSelected) btnStyle = "w-full p-3 rounded-xl text-xs font-semibold text-left border border-rose-500 bg-rose-500/20 text-rose-300";
                      }

                      return (
                        <button
                          key={idx}
                          disabled={bugSubmitted || roundTimer === 0}
                          onClick={() => {
                            setBugSelectedOpt(idx);
                            setBugSubmitted(true);

                            if (isCorrect) {
                              setBugScore(prev => prev + 1);
                              updateUserProfile({
                                addXp: qXpAmount
                              });
                            }
                          }}
                          className={btnStyle}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Banner */}
                  {bugSubmitted && (
                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 animate-in fade-in">
                      <p className={`text-xs font-bold ${bugSelectedOpt === currentQ.answer ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {bugSelectedOpt === currentQ.answer 
                          ? `🎉 Correct Bug Identified! +${qXpAmount} XP Earned!` 
                          : '❌ Incorrect Bug Choice!'}
                      </p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        <strong>Explanation:</strong> {currentQ.explanation}
                      </p>
                    </div>
                  )}

                  {/* Next / Finish Button */}
                  {bugSubmitted && (
                    <div className="pt-1">
                      {bugIndex < activeBugList.length - 1 ? (
                        <button
                          onClick={() => {
                            setBugIndex(prev => prev + 1);
                            setBugSelectedOpt(null);
                            setBugSubmitted(false);
                          }}
                          className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all"
                        >
                          Next Bug Hunt ➔
                        </button>
                      ) : (
                        <button
                          onClick={handleFinishBug}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:opacity-90 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all"
                        >
                          Finish Hunt & See Results 🏁
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Level Results Screen with Funny Ranking & Custom Suggestions */
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4 animate-in fade-in">
                  <div className="space-y-2">
                    <div className="text-4xl">{funnyResult.emoji}</div>
                    <h4 className="text-lg font-black text-rose-400">
                      {funnyResult.title}
                    </h4>
                    <p className="text-xs text-slate-300 italic bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      "{funnyResult.message}"
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-xs text-rose-200 text-left space-y-1">
                    <p className="font-bold text-rose-300">📊 Your Performance Breakdown:</p>
                    <p className="text-slate-300">
                      Score: <strong className="text-white">{bugScore}</strong> / <strong className="text-white">{activeBugList.length}</strong> correct ({Math.round((bugScore / (activeBugList.length || 1)) * 100)}% accuracy)
                    </p>
                    <p className="text-amber-300 font-semibold">
                      Total XP Earned: +{(qXpAmount * bugScore) + (!alreadyClaimedThisWeek ? weeklyBonusAmount : 0)} XP
                    </p>
                  </div>

                  {/* Funny Custom Suggestion Box */}
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 font-semibold leading-relaxed">
                    {funnyResult.suggestion}
                  </div>

                  {!alreadyClaimedThisWeek && (
                    <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-[11px] font-bold text-rose-300">
                      🎉 First Weekly Completion Bonus (+{weeklyBonusAmount} XP) Unlocked!
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setFindBugOpen(false);
                      setRoundTimerActive(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md"
                  >
                    Close & Play Again
                  </button>
                </div>
              )}

            </div>
          </div>
        );
      })()}

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
                        updateUserProfile({ addXp: 50 });
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
      {ecgModalOpen && activeEcgList.length > 0 && (() => {
        const currentWeekId = getISOWeekId();
        const ecgWeeklyCompletions = currentUser?.ecgWeeklyCompletions || {};
        const alreadyClaimedThisWeek = ecgWeeklyCompletions[gameDifficulty] === currentWeekId;
        const currentQ = activeEcgList[ecgIndex % activeEcgList.length];
        const funnyResult = getFunnyEcgResult(ecgScore, activeEcgList.length);

        const ecgQuestionBaseXP = siteConfig?.xpSettings?.ecgQuestionXP ?? 15;
        const ecgWeeklyBonusBaseXP = siteConfig?.xpSettings?.ecgWeeklyBonusXP ?? 50;
        const qXpAmount = Math.round(ecgQuestionBaseXP * gameXpMultiplier);
        const weeklyBonusAmount = Math.round(ecgWeeklyBonusBaseXP * gameXpMultiplier);

        const handleFinishEcg = () => {
          setEcgFinished(true);
          setRoundTimerActive(false);

          const accuracy = Math.round((ecgScore / Math.max(1, activeEcgList.length)) * 100);
          const timeSpent = roundTimerMax - roundTimer;

          processGameAttemptCompletion({
            gameId: 'ecg',
            level: gameDifficulty,
            score: ecgScore * 10,
            maxScore: activeEcgList.length * 10,
            timeTakenSec: timeSpent,
            accuracyPercent: accuracy,
            isPerfect: ecgScore === activeEcgList.length,
            isFastSpeed: timeSpent < 40
          });
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
            <div className="glass-panel rounded-3xl max-w-lg w-full p-6 border border-emerald-500/40 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">⚡</span>
                  <h3 className="text-base font-extrabold text-white">Error Code Guessing</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                    {gameDifficulty} ({activeEcgList.length} Qs)
                  </span>
                </div>
                <button onClick={() => { setEcgModalOpen(false); setRoundTimerActive(false); }} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Weekly XP Status Banner */}
              {alreadyClaimedThisWeek ? (
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between text-purple-300 text-[11px] font-semibold">
                  <span>ℹ️ Weekly Completion Bonus Claimed</span>
                  <span className="text-[10px] text-purple-300/80">+{qXpAmount} XP per correct option active</span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-300 text-[11px] font-semibold">
                  <span>🎯 Weekly XP Active (+{qXpAmount} XP/correct +{weeklyBonusAmount} XP Level Bonus)</span>
                  <span className="text-[10px] text-emerald-400">First play of the week</span>
                </div>
              )}

              {/* Timer Bar */}
              <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono">
                <div className="flex items-center space-x-1.5 text-amber-400">
                  <Clock className="w-4 h-4 animate-pulse" />
                  <span>Time: <strong className={roundTimer <= 10 ? "text-rose-400 font-black animate-ping" : "text-amber-300"}>{roundTimer}s</strong></span>
                </div>
                <div className="w-24 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className={`h-full transition-all duration-1000 ${roundTimer <= 10 ? 'bg-rose-500' : 'bg-emerald-400'}`} style={{ width: `${(roundTimer / roundTimerMax) * 100}%` }} />
                </div>
              </div>

              {!ecgFinished && currentQ ? (
                <>
                  {/* Question Prompt */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Identify Code ({ecgIndex + 1}/{activeEcgList.length}):</span>
                    <div className="text-3xl font-mono font-black text-emerald-400">
                      HTTP {currentQ.code}
                    </div>
                    <p className="text-xs text-slate-300 italic">{currentQ.desc}</p>
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    {currentQ.options.map((opt, idx) => {
                      const isCorrect = idx === currentQ.answer;
                      const isSelected = ecgSelectedOpt === idx;
                      let btnStyle = "w-full p-3 rounded-xl text-xs font-semibold text-left border border-slate-800 bg-slate-900 text-slate-200 hover:bg-emerald-500/20 transition-all";
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

                            if (isCorrect) {
                              setEcgScore(prev => prev + 1);
                              updateUserProfile({
                                addXp: qXpAmount
                              });
                            }
                          }}
                          className={btnStyle}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Banner */}
                  {ecgSubmitted && (
                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center animate-in fade-in">
                      <p className={`text-xs font-bold ${ecgSelectedOpt === currentQ.answer ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {ecgSelectedOpt === currentQ.answer 
                          ? `🎉 Correct Code! +${qXpAmount} XP Earned!` 
                          : '❌ Incorrect Code!'}
                      </p>
                    </div>
                  )}

                  {/* Next / Finish Button */}
                  {ecgSubmitted && (
                    <div className="pt-1">
                      {ecgIndex < activeEcgList.length - 1 ? (
                        <button
                          onClick={() => {
                            setEcgIndex(prev => prev + 1);
                            setEcgSelectedOpt(null);
                            setEcgSubmitted(false);
                          }}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
                        >
                          Next Question ➔
                        </button>
                      ) : (
                        <button
                          onClick={handleFinishEcg}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all"
                        >
                          Finish Level & See Results 🏁
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Level Results Screen with Funny Ranking & Custom Suggestions */
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4 animate-in fade-in">
                  <div className="space-y-2">
                    <div className="text-4xl">{funnyResult.emoji}</div>
                    <h4 className="text-lg font-black text-emerald-400">
                      {funnyResult.title}
                    </h4>
                    <p className="text-xs text-slate-300 italic bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      "{funnyResult.message}"
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-xs text-indigo-200 text-left space-y-1">
                    <p className="font-bold text-indigo-300">📊 Your Performance Breakdown:</p>
                    <p className="text-slate-300">
                      Score: <strong className="text-white">{ecgScore}</strong> / <strong className="text-white">{activeEcgList.length}</strong> correct ({Math.round((ecgScore / (activeEcgList.length || 1)) * 100)}% accuracy)
                    </p>
                    <p className="text-amber-300 font-semibold">
                      Total XP Earned: +{(qXpAmount * ecgScore) + (!alreadyClaimedThisWeek ? weeklyBonusAmount : 0)} XP
                    </p>
                  </div>

                  {/* Funny Custom Suggestion Box */}
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 font-semibold leading-relaxed">
                    {funnyResult.suggestion}
                  </div>

                  {!alreadyClaimedThisWeek && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-bold text-emerald-300">
                      🎉 First Weekly Completion Bonus (+{weeklyBonusAmount} XP) Unlocked!
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setEcgModalOpen(false);
                      setRoundTimerActive(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                  >
                    Close & Play Again
                  </button>
                </div>
              )}

            </div>
          </div>
        );
      })()}

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

            {/* Real Keyboard Test Mode Banner */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-amber-300 text-[11px] font-bold">
              <span>🚫 Real Keyboard Test Mode: Backspace is DISABLED</span>
              <span className="text-[10px] text-amber-400/90 font-medium">Wrong keys auto-advance & reduce accuracy</span>
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
                <div className={`text-sm font-black ${speedTypeAccuracy >= 90 ? 'text-emerald-400' : speedTypeAccuracy >= 75 ? 'text-amber-400' : 'text-rose-400'}`}>{speedTypeAccuracy}%</div>
              </div>
            </div>

            {/* Direct Interactive Code Typing Box (Monkeytype-Style Direct Snippet Typing) */}
            <div className="relative p-5 bg-slate-950 rounded-2xl border-2 border-amber-500/50 shadow-lg shadow-amber-500/10 font-mono text-xs leading-relaxed space-y-3 overflow-hidden group focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/20">
              <div className="flex items-center justify-between text-[10px] text-amber-400 font-sans font-bold uppercase tracking-wider">
                <span>⚡ Type directly on the code snippet below (Backspace disabled)</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {speedTypeInput.length} / {speedTypePrompt.snippet.length} Chars
                </span>
              </div>

              <div className="relative p-4 bg-slate-900/90 rounded-xl border border-slate-800 whitespace-pre-wrap font-mono text-sm leading-relaxed select-none min-h-[140px]">
                {speedTypePrompt.snippet.split('').map((char, i) => {
                  const typedChar = speedTypeInput[i];
                  let charStyle = "text-slate-500";
                  if (typedChar !== undefined) {
                    if (typedChar === char) {
                      charStyle = "text-emerald-400 bg-emerald-500/20 font-bold";
                    } else {
                      charStyle = "text-rose-300 bg-rose-500/40 font-bold underline decoration-rose-500";
                    }
                  } else if (i === speedTypeInput.length) {
                    charStyle = "bg-amber-400 text-slate-950 font-black animate-pulse shadow-sm shadow-amber-400/50";
                  }

                  return (
                    <span key={i} className={charStyle}>
                      {char}
                    </span>
                  );
                })}

                {/* Hidden Overlay Textarea to Capture Input Directly On Snippet Box */}
                <textarea
                  autoFocus
                  rows={1}
                  disabled={speedTypeFinished || roundTimer === 0}
                  value={speedTypeInput}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace') {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    let val = e.target.value;

                    // Block backspace deletion
                    if (val.length < speedTypeInput.length) {
                      return;
                    }

                    // Prevent typing beyond prompt snippet length
                    if (val.length > speedTypePrompt.snippet.length) {
                      val = val.substring(0, speedTypePrompt.snippet.length);
                    }

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

                    // Completion check when full snippet length is typed
                    if (val.length >= promptStr.length) {
                      handleFinishSpeedType(val, false);
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    triggerToast("🚫 Pasting into typing input is disabled!");
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-text resize-none bg-transparent"
                />
              </div>
            </div>

            {speedTypeFinished && (
              <div className="p-5 rounded-3xl bg-slate-950 border border-amber-500/50 space-y-4 animate-in fade-in shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
                    <h4 className="text-sm font-black text-white">
                      {roundTimer === 0 ? "⏰ Time's Up! Test Completed" : "⚡ Typing Challenge Completed!"}
                    </h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase self-start sm:self-auto ${
                    speedTypeWpm >= 50 && speedTypeAccuracy >= 90
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : speedTypeAccuracy >= 80
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  }`}>
                    {speedTypeWpm >= 50 && speedTypeAccuracy >= 90
                      ? '⭐ S-Class Speed Demon'
                      : speedTypeAccuracy >= 80
                      ? '🥇 Pro Coder'
                      : '⚡ Consistent Typer'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Typing Speed</span>
                    <p className="text-lg font-black text-cyan-400">{speedTypeWpm} WPM</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Accuracy</span>
                    <p className={`text-lg font-black ${speedTypeAccuracy >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {speedTypeAccuracy}%
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Characters</span>
                    <p className="text-lg font-black text-indigo-300">
                      {speedTypeInput.length} / {speedTypePrompt.snippet.length}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">XP Earned</span>
                    <p className="text-lg font-black text-amber-300">
                      +{Math.round(50 * (speedTypeAccuracy / 100) * gameXpMultiplier)} XP
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                  <p className="font-bold text-white flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Performance Summary</span>
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    {speedTypeAccuracy >= 90
                      ? 'Outstanding precision! You typed with minimal errors and high coding velocity.'
                      : speedTypeAccuracy >= 75
                      ? 'Good attempt! Try practicing without looking at the keyboard to boost your accuracy.'
                      : 'Keep practicing! Accuracy is key for fast syntax typing.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      const randomNext = typeList[Math.floor(Math.random() * typeList.length)];
                      setSpeedTypePrompt(randomNext);
                      setSpeedTypeInput('');
                      setSpeedTypeStartTime(null);
                      setSpeedTypeFinished(false);
                      setSpeedTypeWpm(0);
                      setSpeedTypeAccuracy(100);
                      const secs = gameDifficulty === 'beginner' ? 60 : gameDifficulty === 'advanced' ? 90 : 75;
                      setRoundTimer(secs);
                      setRoundTimerMax(secs);
                      setRoundTimerActive(true);
                    }}
                    className="w-full sm:w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all"
                  >
                    🔄 Try Another Snippet
                  </button>

                  <button
                    onClick={() => {
                      setSpeedTypeModalOpen(false);
                      setRoundTimerActive(false);
                    }}
                    className="w-full sm:w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs shadow-lg shadow-amber-600/30 transition-all"
                  >
                    ✓ Complete & Close
                  </button>
                </div>
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

      {/* COPY-PASTE PREVENTION FLOATING TOAST BANNER */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-950/95 text-rose-300 border border-rose-500/50 px-4 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center space-x-2.5 animate-in fade-in slide-in-from-bottom-5">
          <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      </div>
    </BrainZoneErrorBoundary>
  );
};
