/// <reference types="vite-plugin-svgr/client" />
import { Badge, Dropdown, MenuProps } from 'antd';
import SignInButton from './SignInButton';
import UserIcon from './UserIcon';
import { useAuth } from '@hooks/useAuth';
import React, { useState } from 'react';
import { FiLogIn } from 'react-icons/fi';
import { SlTrophy } from 'react-icons/sl';
import { useAchievements } from '@hooks/useAchievements';
import { BsBell, BsBellSlashFill } from 'react-icons/bs';
import { RiNotificationBadgeLine } from 'react-icons/ri';
import { ReactComponent as BadgesOff } from '@assets/badges-off-icon.svg';

type Props = {
  light?: boolean;
  height?: number;
};

export const UserMenu = ({ light, height }: Props) => {
  const { loading, userId, signedIn, signInWithGoogle, handleLogout } =
    useAuth();
  const {
    achievements,
    modalOpen,
    setModalOpen,
    userMenuRef,
    userPreferences: { showNotifications, showBadges },
    editUserPreferences,
  } = useAchievements();
  const new_achievements = achievements.filter(
    (achievement) => achievement.state === 'newly_unlocked'
  ).length;

  const menuButtonHeight = height || 50;
  const badgeOffset = {
    x: -6,
    y: 10,
  };

  const [showMenu, setShowMenu] = useState(false);

  const showSignInButton = !(signedIn || loading);
  const onClickHandler = () => {
    if (showSignInButton) signInWithGoogle();
  };

  const classes = `user-menu${light ? '-light' : ''} ${
    showSignInButton ? 'signed-out' : ''
  } `;

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
      style: { color: 'white' },
      key: 'sign-out',
    },
  ];

  const handleOpenChange = (flag: boolean) => {
    if (showSignInButton) return setShowMenu(false);
    // this feels hacky but the menu keeps opening when the modal closes
    if (modalOpen) setShowMenu(false);
    else setShowMenu(flag);
  };

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'sign-out') handleLogout();
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
          {/* we gotta do this to style the menu + make it disappear immediately when signing out */}
          {React.cloneElement(menu as React.ReactElement, {
            style: {
              visibility: showSignInButton ? 'hidden' : 'visible',
              top: '4px',
            },
          })}
        </div>
      )}
    >
      <Badge
        count={showBadges ? new_achievements : 0}
        overflowCount={99}
        offset={[badgeOffset.x, badgeOffset.y]}
        size='default'
        className='cursor-pointer'
      >
        <button
          ref={userMenuRef}
          onClick={onClickHandler}
          className={`user-menu flex items-center justify-center overflow-hidden rounded-full transition-colors duration-100 ${classes}`}
          style={{
            borderWidth: showSignInButton ? '1px' : '2px',
            height: `${menuButtonHeight}px`,
            width: showSignInButton ? 'auto' : `${menuButtonHeight}px`,
          }}
        >
          <>
            {showSignInButton ? (
              <SignInButton height={menuButtonHeight} />
            ) : (
              <UserIcon
                userId={userId}
                loading={loading}
                size={menuButtonHeight}
                light={light}
              />
            )}
          </>
        </button>
      </Badge>
    </Dropdown>
  );
};
