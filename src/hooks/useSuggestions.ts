import { useDeferredValue, useMemo } from "react";
import { useBookmarksStore } from "../store/useBookmarksStore";
import { useHistoryStore } from "../store/useHistoryStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { buildSuggestions, Suggestion } from "../utils/suggestions";
import { useRemoteSuggestions } from "./useRemoteSuggestions";
import { useSearchEngine } from "./useSearchEngine";

const NO_SUGGESTIONS: Suggestion[] = [];

// Skips suggestion computation while inactive so typing stays responsive.
export function useSuggestions(input: string, isActive: boolean): Suggestion[] {
  const engine = useSearchEngine();
  const bookmarks = useBookmarksStore((state) => state.items);
  const history = useHistoryStore((state) => state.entries);
  const remoteEnabled = useSettingsStore((state) => state.searchSuggestions);

  // Defers filtering large bookmark and history lists during fast keystrokes.
  const query = useDeferredValue(input.trim());
  const remote = useRemoteSuggestions(query, isActive && remoteEnabled);

  return useMemo(
    () =>
      isActive && query
        ? buildSuggestions({ query, engine, bookmarks, history, remote })
        : NO_SUGGESTIONS,
    [isActive, query, engine, bookmarks, history, remote],
  );
}