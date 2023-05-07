import { Achievement } from '@src/types';

type Props = {
  selectedAchievement: Achievement | null;
};

const InfoPanel = ({ selectedAchievement }: Props) => {
  const info_panel_margin = 20;

  const info_panel_style: React.CSSProperties = {
    position: 'sticky',
    minHeight: '75px',
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: '10px',
    padding: '10px',
    border: '1px solid rgba(255,255,255,0.2)',
    opacity: selectedAchievement ? 1 : 0,
    marginLeft: `${info_panel_margin}px`,
    marginRight: `${info_panel_margin}px`,
    marginTop: `${info_panel_margin}px`,
    marginBottom: `${info_panel_margin}px`,
    bottom: `${info_panel_margin}px`,
  };

  return (
    <div style={info_panel_style}>
      <div className='text-2xl font-bold'>{selectedAchievement?.title}</div>
      <div className='text-sm'>{selectedAchievement?.description}</div>
    </div>
  );
};

export default InfoPanel;
