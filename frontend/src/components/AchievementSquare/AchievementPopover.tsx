import { Achievement } from '@src/types';
import { Popover } from 'antd';
import React from 'react';

type Props = {
  children: React.ReactNode;
  achievement: Achievement;
  open: boolean;
};

const AchievementPopover = ({ children, achievement, open }: Props) => {
  const { unlockedAt, state } = achievement;
  const popoverContent = (
    <div className='flex max-w-[300px] flex-col gap-[2px]'>
      {unlockedAt && (
        <div className='flex items-center gap-[8px]'>
          <span className='text-sm text-gray-400'>
            {unlockedAt.toDate().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            } as Intl.DateTimeFormatOptions)}
          </span>
          {state === 'newly_unlocked' && (
            <div className='rounded-full bg-[#00bfff] px-[6px] py-[1px] text-xs text-white'>
              New!
            </div>
          )}
        </div>
      )}
      <span className='mb-[4px] text-2xl font-bold text-white'>
        {achievement.title}
      </span>
      <span className='text-white'>{achievement.description}</span>
    </div>
  );

  return (
    <Popover content={popoverContent} open={open} color='black'>
      {children}
    </Popover>
  );
};

export default AchievementPopover;
