import React, { createContext, useState, useEffect } from 'react';
import { UserAchievement, BaseAchievement, Achievement } from '@src/types';
import { useDB } from '@hooks/useDB';
import { useAuth } from '@hooks/useAuth';

interface AchievementsContextValue {
  gameAchievements: BaseAchievement[];
  userAchievements: UserAchievement[];
  achievements: Achievement[];
  unlockAchievement: (achievement: Achievement) => Promise<void>;
  toggleAchievement: (achievement: Achievement) => Promise<void>;
}

export const AchievementsContext = createContext<AchievementsContextValue>(
  {} as AchievementsContextValue
);

interface Props {
  children: React.ReactNode;
}

export const AchievementsProvider = ({ children }: Props) => {
  const db = useDB();
  const { userId } = useAuth();

  const [gameAchievements, setGameAchievements] = useState<BaseAchievement[]>(
    []
  );
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(
    []
  );
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const fetchGameAchievements = async () => {
    const fetchedAchievements = await db.fetchGameAchievements('fallcrate');
    console.log('game achievements: ', fetchedAchievements);
    setGameAchievements(fetchedAchievements);
  };

  const fetchUserAchievements = async () => {
    if (userId) {
      const fetchedAchievements = await db.fetchUserAchievements(userId);
      console.log('user achievements: ', fetchedAchievements);
      setUserAchievements(fetchedAchievements);
    } else {
      setUserAchievements([]);
    }
  };
  const resetAchievements = () => {
    fetchGameAchievements();
    fetchUserAchievements();
  };

  // useEffect(() => {
  //   fetchGameAchievements();
  //   fetchUserAchievements();
  // }, [userId]);

  useEffect(() => {
    const gameUnsubscribe = db.subscribeToGameAchievements(
      'fallcrate',
      setGameAchievements
    );
    const userUnsubscribe = db.subscribeToUserAchievements(
      userId as string,
      setUserAchievements
    );

    return () => {
      gameUnsubscribe && gameUnsubscribe();
      userUnsubscribe && userUnsubscribe();
    };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const extractUserAchievement = (
    achievement: Achievement
  ): UserAchievement => {
    return {
      id: achievement.id,
      gameId: 'fallcrate',
      userId: achievement.userId ?? '',
      unlockedAt: null,
      state: achievement.state,
    };
  };

  const changeAchievementState = async (
    achievement: Achievement,
    state: 'locked' | 'unlocked'
  ) => {
    if (!userId) return;

    const userAchievement = extractUserAchievement(achievement);
    userAchievement.state = state;
    if (state === 'unlocked') userAchievement.unlockedAt = new Date();

    state === 'unlocked'
      ? await db.saveAchievement(userAchievement)
      : await db.deleteAchievement(
          achievement.id,
          achievement.gameId,
          achievement.userId
        );

    resetAchievements();
  };

  const unlockAchievement = (achievement: Achievement) =>
    changeAchievementState(achievement, 'unlocked');
  const lockAchievement = (achievement: Achievement) =>
    changeAchievementState(achievement, 'locked');

  const toggleAchievement = async (achievement: Achievement) => {
    const userAchievement = extractUserAchievement(achievement);
    userAchievement.state === 'locked'
      ? await unlockAchievement(achievement)
      : await lockAchievement(achievement);
  };

  // function to combine a game and user achievement
  const combineSingleAchievement = (
    gameAchievement: BaseAchievement,
    userAchievement: UserAchievement | null
  ): Achievement => {
    if (!userAchievement) {
      userAchievement = {
        id: gameAchievement.id,
        gameId: 'fallcrate',
        userId: userId ?? '',
        unlockedAt: null,
        state: 'locked',
      };
    }
    return {
      ...gameAchievement,
      ...userAchievement,
    };
  };

  // function to combine all game and user achievements
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

  // build achievements
  useEffect(() => {
    setAchievements(combineAchievements(gameAchievements, userAchievements));
  }, [gameAchievements, userAchievements]); // eslint-disable-line react-hooks/exhaustive-deps

  const onMergeAccounts = async (localUserId: string, remoteUserId: string) => {
    const [localUserAchievements, remoteUserAchievements] = await Promise.all([
      db.fetchUserAchievements(localUserId),
      db.fetchUserAchievements(remoteUserId),
    ]);

    const mergedPromises = localUserAchievements.map((localUserAchievement) => {
      const remoteUserAchievement = remoteUserAchievements.find(
        (remoteUserAchievement) =>
          remoteUserAchievement.id === localUserAchievement.id &&
          remoteUserAchievement.gameId === localUserAchievement.gameId
      );
      if (!remoteUserAchievement) {
        const localUserAchievementCopy = { ...localUserAchievement };
        localUserAchievementCopy.userId = remoteUserId;
        return Promise.all([
          db.saveAchievement(localUserAchievementCopy),
          db.deleteAchievement(
            localUserAchievement.id,
            localUserAchievement.gameId,
            localUserAchievement.userId
          ),
        ]);
      }
      return Promise.resolve();
    });

    await Promise.all(mergedPromises);

    resetAchievements();
  };

  type MergeAccountsEventDetail = {
    localUserId: string;
    remoteUserId: string;
  };
  useEffect(
    () => {
      const handleMergeAccounts = (
        mergeAccountsEvent: CustomEvent<MergeAccountsEventDetail>
      ) => {
        const { localUserId, remoteUserId } = mergeAccountsEvent.detail;
        onMergeAccounts(localUserId, remoteUserId);
      };

      window.addEventListener(
        'mergeAccounts',
        handleMergeAccounts as EventListener
      );

      return () =>
        window.removeEventListener(
          'mergeAccounts',
          handleMergeAccounts as EventListener
        );
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <AchievementsContext.Provider
      value={{
        gameAchievements,
        userAchievements,
        achievements,
        unlockAchievement,
        toggleAchievement,
      }}
    >
      {children}
    </AchievementsContext.Provider>
  );
};
