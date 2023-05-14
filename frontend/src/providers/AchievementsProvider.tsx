import React, { createContext, useState, useEffect, useRef } from 'react';
import {
  UserAchievement,
  BaseAchievement,
  Achievement,
  UserPreferencesData,
} from '@src/types';
import { useDB } from '@hooks/useDB';
import { useAuth } from '@hooks/useAuth';
import { Timestamp } from 'firebase/firestore';
import { Modal, notification } from 'antd';
import { GiLaurelCrown } from 'react-icons/gi';
import AchievementsPage from '@components/AchievementsPage';

interface AchievementsContextValue {
  gameAchievements: BaseAchievement[];
  userAchievements: UserAchievement[];
  achievements: Achievement[];
  unlockAchievement: (achievement: Achievement) => Promise<void>;
  saveAchievement: (achievement: Achievement) => Promise<void>;
  toggleAchievement: (achievement: Achievement) => Promise<void>;
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  userMenuRef: React.RefObject<HTMLButtonElement>;
  userPreferences: UserPreferencesData;
  editUserPreferences: (
    preferences: Partial<UserPreferencesData>
  ) => Promise<void>;
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
  const [userPreferences, setUserPreferences] = useState<UserPreferencesData>({
    showNotifications: true,
    showBadges: true,
  });

  const editUserPreferences = async (
    preferences: Partial<UserPreferencesData>
  ) => {
    if (!userId) return;

    await db.saveUserPreferences(userId, {
      ...userPreferences,
      ...preferences,
    });
  };

  // subscribe to game and user achievements
  // also user preferences because I didn't want to create a new provider
  useEffect(() => {
    const gameUnsubscribe = db.subscribeToGameAchievements(
      'fallcrate',
      setGameAchievements
    );
    const userUnsubscribe = db.subscribeToUserAchievements(
      userId as string,
      setUserAchievements
    );
    const userPreferencesUnsubscribe = db.subscribeToUserPreferences(
      userId as string,
      setUserPreferences
    );

    return () => {
      gameUnsubscribe && gameUnsubscribe();
      userUnsubscribe && userUnsubscribe();
      userPreferencesUnsubscribe && userPreferencesUnsubscribe();
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
      if (userPreferences.showNotifications)
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

  const [modalOpen, setModalOpen] = useState(false);

  const [api, contextHolder] = notification.useNotification();

  const openNotification = (
    message = 'Achievement Unlocked',
    description = ''
  ) => {
    api.open({
      message,
      description,
      icon: <GiLaurelCrown />,
      placement: 'bottomRight',
      onClick: () => {
        setModalOpen(true);
        api.destroy();
      },
    });
  };

  const userMenuRef = useRef<HTMLButtonElement>(null);
  const userMenuBoundingRect = userMenuRef.current?.getBoundingClientRect();
  const { x, y } = userMenuBoundingRect ?? { x: 0, y: 0 };

  return (
    <AchievementsContext.Provider
      value={{
        gameAchievements,
        userAchievements,
        achievements,
        unlockAchievement,
        saveAchievement,
        toggleAchievement,
        modalOpen,
        setModalOpen,
        userMenuRef,
        userPreferences,
        editUserPreferences,
      }}
    >
      {contextHolder}
      {children}
      <Modal
        centered
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        bodyStyle={{ marginInline: -1, padding: 0 }} // remove padding
        footer={null} // no footer
        closable={false} // no close button
        mousePosition={userMenuRef.current ? { x, y } : null} // open animation origin
        destroyOnClose // destroy popovers when modal closes
      >
        <div
          className='rounded-lg'
          style={{ backgroundColor: 'rgb(37 44 59)' }}
        >
          <AchievementsPage />
        </div>
      </Modal>
    </AchievementsContext.Provider>
  );
};
