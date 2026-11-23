import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useSettingsStore } from "../store/useSettingsStore";

export function useNativeWindowTheme() {
  const theme = useSettingsStore((state) => state.theme);

  useEffect(() => {
    getCurrentWindow()
      .setTheme(theme === "system" ? null : theme)
      .catch((err) => console.error("[Kanso] window theme error:", err));
  }, [theme]);
}