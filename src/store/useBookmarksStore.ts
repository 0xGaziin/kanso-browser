import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  createdAt: number;
}

interface BookmarksState {
  items: Bookmark[];
  toggle: (url: string, title: string) => void;
  remove: (id: string) => void;
}

export const useBookmarksStore = create<BookmarksState>()(
  persist(
    (set) => ({
      items: [],

      toggle: (url, title) =>
        set((state) => {
          if (state.items.some((item) => item.url === url)) {
            return { items: state.items.filter((item) => item.url !== url) };
          }
          const bookmark: Bookmark = {
            id: crypto.randomUUID(),
            url,
            title: title || url,
            createdAt: Date.now(),
          };
          return { items: [bookmark, ...state.items] };
        }),

      remove: (id) =>
        set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
    }),
    { name: "kanso:bookmarks:v1" },
  ),
);