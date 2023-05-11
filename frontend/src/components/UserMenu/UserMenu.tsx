import SignInButton from './SignInButton';
import UserIcon from './UserIcon';
import { useAuth } from '@hooks/useAuth';

type Props = {
  light?: boolean;
  height?: number;
};

export const UserMenu = ({ light, height }: Props) => {
  const { loading, userId, signedIn, signInWithGoogle, handleLogout } =
    useAuth();

  const menuButtonHeight = height || 50;

  const showSignInButton = !(signedIn || loading);
  const onClickHandler = showSignInButton ? signInWithGoogle : handleLogout;

  const classes = `user-menu${light ? '-light' : ''} ${
    showSignInButton ? 'signed-out' : ''
  } `;

  return (
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
  );
};
