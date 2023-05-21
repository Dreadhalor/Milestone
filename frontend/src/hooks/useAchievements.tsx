import {
  AchievementsContext,
  AchievementsContextValue,
} from '@providers/AchievementsProvider';
import { useContext } from 'react';

export const useAchievements = (): AchievementsContextValue =>
  useContext(AchievementsContext);
