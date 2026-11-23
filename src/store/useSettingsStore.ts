import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LanguagePreference } from "../i18n/translate";
import {
  DEFAULT_SEARCH_ENGINE_ID,
  resolveSearchEngine,
  SearchEngine,
} from "../utils/resolveInput";

export type StartupMode = "newtab" | "homepage";
export type ThemePreference = "light" | "dark" | "system";

interface SettingsState {
  theme: ThemePreference;
  language: LanguagePreference;
  searchEngineId: string;
  customSearchUrl: string;
  searchSuggestions: boolean;
  saveHistory: boolean;
  startupMode: StartupMode;
  homepageUrl: string;
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: LanguagePreference) => void;
  setSearchEngine: (id: string) => void;
  setCustomSearchUrl: (url: string) => void;
  setSearchSuggestions: (enabled: boolean) => void;
  setSaveHistory: (enabled: boolean) => void;
  setStartupMode: (mode: StartupMode) => void;
  setHomepageUrl: (url: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      language: "system",
      searchEngineId: DEFAULT_SEARCH_ENGINE_ID,
      customSearchUrl: "",
      searchSuggestions: true,
      saveHistory: true,
      startupMode: "newtab",
      homepageUrl: "",
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setSearchEngine: (id) => set({ searchEngineId: id }),
      setCustomSearchUrl: (url) => set({ customSearchUrl: url }),
      setSearchSuggestions: (enabled) => set({ searchSuggestions: enabled }),
      setSaveHistory: (enabled) => set({ saveHistory: enabled }),
      setStartupMode: (mode) => set({ startupMode: mode }),
      setHomepageUrl: (url) => set({ homepageUrl: url }),
    }),
    { name: "kanso:settings:v1" },
  ),
);

// Non-reactive read, for store actions and event handlers.
export function getActiveSearchEngine(): SearchEngine {
  const { searchEngineId, customSearchUrl } = useSettingsStore.getState();
  return resolveSearchEngine(searchEngineId, customSearchUrl);
}