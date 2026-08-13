import { describe, it, expect, beforeEach } from "vitest";
import {
  processExamComplete,
  processQuestionAnswered,
  processDrillComplete,
  processSmartPracticeSession,
  toggleGamification,
} from "@/lib/gamification/engine";
import { createInitialGamificationState } from "@/lib/types/gamification";
import type { GamificationState } from "@/lib/types/gamification";
import { createEmptyProgress } from "@/lib/types/progress";
import type { ExamAttempt, UserProgress } from "@/lib/types/progress";
import {
  ensureTodayProgress,
  getTodayDateString,
  getYesterdayDateString,
} from "@/lib/gamification/daily-goals";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeExam(overrides: Partial<ExamAttempt> = {}): ExamAttempt {
  return {
    id: "exam-1",
    category: "3",
    score: 30,
    totalQuestions: 40,
    correctCount: 35,
    incorrectCount: 3,
    unansweredCount: 2,
    passed: true,
    timestamp: Date.now(),
    timeSpent: 2400,
    ...overrides,
  };
}

function stateWithDailyGoals(state: GamificationState): GamificationState {
  return {
    ...state,
    dailyProgress: ensureTodayProgress(state.dailyProgress),
  };
}

// ---------------------------------------------------------------------------
// processExamComplete
// ---------------------------------------------------------------------------

describe("processExamComplete", () => {
  let state: GamificationState;
  let progress: UserProgress;

  beforeEach(() => {
    state = stateWithDailyGoals(createInitialGamificationState());
    progress = createEmptyProgress();
  });

  it("awards XP for a passing exam", () => {
    const exam = makeExam({ passed: true });
    const { newState, result } = processExamComplete(state, progress, exam);

    expect(result.xpGained).toBeGreaterThan(0);
    expect(newState.totalXP).toBeGreaterThan(0);
    expect(result.xpEvents.some((e) => e.type === "exam_completed")).toBe(true);
    expect(result.xpEvents.some((e) => e.type === "exam_passed")).toBe(true);
  });

  it("awards XP for a failing exam (completion only)", () => {
    const exam = makeExam({ passed: false, score: 10 });
    const { result } = processExamComplete(state, progress, exam);

    expect(result.xpEvents.some((e) => e.type === "exam_completed")).toBe(true);
    expect(result.xpEvents.some((e) => e.type === "exam_passed")).toBe(false);
  });

  it("awards bonus for perfect score", () => {
    const exam = makeExam({
      correctCount: 40,
      incorrectCount: 0,
      unansweredCount: 0,
    });
    const { result } = processExamComplete(state, progress, exam);

    expect(result.xpEvents.some((e) => e.type === "perfect_score")).toBe(true);
  });

  it("updates questions_answered daily goal from exam questions", () => {
    // 35 correct + 3 incorrect = 38 answered; the 2 unanswered blanks are excluded.
    const exam = makeExam({
      totalQuestions: 40,
      correctCount: 35,
      incorrectCount: 3,
      unansweredCount: 2,
    });
    const { newState } = processExamComplete(state, progress, exam);

    // Find the questions_answered goal in daily progress
    const qaGoal = newState.dailyProgress?.goals.find(
      (g) => g.type === "questions_answered"
    );
    if (qaGoal) {
      const goalProgress = newState.dailyProgress?.progress[qaGoal.id] ?? 0;
      expect(goalProgress).toBeGreaterThanOrEqual(38);
    }
  });

  it("updates questions_correct daily goal from exam correct answers", () => {
    const exam = makeExam({ totalQuestions: 40, correctCount: 30 });
    const { newState } = processExamComplete(state, progress, exam);

    const qcGoal = newState.dailyProgress?.goals.find(
      (g) => g.type === "questions_correct"
    );
    if (qcGoal) {
      const goalProgress = newState.dailyProgress?.progress[qcGoal.id] ?? 0;
      expect(goalProgress).toBeGreaterThanOrEqual(30);
    }
  });

  it("updates lifetime questionsAnswered from exam (excluding unanswered blanks)", () => {
    // 25 correct + 10 incorrect = 35 answered; the 5 unanswered blanks are excluded.
    const exam = makeExam({
      totalQuestions: 40,
      correctCount: 25,
      incorrectCount: 10,
      unansweredCount: 5,
    });
    const { newState } = processExamComplete(state, progress, exam);

    expect(newState.lifetimeStats.questionsAnswered).toBe(35);
    expect(newState.lifetimeStats.questionsCorrect).toBe(25);
  });

  it("credits zero questionsAnswered for an exam ended without answering", () => {
    const exam = makeExam({
      totalQuestions: 40,
      correctCount: 0,
      incorrectCount: 0,
      unansweredCount: 40,
    });
    const { newState } = processExamComplete(state, progress, exam);

    expect(newState.lifetimeStats.questionsAnswered).toBe(0);
    expect(newState.lifetimeStats.questionsCorrect).toBe(0);
  });

  it("updates exams_taken daily goal", () => {
    const exam = makeExam();
    const { newState } = processExamComplete(state, progress, exam);

    const etGoal = newState.dailyProgress?.goals.find(
      (g) => g.type === "exams_taken"
    );
    if (etGoal) {
      const goalProgress = newState.dailyProgress?.progress[etGoal.id] ?? 0;
      expect(goalProgress).toBeGreaterThanOrEqual(1);
    }
  });

  it("tracks categories attempted", () => {
    const exam = makeExam({ category: "2" });
    const { newState } = processExamComplete(state, progress, exam);

    expect(newState.lifetimeStats.categoriesAttempted).toContain("2");
  });

  it("tracks fast finishes (30+ min remaining)", () => {
    const exam = makeExam();
    const { newState } = processExamComplete(state, progress, exam, 1800);

    expect(newState.lifetimeStats.fastFinishes).toBe(1);
  });

  it("does not track fast finish with less than 30 min remaining", () => {
    const exam = makeExam();
    const { newState } = processExamComplete(state, progress, exam, 1799);

    expect(newState.lifetimeStats.fastFinishes).toBe(0);
  });

  it("tracks comeback (pass after failing same category)", () => {
    const previousFail = makeExam({
      id: "old-exam",
      passed: false,
      category: "3",
    });
    progress.examHistory = [previousFail];

    const exam = makeExam({ id: "new-exam", passed: true, category: "3" });
    const { newState } = processExamComplete(state, progress, exam);

    expect(newState.lifetimeStats.comebacks).toBe(1);
  });

  it("awards first_of_day XP on first activity", () => {
    const exam = makeExam();
    const { result } = processExamComplete(state, progress, exam);

    expect(result.xpEvents.some((e) => e.type === "first_of_day")).toBe(true);
  });

  it("does nothing when gamification is disabled", () => {
    state = toggleGamification(state, false);
    const exam = makeExam();
    const { newState, result } = processExamComplete(state, progress, exam);

    expect(result.xpGained).toBe(0);
    expect(newState.totalXP).toBe(0);
  });

  it("accumulates XP across multiple exams", () => {
    const exam1 = makeExam({ id: "e1" });
    const { newState: s1 } = processExamComplete(state, progress, exam1);

    const exam2 = makeExam({ id: "e2" });
    progress.examHistory = [exam1];
    const { newState: s2 } = processExamComplete(s1, progress, exam2);

    expect(s2.totalXP).toBeGreaterThan(s1.totalXP);
  });
});

