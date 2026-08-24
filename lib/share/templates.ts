import type { ShareContent } from "./share-service";

// The canonical origin. Shared links point straight at it rather than at the
// apex, which redirects — a shared result should not cost the recipient a hop.
const APP_URL = "https://www.radioescola.pt";
const HASHTAGS = ["hamradio", "radioamador", "portugal"];

interface ExamResultParams {
  category: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
}

interface AchievementParams {
  achievementName: string;
  achievementDescription?: string;
}

interface LevelUpParams {
  level: number;
  levelName: string;
}

interface StreakParams {
  streakDays: number;
}

/**
 * Create share content for exam results
 */
export function createExamResultShare(params: ExamResultParams): ShareContent {
  const { category, score, totalQuestions, passed } = params;
  const percentage = Math.round((score / totalQuestions) * 100);

  const statusEmoji = passed ? "✅" : "📚";
  const statusText = passed ? "Passed" : "Keep practicing";

  return {
    title: `Ham Radio Exam Result - Category ${category}`,
    text: `${statusEmoji} ${statusText}! I scored ${score}/${totalQuestions} (${percentage}%) on my Category ${category} ham radio practice exam on Rádio Escola!`,
    url: APP_URL,
    hashtags: HASHTAGS,
  };
}

/**
 * Create share content for achievement unlock
 */
export function createAchievementShare(params: AchievementParams): ShareContent {
  const { achievementName, achievementDescription } = params;

  return {
    title: `Achievement Unlocked - ${achievementName}`,
    text: `🏆 I just unlocked the "${achievementName}" achievement on Rádio Escola!${achievementDescription ? ` ${achievementDescription}` : ""}`,
    url: APP_URL,
    hashtags: HASHTAGS,
  };
}

/**
 * Create share content for level up
 */
export function createLevelUpShare(params: LevelUpParams): ShareContent {
  const { level, levelName } = params;

  return {
    title: `Level Up - ${levelName}`,
    text: `📻 I reached Level ${level}: ${levelName} on Rádio Escola! Studying to become a licensed ham radio operator.`,
    url: APP_URL,
    hashtags: HASHTAGS,
  };
}

/**
 * Create share content for study streak
 */
export function createStreakShare(params: StreakParams): ShareContent {
  const { streakDays } = params;

  return {
    title: `${streakDays} Day Study Streak`,
    text: `🔥 ${streakDays} day study streak on Rádio Escola! Consistent practice for my ham radio license.`,
    url: APP_URL,
    hashtags: HASHTAGS,
  };
}
