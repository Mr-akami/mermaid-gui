import { atom } from 'jotai';

export interface PendingNode {
  type: 'flowchart' | 'sequence' | 'class' | 'state' | 'er';
  data: any;
}

export const pendingNodeAtom = atom<PendingNode | null>(null);