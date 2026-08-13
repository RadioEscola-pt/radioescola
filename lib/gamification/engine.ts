/**
 * Gamification Engine
 * Processes events and updates gamification state
 */

import type {
  GamificationState,
  GamificationResult,
  XPEvent,
  Achievement,
  UnlockedAchievement,
  DailyGoalType,
} from "@/lib/types/gamification";
import type { ExamAttempt, UserProgress } from "@/lib/types/progress";
import { createInitialGamificationState } from "@/lib/types/gamification";
import { XP_VALUES, calculateExamXP, calculateDailyStreakBonus, ACHIEVEMENT_XP, FAST_FINISH_SECONDS_REMAINING } from "./xp";
import { getLevelForXP } from "./levels";

// Maximum XP allowed (safety cap to prevent corruption from bugs)
const MAX_XP = 100000;

// Helper to safely add XP with cap
function addXPSafely(currentXP: number, xpToAdd: number): number {
  return Math.min(currentXP + xpToAdd, MAX_XP);
}

import { ACHIEVEMENTS } from "./achievements";
import {
  ensureTodayProgress,
  updateDailyGoalProgress,
  areAllDailyGoalsComplete,
  getTodayDateString,
  getYesterdayDateString,
} from "./daily-goals";

/**
 * Create an empty result (used when gamification is disabled)
 */
function createEmptyResult(state: GamificationState): GamificationResult {
  return {
    xpGained: 0,
    xpEvents: [],
    newAchievements: [],
    levelUp: false,
    previousLevel: state.currentLevel,
    newLevel: state.currentLevel,
    dailyGoalsCompleted: [],
    allDailyGoalsComplete: false,
  };
}

/**
 * Evaluate achievements and fold any newly-unlocked ones into the state.
 *
 * Shared by every activity processor so achievements unlock as soon as their
 * underlying stat advances — not only after the next exam. Pushes an
 * `achievement_unlocked` XP event per unlock (into the caller's `events` array),
 * adds the reward XP (capped) and rechecks the level. When `progress` is absent
 * (e.g. pure unit tests) it is a no-op.
 */
function applyAchievements(
  state: GamificationState,
  progress: UserProgress | undefined,
  events: XPEvent[],
  timeRemaining: number,
  now: number
): { newState: GamificationState; unlocked: Achievement[] } {
  if (!progress) {
    return { newState: state, unlocked: [] };
  }

  const achievementResult = checkAchievements(state, progress, timeRemaining);
  const newState = achievementResult.newState;

  for (const achievement of achievementResult.unlocked) {
    events.push({
      type: "achievement_unlocked",
      amount: achievement.xpReward,
      timestamp: now,
      metadata: { achievementId: achievement.id },
    });
    newState.totalXP = addXPSafely(newState.totalXP, achievement.xpReward);
  }

  newState.currentLevel = getLevelForXP(newState.totalXP).level;

  return { newState, unlocked: achievementResult.unlocked };
}

/**
 * Advance the consecutive-day daily-goal streak.
 *
 * Increments only when the previous all-goals-complete day was *yesterday*;
 * resets to 1 after any gap (or on the very first completion). Without this the
 * value was a lifetime count of all-goals days, inflating the streak-bonus XP
 * and the number shown in the daily-goals card.
 */
function bumpDailyGoalStreak(
  state: GamificationState,
  today: string
): GamificationState {
  const yesterday = getYesterdayDateString(today);
  let streak: number;
  if (state.lastGoalCompletionDate === today) {
    // Already counted today (guarded by bonusClaimed, but stay idempotent).
    streak = state.dailyGoalStreak;
  } else if (state.lastGoalCompletionDate === yesterday) {
    streak = state.dailyGoalStreak + 1;
  } else {
    streak = 1;
  }
  return { ...state, dailyGoalStreak: streak, lastGoalCompletionDate: today };
}

/**
 * Process exam completion
 */
