import {
  BaseAchievement,
  UserAchievement,
  UserPreferencesData,
} from '@src/types';
import { Database } from './Database';
import {
  getUserAchievementPrimaryKey,
  processGameAchievements,
  processUserAchievement,
} from './jsonServerFormatters';

const databaseUrl =
  import.meta.env.VITE_DATABASE_URL || 'http://localhost:3000';

const useJsonServerDB = (): Database => {
  const fetchGameAchievements = async (
    gameId: string
  ): Promise<BaseAchievement[]> => {
    // make a get request to /achievements/:gameId
    return fetch(`${databaseUrl}/gameAchievements?gameId=${gameId}`)
      .then((res) => res.json())
      .then((unprocessed_game_achievements) =>
        processGameAchievements(unprocessed_game_achievements)
      );
  };

  const fetchUserAchievements = async (
    userId: string | null
  ): Promise<UserAchievement[]> => {
    if (!userId) return Promise.resolve([]);
    // make a get request to /userAchievements/:userId & process the response
    return fetch(`${databaseUrl}/userAchievements?userId=${userId}`)
      .then((res) => res.json())
      .then((unprocessed_achievements) =>
        unprocessed_achievements.map(processUserAchievement)
      );
  };

  const saveAchievement = async (
    achievement: UserAchievement
  ): Promise<UserAchievement> => {
    const id = getUserAchievementPrimaryKey(achievement);
    // First, check if the UserAchievement exists
    const response = await fetch(`${databaseUrl}/userAchievements?id=${id}`);
    const existingAchievement = await response.json();

    // If the UserAchievement exists, update it
    if (existingAchievement.length > 0) {
      return fetch(`${databaseUrl}/userAchievements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(achievement),
      }).then((res) => res.json());
    } else {
      // If the UserAchievement doesn't exist, create a new one
      const copy = { ...achievement };
      copy.id = getUserAchievementPrimaryKey(achievement);
      return fetch(`${databaseUrl}/userAchievements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copy),
      }).then((res) => res.json());
    }
  };

  const deleteAchievement = async (
    achievement_id: string,
    game_id: string,
    user_id: string
  ): Promise<void> => {
    const id = getUserAchievementPrimaryKey({
      id: achievement_id,
      gameId: game_id,
      userId: user_id,
    } as UserAchievement);
    const url = `${databaseUrl}/userAchievements/${id}`;
    console.log('deleting achievement at url', url);
    // use the params to make a delete request to /userAchievements/:id
    return fetch(`${url}`, {
      method: 'DELETE',
    }).then((res) => {
      console.log('deleted achievement', achievement_id);
      return res.json();
    });
  };

  const subscribeToGameAchievements =
    (game_id: string, callback: (achievements: BaseAchievement[]) => void) =>
    () => {
      console.log('subscribing to game achievements', game_id, callback);
    };
  const subscribeToUserAchievements =
    (user_id: string, callback: (achievements: UserAchievement[]) => void) =>
    () => {
      console.log('subscribing to user achievements', user_id, callback);
    };

  const saveUserPreferences = async (
    user_id: string,
    preferences: Partial<UserPreferencesData>
  ): Promise<void> => {
    console.log('setting user preferences', user_id, preferences);
  };
  const subscribeToUserPreferences =
    (user_id: string, callback: (preferences: UserPreferencesData) => void) =>
    () => {
      console.log('subscribing to user preferences', user_id, callback);
    };

  return {
    fetchGameAchievements,
    fetchUserAchievements,
    saveAchievement,
    deleteAchievement,
    subscribeToGameAchievements,
    subscribeToUserAchievements,
    saveUserPreferences,
    subscribeToUserPreferences,
  };
};

export default useJsonServerDB;
