/**
 * Configurable Grade Target Constants
 * Change grade boundaries here without modifying UI components.
 */
export const GRADE_TARGET_CONFIG = [
  { id: 'O', grade: 'O Grade', icon: '🏆', targetFinalMark: 90, isProminent: true },
  { id: 'A_PLUS', grade: 'A+ Grade', icon: '⭐', targetFinalMark: 80, isProminent: false },
  { id: 'A', grade: 'A Grade', icon: '⭐', targetFinalMark: 70, isProminent: false },
  { id: 'B_PLUS', grade: 'B+ Grade', icon: '🟢', targetFinalMark: 60, isProminent: false },
  { id: 'B', grade: 'B Grade', icon: '🟡', targetFinalMark: 50, isProminent: false },
  { id: 'PASS', grade: 'Pass', icon: '✅', targetFinalMark: 40, isProminent: false }
];

/**
 * Calculates the required Semester Exam mark (out of 100) to reach a target final mark (out of 100),
 * given an estimated internal mark (out of 40).
 * 
 * Formula: Required Semester Exam Mark = ((Target Final Mark - Estimated Internal Mark) / 60) * 100
 * Rounded UP to the next integer using Math.ceil().
 *
 * @param {number|null} internalMark - Estimated internal mark out of 40
 * @param {number} targetFinalMark - Target final mark out of 100
 * @returns {object} Calculation result including status, required mark, and text suggestions
 */
export const calculateRequiredSemesterMark = (internalMark, targetFinalMark) => {
  if (internalMark === null || internalMark === undefined || isNaN(internalMark)) {
    return {
      requiredMark: null,
      status: 'missing_inputs',
      message: 'Enter both Internal 1 and Internal 2 marks above to see your Semester Exam target suggestions.'
    };
  }

  // Formula calculation
  const rawRequired = ((targetFinalMark - internalMark) / 60) * 100;

  if (rawRequired <= 0) {
    return {
      requiredMark: 0,
      status: 'already_achieved',
      message: 'Already achieved based on your estimated internal mark.'
    };
  }

  // Always round UP using Math.ceil() for safe student target
  const roundedRequired = Math.ceil(rawRequired);

  if (roundedRequired > 100) {
    return {
      requiredMark: roundedRequired,
      status: 'not_achievable',
      message: 'Not achievable with the current estimated internal mark.'
    };
  }

  return {
    requiredMark: roundedRequired,
    status: 'achievable',
    displayValue: `${roundedRequired}+/100`,
    suggestion: `Aim for ${roundedRequired}+/100`
  };
};

/**
 * Calculates all grade target suggestions based on the current estimated internal mark out of 40.
 *
 * @param {number|null} internalMark - Estimated internal mark out of 40
 * @returns {Array} List of grade targets with calculated semester targets
 */
export const calculateAllGradeTargets = (internalMark) => {
  return GRADE_TARGET_CONFIG.map((config) => {
    const calcResult = calculateRequiredSemesterMark(internalMark, config.targetFinalMark);
    return {
      ...config,
      calcResult
    };
  });
};
