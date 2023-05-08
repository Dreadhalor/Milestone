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
    // make a get request to /userAchievements/:userId & process the response
    return fetch(`${databaseUrl}/userAchievements?userId=${userId}`)
      .then((res) => res.json())
      .then((unprocessed_achievements) => {
        return unprocessed_achievements.map(
          (unprocessed_achievement: UserAchievement) => {
            unprocessed_achievement.id =
              unprocessed_achievement.id.split('--')[2];
            return unprocessed_achievement;
          }
        );
      });
  };

  const saveAchievement = async (
    achievement: UserAchievement
  ): Promise<UserAchievement> => {
    // First, check if the UserAchievement exists
    const response = await fetch(
      `${databaseUrl}/userAchievements?id=${achievement.userId}--${achievement.gameId}--${achievement.id}`
    );
    const existingAchievement = await response.json();

    // If the UserAchievement exists, update it
    if (existingAchievement.length > 0) {
      return fetch(
        `${databaseUrl}/userAchievements/${achievement.userId}--${achievement.gameId}--${achievement.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(achievement),
        }
      ).then((res) => res.json());
    } else {
      // If the UserAchievement doesn't exist, create a new one
      const copy = { ...achievement };
      copy.id = `${achievement.userId}--${achievement.gameId}--${achievement.id}`;
      return fetch(`${databaseUrl}/userAchievements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(copy),
      }).then((res) => res.json());
    }
  };

  return { fetchGameAchievements, fetchUserAchievements, saveAchievement };
};

export default useJsonServerDB;
