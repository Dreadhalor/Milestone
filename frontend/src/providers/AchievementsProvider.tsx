import React, { createContext, useState, useEffect } from 'react';
import { UserAchievement, BaseAchievement, Achievement } from '@src/types';
import { useDB } from '@src/hooks/useDB';
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
  const [gameAchievements, setGameAchievements] = useState<BaseAchievement[]>(
    []
  );
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(
    []
  );
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const db = useDB();
  const { userId } = useAuth();

  const resetAchievements = async () => {
    const fetchGameAchievements = async () => {
      const fetchedAchievements = await db.fetchGameAchievements('fallcrate');
      setGameAchievements(fetchedAchievements);
    };
    const fetchUserAchievements = async () => {
      const fetchedAchievements = await db.fetchUserAchievements(
        userId ?? null
      );
      console.log('fetchedUserAchievements', fetchedAchievements);
      setUserAchievements(fetchedAchievements);
    };

    fetchGameAchievements();
    fetchUserAchievements();
  };

  useEffect(() => {
    resetAchievements();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleAchievement = async (achievement: Achievement) => {
    if (!userId) {
      return;
    }

    const userAchievement = extractUserAchievement(achievement);

    if (userAchievement.state === 'locked') {
      await unlockAchievement(achievement);
    } else {
      await lockAchievement(achievement);
    }
    resetAchievements();
  };

  const unlockAchievement = async (achievement: Achievement) => {
    if (!userId) {
      return;
    }

    const userAchievement = extractUserAchievement(achievement);
    userAchievement.unlockedAt = new Date();
    userAchievement.state = 'unlocked';

    await db.saveAchievement(userAchievement);
  };

  const lockAchievement = async (achievement: Achievement) => {
    if (!userId) {
      return;
    }

    return await db.deleteAchievement(
      achievement.id,
      achievement.gameId,
      achievement.userId
    );
  };

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
    const achievements = combineAchievements(
      gameAchievements,
      userAchievements
    );

    setAchievements(achievements);
  }, [gameAchievements, userAchievements]); // eslint-disable-line react-hooks/exhaustive-deps

  const onMergeAccounts = async (localUserId: string, remoteUserId: string) => {
    Promise.all([
      db.fetchUserAchievements(localUserId),
      db.fetchUserAchievements(remoteUserId),
    ])
      .then(([localUserAchievements, remoteUserAchievements]) => {
        return localUserAchievements.map((localUserAchievement) => {
          // if the remote user doesn't have the achievement, just update the userId
          // and save it while deleting the local one
          const remoteUserAchievement = remoteUserAchievements.find(
            (remoteUserAchievement) =>
              remoteUserAchievement.id === localUserAchievement.id &&
              remoteUserAchievement.gameId === localUserAchievement.gameId
          );
          if (!remoteUserAchievement) {
            const localUserAchievementCopy = { ...localUserAchievement };
            localUserAchievementCopy.userId = remoteUserId;
            Promise.all([
              db.saveAchievement(localUserAchievementCopy),
              db.deleteAchievement(
                localUserAchievement.id,
                localUserAchievement.gameId,
                localUserAchievement.userId
              ),
            ]);
          }
        });
      })
      .then(() => {
        resetAchievements();
      });
  };

  type MergeAccountsEventDetail = {
    localUserId: string;
    remoteUserId: string;
  };
  // In AchievementsProvider:
  useEffect(
    () => {
      const handleMergeAccounts = (
        mergeAccountsEvent: CustomEvent<MergeAccountsEventDetail>
      ) => {
        const { localUserId, remoteUserId } = mergeAccountsEvent.detail;
        console.log('mergeAccounts event received', mergeAccountsEvent.detail);
        // Run your merge function here using event.detail.userId
        onMergeAccounts(localUserId, remoteUserId);
      };

      window.addEventListener(
        'mergeAccounts',
        handleMergeAccounts as EventListener
      );

      return () => {
        window.removeEventListener(
          'mergeAccounts',
          handleMergeAccounts as EventListener
        );
      };
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
