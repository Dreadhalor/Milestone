import { BaseAchievement, UserAchievement } from '@src/types';

export interface Database {
  fetchGameAchievements: (game_id: string) => Promise<BaseAchievement[]>;
  fetchUserAchievements: (user_id: string | null) => Promise<UserAchievement[]>;
  saveAchievement: (achievement: UserAchievement) => Promise<UserAchievement>;
  deleteAchievement: (
    achievement_id: string,
    game_id: string,
    user_id: string
  ) => Promise<void>;
}
