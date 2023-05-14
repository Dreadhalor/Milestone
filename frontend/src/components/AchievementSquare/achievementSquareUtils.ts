import { Achievement } from '@src/types';
import React from 'react';

type Direction = 'top' | 'bottom' | 'left' | 'right';

export type Neighbors = {
  top: Achievement | null;
  bottom: Achievement | null;
  left: Achievement | null;
  right: Achievement | null;
};

const unlockedStates = ['unlocked', 'newly_unlocked'];
const isUnlocked = (state: string) => unlockedStates.includes(state);

export const getAchievementGridIndex = (
  achievement_id: string,
  achievements: Achievement[]
): number => {
  return achievements.findIndex((a) => a.id === achievement_id);
};

export const getNeighbors = (
  achievement_id: string,
  achievements: Achievement[]
): Neighbors => {
  const achievement_index = getAchievementGridIndex(
    achievement_id,
    achievements
  );
  if (achievement_index === -1)
    return {
      top: null,
      bottom: null,
      left: null,
      right: null,
    };

  const row = Math.floor(achievement_index / 10);
  const column = achievement_index % 10;
  const top = row > 0 ? achievements[achievement_index - 10] : null;
  const bottom = row < 9 ? achievements[achievement_index + 10] : null;
  const left = column > 0 ? achievements[achievement_index - 1] : null;
  const right = column < 9 ? achievements[achievement_index + 1] : null;

  return {
    top,
    bottom,
    left,
    right,
  };
};

const checkOneNeighborState = (
  states: ('locked' | 'unlocked' | null)[],
  neighbors: Neighbors,
  direction: Direction
) => {
  const neighbor = neighbors[direction];
  if (!neighbor) return states.includes(null);

  if (states.includes('unlocked')) return isUnlocked(neighbor.state);
  return states.includes(neighbor.state as 'locked' | null);
};
export const checkNeighborState = (
  states: ('locked' | 'unlocked' | null)[],
  neighbors: Neighbors,
  directions: Direction[] = ['top', 'bottom', 'left', 'right'],
  all = false
) => {
  if (all)
    return directions.every((direction) =>
      checkOneNeighborState(states, neighbors, direction)
    );
  return directions.some((direction) =>
    checkOneNeighborState(states, neighbors, direction)
  );
};

const getBorder = (
  direction: Direction,
  is_selected: boolean,
  is_locked: boolean,
  neighbors: Neighbors,
  has_unlocked_neighbors: boolean
): string => {
  if (is_selected) return '2px solid rgba(255,255,255,1)';
  if (is_locked) {
    if (checkNeighborState(['unlocked', null], neighbors, [direction])) {
      if (direction === 'left' || direction === 'top')
        return '4px solid rgba(255,255,255,0.3)';
      return '4px solid rgba(0,0,0,0.3)';
    }
    if (has_unlocked_neighbors) return '1px solid rgba(255,255,255,0.1)';
  }
  return 'none';
};
const getBorderRadius = (directions: Direction[], neighbors: Neighbors) => {
  return checkNeighborState(['unlocked', null], neighbors, directions, true)
    ? 4
    : 0;
};

type BorderParams = [
  isSelected: boolean,
  isLocked: boolean,
  neighbors: Neighbors,
  hasUnlockedNeighbors: boolean
];
export const constructBorders = (
  neighbors: Neighbors,
  is_selected: boolean,
  is_locked: boolean,
  has_unlocked_neighbors: boolean
): React.CSSProperties => {
  const params: BorderParams = [
    is_selected,
    is_locked,
    neighbors,
    has_unlocked_neighbors,
  ];
  return {
    borderTopLeftRadius: getBorderRadius(['top', 'left'], neighbors),
    borderTopRightRadius: getBorderRadius(['top', 'right'], neighbors),
    borderBottomLeftRadius: getBorderRadius(['bottom', 'left'], neighbors),
    borderBottomRightRadius: getBorderRadius(['bottom', 'right'], neighbors),
    borderLeft: getBorder('left', ...params),
    borderRight: getBorder('right', ...params),
    borderTop: getBorder('top', ...params),
    borderBottom: getBorder('bottom', ...params),
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  };
};
