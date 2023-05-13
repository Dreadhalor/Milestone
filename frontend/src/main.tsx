import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import { AchievementsProvider } from '@providers/AchievementsProvider';
import 'milestone-components/styles.scss';
import { AuthProvider } from './providers/AuthProvider';
import { ConfigProvider } from 'antd';
import { App as AntApp } from 'antd';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <AchievementsProvider>
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
            },
          }}
        >
          <AntApp>
            <App />
          </AntApp>
        </ConfigProvider>
      </AchievementsProvider>
    </AuthProvider>
  </React.StrictMode>
);
