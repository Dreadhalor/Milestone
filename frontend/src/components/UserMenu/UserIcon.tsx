import { User } from 'firebase/auth';
import { createAvatar } from '@dicebear/core';
import { thumbs } from '@dicebear/collection';
import { MoonLoader } from 'react-spinners';
import { BiMenu } from 'react-icons/bi';

type Props = {
  user: User | null;
  loading: boolean;
  size?: number;
};

const UserIcon = ({ user, loading, size }: Props) => {
  const profileButtonSize = size ?? 50;

  if (!user) {
    return loading ? (
      <MoonLoader color='#ffffff' size={profileButtonSize / 2} />
    ) : (
      <BiMenu color='#ffffff' />
    );
  }

  const avatar = createAvatar(thumbs, {
    seed: user?.uid,
    scale: 80,
    radius: 50,
    translateY: -10,
  });

  const svg = avatar.toDataUriSync();

  return (
    <img
      src={svg}
      alt='User avatar'
      style={{
        width: `${profileButtonSize}px`,
        height: `${profileButtonSize}px`,
      }}
    />
  );
};

export default UserIcon;
