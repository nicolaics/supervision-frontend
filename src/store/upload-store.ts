import { create } from 'zustand';

interface UploadState {
  showUploadCards: boolean;
  setShowUploadCards: (show: boolean) => void;
  hasData: boolean;
  setHasData: (hasData: boolean) => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  showUploadCards: true,
  setShowUploadCards: (show) => set({ showUploadCards: show }),
  hasData: false,
  setHasData: (hasData) => set({ hasData, showUploadCards: !hasData }),
}));

