import React, { createContext, useState, useEffect } from 'react';
import { UserAchievement, BaseAchievement, Achievement } from '@src/types';
import { useDB } from '@src/hooks/useDB';
import { useUser } from 'reactfire';

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

  // const [user, setUser] = useState<User | null>(null);

  const db = useDB();
  const { data: user } = useUser();

  const resetAchievements = async () => {
    const fetchGameAchievements = async () => {
      const fetchedAchievements = await db.fetchGameAchievements('fallcrate');
      setGameAchievements(fetchedAchievements);
    };
    const fetchUserAchievements = async () => {
      const fetchedAchievements = await db.fetchUserAchievements(
        user?.uid ?? null
      );
      setUserAchievements(fetchedAchievements);
    };

    fetchGameAchievements();
    fetchUserAchievements();
  };

  useEffect(() => {
    resetAchievements();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleAchievement = async (achievement: Achievement) => {
    if (!user) {
      return;
    }

    const userAchievement = extractUserAchievement(achievement);
    console.log(userAchievement);

    if (userAchievement.state === 'locked') {
      await unlockAchievement(achievement);
    } else {
      await lockAchievement(achievement);
    }
    resetAchievements();
  };

  const unlockAchievement = async (achievement: Achievement) => {
    if (!user) {
      return;
    }

    const userAchievement = extractUserAchievement(achievement);
    userAchievement.unlockedAt = new Date();
    userAchievement.state = 'unlocked';

    await db.saveAchievement(userAchievement);
  };

  const lockAchievement = async (achievement: Achievement) => {
    if (!user) {
      return;
    }

    const userAchievement = extractUserAchievement(achievement);
    userAchievement.unlockedAt = null;
    userAchievement.state = 'locked';

    return await db.saveAchievement(userAchievement);
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
        userId: user?.uid ?? '',
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