// ---------------------------------------------------------------------------
// processQuestionAnswered
// ---------------------------------------------------------------------------

describe("processQuestionAnswered", () => {
  let state: GamificationState;

  beforeEach(() => {
    state = stateWithDailyGoals(createInitialGamificationState());
  });

  it("increments lifetime questionsAnswered", () => {
    const { newState } = processQuestionAnswered(state, true);

    expect(newState.lifetimeStats.questionsAnswered).toBe(1);
    expect(newState.lifetimeStats.questionsCorrect).toBe(1);
  });

  it("only increments questionsCorrect when answer is correct", () => {
    const { newState } = processQuestionAnswered(state, false);

    expect(newState.lifetimeStats.questionsAnswered).toBe(1);
    expect(newState.lifetimeStats.questionsCorrect).toBe(0);
  });

  it("updates questions_answered daily goal", () => {
    const { newState } = processQuestionAnswered(state, true);

    const qaGoal = newState.dailyProgress?.goals.find(
      (g) => g.type === "questions_answered"
    );
    if (qaGoal) {
      expect(newState.dailyProgress?.progress[qaGoal.id]).toBeGreaterThanOrEqual(1);
    }
  });

  it("does nothing when gamification is disabled", () => {
    state = toggleGamification(state, false);
    const { newState } = processQuestionAnswered(state, true);

    expect(newState.lifetimeStats.questionsAnswered).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// processDrillComplete
// ---------------------------------------------------------------------------

describe("processDrillComplete", () => {
  let state: GamificationState;

  beforeEach(() => {
    state = stateWithDailyGoals(createInitialGamificationState());
  });

  it("awards XP for drill completion", () => {
    const { result } = processDrillComplete(state, 8, 10);

    expect(result.xpGained).toBeGreaterThan(0);
    expect(result.xpEvents.some((e) => e.type === "drill_completed")).toBe(true);
  });

  it("awards bonus for perfect drill", () => {
    const { result } = processDrillComplete(state, 10, 10);

    expect(result.xpEvents.some((e) => e.type === "drill_perfect")).toBe(true);
  });

  it("updates questions_answered daily goal from drill", () => {
    const { newState } = processDrillComplete(state, 7, 10);

    const qaGoal = newState.dailyProgress?.goals.find(
      (g) => g.type === "questions_answered"
    );
    if (qaGoal) {
      expect(newState.dailyProgress?.progress[qaGoal.id]).toBeGreaterThanOrEqual(10);
    }
  });

  it("updates questions_correct daily goal from drill", () => {
    const { newState } = processDrillComplete(state, 7, 10);

    const qcGoal = newState.dailyProgress?.goals.find(
      (g) => g.type === "questions_correct"
    );
    if (qcGoal) {
      expect(newState.dailyProgress?.progress[qcGoal.id]).toBeGreaterThanOrEqual(7);
    }
  });

  it("does nothing when gamification is disabled", () => {
    state = toggleGamification(state, false);
    const { result } = processDrillComplete(state, 10, 10);

    expect(result.xpGained).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// processSmartPracticeSession
// ---------------------------------------------------------------------------

describe("processSmartPracticeSession", () => {
  let state: GamificationState;

  beforeEach(() => {
    state = stateWithDailyGoals(createInitialGamificationState());
  });

  it("awards XP for smart practice", () => {
    const { result } = processSmartPracticeSession(state, 15);

    expect(result.xpGained).toBeGreaterThan(0);
    expect(result.xpEvents.some((e) => e.type === "smart_practice_session")).toBe(true);
  });

  it("increments smartPracticeSessions lifetime stat", () => {
    const { newState } = processSmartPracticeSession(state, 15);

    expect(newState.lifetimeStats.smartPracticeSessions).toBe(1);
  });

  it("does nothing when gamification is disabled", () => {
    state = toggleGamification(state, false);
    const { result } = processSmartPracticeSession(state, 15);

    expect(result.xpGained).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Daily goals consistency across activity types
// ---------------------------------------------------------------------------

describe("daily goal consistency across activity types", () => {
  let state: GamificationState;
  let progress: UserProgress;

  beforeEach(() => {
    state = stateWithDailyGoals(createInitialGamificationState());
    progress = createEmptyProgress();
  });

  it("exam questions count the same as individual questions for daily goals", () => {
    // Answer all 40 questions via exam (30 correct, 10 incorrect, 0 unanswered)
    const exam = makeExam({
      totalQuestions: 40,
      correctCount: 30,
      incorrectCount: 10,
      unansweredCount: 0,
    });
    const { newState: examState } = processExamComplete(state, progress, exam);

    // Answer 40 questions individually
    let questionState = { ...state };
    for (let i = 0; i < 40; i++) {
      const { newState } = processQuestionAnswered(questionState, i < 30);
      questionState = newState;
    }

    // Both should have the same lifetime question counts
    expect(examState.lifetimeStats.questionsAnswered).toBe(
      questionState.lifetimeStats.questionsAnswered
    );
    expect(examState.lifetimeStats.questionsCorrect).toBe(
      questionState.lifetimeStats.questionsCorrect
    );
  });

  it("drill questions count toward questions_answered daily goal", () => {
    const { newState } = processDrillComplete(state, 8, 10);

    const qaGoal = newState.dailyProgress?.goals.find(
      (g) => g.type === "questions_answered"
    );
    if (qaGoal) {
      expect(newState.dailyProgress?.progress[qaGoal.id]).toBeGreaterThanOrEqual(10);
    }
  });

  it("drill updates lifetime questionsAnswered and questionsCorrect", () => {
    const { newState } = processDrillComplete(state, 8, 10);

    expect(newState.lifetimeStats.questionsAnswered).toBe(10);
    expect(newState.lifetimeStats.questionsCorrect).toBe(8);
  });

  it("drill counts only answered questions, excluding skipped ones", () => {
    // 8 correct out of 10, but only 9 were actually answered (1 skipped).
    const { newState } = processDrillComplete(state, 8, 10, undefined, 9);

    expect(newState.lifetimeStats.questionsAnswered).toBe(9);
    expect(newState.lifetimeStats.questionsCorrect).toBe(8);
  });
});

// ---------------------------------------------------------------------------
// Daily goal streak (consecutive-day reset)
// ---------------------------------------------------------------------------

/**
 * Build a state whose (single) daily goal is already complete and whose bonus
 * has not yet been claimed, so the next processor call enters the
 * "all daily goals complete" branch and bumps the streak.
 */
function stateWithAllGoalsComplete(
  base: GamificationState,
  lastGoalCompletionDate: string | null,
  dailyGoalStreak: number
): GamificationState {
  const today = getTodayDateString();
  const goal = {
    id: `${today}-done`,
    type: "questions_answered" as const,
    target: 1,
    xpReward: 10,
  };
  return {
    ...base,
    dailyGoalStreak,
    lastGoalCompletionDate,
    dailyProgress: {
      date: today,
      goals: [goal],
      progress: { [goal.id]: 1 },
      completed: [goal.id],
      bonusClaimed: false,
    },
  };
}

describe("dailyGoalStreak consecutive-day handling", () => {
  const base = createInitialGamificationState();
  const today = getTodayDateString();

  it("increments when the previous completion was yesterday", () => {
    const state = stateWithAllGoalsComplete(base, getYesterdayDateString(today), 3);
    const { newState } = processQuestionAnswered(state, true);

    expect(newState.dailyGoalStreak).toBe(4);
    expect(newState.lastGoalCompletionDate).toBe(today);
  });

  it("resets to 1 after a missed day (gap)", () => {
    const twoDaysAgo = getYesterdayDateString(getYesterdayDateString(today));
    const state = stateWithAllGoalsComplete(base, twoDaysAgo, 3);
    const { newState } = processQuestionAnswered(state, true);

    expect(newState.dailyGoalStreak).toBe(1);
    expect(newState.lastGoalCompletionDate).toBe(today);
  });

  it("starts at 1 on the first ever completion", () => {
    const state = stateWithAllGoalsComplete(base, null, 0);
    const { newState } = processQuestionAnswered(state, true);

    expect(newState.dailyGoalStreak).toBe(1);
    expect(newState.lastGoalCompletionDate).toBe(today);
  });

  it("increments dailyGoalSetsCompleted once and flags the bonus as just claimed", () => {
    const state = stateWithAllGoalsComplete(base, getYesterdayDateString(today), 1);
    const { newState, result } = processQuestionAnswered(state, true);

    expect(newState.lifetimeStats.dailyGoalSetsCompleted).toBe(1);
    expect(result.allDailyGoalsComplete).toBe(true);
  });

  it("unlocks daily_champion after 7 goal SETS, not 7 individual goals", () => {
    let state = stateWithAllGoalsComplete(base, getYesterdayDateString(today), 6);
    state = {
      ...state,
      lifetimeStats: { ...state.lifetimeStats, dailyGoalSetsCompleted: 6 },
    };

    const { result } = processQuestionAnswered(state, true, createEmptyProgress());

    expect(result.newAchievements.some((a) => a.id === "daily_champion")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Achievements unlock outside of exams
// ---------------------------------------------------------------------------

describe("achievements evaluate on non-exam activity", () => {
  let progress: UserProgress;

  beforeEach(() => {
    progress = createEmptyProgress();
  });

  it("unlocks a question-count achievement from a browsed question", () => {
    let state = stateWithDailyGoals(createInitialGamificationState());
    state = { ...state, lifetimeStats: { ...state.lifetimeStats, questionsAnswered: 99 } };

    const { result } = processQuestionAnswered(state, true, progress);

    expect(result.newAchievements.some((a) => a.id === "hundred_questions")).toBe(true);
  });

  it("does not evaluate achievements when no progress is supplied", () => {
    let state = stateWithDailyGoals(createInitialGamificationState());
    state = { ...state, lifetimeStats: { ...state.lifetimeStats, questionsAnswered: 99 } };

    const { result } = processQuestionAnswered(state, true);

    expect(result.newAchievements).toHaveLength(0);
  });

  it("unlocks a streak achievement via progress.stats from a question", () => {
    const state = stateWithDailyGoals(createInitialGamificationState());
    progress.stats.longestStreak = 7;

    const { result } = processQuestionAnswered(state, true, progress);

    expect(result.newAchievements.some((a) => a.id === "week_streak")).toBe(true);
  });

  it("unlocks achievements from a drill", () => {
    let state = stateWithDailyGoals(createInitialGamificationState());
    state = { ...state, lifetimeStats: { ...state.lifetimeStats, questionsAnswered: 99 } };

    const { result } = processDrillComplete(state, 1, 1, progress);

    expect(result.newAchievements.some((a) => a.id === "hundred_questions")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// XP safety cap
// ---------------------------------------------------------------------------

describe("XP safety cap", () => {
  it("caps XP at 100,000", () => {
    let state = stateWithDailyGoals(createInitialGamificationState());
    state.totalXP = 99_990;
    const progress = createEmptyProgress();

    const exam = makeExam();
    const { newState } = processExamComplete(state, progress, exam);

    expect(newState.totalXP).toBeLessThanOrEqual(100_000);
  });
});