export function processExamComplete(
  state: GamificationState,
  progress: UserProgress,
  exam: ExamAttempt,
  timeRemaining: number = 0
): { newState: GamificationState; result: GamificationResult } {
  // If gamification is disabled, return unchanged state
  if (!state.settings.enabled) {
    return { newState: state, result: createEmptyResult(state) };
  }

  let newState = { ...state };
  const events: XPEvent[] = [];
  const newAchievements: Achievement[] = [];
  const now = Date.now();
  const today = getTodayDateString();

  // Check if this is first activity of the day
  const isFirstOfDay = newState.lastActivityDate !== today;
  if (isFirstOfDay) {
    events.push({ type: "first_of_day", amount: XP_VALUES.FIRST_OF_DAY, timestamp: now });
    newState.lastActivityDate = today;
  }

  // Check if first pass for this category
  const isFirstCategoryPass =
    exam.passed &&
    !progress.examHistory.some(
      (e) => e.category === exam.category && e.passed && e.id !== exam.id
    );

  // Calculate exam XP
  const isPerfect = exam.correctCount === exam.totalQuestions;
  const examXP = calculateExamXP(exam.passed, isPerfect, isFirstCategoryPass);

  events.push({ type: "exam_completed", amount: examXP.breakdown.completed, timestamp: now });
  if (exam.passed) {
    events.push({ type: "exam_passed", amount: examXP.breakdown.passed, timestamp: now });
    if (isFirstCategoryPass) {
      events.push({
        type: "exam_passed",
        amount: examXP.breakdown.firstCategoryPass,
        timestamp: now,
        metadata: { firstCategory: true },
      });
    }
  }
  if (isPerfect) {
    events.push({ type: "perfect_score", amount: examXP.breakdown.perfectScore, timestamp: now });
    newState.lifetimeStats = {
      ...newState.lifetimeStats,
      perfectScores: newState.lifetimeStats.perfectScores + 1,
    };
  }

  // Track fast finish (30+ min remaining)
  if (timeRemaining >= FAST_FINISH_SECONDS_REMAINING) {
    newState.lifetimeStats = {
      ...newState.lifetimeStats,
      fastFinishes: newState.lifetimeStats.fastFinishes + 1,
    };
  }

  // Track comeback (pass after failing same category)
  if (exam.passed) {
    const previousFail = progress.examHistory.find(
      (e) => e.category === exam.category && !e.passed && e.id !== exam.id
    );
    if (previousFail) {
      newState.lifetimeStats = {
        ...newState.lifetimeStats,
        comebacks: newState.lifetimeStats.comebacks + 1,
      };
    }
  }

  // Track categories attempted
  if (!newState.lifetimeStats.categoriesAttempted.includes(exam.category)) {
    newState.lifetimeStats = {
      ...newState.lifetimeStats,
      categoriesAttempted: [...newState.lifetimeStats.categoriesAttempted, exam.category],
    };
  }

  // Update daily goals
  newState.dailyProgress = ensureTodayProgress(newState.dailyProgress);
  const dailyResult = updateDailyGoalProgress(newState.dailyProgress, "exams_taken", 1);
  newState.dailyProgress = dailyResult.updated;

  // Exam questions also count toward questions_answered and questions_correct goals.
  // Only questions the user actually answered count — unanswered blanks are excluded
  // (exam.totalQuestions is the full sample size, e.g. 40, regardless of how many were answered).
  const answeredQuestions = exam.correctCount + exam.incorrectCount;
  const questionsResult = updateDailyGoalProgress(newState.dailyProgress, "questions_answered", answeredQuestions);
  newState.dailyProgress = questionsResult.updated;
  const correctResult = updateDailyGoalProgress(newState.dailyProgress, "questions_correct", exam.correctCount);
  newState.dailyProgress = correctResult.updated;

  // Also update lifetime question stats
  newState.lifetimeStats = {
    ...newState.lifetimeStats,
    questionsAnswered: newState.lifetimeStats.questionsAnswered + answeredQuestions,
    questionsCorrect: newState.lifetimeStats.questionsCorrect + exam.correctCount,
  };

  for (const goal of [...dailyResult.newlyCompleted, ...questionsResult.newlyCompleted, ...correctResult.newlyCompleted]) {
    events.push({ type: "daily_goal", amount: goal.xpReward, timestamp: now });
    newState.lifetimeStats = {
      ...newState.lifetimeStats,
      dailyGoalsCompleted: newState.lifetimeStats.dailyGoalsCompleted + 1,
    };
  }

  // Check for all daily goals complete bonus
  const allDailyComplete = areAllDailyGoalsComplete(newState.dailyProgress);
  let bonusJustClaimed = false;
  if (allDailyComplete && !newState.dailyProgress.bonusClaimed) {
    events.push({ type: "daily_goals_all_bonus", amount: XP_VALUES.DAILY_GOALS_ALL_BONUS, timestamp: now });
    newState.dailyProgress = { ...newState.dailyProgress, bonusClaimed: true };
    bonusJustClaimed = true;
    newState.lifetimeStats = {
      ...newState.lifetimeStats,
      dailyGoalSetsCompleted: newState.lifetimeStats.dailyGoalSetsCompleted + 1,
    };
    newState = bumpDailyGoalStreak(newState, today);

    // Daily streak bonus
    const streakBonus = calculateDailyStreakBonus(newState.dailyGoalStreak);
    if (streakBonus > 0) {
      events.push({ type: "daily_streak_bonus", amount: streakBonus, timestamp: now });
    }
  }

  // Calculate total XP
  const totalXP = events.reduce((sum, e) => sum + e.amount, 0);
  const previousLevel = newState.currentLevel;

  // Apply XP (with safety cap)
  newState.totalXP = addXPSafely(newState.totalXP, totalXP);
  newState.currentLevel = getLevelForXP(newState.totalXP).level;

  // Check achievements (also adds their XP + rechecks level)
  const achResult = applyAchievements(newState, progress, events, timeRemaining, now);
  newState = achResult.newState;
  newAchievements.push(...achResult.unlocked);

  // Update XP history (keep last 100)
  newState.xpHistory = [...events, ...newState.xpHistory].slice(0, 100);

  return {
    newState,
    result: {
      xpGained: totalXP + achResult.unlocked.reduce((sum, a) => sum + a.xpReward, 0),
      xpEvents: events,
      newAchievements,
      levelUp: newState.currentLevel > previousLevel,
      previousLevel,
      newLevel: newState.currentLevel,
      dailyGoalsCompleted: dailyResult.newlyCompleted,
      allDailyGoalsComplete: bonusJustClaimed,
    },
  };
}

