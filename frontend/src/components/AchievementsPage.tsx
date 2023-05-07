import React, { useState } from 'react';
import { useAchievements } from '@src/hooks/useAchievements';
import { useSigninCheck } from 'reactfire';
import { SignInOutButton } from './SignInOutButton';
import { Achievement } from '@src/types';
import AchievementsGrid from './AchievementsGrid';
import InfoPanel from './InfoPanel';

const AchievementsPage: React.FC = () => {
  const signInCheck = useSigninCheck();
  const { status, data: signInCheckResult } = signInCheck;
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);

  const { achievements } = useAchievements();

  const selectAchievement = (achievement_id: string | null) => {
    const achievement =
      achievements.find((achievement) => achievement.id === achievement_id) ??
      null;
    setSelectedAchievement(achievement);
  };

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <div
      className='relative flex h-full w-full flex-col content-center text-white'
      onClick={() => selectAchievement(null)}
    >
      <span className=' mx-auto p-3 font-sans text-4xl'>
        Dreadhalor's Treasure Hunt <SignInOutButton />
      </span>
      {signInCheckResult.signedIn === true && (
        <div className='relative overflow-auto'>
          <AchievementsGrid
            selectedAchievement={selectedAchievement}
            selectAchievement={selectAchievement}
          />
          <InfoPanel selectedAchievement={selectedAchievement} />
        </div>
      )}
    </div>
  );
};

export default AchievementsPage;
