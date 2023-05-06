import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import { AchievementsProvider } from '@providers/AchievementsProvider';
import { FirebaseProvider } from '@providers/FirebaseProvider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <FirebaseProvider>
      <AchievementsProvider>
        <App />
      </AchievementsProvider>
    </FirebaseProvider>
  </React.StrictMode>
);