/**
 * Process question answered (for daily goals and lifetime stats)
 */
export function processQuestionAnswered(
  state: GamificationState,
  correct: boolean,
  progress?: UserProgress,
  goalType: DailyGoalType = "questions_answered"
): { newState: GamificationState; result: GamificationResult } {
  if (!state.settings.enabled) {
    return { newState: state, result: createEmptyResult(state) };
  }

  let newState = { ...state };
  const events: XPEvent[] = [];
  const now = Date.now();
  const today = getTodayDateString();

  // Check if first activity of the day
  const isFirstOfDay = newState.lastActivityDate !== today;
  if (isFirstOfDay) {
    events.push({ type: "first_of_day", amount: XP_VALUES.FIRST_OF_DAY, timestamp: now });
    newState.lastActivityDate = today;
  }

  // Update lifetime stats
  newState.lifetimeStats = {
    ...newState.lifetimeStats,
    questionsAnswered: newState.lifetimeStats.questionsAnswered + 1,
    questionsCorrect: newState.lifetimeStats.questionsCorrect + (correct ? 1 : 0),
  };

  // Update daily goals
  newState.dailyProgress = ensureTodayProgress(newState.dailyProgress);

  // Update questions answered goal
  let dailyResult = updateDailyGoalProgress(newState.dailyProgress, goalType, 1);
  newState.dailyProgress = dailyResult.updated;

  // Also update questions correct goal if correct
  if (correct) {
    const correctResult = updateDailyGoalProgress(newState.dailyProgress, "questions_correct", 1);
    newState.dailyProgress = correctResult.updated;
    dailyResult.newlyCompleted.push(...correctResult.newlyCompleted);
  }

  for (const goal of dailyResult.newlyCompleted) {
    events.push({ type: "daily_goal", amount: goal.xpReward, timestamp: now });
    newState.lifetimeStats = {
      ...newState.lifetimeStats,
      dailyGoalsCompleted: newState.lifetimeStats.dailyGoalsCompleted + 1,
    };
  }

  // Check for all daily goals complete
  const allDailyComplete = areAllDailyGoalsComplete(newState.dailyProgress);
  let bonusJustClaimed = false;
  if (allDailyComplete && !newState.dailyProgress.bonusClaimed) {
    events.push({ type: "daily_goals_all_bonus", amount: XP_VALUES.DAILY_GOALS_ALL_BONUS, timestamp: now });
    newState.dailyProgress = { ...newState.dailyProgress, bonusClaimed: true };
    bonusJustClaimed = true;
    newState.lifetimeStats = {
      ...newState.lifetimeStats,
      dailyGoalSetsCompleted: newState.lifetimeStats.dailyGoalSetsCompleted + 1,
    };
    newState = bumpDailyGoalStreak(newState, today);
  }

  // Calculate total XP (questions don't earn XP directly outside exams, only through goals)
  const totalXP = events.reduce((sum, e) => sum + e.amount, 0);
  const previousLevel = newState.currentLevel;

  newState.totalXP = addXPSafely(newState.totalXP, totalXP);
  newState.currentLevel = getLevelForXP(newState.totalXP).level;

  // Check achievements (streak/level/question milestones can unlock here too)
  const ach = applyAchievements(newState, progress, events, 0, now);
  newState = ach.newState;
  newState.xpHistory = [...events, ...newState.xpHistory].slice(0, 100);

  return {
    newState,
    result: {
      xpGained: totalXP + ach.unlocked.reduce((sum, a) => sum + a.xpReward, 0),
      xpEvents: events,
      newAchievements: ach.unlocked,
      levelUp: newState.currentLevel > previousLevel,
      previousLevel,
      newLevel: newState.currentLevel,
      dailyGoalsCompleted: dailyResult.newlyCompleted,
      allDailyGoalsComplete: bonusJustClaimed,
    },
  };
}

