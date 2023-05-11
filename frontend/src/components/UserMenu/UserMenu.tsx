import { Dropdown, MenuProps } from 'antd';
import SignInButton from './SignInButton';
import UserIcon from './UserIcon';
import { useAuth } from '@hooks/useAuth';
import React, { useState } from 'react';
import { FiLogIn } from 'react-icons/fi';

type Props = {
  light?: boolean;
  height?: number;
};

export const UserMenu = ({ light, height }: Props) => {
  const { loading, userId, signedIn, signInWithGoogle, handleLogout } =
    useAuth();

  const menuButtonHeight = height || 50;

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
        <span className='flex items-center gap-[8px]'>
          <FiLogIn />
          Sign out
        </span>
      ),
      style: { color: 'white' },
      key: '0',
    },
  ];

  const handleOpenChange = (flag: boolean) => {
    if (showSignInButton) return setShowMenu(false);
    setShowMenu(flag);
  };

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === '0') handleLogout();
  };

  return (
    <Dropdown
      menu={{ items, onClick: handleMenuClick }}
      trigger={['click']}
      open={showMenu}
      onOpenChange={handleOpenChange}
      dropdownRender={(menu) =>
        // we gotta do this to style the menu + make it disappear immediately when signing out
        React.cloneElement(menu as React.ReactElement, {
          style: { visibility: showSignInButton ? 'hidden' : 'visible' },
        })
      }
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
      </button>
    </Dropdown>
  );
};
