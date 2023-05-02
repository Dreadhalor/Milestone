import { Database } from './Database';
import useJsonServerDB from './useJsonServerDB';
// import useFirestoreDB from './useFirestoreDB';

export interface DBConfig {
  type: 'json-server' | 'firestore';
}

const defaultDBType = import.meta.env.VITE_DATABASE_TYPE || 'firestore';

export const useCreateDB = (
  config: DBConfig = { type: defaultDBType as 'json-server' | 'firestore' }
): Database => {
  switch (config.type) {
    case 'json-server':
      return useJsonServerDB();
    default:
      throw new Error('Invalid database type');
  }
};
