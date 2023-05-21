import { useEffect } from 'react';
import { useDB } from '@hooks/useDB';

type MergeAccountsEventDetail = {
  localUid: string;
  remoteUid: string;
};

export function useMergeAccounts() {
  const db = useDB();

  useEffect(() => {
    const onMergeAccounts = async (localUid: string, remoteUid: string) => {
      const [localUserAchievements, remoteUserAchievements] = await Promise.all(
        [
          db.fetchUserAchievements(localUid),
          db.fetchUserAchievements(remoteUid),
        ]
      );

      const mergedPromises = localUserAchievements.map(
        async (localUserAchievement) => {
          const remoteUserAchievement = remoteUserAchievements.find(
            (remoteUserAchievement) =>
              remoteUserAchievement.id === localUserAchievement.id &&
              remoteUserAchievement.gameId === localUserAchievement.gameId
          );
          if (!remoteUserAchievement) {
            const localUserAchievementCopy = { ...localUserAchievement };
            localUserAchievementCopy.uid = remoteUid;
            await db.saveAchievement(localUserAchievementCopy);
          }
          return db.deleteAchievement(
            localUserAchievement.id,
            localUserAchievement.gameId,
            localUserAchievement.uid
          );
        }
      );

      await Promise.all(mergedPromises);
    };

    const handleMergeAccounts = (
      mergeAccountsEvent: CustomEvent<MergeAccountsEventDetail>
    ) => {
      const { localUid, remoteUid } = mergeAccountsEvent.detail;
      onMergeAccounts(localUid, remoteUid);
    };

    window.addEventListener(
      'mergeAccounts',
      handleMergeAccounts as EventListener
    );

    return () =>
      window.removeEventListener(
        'mergeAccounts',
        handleMergeAccounts as EventListener
      );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
