import {
  BaseAchievement,
  UserAchievement,
  UserPreferencesData,
} from '@src/types';

export interface Database {
  fetchGameAchievements: (game_id: string) => Promise<BaseAchievement[]>;
  fetchUserAchievements: (user_id: string | null) => Promise<UserAchievement[]>;
  saveAchievement: (achievement: UserAchievement) => Promise<UserAchievement>;
  deleteAchievement: (
    achievement_id: string,
    game_id: string,
    user_id: string
  ) => Promise<void>;
  subscribeToUserAchievements: (
    user_id: string,
    callback: (achievements: UserAchievement[]) => void
  ) => () => void;
  subscribeToGameAchievements: (
    game_id: string,
    callback: (achievements: BaseAchievement[]) => void
  ) => () => void;

  subscribeToUserPreferences: (
    user_id: string,
    callback: (preferences: UserPreferencesData) => void
  ) => () => void;
  saveUserPreferences: (
    user_id: string,
    preferences: Partial<UserPreferencesData>
  ) => Promise<void>;
}
