import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import { AchievementsProvider } from '@providers/AchievementsProvider';
import { MilestoneProvider } from 'milestone-components';
import 'milestone-components/styles.scss';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MilestoneProvider>
      <AchievementsProvider>
        <App />
      </AchievementsProvider>
    </MilestoneProvider>
  </React.StrictMode>
);
