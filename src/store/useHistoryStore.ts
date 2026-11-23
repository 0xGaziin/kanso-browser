import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface HistoryEntry {
  id: string;
  url: string;
  title: string;
  visitedAt: number;
}

const MAX_ENTRIES = 5000;
// Collapses quick reloads or redirects on the same URL into a single visit.
const DUPLICATE_WINDOW_MS = 10_000;

interface HistoryState {
  entries: HistoryEntry[];
  recordVisit: (url: string, title: string) => void;
  updateTitle: (url: string, title: string) => void;
  removeEntry: (id: string) => void;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],

      recordVisit: (url, title) =>
        set((state) => {
          const now = Date.now();
          const [latest, ...rest] = state.entries;

          if (latest && latest.url === url && now - latest.visitedAt < DUPLICATE_WINDOW_MS) {
            return { entries: [{ ...latest, title: title || latest.title }, ...rest] };
          }

          const entry: HistoryEntry = {
            id: crypto.randomUUID(),
            url,
            title: title || url,
            visitedAt: now,
          };
          return { entries: [entry, ...state.entries].slice(0, MAX_ENTRIES) };
        }),

      // Titles typically arrive asynchronously after the page load event fires.
      updateTitle: (url, title) =>
        set((state) => {
          const index = state.entries.findIndex((entry) => entry.url === url);
          if (index === -1) return state;
          const entries = [...state.entries];
          entries[index] = { ...entries[index], title };
          return { entries };
        }),

      removeEntry: (id) =>
        set((state) => ({ entries: state.entries.filter((entry) => entry.id !== id) })),

      clear: () => set({ entries: [] }),
    }),
    { name: "kanso:history:v1" },
  ),
);