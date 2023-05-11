interface BaseAchievement {
  id: string;
  gameId: string;
  title: string;
  description: string;
}

interface GameAchievements {
  gameId: string;
  achievements: BaseAchievement[];
}

interface UserAchievement {
  id: string;
  gameId: string;
  userId: string;
  unlockedAt: Date | null;
  state: 'locked' | 'newly_unlocked' | 'unlocked';
}

interface Achievement extends BaseAchievement, UserAchievement {}

export type { BaseAchievement, UserAchievement, Achievement, GameAchievements };
