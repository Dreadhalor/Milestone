import React, { useCallback, useEffect, useState } from 'react';
import { useAchievements } from '@src/hooks/useAchievements';
import { useSigninCheck } from 'reactfire';
import { SignInOutButton } from './SignInOutButton';
import { Achievement } from '@src/types';

const squareSize = 200;

type AchievementSquareProps = {
  achievement: Achievement;
};
const AchievementSquare = ({ achievement }: AchievementSquareProps) => {
  const is_locked = achievement.state === 'locked';
  const style = {
    width: `${squareSize}px`,
    height: `${squareSize}px`,
    backgroundColor: is_locked ? 'rgb(31,41,55)' : 'rgb(23,37,84)',
    color: is_locked ? 'rgba(255,255,255,0.1)' : 'white',
  };

  const { toggleAchievement } = useAchievements();

  return (
    <div
      className='rounded-lg p-4'
      style={style}
      onClick={() => {
        toggleAchievement(achievement);
      }}
    >
      <div className='text-2xl font-bold'>{achievement.title}</div>
      <div className='text-sm'>{achievement.description}</div>
    </div>
  );
};

const AchievementsGrid: React.FC = () => {
  const squareSize = 200;
  const gap = 4;
  const itemWidthWithGap = squareSize + gap;
  const padding = 20;

  const getContainerWidth = useCallback(() => {
    const initialWidth = window.innerWidth - 2 * padding;
    const itemsPerRow = Math.floor(initialWidth / itemWidthWithGap);
    return itemsPerRow * itemWidthWithGap;
  }, [itemWidthWithGap, padding]);

  const [containerWidth, setContainerWidth] = useState(() =>
    getContainerWidth()
  );

  useEffect(() => {
    const updateContainerWidth = () => {
      setContainerWidth(getContainerWidth());
    };

    window.addEventListener('resize', updateContainerWidth);

    return () => {
      window.removeEventListener('resize', updateContainerWidth);
    };
  }, [itemWidthWithGap, getContainerWidth]);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    gap: `${gap}px`,
    width: `${containerWidth}px`,
    margin: 'auto',
  };

  const { achievements } = useAchievements();

  return (
    <div className='w-full flex-1 overflow-auto pb-[20px]'>
      <div style={containerStyle}>
        {achievements.map((achievement) => (
          <AchievementSquare achievement={achievement} key={achievement.id} />
        ))}
      </div>
    </div>
  );
};

const AchievementsPage: React.FC = () => {
  const signInCheck = useSigninCheck();
  const { status, data: signInCheckResult } = signInCheck;

  console.log('signInCheck', signInCheck);

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <div className='flex h-full w-full flex-col content-center text-white'>
      <span className=' mx-auto p-3 font-sans text-4xl'>
        Dreadhalor's Treasure Hunt <SignInOutButton />
      </span>
      {signInCheckResult.signedIn === true && <AchievementsGrid />}
    </div>
  );
};

export default AchievementsPage;
