import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DownloadFinishedEvent, DownloadStartedEvent } from "../services/browserApi";

export type DownloadStatus = "downloading" | "completed" | "failed";

export interface DownloadItem {
  // Unique path guaranteed by native non-overwriting download naming.
  id: string;
  path: string;
  fileName: string;
  url: string;
  status: DownloadStatus;
  startedAt: number;
}

interface DownloadsState {
  items: DownloadItem[];
  handleStarted: (event: DownloadStartedEvent) => void;
  handleFinished: (event: DownloadFinishedEvent) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useDownloadsStore = create<DownloadsState>()(
  persist(
    (set) => ({
      items: [],

      handleStarted: ({ path, fileName, url }) =>
        set((state) => ({
          items: [
            {
              id: path,
              path,
              fileName,
              url,
              status: "downloading" as const,
              startedAt: Date.now(),
            },
            ...state.items.filter((item) => item.id !== path),
          ],
        })),

      handleFinished: ({ path, success }) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === path
              ? { ...item, status: success ? ("completed" as const) : ("failed" as const) }
              : item,
          ),
        })),

      remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),

      clear: () => set({ items: [] }),
    }),
    { name: "kanso:downloads:v1" },
  ),
);