/**
 * Process smart practice session completion
 */
export function processSmartPracticeSession(
  state: GamificationState,
  questionsCompleted: number,
  progress?: UserProgress
): { newState: GamificationState; result: GamificationResult } {
  if (!state.settings.enabled) {
    return { newState: state, result: createEmptyResult(state) };
  }

  let newState = { ...state };
  const events: XPEvent[] = [];
  const now = Date.now();

  // Award XP for smart practice session
  events.push({ type: "smart_practice_session", amount: XP_VALUES.SMART_PRACTICE_SESSION, timestamp: now });

  // Update lifetime stats
  newState.lifetimeStats = {
    ...newState.lifetimeStats,
    smartPracticeSessions: newState.lifetimeStats.smartPracticeSessions + 1,
  };

  // Update daily goals for smart practice
  newState.dailyProgress = ensureTodayProgress(newState.dailyProgress);
  const dailyResult = updateDailyGoalProgress(
    newState.dailyProgress,
    "smart_practice_questions",
    questionsCompleted
  );
  newState.dailyProgress = dailyResult.updated;

  for (const goal of dailyResult.newlyCompleted) {
    events.push({ type: "daily_goal", amount: goal.xpReward, timestamp: now });
    newState.lifetimeStats = {
      ...newState.lifetimeStats,
      dailyGoalsCompleted: newState.lifetimeStats.dailyGoalsCompleted + 1,
    };
  }

  const totalXP = events.reduce((sum, e) => sum + e.amount, 0);
  const previousLevel = newState.currentLevel;

  newState.totalXP = addXPSafely(newState.totalXP, totalXP);
  newState.currentLevel = getLevelForXP(newState.totalXP).level;

  // Check achievements (smart_learner and level/xp milestones can unlock here)
  const ach = applyAchievements(newState, progress, events, 0, now);
  newState = ach.newState;
  newState.xpHistory = [...events, ...newState.xpHistory].slice(0, 100);

  return {
    newState,
    result: {
      xpGained: totalXP + ach.unlocked.reduce((sum, a) => sum + a.xpReward, 0),
      xpEvents: events,
      newAchievements: ach.unlocked,
      levelUp: newState.currentLevel > previousLevel,
      previousLevel,
      newLevel: newState.currentLevel,
      dailyGoalsCompleted: dailyResult.newlyCompleted,
      allDailyGoalsComplete: false,
    },
  };
}

