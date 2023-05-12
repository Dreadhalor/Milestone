import { createAvatar } from '@dicebear/core';
import { thumbs } from '@dicebear/collection';
import { MoonLoader } from 'react-spinners';
import { BiMenu } from 'react-icons/bi';

type Props = {
  userId: string | null;
  loading: boolean;
  size?: number;
  light?: boolean;
};

const UserIcon = ({ userId, loading, size, light }: Props) => {
  const profileButtonSize = size ?? 50;

  const color = light ? '#000000' : '#ffffff';

  if (!userId) {
    return loading ? (
      <MoonLoader color={color} size={profileButtonSize / 2} />
    ) : (
      <BiMenu color={color} />
    );
  }

  const avatar = createAvatar(thumbs, {
    seed: userId,
    scale: 80,
    radius: 50,
    translateY: -10,
  });

  const svg = avatar.toDataUriSync();

  return (
    // return an image, but don't make it draggable
    <img
      draggable={false}
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
