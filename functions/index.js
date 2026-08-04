/**
 * Firebase Cloud Functions for IT Department Student Resource Hub
 * Java Code Compiler & Execution Service using Judge0 CE & Piston API
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// In-memory rate limiting map for Cloud Functions environment
const userRateLimits = new Map();

/**
 * Cloud Function: runJavaCode
 * Accepts: { code, stdin, topicId }
 * Returns: { stdout, stderr, compileOutput, exitCode, executionTimeMs }
 */
exports.runJavaCode = onCall({ cors: true }, async (request) => {
  const { code, stdin = "", topicId = "default" } = request.data || {};
  const authUid = request.auth ? request.auth.uid : (request.rawRequest?.ip || "anonymous");

  // 1. Empty code check
  if (!code || typeof code !== "string" || !code.trim()) {
    throw new HttpsError("invalid-argument", "Write some code first!");
  }

  // 2. Rate limiting (max 10 runs/min per user)
  const now = Date.now();
  const userRecord = userRateLimits.get(authUid) || { count: 0, resetTime: now + 60000 };
  
  if (now > userRecord.resetTime) {
    userRecord.count = 0;
    userRecord.resetTime = now + 60000;
  }

  if (userRecord.count >= 10) {
    logger.warn(`Rate limit exceeded for user ${authUid}`);
    throw new HttpsError(
      "resource-exhausted",
      "You're running code too quickly. Please wait a few seconds before trying again."
    );
  }

  userRecord.count += 1;
  userRateLimits.set(authUid, userRecord);

  // 3. Call Judge0 CE / Piston API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch("https://ce.judge0.com/submissions?wait=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        language_id: 62, // Java (OpenJDK 13.0.1)
        source_code: code,
        stdin: stdin
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      logger.error(`Judge0 CE returned status ${response.status}`);
      throw new HttpsError("unavailable", "Compiler service unavailable, please try again");
    }

    const result = await response.json();

    const stdout = result.stdout || "";
    const stderr = result.stderr || "";
    const compileOutput = result.compile_output || "";
    const exitCode = result.status?.id === 3 ? 0 : (result.status?.id || 1);
    const executionTimeMs = parseFloat(result.time || 0) * 1000;

    return {
      stdout,
      stderr,
      compileOutput,
      exitCode,
      executionTimeMs
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new HttpsError("deadline-exceeded", "⚠️ Execution timed out (12s limit). Check for infinite loops.");
    }
    logger.error("Error executing Java code:", error);
    throw new HttpsError("internal", error.message || "Compiler service error — please try again in a moment");
  }
});
