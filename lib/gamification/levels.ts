/**
 * Level definitions and progression
 * Ham radio themed level names
 */

import type { Level } from "@/lib/types/gamification";

export const LEVELS: Level[] = [
  { level: 1,  name: "SWL Listener",      nameKey: "levels.1",  minXP: 0,      maxXP: 100,      icon: "Radio" },
  { level: 2,  name: "Apprentice",        nameKey: "levels.2",  minXP: 100,    maxXP: 300,      icon: "Headphones" },
  { level: 3,  name: "Novice",            nameKey: "levels.3",  minXP: 300,    maxXP: 600,      icon: "Signal" },
  { level: 4,  name: "Technician",        nameKey: "levels.4",  minXP: 600,    maxXP: 1000,     icon: "Wrench" },
  { level: 5,  name: "General Operator",  nameKey: "levels.5",  minXP: 1000,   maxXP: 1500,     icon: "RadioTower" },
  { level: 6,  name: "Advanced Operator", nameKey: "levels.6",  minXP: 1500,   maxXP: 2200,     icon: "Antenna" },
  { level: 7,  name: "Extra Class",       nameKey: "levels.7",  minXP: 2200,   maxXP: 3000,     icon: "Satellite" },
  { level: 8,  name: "DX Hunter",         nameKey: "levels.8",  minXP: 3000,   maxXP: 4000,     icon: "Globe" },
  { level: 9,  name: "Contest Operator",  nameKey: "levels.9",  minXP: 4000,   maxXP: 5500,     icon: "Trophy" },
  { level: 10, name: "Net Control",       nameKey: "levels.10", minXP: 5500,   maxXP: 7500,     icon: "Network" },
  { level: 11, name: "ARRL Member",       nameKey: "levels.11", minXP: 7500,   maxXP: 10000,    icon: "Award" },
  { level: 12, name: "Elmer",             nameKey: "levels.12", minXP: 10000,  maxXP: 15000,    icon: "GraduationCap" },
  { level: 13, name: "Station Master",    nameKey: "levels.13", minXP: 15000,  maxXP: 25000,    icon: "Building2" },
  { level: 14, name: "Silent Key Legend", nameKey: "levels.14", minXP: 25000,  maxXP: 50000,    icon: "Star" },
  { level: 15, name: "Hall of Fame",      nameKey: "levels.15", minXP: 50000,  maxXP: Infinity, icon: "Crown" },
];

export function getLevelForXP(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    const level = LEVELS[i];
    if (level && xp >= level.minXP) {
      return level;
    }
  }
  return LEVELS[0]!;
}

export function getLevelByNumber(levelNum: number): Level | undefined {
  return LEVELS.find(l => l.level === levelNum);
}

export function getXPProgress(xp: number): {
  currentXP: number;
  levelXP: number;
  requiredXP: number;
  percentage: number;
} {
  const level = getLevelForXP(xp);
  const nextLevelIndex = LEVELS.findIndex(l => l.level === level.level + 1);
  const nextLevel = nextLevelIndex >= 0 ? LEVELS[nextLevelIndex] : null;

  if (!nextLevel || level.maxXP === Infinity) {
    return {
      currentXP: xp,
      levelXP: xp - level.minXP,
      requiredXP: 0,
      percentage: 100,
    };
  }

  const levelXP = xp - level.minXP;
  const requiredXP = nextLevel.minXP - level.minXP;
  const percentage = Math.min(100, Math.round((levelXP / requiredXP) * 100));

  return {
    currentXP: xp,
    levelXP,
    requiredXP,
    percentage,
  };
}

export function getXPToNextLevel(xp: number): number {
  const level = getLevelForXP(xp);
  const nextLevelIndex = LEVELS.findIndex(l => l.level === level.level + 1);
  const nextLevel = nextLevelIndex >= 0 ? LEVELS[nextLevelIndex] : null;

  if (!nextLevel) return 0;
  return nextLevel.minXP - xp;
}
