import React, { createContext, useState, useRef } from 'react';
import { UserAchievement, Achievement } from '@src/types';
import { useDB } from '@hooks/useDB';
import { Timestamp } from 'firebase/firestore';
import { Modal, notification } from 'antd';
import { GiLaurelCrown } from 'react-icons/gi';
import AchievementsPage from '@components/AchievementsPage';
import { useAuth } from '@hooks/useAuth';
import { useUserPreferences } from '@hooks/achievements/useUserPreferences';
import { useMergeAccounts } from '@hooks/achievements/useMergeAccounts';
import useCombinedAchievements from '@hooks/achievements/useCombinedAchievements';

export interface AchievementsContextValue {
  achievements: Achievement[];
  unlockAchievement: (achievement: Achievement) => Promise<void>;
  saveAchievement: (achievement: Achievement) => Promise<void>;
  toggleAchievement: (achievement: Achievement) => Promise<void>;
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  userMenuRef: React.RefObject<HTMLButtonElement>;
  // for consuming projects
  isUnlockable: (id: string, gameId?: string) => boolean;
  unlockAchievementById: (id: string, gameId?: string) => Promise<void>;
}

export const AchievementsContext = createContext<AchievementsContextValue>(
  {} as AchievementsContextValue
);

interface Props {
  children: React.ReactNode;
  app?: string;
}

export const AchievementsProvider = ({
  children,
  app = 'fallcrate',
}: Props) => {
  const db = useDB();
  const { uid } = useAuth();
  const achievements = useCombinedAchievements(uid, app);
  const { userPreferences } = useUserPreferences(uid);
  useMergeAccounts();

  const saveAchievement = async (achievement: Achievement) => {
    if (!uid) return;

    const userAchievement = extractUserAchievement(achievement);
    await db.saveAchievement(userAchievement);
  };

  const extractUserAchievement = (
    achievement: Achievement
  ): UserAchievement => {
    return {
      id: achievement.id,
      gameId: app,
      uid: achievement.uid,
      unlockedAt: achievement.unlockedAt ?? null,
      state: achievement.state,
    };
  };

  const changeAchievementState = async (
    achievement: Achievement,
    state: 'locked' | 'unlocked'
  ) => {
    if (!uid) return;
    if (achievement.state === state) return;

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
          achievement.uid
        );
  };

  const unlockAchievementById = async (id: string, gameId?: string) => {
    if (app) gameId = app;
    const achievement = achievements.find(
      (achievement) => achievement.id === id && achievement.gameId === gameId
    );
    if (!achievement)
      throw new Error(
        `Achievement ${id} in ${gameId} not found! Available achievements: ${
          achievements.length > 0
            ? achievements.map((achievement) => achievement.id).join(', ')
            : 'none'
        }`
      );

    await unlockAchievement(achievement);
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
  const { x, y, width, height } = userMenuBoundingRect ?? {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
  // get the center of the user menu
  const modalOrigin = {
    x: x + width / 2 ?? 0,
    y: y + height / 2 ?? 0,
  };

  const isUnlockable = (id: string, gameId?: string) => {
    if (app) gameId = app;
    return (
      achievements.find(
        (achievement) =>
          achievement.uid === uid &&
          achievement.gameId === gameId &&
          achievement.id === id &&
          achievement.state === 'locked'
      ) !== undefined
    );
  };

  return (
    <AchievementsContext.Provider
      value={{
        achievements,
        unlockAchievement,
        saveAchievement,
        toggleAchievement,
        modalOpen,
        setModalOpen,
        userMenuRef,
        isUnlockable,
        unlockAchievementById,
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
        mousePosition={userMenuRef.current ? { ...modalOrigin } : null} // open animation origin
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
