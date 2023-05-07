import { getStorage, connectStorageEmulator } from 'firebase/storage'; // Firebase v9+
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'; // Firebase v9+
import {
  FirebaseAppProvider,
  StorageProvider,
  FirestoreProvider,
  useFirebaseApp,
  AuthProvider,
} from 'reactfire';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Firebase v9+: pull from .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

type Props = {
  children: React.ReactNode;
};

function FirebaseComponents({ children }: Props) {
  const app = useFirebaseApp();

  // const storage = getStorage(app);
  // const db = getFirestore(app);
  const auth = getAuth(app);

  if (location.hostname === 'localhost') {
    // Point to the emulators running on localhost.
    // connectStorageEmulator(storage, 'localhost', 9199);
    // connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099', {
      disableWarnings: true,
    });
  }

  return (
    // <StorageProvider sdk={storage}>
    // {/* <FirestoreProvider sdk={db}> */}
    <AuthProvider sdk={auth}>{children}</AuthProvider>
    // {/* </FirestoreProvider> */}
    // </StorageProvider>
  );
}

export const FirebaseProvider = ({ children }: Props) => {
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <FirebaseComponents>{children}</FirebaseComponents>
    </FirebaseAppProvider>
  );
};
