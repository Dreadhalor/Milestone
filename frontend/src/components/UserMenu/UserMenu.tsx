import { useAuth } from 'reactfire';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import SignInButton from './SignInButton';
import UserIcon from './UserIcon';

const UserMenu = () => {
  const auth = useAuth();
  const [user, setUser] = useState(null as User | null);
  const [loading, setLoading] = useState(true);

  const menuButtonHeight = 50;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [auth]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const showSignInButton = !(user || loading);
  const onClickHandler = showSignInButton ? signInWithGoogle : handleLogout;

  const hover_classes = `hover:border-[rgba(255,255,255,0.7)] ${
    showSignInButton ? 'hover:bg-[#6ebcff33]' : ''
  }`;

  return (
    <button
      onClick={onClickHandler}
      className={`flex items-center justify-center rounded-full border-solid border-[rgba(255,255,255,0.5)] ${hover_classes}`}
      style={{
        borderWidth: showSignInButton ? '1px' : '2px',
        height: `${menuButtonHeight}px`,
        width: showSignInButton ? 'auto' : `${menuButtonHeight}px`,
      }}
    >
      {showSignInButton ? (
        <SignInButton />
      ) : (
        <UserIcon user={user} loading={loading} size={menuButtonHeight} />
      )}
    </button>
  );
};

export default UserMenu;
