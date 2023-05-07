import { Achievement } from '@src/types';
import { useAchievements } from '../../hooks/useAchievements';
import { constructBorders, getNeighbors } from './achievementSquareUtils';

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
  const neighbors = getNeighbors(achievement.id, achievements);
  const has_unlocked_neighbors =
    neighbors.top?.state === 'unlocked' ||
    neighbors.bottom?.state === 'unlocked' ||
    neighbors.left?.state === 'unlocked' ||
    neighbors.right?.state === 'unlocked';

  const bg_colors = {
    locked: 'rgb(17 24 39)',
    unlocked: '',
    locked_with_unlocked_neighbors: 'rgba(51,61,75,0.97)',
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!is_locked || has_unlocked_neighbors) {
      selectAchievement(achievement.id);
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
    <div className='relative pb-[100%]'>
      <div
        className={`p-4 ${!is_selected ? 'transition-all' : ''}`}
        style={{ ...innerSquareStyle, ...style }}
        onClick={handleClick}
        onDoubleClick={() => {
          toggleAchievement(achievement);
        }}
      ></div>
    </div>
  );
};

export default AchievementSquare;