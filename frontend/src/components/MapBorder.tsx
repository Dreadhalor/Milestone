import React, { useEffect, useState } from 'react';
import roughBorderSouth from '@assets/ripped-paper-border-south.png';
import roughBorderEast from '@assets/ripped-paper-border-east.png';

type Props = {
  children: React.ReactNode;
};

const MapBorder = ({ children }: Props) => {
  const [borderThickness, setBorderThickness] = useState(0);
  const wrapperStyle = {
    display: 'grid',
    gridTemplateRows: `${borderThickness}px auto ${borderThickness}px`,
    gridTemplateColumns: `${borderThickness}px auto ${borderThickness}px`,
    gridTemplateAreas: `
      "top-left top-border top-right"
      "left-border content right-border"
      "bottom-left bottom-border bottom-right"`,
  };

  type Dimensions = {
    width: number;
    height: number;
  };
  useEffect(() => {
    const getImageDimensions = (src: string): Promise<Dimensions> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          resolve({ width: img.width, height: img.height } as Dimensions);
        };
      });
    };

    getImageDimensions(roughBorderSouth).then((dimensions) => {
      setBorderThickness(dimensions.height);
    });
  }, []);

  const borderStyle = (direction: 'top' | 'left' | 'bottom' | 'right') => {
    switch (direction) {
      case 'top':
        return {
          gridArea: 'top-border',
          width: '100%',
          height: `${borderThickness}px`,
          backgroundImage: `url(${roughBorderSouth})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat-x',
          transform: 'rotate(180deg)',
          margin: 'auto',
        };

      case 'left':
        return {
          gridArea: 'left-border',
          height: '100%',
          width: `${borderThickness}px`,
          backgroundImage: `url(${roughBorderEast})`,
          transform: 'rotate(180deg)',
          backgroundPosition: 'center',
          margin: 'auto',
        };

      case 'bottom':
        return {
          gridArea: 'bottom-border',
          width: '100%',
          height: `${borderThickness}px`,
          backgroundImage: `url(${roughBorderSouth})`,
          backgroundRepeat: 'repeat-x',
          margin: 'auto',
        };

      case 'right':
        return {
          gridArea: 'right-border',
          height: '100%',
          width: `${borderThickness}px`,
          backgroundImage: `url(${roughBorderEast})`,
          margin: 'auto',
        };

      default:
        return {};
    }
  };

  return (
    <div style={wrapperStyle}>
      <div style={borderStyle('top')} />
      <div style={borderStyle('left')} />
      <div style={borderStyle('bottom')} />
      <div style={borderStyle('right')} />
      <div style={{ gridArea: 'content' }}>{children}</div>
    </div>
  );
};

export default MapBorder;
