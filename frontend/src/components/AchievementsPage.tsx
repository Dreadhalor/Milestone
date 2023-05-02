import React, { useCallback, useEffect, useState } from 'react';
import achievements_list from '../achievements.json';
import { BaseAchievement } from '../types';

const achievementsData: BaseAchievement[] = achievements_list.base_achievements;
const squareSize = 200;

type AchievementSquareProps = {
  achievement: BaseAchievement;
};
const AchievementSquare = ({ achievement }: AchievementSquareProps) => {
  const style = {
    width: `${squareSize}px`,
    height: `${squareSize}px`,
  };

  return (
    <div className='rounded-lg bg-gray-800 p-4' style={style}>
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
    margin: '0 auto',
  };

  return (
    <div className='w-full flex-1 overflow-auto pb-[20px]'>
      <div style={containerStyle}>
        {achievementsData.map((achievement) => (
          <AchievementSquare achievement={achievement} key={achievement.id} />
        ))}
      </div>
    </div>
  );
};

const AchievementsPage: React.FC = () => {
  return (
    <div className='flex h-full w-full flex-col content-center text-white'>
      <span className=' mx-auto p-3 font-sans text-4xl'>
        Dreadhalor's Treasure Hunt
      </span>
      <AchievementsGrid />
    </div>
  );
};

export default AchievementsPage;
