import { createAvatar } from '@dicebear/core';
import { thumbs } from '@dicebear/collection';
import { MoonLoader } from 'react-spinners';
import { ReactComponent as AnonIcon } from '@assets/anon-icon.svg';

type Props = {
  uid: string | null;
  signedIn: boolean;
  loading: boolean;
  size?: number;
  light?: boolean;
};

const UserIcon = ({ uid, signedIn, loading, size, light }: Props) => {
  const profileButtonSize = size ?? 50;
  const anonIconRatio = 3 / 5;

  const color = light ? '#000000' : '#ffffff';
  const iconColor = light ? '#3ea6ff' : '#ffffff';

  if (loading) return <MoonLoader color={color} size={profileButtonSize / 2} />;

  if (!signedIn || !uid) {
    return (
      <AnonIcon fill={iconColor} width={profileButtonSize * anonIconRatio} />
    );
  }

  const avatar = createAvatar(thumbs, {
    seed: uid ?? '',
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