/**
 * Process drill completion
 */
export function processDrillComplete(
  state: GamificationState,
  correctAnswers: number,
  totalQuestions: number,
  progress?: UserProgress,
  // Number of questions actually answered (excludes skips). Defaults to
  // totalQuestions for backward compatibility. totalQuestions is still used
  // to determine a perfect score (all questions correct).
  answeredQuestions: number = totalQuestions
): { newState: GamificationState; result: GamificationResult } {
  if (!state.settings.enabled) {
    return { newState: state, result: createEmptyResult(state) };
  }

  let newState = { ...state };
  const events: XPEvent[] = [];
  const now = Date.now();
  const today = getTodayDateString();

  // Check if first activity of the day
  const isFirstOfDay = newState.lastActivityDate !== today;
  if (isFirstOfDay) {
    events.push({ type: "first_of_day", amount: XP_VALUES.FIRST_OF_DAY, timestamp: now });
    newState.lastActivityDate = today;
  }

  const isPerfect = correctAnswers === totalQuestions;

  // Award XP for drill completion
  events.push({ type: "drill_completed", amount: XP_VALUES.DRILL_COMPLETED, timestamp: now });

  // Bonus XP for perfect score
  if (isPerfect) {
    events.push({ type: "drill_perfect", amount: XP_VALUES.DRILL_PERFECT, timestamp: now });
  }

  // Update lifetime stats
  newState.lifetimeStats = {
    ...newState.lifetimeStats,
    drillsCompleted: (newState.lifetimeStats.drillsCompleted ?? 0) + 1,
    drillsPerfect: (newState.lifetimeStats.drillsPerfect ?? 0) + (isPerfect ? 1 : 0),
    questionsAnswered: newState.lifetimeStats.questionsAnswered + answeredQuestions,
    questionsCorrect: newState.lifetimeStats.questionsCorrect + correctAnswers,
  };

  // Update daily goals
  newState.dailyProgress = ensureTodayProgress(newState.dailyProgress);
  const dailyResult = updateDailyGoalProgress(
    newState.dailyProgress,
    "questions_answered",
    answeredQuestions
  );
  newState.dailyProgress = dailyResult.updated;

  // Also track correct answers
  const correctResult = updateDailyGoalProgress(
    newState.dailyProgress,
    "questions_correct",
    correctAnswers
  );
  newState.dailyProgress = correctResult.updated;
  dailyResult.newlyCompleted.push(...correctResult.newlyCompleted);

  for (const goal of dailyResult.newlyCompleted) {
    events.push({ type: "daily_goal", amount: goal.xpReward, timestamp: now });
    newState.lifetimeStats = {
      ...newState.lifetimeStats,
      dailyGoalsCompleted: newState.lifetimeStats.dailyGoalsCompleted + 1,
    };
  }

  // Check for all daily goals complete
  const allDailyComplete = areAllDailyGoalsComplete(newState.dailyProgress);
  let bonusJustClaimed = false;
  if (allDailyComplete && !newState.dailyProgress.bonusClaimed) {
    events.push({ type: "daily_goals_all_bonus", amount: XP_VALUES.DAILY_GOALS_ALL_BONUS, timestamp: now });
    newState.dailyProgress = { ...newState.dailyProgress, bonusClaimed: true };
    bonusJustClaimed = true;
    newState.lifetimeStats = {
      ...newState.lifetimeStats,
      dailyGoalSetsCompleted: newState.lifetimeStats.dailyGoalSetsCompleted + 1,
    };
    newState = bumpDailyGoalStreak(newState, today);

    const streakBonus = calculateDailyStreakBonus(newState.dailyGoalStreak);
    if (streakBonus > 0) {
      events.push({ type: "daily_streak_bonus", amount: streakBonus, timestamp: now });
    }
  }

  const totalXP = events.reduce((sum, e) => sum + e.amount, 0);
  const previousLevel = newState.currentLevel;

  newState.totalXP = addXPSafely(newState.totalXP, totalXP);
  newState.currentLevel = getLevelForXP(newState.totalXP).level;

  // Check achievements (drill milestones, streak/level/xp can unlock here)
  const ach = applyAchievements(newState, progress, events, 0, now);
  newState = ach.newState;
  newState.xpHistory = [...events, ...newState.xpHistory].slice(0, 100);

  return {
    newState,
    result: {
      xpGained: totalXP + ach.unlocked.reduce((sum, a) => sum + a.xpReward, 0),
      xpEvents: events,
      newAchievements: ach.unlocked,
      levelUp: newState.currentLevel > previousLevel,
      previousLevel,
      newLevel: newState.currentLevel,
      dailyGoalsCompleted: dailyResult.newlyCompleted,
      allDailyGoalsComplete: bonusJustClaimed,
    },
  };
}

