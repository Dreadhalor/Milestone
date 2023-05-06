import { AchievementsContext } from '@providers/AchievementsProvider';
import { useContext } from 'react';

export const useAchievements = () => useContext(AchievementsContext);
