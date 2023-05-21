import { useState, useEffect } from 'react';
import { useDB } from '@hooks/useDB';
import { UserPreferencesData } from '@src/types';

export function useUserPreferences(uid: string | null) {
  const db = useDB();
  const [userPreferences, setUserPreferences] = useState<UserPreferencesData>({
    showNotifications: true,
    showBadges: true,
  });

  useEffect(() => {
    const userPreferencesUnsubscribe = db.subscribeToUserPreferences(
      uid,
      setUserPreferences
    );

    return () => {
      userPreferencesUnsubscribe();
    };
  }, [uid]); // eslint-disable-line react-hooks/exhaustive-deps

  const editUserPreferences = async (
    preferences: Partial<UserPreferencesData>
  ) => {
    if (!uid) return;

    await db.saveUserPreferences(uid, {
      ...userPreferences,
      ...preferences,
    });
  };

  return { userPreferences, editUserPreferences };
}
