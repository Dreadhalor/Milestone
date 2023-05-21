import { useUserPreferences } from '@hooks/achievements/useUserPreferences';
import { useAuth } from '@hooks/useAuth';
import { Badge } from 'antd';
import { useAchievements } from '@hooks/useAchievements';

type Props = {
  children?: React.ReactNode;
};

const UserMenuBadgeWrapper = ({ children }: Props) => {
  const { uid } = useAuth();
  const {
    userPreferences: { showBadges },
  } = useUserPreferences(uid);
  const { achievements } = useAchievements();

  const new_achievements = achievements.filter(
    (achievement) => achievement.state === 'newly_unlocked'
  ).length;

  const badgeOffset = {
    x: -6,
    y: 10,
  };

  return (
    <>
      <Badge
        count={showBadges ? new_achievements : 0}
        overflowCount={99}
        offset={[badgeOffset.x, badgeOffset.y]}
        size='default'
        className='flex cursor-pointer items-center'
      >
        {children}
      </Badge>
    </>
  );
};

export default UserMenuBadgeWrapper;
