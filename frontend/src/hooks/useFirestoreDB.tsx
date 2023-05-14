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
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import {
  BaseAchievement,
  BaseAchievementData,
  UserAchievementData,
  UserAchievement,
  UserPreferences,
  UserPreferencesData,
} from '@src/types';
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

const convertDBUserAchievement = (
  doc: QueryDocumentSnapshot<DocumentData>,
  userId: string
) => {
  const data = doc.data() as UserAchievementData;
  return {
    id: doc.id,
    gameId: 'fallcrate',
    userId,
    ...data,
  };
};
const convertDBGameAchievement = (doc: QueryDocumentSnapshot<DocumentData>) => {
  const data = doc.data() as BaseAchievementData;
  return {
    id: doc.id,
    gameId: 'fallcrate',
    ...data,
  };
};

const useFirestoreDB = (): Database => {
  const fetchGameAchievements = async (
    gameId: string
  ): Promise<BaseAchievement[]> => {
    const q = query(collection(db, `games/${gameId}/achievements`));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => convertDBGameAchievement(doc));
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
    return querySnapshot.docs.map((doc) =>
      convertDBUserAchievement(doc, userId)
    );
  };

  const saveAchievement = async (
    achievement: UserAchievement
  ): Promise<UserAchievement> => {
    const { id, gameId, userId, state, unlockedAt } = achievement;
    const dbAchievement: UserAchievementData = { state, unlockedAt };
    await setDoc(
      doc(db, `users/${userId}/games/${gameId}/achievements/${id}`),
      dbAchievement
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
      const achievements = querySnapshot.docs.map((doc) =>
        convertDBGameAchievement(doc)
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
      const achievements = querySnapshot.docs.map((doc) =>
        convertDBUserAchievement(doc, userId)
      );
      callback(achievements);
    });
  };

  // given a partial UserPreferences object, save it to the database
  const saveUserPreferences = async (
    userId: string,
    preferences: Partial<UserPreferencesData>
  ): Promise<void> => {
    await setDoc(doc(db, `users/${userId}/games/fallcrate`), { preferences });
  };

  const subscribeToUserPreferences = (
    userId: string,
    callback: (preferences: UserPreferencesData) => void
  ): (() => void) => {
    if (!userId) return () => {}; // eslint-disable-line @typescript-eslint/no-empty-function

    const userDoc = doc(db, `users/${userId}/games/fallcrate`);

    return onSnapshot(userDoc, (doc) => {
      const userData = doc.data() as UserPreferences;
      const { showNotifications = true, showBadges = true } =
        userData?.preferences || {};
      const sanitizedPreferences = { showNotifications, showBadges };
      callback(sanitizedPreferences);
    });
  };

  return {
    fetchGameAchievements,
    fetchUserAchievements,
    saveAchievement,
    deleteAchievement,
    subscribeToGameAchievements,
    subscribeToUserAchievements,
    saveUserPreferences,
    subscribeToUserPreferences,
  };
};

export default useFirestoreDB;
