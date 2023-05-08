import { Achievement } from '@src/types';
import { Popover } from 'antd';
import React from 'react';

type Props = {
  children: React.ReactNode;
  achievement: Achievement;
  open: boolean;
};

const AchievementPopover = ({ children, achievement, open }: Props) => {
  const popoverContent = (
    <div className='flex max-w-[300px] flex-col gap-[8px]'>
      <span className='text-2xl font-bold text-white'>{achievement.title}</span>
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