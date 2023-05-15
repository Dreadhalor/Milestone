import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import { AchievementsProvider } from '@providers/AchievementsProvider';
import 'milestone-components/styles.scss';
import { AuthProvider } from './providers/AuthProvider';
import { ConfigProvider } from 'antd';
import { MilestoneProvider } from 'milestone-components';

const localSetup = (
  <AuthProvider>
    <ConfigProvider
      theme={{
        components: {
          Dropdown: {
            colorBgElevated: '#383838',
            controlItemBgHover: '#484848',
          },
          Modal: {
            wireframe: true,
          },
          Notification: {
            colorTextHeading: '#fff',
            colorText: '#fff',
            colorBgElevated: 'rgb(17,24,39)',
            colorIcon: '#fff',
            colorIconHover: '#aaa',
            fontSizeLG: 24,
            fontWeightStrong: 700,
          },
        },
      }}
    >
      <AchievementsProvider>
        <App />
      </AchievementsProvider>
    </ConfigProvider>
  </AuthProvider>
);

const remoteSetup = (
  <MilestoneProvider>
    <App />
  </MilestoneProvider>
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>{remoteSetup}</React.StrictMode>
);
