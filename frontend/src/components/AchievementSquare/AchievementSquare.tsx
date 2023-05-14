import { Achievement } from '@src/types';
import { useAchievements } from '@hooks/useAchievements';
import {
  checkNeighborState,
  constructBorders,
  getNeighbors,
} from './achievementSquareUtils';
import AchievementPopover from './AchievementPopover';
import { FaExclamationCircle } from 'react-icons/fa';

type AchievementSquareProps = {
  achievement: Achievement;
  selectedAchievement: Achievement | null;
  selectAchievement: (achievement_id: string | null) => void;
};
const AchievementSquare = ({
  achievement,
  selectedAchievement,
  selectAchievement,
}: AchievementSquareProps) => {
  const { achievements } = useAchievements();
  const is_locked = achievement.state === 'locked';
  const is_selected = selectedAchievement?.id === achievement.id;
  const newly_unlocked = achievement.state === 'newly_unlocked';
  const neighbors = getNeighbors(achievement.id, achievements);
  const has_unlocked_neighbors = checkNeighborState(['unlocked'], neighbors);

  const bg_colors = {
    locked: 'rgb(44,3,21)',
    unlocked: '',
    locked_with_unlocked_neighbors: 'rgba(84,43,61,0.97)',
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!is_locked || has_unlocked_neighbors) {
      if (is_selected) selectAchievement(null);
      else selectAchievement(achievement.id);
      e.stopPropagation();
    }
  };

  const getBackgroundColor = () => {
    if (!is_locked) return bg_colors.unlocked;
    if (has_unlocked_neighbors) return bg_colors.locked_with_unlocked_neighbors;
    return bg_colors.locked;
  };

  const style = {
    backgroundColor: getBackgroundColor(),
  };

  const innerSquareStyle = constructBorders(
    neighbors,
    is_selected,
    is_locked,
    has_unlocked_neighbors
  );

  const { toggleAchievement } = useAchievements();

  return (
    <AchievementPopover achievement={achievement} open={is_selected}>
      <div className='relative pb-[100%]'>
        {newly_unlocked && (
          <FaExclamationCircle
            style={{
              color: 'yellow',
              position: 'absolute',
              top: 5,
              right: 5,
            }}
          />
        )}
        <div
          className={`flex ${!is_selected ? 'transition-all' : ''}`}
          style={{ ...innerSquareStyle, ...style }}
          onClick={handleClick}
          onDoubleClick={() => {
            toggleAchievement(achievement);
          }}
        ></div>
      </div>
    </AchievementPopover>
  );
};

export default AchievementSquare;
