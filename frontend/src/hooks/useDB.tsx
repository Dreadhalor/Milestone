// import { useCreateDB } from '../db/DBConfig';
import { Database } from '../db/Database';
import useFirestoreDB from './useFirestoreDB';

export const useDB = (): Database => {
  // return useCreateDB();
  return useFirestoreDB();
};
