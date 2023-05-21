/// <reference types="vite-plugin-svgr/client" />
import React from 'react';
import { Badge, Dropdown, MenuProps } from 'antd';
import { useAuth } from '@hooks/useAuth';
import { FiLogIn } from 'react-icons/fi';
import { SlTrophy } from 'react-icons/sl';
import { useAchievements } from '@hooks/useAchievements';
import { BsBell, BsBellSlashFill, BsGoogle } from 'react-icons/bs';
import { RiNotificationBadgeLine } from 'react-icons/ri';
import { ReactComponent as BadgesOff } from '@assets/badges-off-icon.svg';
import { useUserPreferences } from '@hooks/achievements/useUserPreferences';

type Props = {
  children: React.ReactNode;
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
};

export const UserMenuDropdown = ({
  children,
  showMenu,
  setShowMenu,
}: Props) => {
  const { loading, uid, signedIn, handleLogout, signInWithGoogle } = useAuth();
  const { achievements, setModalOpen } = useAchievements();
  const {
    userPreferences: { showNotifications, showBadges },
    editUserPreferences,
  } = useUserPreferences(uid);
  const new_achievements = achievements.filter(
    (achievement) => achievement.state === 'newly_unlocked'
  ).length;

  const showSignInButton = !(signedIn || loading);

  const items: MenuProps['items'] = [
    {
      label: (
        <span className='flex items-center gap-[16px]'>
          <Badge count={showBadges ? new_achievements : 0} size='small'>
            <SlTrophy style={{ color: 'white' }} />
          </Badge>
          Achievements
        </span>
      ),
      style: { color: 'white' },
      key: 'achievements',
    },
    {
      label: (
        <span className='flex items-center gap-[16px]'>
          {showNotifications ? (
            <BsBell style={{ color: 'white' }} />
          ) : (
            <BsBellSlashFill style={{ color: 'white' }} />
          )}
          Toggle Notifications
        </span>
      ),
      style: { color: 'white' },
      key: 'toggle-notifications',
    },
    {
      label: (
        <span className='flex items-center gap-[16px]'>
          {showBadges ? (
            <RiNotificationBadgeLine style={{ color: 'white' }} />
          ) : (
            <BadgesOff style={{ fill: 'white' }} width={14} height={14} />
          )}
          Toggle Badges
        </span>
      ),
      style: { color: 'white' },
      key: 'toggle-badges',
    },
    {
      label: (
        <span className='flex items-center gap-[16px]'>
          <FiLogIn />
          Sign out
        </span>
      ),
      // hide this if the user is signed out
      style: { color: 'white', display: !showSignInButton ? 'flex' : 'none' },
      key: 'sign-out',
    },
    {
      label: (
        <span className='flex items-center gap-[16px]'>
          <BsGoogle />
          Sign In&nbsp;&nbsp;😉
        </span>
      ),
      // hide this if the user is signed in
      style: { color: 'white', display: showSignInButton ? 'flex' : 'none' },
      key: 'sign-in',
    },
  ];

  const handleOpenChange = (flag: boolean) => setShowMenu(flag);

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'sign-out') {
      handleLogout();
      setShowMenu(false);
    }
    if (e.key === 'sign-in') {
      signInWithGoogle();
      setShowMenu(false);
    }
    if (e.key === 'achievements') {
      setShowMenu(false);
      setModalOpen(true);
    }
    if (e.key === 'toggle-notifications') {
      editUserPreferences({
        showNotifications: !showNotifications,
      });
    }
    if (e.key === 'toggle-badges') {
      editUserPreferences({
        showBadges: !showBadges,
      });
    }
  };

  return (
    <Dropdown
      menu={{ items, onClick: handleMenuClick }}
      trigger={['click']}
      open={showMenu}
      onOpenChange={handleOpenChange}
      dropdownRender={(menu) => (
        // this is just a hack to push the menu down a bit
        <div className='relative'>
          {/* we gotta do this to style the menu */}
          {React.cloneElement(menu as React.ReactElement, {
            style: {
              top: '4px',
            },
          })}
        </div>
      )}
    >
      {/* this div needs to be here because Dropdown doesn't work when its child is a React component */}
      <div>{children}</div>
    </Dropdown>
  );
};
