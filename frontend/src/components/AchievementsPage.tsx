import { useEffect, useState } from 'react';
import { useAchievements } from '@src/hooks/useAchievements';
import { Achievement } from '@src/types';
import AchievementsGrid from './AchievementsGrid';
import { useAuth } from '@hooks/useAuth';
import { hasUnlockedNeighbors } from './AchievementSquare/achievementSquareUtils';

const AchievementsPage = () => {
  const { loading, uid } = useAuth();
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);

  const { achievements, saveAchievement } = useAchievements();

  const selectAchievement = (achievement_id: string | null) => {
    const achievement =
      achievements.find((achievement) => achievement.id === achievement_id) ??
      null;
    if (
      selectedAchievement?.state === 'newly_unlocked' &&
      achievement?.id !== selectedAchievement?.id
    ) {
      selectedAchievement.state = 'unlocked';
      saveAchievement(selectedAchievement);
    }
    setSelectedAchievement(achievement);
  };

  useEffect(() => {
    // reset selected achievement when achievements change &:
    // - selected achievement is locked and has no unlocked neighbors
    if (!selectedAchievement) return;
    if (selectedAchievement?.state !== 'locked') return;
    if (hasUnlockedNeighbors(selectedAchievement, achievements)) return;
    selectAchievement(null);
  }, [achievements]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // reset selected achievement when component unmounts
    return () => {
      if (!selectedAchievement) return;
      if (selectedAchievement.state === 'newly_unlocked') {
        selectedAchievement.state = 'unlocked';
        saveAchievement(selectedAchievement);
      }
    };
  }, [selectedAchievement]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div>Loading...</div>;

  return (
    <div
      className='relative flex min-h-0 w-full flex-1 flex-col content-center text-white'
      onClick={() => selectAchievement(null)}
    >
      <span className='mx-auto flex p-3 font-sans text-4xl'>
        Fallcrate's Treasure Hunt
      </span>
      {uid && (
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
