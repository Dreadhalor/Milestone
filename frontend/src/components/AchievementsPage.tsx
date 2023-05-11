import React, { useState } from 'react';
import { useAchievements } from '@src/hooks/useAchievements';
import { Achievement } from '@src/types';
import AchievementsGrid from './AchievementsGrid';
import { useAuth } from '@hooks/useAuth';

const AchievementsPage: React.FC = () => {
  const { loading, userId } = useAuth();
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);

  const { achievements } = useAchievements();

  const selectAchievement = (achievement_id: string | null) => {
    const achievement =
      achievements.find((achievement) => achievement.id === achievement_id) ??
      null;
    setSelectedAchievement(achievement);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div
      className='relative flex min-h-0 w-full flex-1 flex-col content-center text-white'
      onClick={() => selectAchievement(null)}
    >
      <span className='mx-auto flex p-3 font-sans text-4xl'>
        Dreadhalor's Treasure Hunt
      </span>
      {userId && (
        <div className='relative overflow-auto'>
          <AchievementsGrid
            selectedAchievement={selectedAchievement}
            selectAchievement={selectAchievement}
          />
        </div>
      )}
    </div>
  );
};

export default AchievementsPage;
