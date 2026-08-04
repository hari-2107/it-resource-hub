import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { JavaCompilerService, getDailyRunsForTopic } from '../services/javaCompilerService';
import { 
  Coffee, 
  BookOpen, 
  Terminal, 
  Play, 
  RotateCcw, 
  Copy, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  Sparkles,
  Monitor,
  Zap,
  BarChart3,
  Clock,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  Activity,
  Flame,
  RefreshCw
} from 'lucide-react';

const TOPICS = [
  {
    id: 'topic_1',
    topicNumber: 1,
    title: '1. What is Java (JVM, JDK, JRE)',
    explanation: `Java is a high-level, class-based, object-oriented programming language designed around the principle of **"Write Once, Run Anywhere" (WORA)**. When you write Java code, it is compiled into platform-independent **Bytecode** (\`.class\` file), which can run on any device with a Java Virtual Machine.

Key Components Explained:
- **JVM (Java Virtual Machine)**: The core execution engine. It loads, verifies, and executes Java bytecode by translating it into native machine code specific to the host OS (Windows, Mac, Linux).
- **JRE (Java Runtime Environment)**: Includes the JVM + core class libraries (\`rt.jar\`, etc.). It provides everything required to **run** a compiled Java application.
- **JDK (Java Development Kit)**: The complete software development environment. It contains the JRE + development tools like the compiler (\`javac\`), debugger (\`jdb\`), and archiver (\`jar\`).`,
    codeExample: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("JVM executes this bytecode across platforms.");
    }
}`,
    starterCode: `public class Main {
    public static void main(String[] args) {
        // Try modifying the code below to print your name & department!
        System.out.println("Welcome to IT Department Java Lab!");
        System.out.println("Java version: " + System.getProperty("java.version"));
    }
}`,
    defaultStdin: ''
  },
  {
    id: 'topic_2',
    topicNumber: 2,
    title: '2. Variables & Data Types',
    explanation: `Variables are named containers for storing data values in memory. Java is a **statically-typed language**, meaning every variable must be declared with a specific data type before it can be used.

