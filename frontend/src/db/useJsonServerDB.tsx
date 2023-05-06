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
    userId: string | null
  ): Promise<UserAchievement[]> => {
    if (!userId) return Promise.resolve([]);
    // make a get request to /userAchievements/:gameId
    return fetch(`${databaseUrl}/userAchievements?userId=${userId}`).then(
      (res) => res.json()
    );
  };

  const saveAchievement = async (
    achievement: UserAchievement
  ): Promise<UserAchievement> => {
    // First, check if the UserAchievement exists
    const response = await fetch(
      `${databaseUrl}/userAchievements?id=${achievement.id}`
    );
    const existingAchievement = await response.json();

    // If the UserAchievement exists, update it
    if (existingAchievement.length > 0) {
      return fetch(`${databaseUrl}/userAchievements/${achievement.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(achievement),
      }).then((res) => res.json());
    } else {
      // If the UserAchievement doesn't exist, create a new one
      return fetch(`${databaseUrl}/userAchievements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(achievement),
      }).then((res) => res.json());
    }
  };

  return { fetchGameAchievements, fetchUserAchievements, saveAchievement };
};

export default useJsonServerDB;
