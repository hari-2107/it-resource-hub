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
  Lock,
  ShieldAlert
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
  // BEGINNER LEVEL (5 Questions)
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

  // INTERMEDIATE LEVEL (8 Questions)
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

  // ADVANCED LEVEL (10 Questions)
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
  }
];

const FIND_BUG_CHALLENGES = [
  // BEGINNER LEVEL (5 Questions)
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

  // INTERMEDIATE LEVEL (8 Questions)
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

  // ADVANCED LEVEL (10 Questions)
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
    addThisOrThatPoll,
    weeklyMissions: contextMissions,
    badges: contextBadges,
    mysteryRewards,
    siteConfig
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



  // Leaderboard Filters State: 'weekly' | 'monthly' | 'class'
  const [leaderboardFilter, setLeaderboardFilter] = useState('weekly');

  // Weekly Mission State
  const activeWeeklyMissions = (contextMissions && contextMissions.length > 0) ? contextMissions : [
    { id: 'm-1', title: 'Complete 3 Quick Quizzes', target: 3, progress: 2, reward: 75 },
    { id: 'm-2', title: 'Play Spin & Learn 3 times', target: 3, progress: 2, reward: 50 },
    { id: 'm-3', title: 'Complete 2 Coding Challenges', target: 2, progress: 1, reward: 100 }
  ];
  const activeBadges = (contextBadges && contextBadges.length > 0) ? contextBadges : INITIAL_ACHIEVEMENT_BADGES;
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

  const start60SecChallenge = (diffLevel = gameDifficulty || 'intermediate') => {
    const allQuestions = (quizQuestions && quizQuestions.length > 0) ? quizQuestions : DAILY_QUIZ_QUESTIONS;
    const diffQuestions = allQuestions.filter(q => {
      if (diffLevel === 'beginner') return q.difficulty === 'beginner';
      if (diffLevel === 'advanced') return q.difficulty === 'advanced';
      return !q.difficulty || q.difficulty === 'intermediate';
    });
    const pool = diffQuestions.length > 0 ? diffQuestions : allQuestions;

    setChallengeQuizPool(pool);
    setChallengeIndex(0);
    setChallengeScore(0);
    setChallengeTimer(60);
    setChallengeFinished(false);
    setChallengeActive(true);
    setChallengeOpen(true);
  };

  const handleAnswerChallenge = (optionIndex) => {
    const pool = challengeQuizPool.length > 0 ? challengeQuizPool : ((quizQuestions && quizQuestions.length > 0) ? quizQuestions : DAILY_QUIZ_QUESTIONS);
    const currentQ = pool[challengeIndex % pool.length];

    if (currentQ && optionIndex === currentQ.answer) {
      setChallengeScore(prev => prev + 1);
    }
    // Continuous 60s sprint: always advance to next question; time limit of 60s controls when sprint ends!
    setChallengeIndex(prev => prev + 1);
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
        const pool = (mysteryRewards && mysteryRewards.length > 0) ? mysteryRewards : [
          { id: 'mr-1', title: '+150 Super XP Bonus', rewardType: 'xp', value: 150 },
          { id: 'mr-2', title: 'Golden Legend Border', rewardType: 'cosmetic', value: 'golden_legend' },
          { id: 'mr-3', title: '1x Streak Shield', rewardType: 'shield', value: 1 }
        ];
        const loot = pool[Math.floor(Math.random() * pool.length)];

        if (loot.rewardType === 'xp') {
          nextProfile.funPoints = funPoints + Number(loot.value);
        } else if (loot.rewardType === 'cosmetic') {
          const unlockedBorders = currentUser?.unlockedBorderIds || ['default', 'cyber_neon'];
          if (!unlockedBorders.includes(loot.value)) {
            nextProfile.unlockedBorderIds = [...unlockedBorders, loot.value];
          }
        }
        updateUserProfile(nextProfile);
        setSpinResult(`🎁 Mystery Loot: ${loot.title}!`);
      }
    }, 3600);
  };

  // Guess Output Challenge list
  const guessList = (guessOutputChallenges && guessOutputChallenges.length > 0) ? guessOutputChallenges : GUESS_OUTPUT_CHALLENGES;

  // Find Bug Challenge list
  const bugList = (findBugChallenges && findBugChallenges.length > 0) ? findBugChallenges : FIND_BUG_CHALLENGES;

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

            {/* CARD 3: 🗳️ THIS OR THAT (DAILY POLL) */}
            <div className="glass-card rounded-3xl p-6 border border-amber-500/30 bg-gradient-to-b from-amber-950/30 via-slate-950 to-slate-950 space-y-4 relative overflow-hidden flex flex-col justify-between group hover:border-amber-500/60 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Daily Poll
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                    <Users className="w-3 h-3 text-amber-400" />
                    <span>{totalPollVotes} {totalPollVotes === 1 ? 'user' : 'users'} voted</span>
                  </span>
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
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleVotePoll('A')}
                        className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/60 text-xs font-bold text-slate-200 hover:text-white transition-all text-center group/opt flex flex-col items-center justify-center space-y-1"
                      >
                        <span className="text-white font-black">{activePoll.optionA}</span>
                        <span className="text-[10px] text-amber-400 font-semibold">{activePoll.votesA || 0} votes ({percentA}%)</span>
                      </button>
                      <button
                        onClick={() => handleVotePoll('B')}
                        className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/60 text-xs font-bold text-slate-200 hover:text-white transition-all text-center group/opt flex flex-col items-center justify-center space-y-1"
                      >
                        <span className="text-white font-black">{activePoll.optionB}</span>
                        <span className="text-[10px] text-cyan-400 font-semibold">{activePoll.votesB || 0} votes ({percentB}%)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-amber-300">
                        <span>{activePoll.optionA} {userVoteChoice === 'A' ? '✓ Your Vote' : ''}</span>
                        <span>{activePoll.votesA || 0} votes ({percentA}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500" style={{ width: `${percentA}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-cyan-300">
                        <span>{activePoll.optionB} {userVoteChoice === 'B' ? '✓ Your Vote' : ''}</span>
                        <span>{activePoll.votesB || 0} votes ({percentB}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-500" style={{ width: `${percentB}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-center text-slate-400 font-semibold flex items-center justify-center space-x-1">
                <span>{hasVotedActivePoll ? `✓ Voted (${totalPollVotes} total votes) • +25 XP Claimed` : `👥 ${totalPollVotes} users voted so far • Click an option to vote (+25 XP)!`}</span>
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
                    const filtered = ECG_CHALLENGES.filter(c => c.difficulty === diff);
                    const questions = shuffleArray(filtered.length > 0 ? filtered : ECG_CHALLENGES);
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
                  {activeWeeklyMissions.map(m => (
                    <div key={m.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white flex items-center gap-2">
                          <CheckCircle2 className={`w-4 h-4 ${(m.progress || 0) >= m.target ? 'text-emerald-400' : 'text-slate-600'}`} />
                          {m.title}
                        </span>
                        <span className="text-slate-400 font-mono font-bold">{m.progress || 0} / {m.target} Completed</span>
                      </div>

                      <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                          style={{ width: `${Math.min(100, ((m.progress || 0) / m.target) * 100)}%` }}
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
            
            {(() => {
              const pool = challengeQuizPool.length > 0 ? challengeQuizPool : ((quizQuestions && quizQuestions.length > 0) ? quizQuestions : DAILY_QUIZ_QUESTIONS);
              const currentQ = pool[challengeIndex % pool.length];

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
                      <p className="text-xs text-slate-400">Question #{challengeIndex + 1} • Continuous 60s Sprint ({pool.length} Qs in pool)</p>
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
                              setSelectedQuizOption(idx);
                              if (idx === currentQ?.answer) {
                                setQuizScore(prev => prev + 1);
                              }
                              if (quizIndex < pool.length - 1) {
                                setQuizIndex(prev => prev + 1);
                              } else {
                                setQuizFinished(true);
                                const earned = Math.round(80 * gameXpMultiplier);
                                updateUserProfile({ funPoints: funPoints + earned });
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
                      <p className="text-xs font-bold text-amber-400">+{Math.round(80 * gameXpMultiplier)} XP Awarded!</p>
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

          if (!alreadyClaimedThisWeek) {
            const updatedCompletions = {
              ...guessWeeklyCompletions,
              [gameDifficulty]: currentWeekId
            };
            updateUserProfile({
              funPoints: (currentUser?.funPoints || 450) + weeklyBonusAmount,
              guessWeeklyCompletions: updatedCompletions
            });
          }
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
                                funPoints: (currentUser?.funPoints || 450) + qXpAmount
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

          if (!alreadyClaimedThisWeek) {
            const updatedCompletions = {
              ...bugWeeklyCompletions,
              [gameDifficulty]: currentWeekId
            };
            updateUserProfile({
              funPoints: (currentUser?.funPoints || 450) + weeklyBonusAmount,
              bugWeeklyCompletions: updatedCompletions
            });
          }
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
                                funPoints: (currentUser?.funPoints || 450) + qXpAmount
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

          if (!alreadyClaimedThisWeek) {
            const updatedCompletions = {
              ...ecgWeeklyCompletions,
              [gameDifficulty]: currentWeekId
            };
            updateUserProfile({
              funPoints: (currentUser?.funPoints || 450) + weeklyBonusAmount,
              ecgWeeklyCompletions: updatedCompletions
            });
          }
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
                                funPoints: (currentUser?.funPoints || 450) + qXpAmount
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
              placeholder="⚡ Start typing here (Backspace is disabled)..."
              value={speedTypeInput}
              onKeyDown={(e) => {
                // Disable Backspace in real exam keyboard mode
                if (e.key === 'Backspace') {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                let val = e.target.value;

                // Block backspace deletion (prevent shortening input length)
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
                  setSpeedTypeFinished(true);
                  setRoundTimerActive(false);
                  const earned = Math.round(50 * (acc / 100) * gameXpMultiplier);
                  updateUserProfile({ funPoints: funPoints + earned });
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                triggerToast("🚫 Pasting into typing input is disabled!");
              }}
              className="w-full p-3 bg-slate-900 text-xs text-amber-300 rounded-xl border border-slate-800 font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />

            {speedTypeFinished && (
              <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-center space-y-2 animate-in fade-in">
                <p className="text-sm font-black text-emerald-400">
                  {speedTypeAccuracy >= 90 ? '⚡ Typing Test Completed!' : '🏁 Test Finished! Practice for Higher Accuracy'}
                </p>
                <div className="flex justify-center gap-4 text-xs font-mono text-slate-300">
                  <span>Speed: <strong className="text-cyan-300">{speedTypeWpm} WPM</strong></span>
                  <span>Accuracy: <strong className="text-emerald-300">{speedTypeAccuracy}%</strong></span>
                  <span>XP Awarded: <strong className="text-amber-300">+{Math.round(50 * (speedTypeAccuracy / 100) * gameXpMultiplier)} XP</strong></span>
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

      {/* COPY-PASTE PREVENTION FLOATING TOAST BANNER */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-950/95 text-rose-300 border border-rose-500/50 px-4 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center space-x-2.5 animate-in fade-in slide-in-from-bottom-5">
          <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
