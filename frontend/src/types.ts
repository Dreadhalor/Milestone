import { Timestamp } from 'firebase/firestore';

interface GameAchievements {
  gameId: string;
  achievements: BaseAchievement[];
}

interface BaseAchievementData {
  title: string;
  description: string;
}
interface BaseAchievement extends BaseAchievementData {
  id: string;
  gameId: string;
}

interface UserAchievementData {
  unlockedAt: Timestamp | null;
  state: 'locked' | 'newly_unlocked' | 'unlocked';
}

interface UserAchievement extends UserAchievementData {
  id: string;
  gameId: string;
  userId: string;
}

interface Achievement extends BaseAchievement, UserAchievement {}

export type {
  BaseAchievementData,
  BaseAchievement,
  UserAchievementData,
  UserAchievement,
  Achievement,
  GameAchievements,
};
