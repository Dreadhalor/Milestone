import { useState, useEffect } from 'react';
import { useDB } from '@hooks/useDB';
import { BaseAchievement, UserAchievement } from '@src/types';

export function useAchievementsData(uid: string | null, gameId: string) {
  const db = useDB();
  const [gameAchievements, setGameAchievements] = useState<BaseAchievement[]>(
    []
  );
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(
    []
  );

  useEffect(() => {
    const gameUnsubscribe = db.subscribeToGameAchievements(
      gameId,
      setGameAchievements
    );
    const userUnsubscribe = db.subscribeToUserAchievements(
      uid,
      setUserAchievements
    );

    return () => {
      gameUnsubscribe();
      userUnsubscribe();
    };
  }, [uid, gameId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { gameAchievements, userAchievements };
}
