import {
  getFirestore,
  collection,
  query,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  connectFirestoreEmulator,
  onSnapshot,
} from 'firebase/firestore';
import { BaseAchievement, UserAchievement } from '@src/types';
import { Database } from '@src/db/Database';
import { getApp, getApps, initializeApp } from 'firebase/app';

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

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Connect to Firestore emulator if the host is localhost
if (location.hostname === 'localhost') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}

const useFirestoreDB = (): Database => {
  const fetchGameAchievements = async (
    gameId: string
  ): Promise<BaseAchievement[]> => {
    const q = query(collection(db, `games/${gameId}/achievements`));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as BaseAchievement);
  };

  const fetchUserAchievements = async (
    userId: string | null
  ): Promise<UserAchievement[]> => {
    if (!userId) return Promise.resolve([]);
    const achievementsCollection = collection(
      db,
      `users/${userId}/games/fallcrate/achievements`
    );
    const querySnapshot = await getDocs(achievementsCollection);
    console.log('querySnapshot', querySnapshot);
    return querySnapshot.docs.map((doc) => doc.data() as UserAchievement);
  };

  const saveAchievement = async (
    achievement: UserAchievement
  ): Promise<UserAchievement> => {
    await setDoc(
      doc(
        db,
        `users/${achievement.userId}/games/${achievement.gameId}/achievements/${achievement.id}`
      ),
      achievement
    );
    return achievement;
  };

  const deleteAchievement = async (
    achievement_id: string,
    game_id: string,
    user_id: string
  ): Promise<void> => {
    await deleteDoc(
      doc(
        db,
        `users/${user_id}/games/${game_id}/achievements/${achievement_id}`
      )
    );
  };

  const subscribeToGameAchievements = (
    gameId: string,
    callback: (achievements: BaseAchievement[]) => void
  ) => {
    const q = query(collection(db, `games/${gameId}/achievements`));
    return onSnapshot(q, (querySnapshot) => {
      const achievements = querySnapshot.docs.map(
        (doc) => doc.data() as BaseAchievement
      );
      callback(achievements);
    });
  };

  const subscribeToUserAchievements = (
    userId: string,
    callback: (achievements: UserAchievement[]) => void
  ): (() => void) => {
    if (!userId) return () => {}; // eslint-disable-line @typescript-eslint/no-empty-function

    const achievementsCollection = collection(
      db,
      `users/${userId}/games/fallcrate/achievements`
    );

    return onSnapshot(achievementsCollection, (querySnapshot) => {
      const achievements = querySnapshot.docs.map(
        (doc) => doc.data() as UserAchievement
      );
      callback(achievements);
    });
  };

  return {
    fetchGameAchievements,
    fetchUserAchievements,
    saveAchievement,
    deleteAchievement,
    subscribeToGameAchievements,
    subscribeToUserAchievements,
  };
};

export default useFirestoreDB;
