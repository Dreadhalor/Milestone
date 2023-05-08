import React, { useState } from 'react';
import { useAchievements } from '@src/hooks/useAchievements';
import { useSigninCheck } from 'reactfire';
import { Achievement } from '@src/types';
import AchievementsGrid from './AchievementsGrid';

const AchievementsPage: React.FC = () => {
  const signInCheck = useSigninCheck();
  const { status, data: signInCheckResult } = signInCheck;
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);

  const { achievements } = useAchievements();

  // console.log('sign in result:', signInCheckResult);

  const selectAchievement = (achievement_id: string | null) => {
    const achievement =
      achievements.find((achievement) => achievement.id === achievement_id) ??
      null;
    setSelectedAchievement(achievement);
  };

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <div
      className='relative flex min-h-0 w-full flex-1 flex-col content-center text-white'
      onClick={() => selectAchievement(null)}
    >
      <span className='mx-auto flex p-3 font-sans text-4xl'>
        Dreadhalor's Treasure Hunt
      </span>
      {signInCheckResult.signedIn === true && (
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
