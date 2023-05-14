import { Badge, Dropdown, MenuProps, Modal } from 'antd';
import SignInButton from './SignInButton';
import UserIcon from './UserIcon';
import { useAuth } from '@hooks/useAuth';
import React, { useState } from 'react';
import { FiLogIn } from 'react-icons/fi';
import { SlTrophy } from 'react-icons/sl';
import AchievementsPage from '@components/AchievementsPage';
import { useAchievements } from '@hooks/useAchievements';

type Props = {
  light?: boolean;
  height?: number;
};

export const UserMenu = ({ light, height }: Props) => {
  const { loading, userId, signedIn, signInWithGoogle, handleLogout } =
    useAuth();
  const { achievements } = useAchievements();
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
        <span className='flex items-center gap-[10px]'>
          <SlTrophy />
          Achievements
        </span>
      ),
      style: { color: 'white' },
      key: 'achievements',
    },
    {
      label: (
        <span className='flex items-center gap-[10px]'>
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
  };

  const [modalOpen, setModalOpen] = useState(false);
  const closeModal = () => {
    console.log('close modal from parent');
    setModalOpen(false);
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
        count={new_achievements}
        overflowCount={99}
        offset={[badgeOffset.x, badgeOffset.y]}
        size='default'
        className='cursor-pointer'
      >
        <button
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
            <Modal
              centered
              open={modalOpen}
              onCancel={closeModal}
              bodyStyle={{ marginInline: -1, padding: 0 }}
              footer={null}
              destroyOnClose
            >
              <div
                className='rounded-lg'
                style={{ backgroundColor: 'rgb(37 44 59)' }}
              >
                <AchievementsPage modal={modalOpen} />
              </div>
            </Modal>
          </>
        </button>
      </Badge>
    </Dropdown>
  );
};
