/**
 * Frontend Execution Service for Learn Java Code Compiler
 * Connects to OpenJDK Execution Service (Judge0 CE / Piston API) with rate limiting & timeout.
 */

const JUDGE0_EXECUTE_URL = 'https://ce.judge0.com/submissions?wait=true';
const PISTON_EXECUTE_URL = 'https://emkc.org/api/v2/piston/execute';
const TIMEOUT_MS = 12000; // 12 seconds timeout for infinite loop protection

const DAILY_LIMIT_KEY_PREFIX = 'java_daily_runs_';
const THROTTLE_KEY = 'java_throttle_runs';

/**
 * Get daily runs count for a topic on the current date
 */
export const getDailyRunsForTopic = (topicId) => {
  const today = new Date().toISOString().split('T')[0];
  const key = `${DAILY_LIMIT_KEY_PREFIX}${topicId}_${today}`;
  const stored = localStorage.getItem(key);
  return stored ? parseInt(stored, 10) : 0;
};

/**
 * Increment daily runs count for a topic
 */
const incrementDailyRunsForTopic = (topicId) => {
  const today = new Date().toISOString().split('T')[0];
  const key = `${DAILY_LIMIT_KEY_PREFIX}${topicId}_${today}`;
  const current = getDailyRunsForTopic(topicId);
  localStorage.setItem(key, String(current + 1));
  return current + 1;
};

/**
 * Per-minute rate limit throttle check (max 10 runs / min)
 */
const checkPerMinuteThrottle = () => {
  const now = Date.now();
  const raw = sessionStorage.getItem(THROTTLE_KEY);
  let timestamps = raw ? JSON.parse(raw) : [];

  // Filter timestamps within the last 60 seconds
  timestamps = timestamps.filter(t => now - t < 60000);

  if (timestamps.length >= 10) {
    return false; // Throttled!
  }

  timestamps.push(now);
  sessionStorage.setItem(THROTTLE_KEY, JSON.stringify(timestamps));
  return true;
};

export const JavaCompilerService = {
  getDailyRunsForTopic,

  /**
   * Run Java code against Judge0 CE / Piston API
   * @param {Object} params { code, stdin, topicId, userId }
   * @returns {Promise<Object>} { stdout, stderr, compileOutput, exitCode, executionTimeMs, error, isRateLimited }
   */
  runJavaCode: async ({ code, stdin = '', topicId = 'topic_1', userId = 'guest' }) => {
    // 1. Check for empty code
    if (!code || !code.trim()) {
      return {
        error: "Write some code first!",
        stdout: '',
        stderr: 'Write some code first!',
        exitCode: 1
      };
    }

    // 2. Check Daily Topic Limit (max 20 runs/day)
    const dailyRuns = getDailyRunsForTopic(topicId);
    if (dailyRuns >= 20) {
      return {
        error: "You've hit today's run limit for this topic — review your code and try again tomorrow, or move to the next topic",
        stderr: "You've hit today's run limit for this topic (20/20 runs). Please try again tomorrow or proceed to the next topic.",
        stdout: '',
        isRateLimited: true,
        exitCode: 429
      };
    }

    // 3. Check Per-minute Throttle (max 10 runs/min)
    if (!checkPerMinuteThrottle()) {
      return {
        error: "You're running code too quickly. Please wait a few seconds before trying again.",
        stderr: "Rate limit exceeded: max 10 runs per minute. Please pause a moment before clicking Run & Verify again.",
        stdout: '',
        isRateLimited: true,
        exitCode: 429
      };
    }

    // 4. Set up AbortController timeout (12s timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      // Primary Execution Engine: Judge0 CE OpenJDK 13.0.1
      const response = await fetch(JUDGE0_EXECUTE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          language_id: 62, // Java (OpenJDK 13.0.1 / Java 15+)
          source_code: code,
          stdin: stdin || ''
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Fallback to secondary Piston API if primary endpoint returned error status
        return await JavaCompilerService.fallbackPistonExecute({ code, stdin, topicId });
      }

      const data = await response.json();

      // Check if API returned an error message wrapper
      if (data.message && !data.stdout && !data.compile_output && !data.stderr) {
        return await JavaCompilerService.fallbackPistonExecute({ code, stdin, topicId });
      }

      const newDailyCount = incrementDailyRunsForTopic(topicId);

      const stdout = data.stdout || '';
      const stderr = data.stderr || '';
      const compileOutput = data.compile_output || '';
      const exitCode = data.status?.id === 3 ? 0 : (data.status?.id || 1);
      const executionTimeMs = parseFloat(data.time || 0) * 1000;

      return {
        stdout,
        stderr: stderr || compileOutput,
        compileOutput,
        exitCode,
        executionTimeMs,
        dailyRunsCount: newDailyCount,
        error: null
      };

    } catch (err) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        return {
          error: "⚠️ Execution timed out (12s limit). Check for infinite loops or heavy calculations in your code.",
          stderr: "⚠️ Execution Timed Out: Your program exceeded the 12-second execution limit. Verify that your code does not contain infinite loops (e.g. while(true)) or unresponsive Scanner input requests.",
          stdout: '',
          exitCode: 124
        };
      }

      return {
        error: "⚠️ Compiler service error — please try again in a moment",
        stderr: `Network Error: Unable to reach code execution server (${err.message || 'connection failed'}). Please check your internet connection and try again.`,
        stdout: '',
        exitCode: 500
      };
    }
  },

  /**
   * Fallback Piston API executor
   */
  fallbackPistonExecute: async ({ code, stdin, topicId }) => {
    try {
      const response = await fetch(PISTON_EXECUTE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: 'java',
          version: '15.0.2',
          files: [{ name: 'Main.java', content: code }],
          stdin: stdin || ''
        })
      });

      if (!response.ok) {
        return {
          error: "⚠️ Compiler service error — please try again in a moment",
          stderr: "Compiler service error — please try again in a moment",
          stdout: '',
          exitCode: response.status
        };
      }

      const data = await response.json();
      if (!data || !data.run) {
        return {
          error: "⚠️ Compiler service error — please try again in a moment",
          stderr: data.message || "Compiler service error — please try again in a moment",
          stdout: '',
          exitCode: 500
        };
      }

      const newDailyCount = incrementDailyRunsForTopic(topicId);
      return {
        stdout: data.run.stdout || '',
        stderr: data.run.stderr || data.compile?.stderr || '',
        compileOutput: data.compile?.output || '',
        exitCode: data.run.code ?? 0,
        executionTimeMs: data.run.time || 0,
        dailyRunsCount: newDailyCount,
        error: null
      };
    } catch (e) {
      return {
        error: "⚠️ Compiler service error — please try again in a moment",
        stderr: `Compiler Error: ${e.message}`,
        stdout: '',
        exitCode: 500
      };
    }
  }
};
