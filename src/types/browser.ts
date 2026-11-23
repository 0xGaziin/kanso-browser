export interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isLoading: boolean;
  isPinned: boolean;
  isSuspended: boolean;
  isPlayingAudio: boolean;
  blockedCount: number;
}

export type NavigationAction = "back" | "forward" | "reload";