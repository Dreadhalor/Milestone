import React from 'react';
import UserIcon from './UserIcon';
import { useAuth } from '@hooks/useAuth';
import { useAchievements } from '@hooks/useAchievements';

type Props = {
  light?: boolean;
  height?: number;
  style?: React.CSSProperties;
  showMenu?: boolean;
};

export const UserMenuButton = ({
  light,
  height,
  style = {},
  showMenu = false,
}: Props) => {
  const { loading, uid, signedIn } = useAuth();
  const { userMenuRef } = useAchievements();

  const menuButtonHeight = height || 50;

  const borderSignedInClasses = showMenu
    ? 'border-white'
    : 'border-transparent group-hover:border-white';
  const borderSignedInClassesLight = showMenu
    ? 'border-[#6ebcff99] border-[2px]'
    : 'border-[#6ebcff33] border-[2px] group-hover:border-[#6ebcff99]';
  const borderSignedOutClasses = showMenu
    ? 'border-transparent'
    : 'border-white group-hover:border-transparent';
  const borderSignedOutClassesLight = showMenu
    ? 'group-hover:border-transparent'
    : 'border-[#6ebcffaa] border-[2px] group-hover:border-transparent';
  const borderClasses = light
    ? signedIn
      ? borderSignedInClassesLight
      : borderSignedOutClassesLight
    : signedIn
    ? borderSignedInClasses
    : borderSignedOutClasses;

  const classes = showMenu ? 'bg-[#6ebcff33]' : '';

  return (
    <button
      ref={userMenuRef}
      className={`group relative flex items-center justify-center overflow-hidden rounded-full transition-colors hover:bg-[#6ebcff33] ${classes}`}
      style={{
        height: `${menuButtonHeight}px`,
        width: `${menuButtonHeight}px`,
        ...style,
      }}
    >
      <div
        className={`absolute inset-0 rounded-full border-[1px] transition-colors ${borderClasses}`}
      ></div>
      <UserIcon
        uid={uid}
        signedIn={signedIn}
        loading={loading}
        size={menuButtonHeight}
        light={light}
      />
    </button>
  );
};
