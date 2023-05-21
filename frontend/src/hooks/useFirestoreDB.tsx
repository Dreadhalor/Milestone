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
  uid: string
) => {
  const data = doc.data() as UserAchievementData;
  return {
    id: doc.id,
    gameId: 'fallcrate',
    uid,
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
    uid: string | null
  ): Promise<UserAchievement[]> => {
    if (!uid) return Promise.resolve([]);
    const achievementsCollection = collection(
      db,
      `users/${uid}/games/fallcrate/achievements`
    );
    const querySnapshot = await getDocs(achievementsCollection);
    return querySnapshot.docs.map((doc) => convertDBUserAchievement(doc, uid));
  };

  const saveAchievement = async (
    achievement: UserAchievement
  ): Promise<UserAchievement> => {
    const { id, gameId, uid, state, unlockedAt } = achievement;
    const dbAchievement: UserAchievementData = { state, unlockedAt };
    await setDoc(
      doc(db, `users/${uid}/games/${gameId}/achievements/${id}`),
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
    uid: string | null,
    callback: (achievements: UserAchievement[]) => void
  ): (() => void) => {
    if (!uid) return () => {}; // eslint-disable-line @typescript-eslint/no-empty-function

    const achievementsCollection = collection(
      db,
      `users/${uid}/games/fallcrate/achievements`
    );

    return onSnapshot(achievementsCollection, (querySnapshot) => {
      const achievements = querySnapshot.docs.map((doc) =>
        convertDBUserAchievement(doc, uid)
      );
      callback(achievements);
    });
  };

  // given a partial UserPreferences object, save it to the database
  const saveUserPreferences = async (
    uid: string,
    preferences: Partial<UserPreferencesData>
  ): Promise<void> => {
    await setDoc(doc(db, `users/${uid}/games/fallcrate`), { preferences });
  };

  const subscribeToUserPreferences = (
    uid: string | null,
    callback: (preferences: UserPreferencesData) => void
  ): (() => void) => {
    if (!uid) return () => {}; // eslint-disable-line @typescript-eslint/no-empty-function

    const userDoc = doc(db, `users/${uid}/games/fallcrate`);

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
