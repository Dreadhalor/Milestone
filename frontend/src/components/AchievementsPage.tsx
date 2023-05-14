import { useEffect, useState } from 'react';
import { useAchievements } from '@src/hooks/useAchievements';
import { Achievement } from '@src/types';
import AchievementsGrid from './AchievementsGrid';
import { useAuth } from '@hooks/useAuth';

type Props = {
  modal: boolean;
};

const AchievementsPage = ({ modal }: Props) => {
  useEffect(() => {
    console.log('modal is', modal ? 'true' : 'false');
  }, [modal]);

  useEffect(() => {
    console.log('AchievementsPage mounted');
    return () => {
      console.log('AchievementsPage unmounted');
    };
  }, []);

  const { loading, userId } = useAuth();
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
    // if (achievement && achievement.state === 'newly_unlocked') {
    //   achievement.state = 'unlocked';
    //   saveAchievement(achievement);
    // }
    setSelectedAchievement(achievement);
  };

  useEffect(() => {
    // reset selected achievement when achievements change
    // it'd be nice to just do this only when the achievement has no
    // unlocked neighbors, but I do NOT want to deal with that right now
    if (selectedAchievement?.state === 'locked') selectAchievement(null);
  }, [achievements]); // eslint-disable-line react-hooks/exhaustive-deps

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
