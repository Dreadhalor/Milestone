import { BaseAchievement, GameAchievements, UserAchievement } from '@src/types';

export const getUserAchievementPrimaryKey = (
  achievement: UserAchievement
): string => {
  if (!achievement.userId || !achievement.gameId || !achievement.id) return '';

  return `${achievement.userId}--${achievement.gameId}--${achievement.id}`;
};
const parseUserAchievementPrimaryKey = (primaryKey: string): string => {
  const id = primaryKey.split('--')[2];
  return id;
};
export const processUserAchievement = (
  achievement: UserAchievement
): UserAchievement => {
  achievement.id = parseUserAchievementPrimaryKey(achievement.id);
  return achievement;
};
export const processGameAchievements = (
  games: GameAchievements[]
): BaseAchievement[] => games.map((game) => game.achievements).flat(1);
