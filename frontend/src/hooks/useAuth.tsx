import { AuthContext, AuthContextValue } from '@providers/AuthProvider';
import { useContext } from 'react';

export const useAuth = (): AuthContextValue => useContext(AuthContext);
