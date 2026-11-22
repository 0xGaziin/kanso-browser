import { useEffect } from "react";
import { useSettingsStore } from "../store/useSettingsStore";

const LIGHT_CLASS = "theme-light";
const SYSTEM_LIGHT_QUERY = "(prefers-color-scheme: light)";
const SETTINGS_STORAGE_KEY = "kanso:settings:v1";

export function useTheme() {
  const theme = useSettingsStore((state) => state.theme);

  useEffect(() => {
    const media = window.matchMedia(SYSTEM_LIGHT_QUERY);

    const apply = () => {
      const isLight = theme === "system" ? media.matches : theme === "light";
      document.documentElement.classList.toggle(LIGHT_CLASS, isLight);
    };

    apply();
    if (theme !== "system") return;

    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === SETTINGS_STORAGE_KEY) {
        void useSettingsStore.persist.rehydrate();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);
}