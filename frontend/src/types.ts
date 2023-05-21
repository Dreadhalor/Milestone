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
  uid: string;
}

interface Achievement extends BaseAchievement, UserAchievement { }

interface UserPreferencesData {
  showNotifications: boolean | undefined;
  showBadges: boolean | undefined;
}
interface UserPreferences {
  preferences: UserPreferencesData;
}

export type {
  BaseAchievementData,
  BaseAchievement,
  UserAchievementData,
  UserAchievement,
  Achievement,
  GameAchievements,
  UserPreferences,
  UserPreferencesData,
};
