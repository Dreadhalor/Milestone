import { BaseAchievement, UserAchievement } from '@src/types';

export interface Database {
  fetchGameAchievements(gameId: string): Promise<BaseAchievement[]>;
  fetchUserAchievements(userId: string): Promise<UserAchievement[]>;
}
