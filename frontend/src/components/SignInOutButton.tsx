import { useAuth } from 'reactfire';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

export const SignInOutButton = () => {
  const auth = useAuth();
  const user = auth.currentUser;

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

  return (
    <span className='text-sm'>
      {user ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <button onClick={signInWithGoogle}>Sign in with Google</button>
      )}
    </span>
  );
};
