import { BaseAchievement, UserAchievement } from '@src/types';
import { Database } from './Database';

const databaseUrl =
  import.meta.env.VITE_DATABASE_URL || 'http://localhost:3000';

const useJsonServerDB = (): Database => {
  const fetchGameAchievements = async (
    gameId: string
  ): Promise<BaseAchievement[]> => {
    // make a get request to /achievements/:gameId
    return fetch(`${databaseUrl}/achievements?gameId=${gameId}`).then((res) =>
      res.json()
    );
  };

  const fetchUserAchievements = async (
    userId: string
  ): Promise<UserAchievement[]> => {
    // make a get request to /userAchievements/:gameId
    return fetch(`${databaseUrl}/achievements?userId=${userId}`).then((res) =>
      res.json()
    );
  };

  return { fetchGameAchievements, fetchUserAchievements };
};

export default useJsonServerDB;