/**
 * Toggle gamification enabled/disabled
 */
export function toggleGamification(
  state: GamificationState,
  enabled: boolean
): GamificationState {
  return {
    ...state,
    settings: {
      ...state.settings,
      enabled,
    },
  };
}

/**
 * Check and award achievements
 */
function checkAchievements(
  state: GamificationState,
  progress: UserProgress,
  timeRemaining: number = 0
): { newState: GamificationState; unlocked: Achievement[] } {
  const unlocked: Achievement[] = [];
  const newUnlockedAchievements: UnlockedAchievement[] = [...state.unlockedAchievements];
  const unlockedIds = new Set(state.unlockedAchievements.map((a) => a.achievementId));

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.has(achievement.id)) continue;

    if (evaluateCondition(achievement.condition, state, progress, timeRemaining)) {
      unlocked.push(achievement);
      newUnlockedAchievements.push({
        achievementId: achievement.id,
        unlockedAt: Date.now(),
        notified: false,
      });
    }
  }

  return {
    newState: { ...state, unlockedAchievements: newUnlockedAchievements },
    unlocked,
  };
}

/**
 * Evaluate achievement condition
 */
function evaluateCondition(
  condition: Achievement["condition"],
  state: GamificationState,
  progress: UserProgress,
  timeRemaining: number
): boolean {
  switch (condition.type) {
    case "exams_completed":
      return progress.stats.totalExams >= condition.count;
    case "exams_passed":
      return progress.stats.totalPassed >= condition.count;
    case "perfect_scores":
      return state.lifetimeStats.perfectScores >= condition.count;
    case "questions_answered":
      return state.lifetimeStats.questionsAnswered >= condition.count;
    case "questions_correct":
      return state.lifetimeStats.questionsCorrect >= condition.count;
    case "streak_days":
      return progress.stats.longestStreak >= condition.count;
    case "daily_goals_completed":
      return state.lifetimeStats.dailyGoalsCompleted >= condition.count;
    case "daily_goal_sets_completed":
      return state.lifetimeStats.dailyGoalSetsCompleted >= condition.count;
    case "smart_practice_sessions":
      return state.lifetimeStats.smartPracticeSessions >= condition.count;
    case "level_reached":
      return state.currentLevel >= condition.level;
    case "all_categories_attempted":
      return state.lifetimeStats.categoriesAttempted.length >= 3;
    case "category_mastered":
      // Check if category has >= 70% mastery rate
      return checkCategoryMastered(progress, condition.categoryId);
    case "fast_finish":
      return state.lifetimeStats.fastFinishes > 0;
    case "comeback":
      return state.lifetimeStats.comebacks > 0;
    case "xp_total":
      return state.totalXP >= condition.amount;
    default:
      return false;
  }
}

