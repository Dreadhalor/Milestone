interface BaseAchievement {
  id: string;
  gameId: string;
  title: string;
  description: string;
}

interface UserAchievement {
  id: string;
  gameId: string;
  userId: string;
  unlockedAt: Date;
  state: 'locked' | 'newly_unlocked' | 'unlocked';
}

export type { BaseAchievement, UserAchievement };
