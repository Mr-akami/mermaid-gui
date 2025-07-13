import { atom } from 'jotai';

export type DrawingMode = 'select' | 'draw-line';
export type PlacementMode = 'auto' | 'click';

export const drawingModeAtom = atom<DrawingMode>('select');
export const placementModeAtom = atom<PlacementMode>('auto');