/**
 * Check if a category is mastered (70%+ of questions answered correctly 2+ times)
 */
function checkCategoryMastered(progress: UserProgress, categoryId: string): boolean {
  const prefix = `cat${categoryId}_`;
  let mastered = 0;
  let total = 0;

  for (const [key, stats] of Object.entries(progress.questionStats)) {
    if (key.startsWith(prefix)) {
      total++;
      if (stats.correct >= 2 && stats.correct / stats.attempts >= 0.7) {
        mastered++;
      }
    }
  }

  // Need at least 50 questions attempted and 70%+ mastered
  return total >= 50 && mastered / total >= 0.7;
}

/**
 * Mark achievements as notified
 */
export function markAchievementsNotified(
  state: GamificationState,
  achievementIds: string[]
): GamificationState {
  const idSet = new Set(achievementIds);
  return {
    ...state,
    unlockedAchievements: state.unlockedAchievements.map((ua) =>
      idSet.has(ua.achievementId) ? { ...ua, notified: true } : ua
    ),
  };
}

/**
 * Get pending achievement notifications
 */
export function getPendingAchievementNotifications(
  state: GamificationState
): UnlockedAchievement[] {
  return state.unlockedAchievements.filter((ua) => !ua.notified);
}

/**
 * Migrate existing progress to include gamification state
 */
export function migrateToGamification(
  progress: UserProgress
): GamificationState {
  const state = createInitialGamificationState();

  // Calculate lifetime stats from existing progress
  let questionsAnswered = 0;
  let questionsCorrect = 0;

  for (const stats of Object.values(progress.questionStats)) {
    questionsAnswered += stats.attempts;
    questionsCorrect += stats.correct;
  }

  // Get categories attempted from exam history
  const categoriesAttempted = [
    ...new Set(progress.examHistory.map((e) => e.category)),
  ];

  // Count perfect scores
  const perfectScores = progress.examHistory.filter(
    (e) => e.correctCount === e.totalQuestions
  ).length;

  state.lifetimeStats = {
    ...state.lifetimeStats,
    questionsAnswered,
    questionsCorrect,
    perfectScores,
    categoriesAttempted,
  };

  // Award XP for past activity (simplified: 5 XP per correct answer)
  const retroactiveXP = questionsCorrect * 5 + progress.stats.totalPassed * 50;
  state.totalXP = addXPSafely(0, retroactiveXP);
  state.currentLevel = getLevelForXP(state.totalXP).level;

  // Retroactively unlock achievements the user already earned. Mark them as
  // already notified so returning users are not flooded with toasts on the
  // first load after this migration.
  const { newState: withAchievements, unlocked } = checkAchievements(state, progress, 0);
  const finalState = withAchievements;
  for (const achievement of unlocked) {
    finalState.totalXP = addXPSafely(finalState.totalXP, achievement.xpReward);
  }
  finalState.currentLevel = getLevelForXP(finalState.totalXP).level;
  finalState.unlockedAchievements = finalState.unlockedAchievements.map((ua) => ({
    ...ua,
    notified: true,
  }));

  return finalState;
}