Primitive Data Types:
- \`int\`: Stores integers (whole numbers) without decimals (e.g., \`100\`, \`-42\`). Size: 4 bytes.
- \`double\`: Stores floating-point numbers with high precision (e.g., \`3.14159\`, \`-0.005\`). Size: 8 bytes.
- \`char\`: Stores a single Unicode character enclosed in single quotes (e.g., \`'A'\`, \`'$'\`). Size: 2 bytes.
- \`boolean\`: Stores truth values: \`true\` or \`false\`. Size: 1 bit.

Reference Data Type:
- \`String\`: Represents a sequence of characters enclosed in double quotes (e.g., \`"Hello Java"\`).`,
    codeExample: `public class VariablesDemo {
    public static void main(String[] args) {
        int studentId = 101;
        double gpa = 3.92;
        char grade = 'A';
        boolean isEnrolled = true;
        String studentName = "Ananya Sharma";

        System.out.println("Student Name: " + studentName);
        System.out.println("ID: " + studentId + " | GPA: " + gpa);
        System.out.println("Grade: " + grade + " | Active: " + isEnrolled);
    }
}`,
    starterCode: `public class Main {
    public static void main(String[] args) {
        int studentId = 202;
        double gpa = 3.85;
        char grade = 'A';
        boolean isPassed = true;
        String studentName = "Rahul Verma";

        // Try adding another variable for attendancePercentage (double) and print it!
        System.out.println("Student Name: " + studentName);
        System.out.println("ID: " + studentId + " | GPA: " + gpa);
        System.out.println("Grade: " + grade + " | Passed: " + isPassed);
    }
}`,
    defaultStdin: ''
  },
  {
    id: 'topic_3',
    topicNumber: 3,
    title: '3. Taking Input in Java — Scanner Class in Depth',
    explanation: `To accept input from the console, Java provides the **\`Scanner\`** class located in the \`java.util\` package.

How to set up Scanner:
\`import java.util.Scanner;\`
\`Scanner sc = new Scanner(System.in);\`.

Common Scanner Methods:
- \`sc.nextInt()\`: Reads an integer.
- \`sc.nextDouble()\`: Reads a double.
- \`sc.next()\`: Reads a single word/token (stops at whitespace).
- \`sc.nextLine()\`: Reads an entire line of text (including spaces) until you press Enter.

⚠️ **THE SCANNER BUFFER TRAP (Critical Gotcha!)**:
When you call \`sc.nextInt()\` or \`sc.nextDouble()\`, it reads only the numeric characters and leaves the newline character (\`\\n\`) inside the input buffer.
If you call \`sc.nextLine()\` immediately after \`sc.nextInt()\`, \`nextLine()\` will read that leftover \`\\n\` and instantly return an empty string!

**Fix**: Always consume the leftover newline by inserting an extra \`sc.nextLine();\` after reading numbers, before reading strings.`,
    codeExample: `import java.util.Scanner;

public class ScannerDemo {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter your Roll Number: ");
        int rollNo = sc.nextInt();

        // BUFFER FIX: Consume leftover newline character!
        sc.nextLine(); 

        System.out.print("Enter your Full Name: ");
        String fullName = sc.nextLine();

        System.out.println("Roll No: " + rollNo + " | Name: " + fullName);
        sc.close();
    }
}`,
    starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.println("Reading Roll Number...");
        int rollNo = sc.nextInt();

        // TRY THIS: Uncomment the line below to fix the Scanner buffer trap!
        // sc.nextLine(); 

        System.out.println("Reading Full Name...");
        String fullName = sc.nextLine();

        System.out.println("--- OUTPUT RESULT ---");
        System.out.println("Roll No: " + rollNo);
        System.out.println("Full Name: '" + fullName + "'");

        sc.close();
    }
}`,
    defaultStdin: "101\nAnanya Sharma"
  },
  {
    id: 'topic_4',
    topicNumber: 4,
    title: '4. Output in Java — println vs print vs printf',
    explanation: `Java provides multiple ways to print output to the console via \`System.out\`:

1. \`System.out.println()\`: Prints the text and automatically appends a newline (\`\\n\`) at the end.
2. \`System.out.print()\`: Prints the text without adding a newline, keeping the cursor on the same line.
3. \`System.out.printf()\`: Performs **formatted printing** using format specifiers:
   - \`%d\`: Integer
   - \`%f\`: Floating-point number (e.g., \`%.2f\` formats to 2 decimal places)
   - \`%s\`: String
   - \`%c\`: Character
   - \`%n\`: Platform-independent newline`,
    codeExample: `public class OutputDemo {
    public static void main(String[] args) {
        System.out.print("Hello ");
        System.out.print("World! ");
        System.out.println("(Same line)");

        String product = "Java Notebook";
        int qty = 3;
        double price = 149.50;

        System.out.printf("Item: %s | Qty: %d | Total: ₹%.2f%n", product, qty, (qty * price));
    }
}`,
    starterCode: `public class Main {
    public static void main(String[] args) {
        String item = "Data Structures Book";
        int quantity = 2;
        double pricePerUnit = 499.75;

        // Try changing %.2f to %.4f or %d to see formatting changes!
        System.out.printf("Item: %s | Qty: %d | Total Price: ₹%.2f%n", item, quantity, (quantity * pricePerUnit));
    }
}`,
    defaultStdin: ''
  },
  {
    id: 'topic_5',
    topicNumber: 5,
    title: '5. Operators (Arithmetic, Relational, Logical)',
    explanation: `Operators perform operations on variables and values.

1. **Arithmetic Operators**:
   - \`+\` (Addition), \`-\` (Subtraction), \`*\` (Multiplication), \`/\` (Division), \`%\` (Modulus / Remainder).
   - *Note*: Integer division (e.g., \`17 / 5\`) truncates the fractional part to produce \`3\`.

2. **Relational Operators**:
   - \`==\`, \`!=\`, \`>\`, \`<\`, \`>=\`, \`<=\`. Returns \`true\` or \`false\`.

3. **Logical Operators**:
   - \`&&\` (Logical AND): Both true.
   - \`||\` (Logical OR): At least one true.
   - \`!\` (Logical NOT): Inverts boolean.`,
    codeExample: `public class OperatorsDemo {
    public static void main(String[] args) {
        int a = 17, b = 5;

        System.out.println("Integer Division (17 / 5): " + (a / b)); // 3
        System.out.println("Modulus Remainder (17 % 5): " + (a % b)); // 2

        boolean hasId = true;
        int age = 20;
        System.out.println("Eligible: " + ((age >= 18) && hasId)); // true
    }
}`,
    starterCode: `public class Main {
    public static void main(String[] args) {
        int num1 = 29;
        int num2 = 4;

        System.out.println("Quotient (29 / 4): " + (num1 / num2));
        System.out.println("Remainder (29 % 4): " + (num1 % num2));
        System.out.println("Floating Division: " + ((double) num1 / num2));
    }
}`,
    defaultStdin: ''
  },
  {
    id: 'topic_6',
    topicNumber: 6,
    title: '6. Type Casting (Implicit vs Explicit)',
    explanation: `Type casting is converting a value of one primitive data type to another type.

1. **Implicit Casting (Widening)**:
   - Converting smaller data type to larger size type automatically by Java.
   - Sequence: \`byte\` ➔ \`short\` ➔ \`char\` ➔ \`int\` ➔ \`long\` ➔ \`float\` ➔ \`double\`.

2. **Explicit Casting (Narrowing)**:
   - Converting larger data type to smaller size type manually using parentheses \`(targetType)\`.
   - Sequence: \`double\` ➔ \`float\` ➔ \`long\` ➔ \`int\` ➔ \`char\` ➔ \`short\` ➔ \`byte\`.
   - Truncates decimal parts or causes overflow if out of range!`,
    codeExample: `public class TypeCastingDemo {
    public static void main(String[] args) {
        int numInt = 42;
        double numDouble = numInt; // Automatic 42.0
        System.out.println("Implicit Double: " + numDouble);

        double decimalVal = 99.85;
        int castedInt = (int) decimalVal; // Truncates -> 99
        System.out.println("Explicit Int: " + castedInt);
    }
}`,
    starterCode: `public class Main {
    public static void main(String[] args) {
        double productRating = 4.89;
        
        // Explicitly cast to integer (drops decimal part)
        int roundedStars = (int) productRating;

        System.out.println("Original Rating: " + productRating);
        System.out.println("Truncated Integer Stars: " + roundedStars);
    }
}`,
    defaultStdin: ''
  },
  {
    id: 'topic_7',
    topicNumber: 7,
    title: '7. Basic If-Else Conditionals',
    explanation: `Conditional statements allow your program to execute different blocks of code based on logical conditions.

Syntax:
\`\`\`java
if (condition1) {
    // executes if condition1 is true
} else if (condition2) {
    // executes if condition2 is true
} else {
    // executes if all conditions are false
}
\`\`\``,
    codeExample: `public class ConditionalsDemo {
    public static void main(String[] args) {
        int score = 85;

        if (score >= 90) {
            System.out.println("Grade: A+");
        } else if (score >= 80) {
            System.out.println("Grade: A");
        } else {
            System.out.println("Grade: Pass");
        }
    }
}`,
    starterCode: `public class Main {
    public static void main(String[] args) {
        int marks = 82;

        if (marks >= 90) {
            System.out.println("Grade: Outstanding (A+)");
        } else if (marks >= 75) {
            System.out.println("Grade: Excellent (A)");
        } else if (marks >= 60) {
            System.out.println("Grade: Good (B)");
        } else {
            System.out.println("Grade: Needs Improvement");
        }
    }
}`,
    defaultStdin: ''
  }
];

