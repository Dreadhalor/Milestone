import { ConfigProvider } from 'antd';
import { AchievementsProvider } from './AchievementsProvider';
import { AuthProvider } from './AuthProvider';

interface Props {
  children: React.ReactNode;
  app: string;
}

export const MilestoneProvider = ({ children, app }: Props) => {
  return (
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
        <AchievementsProvider app={app}>{children}</AchievementsProvider>
      </ConfigProvider>
    </AuthProvider>
  );
};
