import { useEffect, useState } from 'react';
import { BaseAchievement, Achievement, UserAchievement } from '@src/types';
import { useAchievementsData } from './useAchievementsData';

const useCombinedAchievements = (
  uid: string | null,
  app = 'fallcrate'
): Achievement[] => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const { gameAchievements, userAchievements } = useAchievementsData(uid, app);

  useEffect(() => {
    const combineSingleAchievement = (
      gameAchievement: BaseAchievement,
      userAchievement: UserAchievement | null
    ): Achievement => {
      if (!userAchievement) {
        userAchievement = {
          id: gameAchievement.id,
          gameId: app,
          uid: uid ?? '', // TODO: fix this (uid is not null)
          unlockedAt: null,
          state: 'locked',
        };
      }
      return {
        ...gameAchievement,
        ...userAchievement,
      };
    };

    const combineAchievements = (
      gameAchievements: BaseAchievement[],
      userAchievements: UserAchievement[]
    ): Achievement[] => {
      return gameAchievements.map((gameAchievement) => {
        const userAchievement =
          userAchievements.find(
            (userAchievement) => userAchievement.id === gameAchievement.id
          ) ?? null;

        return combineSingleAchievement(gameAchievement, userAchievement);
      });
    };

    setAchievements(combineAchievements(gameAchievements, userAchievements));
  }, [gameAchievements, userAchievements, uid, app]);

  return achievements ?? [];
};

export default useCombinedAchievements;
