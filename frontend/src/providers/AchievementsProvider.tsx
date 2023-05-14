import React, { createContext, useState, useEffect } from 'react';
import { UserAchievement, BaseAchievement, Achievement } from '@src/types';
import { useDB } from '@hooks/useDB';
import { useAuth } from '@hooks/useAuth';
import { Timestamp } from 'firebase/firestore';
import { notification } from 'antd';
import { GiLaurelCrown } from 'react-icons/gi';

interface AchievementsContextValue {
  gameAchievements: BaseAchievement[];
  userAchievements: UserAchievement[];
  achievements: Achievement[];
  unlockAchievement: (achievement: Achievement) => Promise<void>;
  saveAchievement: (achievement: Achievement) => Promise<void>;
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

  // subscribe to game and user achievements
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

  const saveAchievement = async (achievement: Achievement) => {
    if (!userId) return;

    const userAchievement = extractUserAchievement(achievement);
    await db.saveAchievement(userAchievement);
  };

  const extractUserAchievement = (
    achievement: Achievement
  ): UserAchievement => {
    return {
      id: achievement.id,
      gameId: 'fallcrate',
      userId: achievement.userId ?? '',
      unlockedAt: achievement.unlockedAt ?? null,
      state: achievement.state,
    };
  };

  const changeAchievementState = async (
    achievement: Achievement,
    state: 'locked' | 'unlocked'
  ) => {
    if (!userId) return;

    const userAchievement = extractUserAchievement(achievement);
    if (state === 'unlocked' && userAchievement.state === 'locked') {
      userAchievement.state = 'newly_unlocked';
      userAchievement.unlockedAt = Timestamp.now();
      openNotification(achievement.title, achievement.description);
    }

    state === 'unlocked'
      ? await db.saveAchievement(userAchievement)
      : await db.deleteAchievement(
          achievement.id,
          achievement.gameId,
          achievement.userId
        );
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

    const mergedPromises = localUserAchievements.map(
      async (localUserAchievement) => {
        const remoteUserAchievement = remoteUserAchievements.find(
          (remoteUserAchievement) =>
            remoteUserAchievement.id === localUserAchievement.id &&
            remoteUserAchievement.gameId === localUserAchievement.gameId
        );
        if (!remoteUserAchievement) {
          const localUserAchievementCopy = { ...localUserAchievement };
          localUserAchievementCopy.userId = remoteUserId;
          await db.saveAchievement(localUserAchievementCopy);
        }
        return db.deleteAchievement(
          localUserAchievement.id,
          localUserAchievement.gameId,
          localUserAchievement.userId
        );
      }
    );

    await Promise.all(mergedPromises);
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

  const [api, contextHolder] = notification.useNotification();

  const openNotification = (
    message = 'Achievement Unlocked',
    description = 'hi'
  ) => {
    api.open({
      message,
      description,
      icon: <GiLaurelCrown />,
      placement: 'bottomRight',
    });
  };

  return (
    <AchievementsContext.Provider
      value={{
        gameAchievements,
        userAchievements,
        achievements,
        unlockAchievement,
        saveAchievement,
        toggleAchievement,
      }}
    >
      {contextHolder}
      {children}
    </AchievementsContext.Provider>
  );
};
