import { useAchievements } from '@src/hooks/useAchievements';
import AchievementSquare from './AchievementSquare/AchievementSquare';
import { Achievement } from '@src/types';
import MapBorder from '@components/MapBorder';
import backgroundImage from '@assets/kid-icarus-background.png';

type AchievementsGridProps = {
  selectedAchievement: Achievement | null;
  selectAchievement: (achievement_id: string | null) => void;
};

const AchievementsGrid = ({
  selectedAchievement,
  selectAchievement,
}: AchievementsGridProps) => {
  const rows = 10;
  const columns = 10;

  const containerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, auto)`,
    justifyContent: 'center',
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    width: '100%',
  };

  const { achievements } = useAchievements();

  const renderAchievementSquares = () => {
    const squares = [];
    for (let i = 0; i < rows * columns; i++) {
      const achievement = achievements[i];
      if (achievement) {
        squares.push(
          <AchievementSquare
            achievement={achievement}
            key={achievement.id}
            selectedAchievement={selectedAchievement}
            selectAchievement={selectAchievement}
          />
        );
      } else {
        squares.push(<div key={`empty-${i}`} />);
      }
    }
    return squares;
  };

  return (
    <div className='w-full flex-1 px-[20px]'>
      <MapBorder>
        <div style={containerStyle}>{renderAchievementSquares()}</div>
      </MapBorder>
    </div>
  );
};

export default AchievementsGrid;