const COMMON_ERROR_LOOKUPS = [
  {
    pattern: /cannot find symbol/i,
    title: "Cannot Find Symbol Error",
    explanation: "Java cannot find the variable, method, or class you referenced. Check for spelling typos, missing variable declarations, or missing imports (e.g. `import java.util.Scanner;`)."
  },
  {
    pattern: /['"]?;\s*['"]?\s*expected/i,
    title: "Missing Semicolon (;) Error",
    explanation: "Java requires every statement to end with a semicolon `;`. Check the line mentioned in the error traceback."
  },
  {
    pattern: /class Main is public, should be declared in a file named Main\.java/i,
    title: "Public Class Name Mismatch",
    explanation: "In Java, the public class name must match the filename. Ensure your public class is named `Main`."
  },
  {
    pattern: /NoSuchElementException|InputMismatchException/i,
    title: "Scanner Input Error",
    explanation: "Your code tried to read input using `nextInt()` or `nextLine()`, but no stdin text was provided or the data type did not match. Add console input in the Stdin box!"
  },
  {
    pattern: /unclosed string literal/i,
    title: "Unclosed String Literal Error",
    explanation: "You opened a String with double quotes `\"` but forgot to close it before the newline."
  }
];

export const JavaLearningPage = () => {
  const authContext = useAuth();
  const currentUser = authContext?.currentUser || null;
  const updateUserProfile = authContext?.updateUserProfile || (() => {});
  const { trackJavaTopicTime, logJavaRunAttempt, getUserJavaActivity } = useData();

  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const currentTopic = TOPICS[activeTopicIndex] || TOPICS[0];

  // Tab View state: 'editor' | 'progress'
  const [activeViewTab, setActiveViewTab] = useState('editor');

  // Code Editor state
  const [userCode, setUserCode] = useState(currentTopic?.starterCode || '');
  const [stdinInput, setStdinInput] = useState(currentTopic?.defaultStdin || '');

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState(null); // { stdout, stderr, exitCode, error }
  const [runsCount, setRunsCount] = useState(0);

  // Copy code feedback
  const [copiedCode, setCopiedCode] = useState(false);

  // Track viewed topics on user document
  const viewedTopics = Array.isArray(currentUser?.viewedTopics) ? currentUser.viewedTopics : [];

  // Active Time Tracking on Current Topic
  const accumulatedTimeRef = React.useRef(0);

  const flushTimeSpent = () => {
    if (accumulatedTimeRef.current > 0 && currentTopic) {
      const secs = accumulatedTimeRef.current;
      accumulatedTimeRef.current = 0;
      if (typeof trackJavaTopicTime === 'function') {
        trackJavaTopicTime(currentUser?.uid, currentTopic.id, secs);
      }
    }
  };

  useEffect(() => {
    accumulatedTimeRef.current = 0;

    const timer = setInterval(() => {
      if (document.visibilityState === 'visible' && document.hasFocus() && activeViewTab === 'editor') {
        accumulatedTimeRef.current += 1;
        if (accumulatedTimeRef.current >= 5) {
          flushTimeSpent();
        }
      }
    }, 1000);

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flushTimeSpent();
      }
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', flushTimeSpent);

    return () => {
      flushTimeSpent();
      clearInterval(timer);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', flushTimeSpent);
    };
  }, [activeTopicIndex, activeViewTab]);

  useEffect(() => {
    if (!currentTopic) return;
    setUserCode(currentTopic.starterCode || '');
    setStdinInput(currentTopic.defaultStdin || '');
    setConsoleOutput(null);
    setRunsCount(getDailyRunsForTopic(currentTopic.id));

    if (currentUser?.uid && typeof updateUserProfile === 'function') {
      if (!viewedTopics.includes(currentTopic.id)) {
        const updatedViewed = [...viewedTopics, currentTopic.id];
        updateUserProfile({ viewedTopics: updatedViewed });
      }
    }
  }, [activeTopicIndex]);

  const handleCopyExampleCode = () => {
    navigator.clipboard.writeText(currentTopic.codeExample);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleResetCode = () => {
    setUserCode(currentTopic.starterCode);
    setStdinInput(currentTopic.defaultStdin);
    setConsoleOutput(null);
  };

  // Support Tab key indentation in code textarea
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const value = userCode;

      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      setUserCode(newValue);

      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  // Run Code via JavaCompilerService (Piston API & Cloud Function)
  const handleRunCode = async () => {
    if (!userCode || !userCode.trim()) {
      setConsoleOutput({
        error: "Write some code first!",
        stderr: "Write some code first!",
        stdout: '',
        code: 1
      });
      return;
    }

    setIsRunning(true);
    setConsoleOutput(null);

    const result = await JavaCompilerService.runJavaCode({
      code: userCode,
      stdin: stdinInput,
      topicId: currentTopic.id,
      userId: currentUser?.uid || 'guest'
    });

    const isSuccess = result.exitCode === 0 && !result.stderr && !result.error;
    const attemptResult = isSuccess 
      ? 'success' 
      : (result.compileOutput ? 'compileError' : 'runtimeError');

    // Log run attempt to user's activity tracker
    if (typeof logJavaRunAttempt === 'function') {
      logJavaRunAttempt(currentUser?.uid, currentTopic.id, {
        codeSnapshot: userCode,
        consoleInput: stdinInput,
        result: attemptResult,
        errorMessage: result.stderr || result.compileOutput || result.error || '',
        executionTimeMs: result.executionTimeMs || 0
      });
    }

    setConsoleOutput({
      stdout: result.stdout || '',
      stderr: result.stderr || result.compileOutput || result.error || '',
      error: result.error || '',
      code: result.exitCode !== undefined ? result.exitCode : 0
    });

    if (result.dailyRunsCount !== undefined) {
      setRunsCount(result.dailyRunsCount);
    } else {
      setRunsCount(getDailyRunsForTopic(currentTopic.id));
    }

    setIsRunning(false);
  };

  // Helper to detect common error lookup matches
  const matchedErrorGuide = consoleOutput?.stderr || consoleOutput?.output 
    ? COMMON_ERROR_LOOKUPS.find(item => item.pattern.test(consoleOutput.stderr || consoleOutput.output))
    : null;

  const totalTopics = TOPICS.length;
  const viewedCount = viewedTopics.length;
  const progressPercent = Math.round((viewedCount / totalTopics) * 100);

  // Student Performance Aggregations
  const userActivityMap = typeof getUserJavaActivity === 'function' 
    ? getUserJavaActivity(currentUser?.uid) 
    : {};

  let totalTimeSpentSecs = 0;
  let totalRunsCount = 0;
  let totalSuccessfulRuns = 0;
  let mostAttemptedTopicId = null;
  let maxAttemptsOnTopic = 0;
  const commonErrorsCountMap = {};

  TOPICS.forEach(topic => {
    const act = userActivityMap[topic.id] || {};
    totalTimeSpentSecs += (act.timeSpentSeconds || 0);
    totalRunsCount += (act.totalRuns || 0);
    totalSuccessfulRuns += (act.successfulRuns || 0);

    if ((act.totalRuns || 0) > maxAttemptsOnTopic) {
      maxAttemptsOnTopic = act.totalRuns;
      mostAttemptedTopicId = topic.id;
    }

    (act.runAttempts || []).forEach(attempt => {
      if (attempt.errorMessage) {
        const msg = attempt.errorMessage.toLowerCase();
        let label = 'Syntax or Compiler Error';
        if (msg.includes('scanner') || msg.includes('inputmismatch') || msg.includes('nosuch') || msg.includes('buffer')) {
          label = 'Scanner Input Buffer / Type Mismatch';
        } else if (msg.includes(';') || msg.includes('expected')) {
          label = 'Missing Semicolon ; or Format';
        } else if (msg.includes('nullpointer') || msg.includes('null')) {
          label = 'Null Pointer Dereference';
        } else if (msg.includes('arrayindex') || msg.includes('out of bounds')) {
          label = 'Array Index Out of Bounds';
        } else if (msg.includes('cannot find symbol') || msg.includes('symbol')) {
          label = 'Undefined Variable or Symbol Scope';
        }
        commonErrorsCountMap[label] = (commonErrorsCountMap[label] || 0) + 1;
      }
    });
  });

  const overallSuccessRate = totalRunsCount > 0 
    ? Math.round((totalSuccessfulRuns / totalRunsCount) * 100) 
    : 0;

  const mostAttemptedTopicObj = TOPICS.find(t => t.id === mostAttemptedTopicId);

  const formatTimeSpent = (totalSecs) => {
    if (!totalSecs || totalSecs <= 0) return '0 mins';
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* HEADER & TOPIC PROGRESS SUMMARY */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-950 relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/20 font-black text-2xl">
                ☕
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                  <span>Learn Java</span>
                  <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Interactive Lab & Compiler
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300">
                  Read core concepts, experiment with code, and verify your understanding with the real Java compiler!
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            {/* TAB VIEW SWITCHER */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setActiveViewTab('editor')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeViewTab === 'editor'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Coffee className="w-4 h-4" />
                <span>📖 Topics & Lab</span>
              </button>
              <button
                onClick={() => {
                  flushTimeSpent();
                  setActiveViewTab('progress');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeViewTab === 'progress'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>📊 My Progress</span>
              </button>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-2 text-xs font-bold text-amber-400">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>{viewedCount} of {totalTopics} Topics Viewed</span>
            </div>
          </div>
        </div>

        {/* Informational Desktop Notice & Progress Bar */}
        <div className="space-y-3 relative z-10 pt-2 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5 text-amber-300/90">
              <Monitor className="w-4 h-4 text-amber-400" />
              💡 Code writing & verification works best on desktop devices.
            </span>
            <span className="text-slate-300 font-bold">Progress: {progressPercent}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style={{ width: `${Math.max(progressPercent, 5)}%` }}
            />
          </div>
        </div>
      </div>

      {/* VIEW CONDITIONAL: EDITOR vs PROGRESS */}
      {activeViewTab === 'editor' ? (
        /* MAIN LAYOUT: SIDEBAR TOPICS + CONCEPT & COMPILER */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR: TOPIC LIST */}
          <div className="space-y-2 lg:col-span-1">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider px-2 block mb-3">
              Course Topics
            </span>

            <div className="space-y-1.5">
              {TOPICS.map((topic, index) => {
                const isActive = index === activeTopicIndex;
                const isViewed = viewedTopics.includes(topic.id);
                const topicStats = userActivityMap[topic.id] || {};
                const topicTimeStr = formatTimeSpent(topicStats.timeSpentSeconds || 0);

                return (
                  <button
                    key={topic.id}
                    onClick={() => setActiveTopicIndex(index)}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-start justify-between gap-3 border ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-500/50 text-white shadow-lg shadow-amber-500/10'
                        : isViewed
                        ? 'bg-slate-900/80 border-slate-800 text-slate-200 hover:bg-slate-900'
                        : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-black flex items-center gap-2">
                        <span>{topic.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        {isViewed ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Viewed
                          </span>
                        ) : (
                          <span>Unread</span>
                        )}
                        {topicStats.timeSpentSeconds > 0 && (
                          <span>• {topicTimeStr}</span>
                        )}
                      </div>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: CONCEPT EXPLANATION & COMPILER */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* CONCEPT SECTION */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">{currentTopic.title}</h2>
                <p className="text-xs text-amber-400/80 font-medium">Concept Explanation & Sample Implementation</p>
              </div>

              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line space-y-4">
                {currentTopic.explanation}
              </div>

              {/* Reference Code Block */}
              <div className="space-y-2 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    Reference Code Example:
                  </span>
                  <button
                    onClick={handleCopyExampleCode}
                    className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 text-[11px] transition-all flex items-center gap-1.5"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800/80 font-mono text-xs text-slate-200 overflow-x-auto">
                  <pre>{currentTopic.codeExample}</pre>
                </div>
              </div>
            </div>

            {/* INTERACTIVE COMPILER WORKSPACE */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/20 bg-slate-950/60 space-y-6 shadow-2xl">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-amber-400" />
                    <span>Interactive Java Compiler</span>
                  </h3>
                  <p className="text-xs text-slate-400">Modify code below, enter inputs if needed, and verify output.</p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleResetCode}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Reset Starter Code</span>
                  </button>

                  <button
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isRunning ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Compiling...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-slate-950" />
                        <span>▶ Run & Verify</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code Editor Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-2">
                  <span>Main.java</span>
                  <span>Language: Java 15 (OpenJDK)</span>
                </div>

                <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl focus-within:border-amber-500/50 transition-all">
                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={14}
                    spellCheck="false"
                    className="w-full p-5 font-mono text-xs sm:text-sm bg-transparent text-emerald-300 focus:outline-none resize-y leading-relaxed"
                  />
                </div>
              </div>

              {/* Stdin Console Input Box (for Scanner testing) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  Console Input (Stdin) — Provide line-by-line input for Scanner tests:
                </label>
                <textarea
                  value={stdinInput}
                  onChange={(e) => setStdinInput(e.target.value)}
                  rows={2}
                  placeholder="Enter input lines here (e.g. 101 \n Ananya Sharma)"
                  className="w-full p-3 font-mono text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Console Output Terminal Panel */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-amber-400" />
                  Compiler Output Terminal
                </span>

                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 min-h-[120px] font-mono text-xs leading-relaxed space-y-3 shadow-inner">
                  {isRunning ? (
                    <div className="flex items-center space-x-2 text-amber-400 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span>Executing code against Java 15 runtime...</span>
                    </div>
                  ) : consoleOutput ? (
                    <div className="space-y-3">
                      {consoleOutput.stdout && (
                        <div className="text-emerald-400 space-y-1">
                          <span className="text-[10px] font-bold uppercase text-emerald-500/80 block">Standard Output (stdout):</span>
                          <pre className="whitespace-pre-wrap">{consoleOutput.stdout}</pre>
                        </div>
                      )}

                      {(consoleOutput.stderr || consoleOutput.error) && (
                        <div className="text-rose-400 space-y-1">
                          <span className="text-[10px] font-bold uppercase text-rose-500/80 block">Error Traceback (stderr):</span>
                          <pre className="whitespace-pre-wrap">{consoleOutput.stderr || consoleOutput.error}</pre>
                        </div>
                      )}

                      {consoleOutput.code !== undefined && (
                        <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-900 flex justify-between">
                          <span>Process exited with code {consoleOutput.code}</span>
                          <span>{consoleOutput.code === 0 ? '✓ Build Success' : '❌ Runtime Error'}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-600 italic">
                      Click "▶ Run & Verify" above to compile your code and see real console output here.
                    </p>
                  )}
                </div>

                {/* Common Compiler Error Guide Lookup */}
                {matchedErrorGuide && (
                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs space-y-1.5 animate-in fade-in">
                    <span className="font-extrabold text-amber-300 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-400" />
                      What does this error mean? ({matchedErrorGuide.title})
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {matchedErrorGuide.explanation}
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* TOPIC NAVIGATION CONTROLS */}
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setActiveTopicIndex(prev => Math.max(0, prev - 1))}
                disabled={activeTopicIndex === 0}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-all flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Topic</span>
              </button>

              <button
                onClick={() => setActiveTopicIndex(prev => Math.min(TOPICS.length - 1, prev + 1))}
                disabled={activeTopicIndex === TOPICS.length - 1}
                className="px-6 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20 disabled:opacity-40 hover:scale-105 transition-all flex items-center space-x-2"
              >
                <span>Next Topic</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      ) : (
        /* STUDENT MY PROGRESS & PERFORMANCE DASHBOARD */
        <div className="space-y-8 animate-in fade-in">
          
          {/* OVERALL SUMMARY STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Time Invested */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-2 bg-gradient-to-br from-slate-900 to-slate-950">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Time Invested</span>
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {formatTimeSpent(totalTimeSpentSecs)}
              </div>
              <p className="text-[11px] text-slate-400">Active effort reading & experimenting on topics</p>
            </div>

            {/* Total Code Runs */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-2 bg-gradient-to-br from-slate-900 to-slate-950">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Code Runs</span>
                <Play className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {totalRunsCount} <span className="text-xs text-slate-400 font-normal">Executions</span>
              </div>
              <p className="text-[11px] text-slate-400">Total "Run & Verify" compiler checks</p>
            </div>

            {/* Success Rate */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-2 bg-gradient-to-br from-slate-900 to-slate-950">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Success Accuracy</span>
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400">
                {overallSuccessRate}%
              </div>
              <p className="text-[11px] text-slate-400">{totalSuccessfulRuns} of {totalRunsCount} runs succeeded</p>
            </div>

            {/* Most Attempted Topic */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-2 bg-gradient-to-br from-slate-900 to-slate-950">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Focus Practice Topic</span>
                <Target className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-sm font-black text-amber-300 truncate">
                {mostAttemptedTopicObj ? mostAttemptedTopicObj.title : 'None Yet'}
              </div>
              <p className="text-[11px] text-slate-400">
                {maxAttemptsOnTopic > 0 ? `${maxAttemptsOnTopic} compilation attempts logged` : 'Start practicing code!'}
              </p>
            </div>

          </div>

          {/* PER-TOPIC BREAKDOWN GRID */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <span>Per-Topic Learning Breakdown</span>
              </h3>
              <span className="text-xs text-slate-400">7 Core Topics</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TOPICS.map((topic, index) => {
                const topicStats = userActivityMap[topic.id] || {};
                const runs = topicStats.totalRuns || 0;
                const successes = topicStats.successfulRuns || 0;
                const topicRate = runs > 0 ? Math.round((successes / runs) * 100) : 0;
                const isViewed = viewedTopics.includes(topic.id);
                const timeSpent = formatTimeSpent(topicStats.timeSpentSeconds || 0);

                return (
                  <div key={topic.id} className="glass-panel p-5 rounded-2xl border border-slate-800/80 bg-slate-950/60 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-black text-white">{topic.title}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <span>Time Spent: <strong className="text-amber-300">{timeSpent}</strong></span>
                          <span>•</span>
                          <span>Last Active: {topicStats.lastViewedAt ? new Date(topicStats.lastViewedAt).toLocaleDateString() : 'Not visited'}</span>
                        </div>
                      </div>
                      {isViewed && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex-shrink-0">
                          Viewed
                        </span>
                      )}
                    </div>

                    {/* Progress Bar & Stats */}
                    <div className="space-y-2 pt-2 border-t border-slate-900">
                      <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                        <span>Compiler Accuracy ({successes}/{runs} Runs)</span>
                        <span className="text-amber-400">{topicRate}% Success</span>
                      </div>

                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all"
                          style={{ width: `${Math.max(topicRate, runs > 0 ? 10 : 0)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PERSONALIZED COMMON MISTAKES & GROWTH OPPORTUNITIES */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-950/20 via-slate-950 to-slate-950 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30 font-bold">
                💡
              </div>
              <div>
                <h3 className="text-base font-black text-white">Personalized Growth & Error Insights</h3>
                <p className="text-xs text-slate-400">Common compiler challenges encountered during your practice sessions</p>
              </div>
            </div>

            {Object.keys(commonErrorsCountMap).length > 0 ? (
              <div className="space-y-3 pt-2">
                {Object.entries(commonErrorsCountMap).map(([errorType, count], i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-extrabold text-amber-300 block">
                        You hit "{errorType}" {count} time{count > 1 ? 's' : ''}
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        Keep practicing! Review syntax structure and input scanner lines carefully to minimize build failures.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 italic text-center">
                ✨ No major compiler errors logged yet! Click "▶ Run & Verify" in the lab workspace to start experimenting with Java code.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
