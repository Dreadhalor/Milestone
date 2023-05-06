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
  unlockedAt: Date | null;
  state: 'locked' | 'newly_unlocked' | 'unlocked';
}

interface Achievement extends BaseAchievement, UserAchievement {}

// interface User {
//   id: string;
//   username: string;
// }

export type { BaseAchievement, UserAchievement, Achievement };
