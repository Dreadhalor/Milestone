import { UserMenuDropdown } from './UserMenuDropdown';
import { UserMenuButton } from './UserMenuButton';
import UserMenuBadgeWrapper from './UserMenuBadgeWrapper';
import { useState } from 'react';
// import './styles.scss';

type Props = {
  light?: boolean;
  height?: number;
  style?: React.CSSProperties;
};
// Dropdown does not respect the round boundaries of the button but neither does YouTube's user menu so I'm excused
export const UserMenu = ({ light = false, height = 50, style = {} }: Props) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <UserMenuDropdown showMenu={showMenu} setShowMenu={setShowMenu}>
      <UserMenuBadgeWrapper>
        <UserMenuButton
          light={light}
          height={height}
          style={style}
          showMenu={showMenu}
        />
      </UserMenuBadgeWrapper>
    </UserMenuDropdown>
  );
};
