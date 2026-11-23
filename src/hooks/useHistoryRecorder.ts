import { useEffect } from "react";
import { browserApi } from "../services/browserApi";
import { useBrowserStore } from "../store/useBrowserStore";
import { useHistoryStore } from "../store/useHistoryStore";
import { useSettingsStore } from "../store/useSettingsStore";

const findTab = (tabId: string) =>
  useBrowserStore.getState().tabs.find((tab) => tab.id === tabId);

const isHistoryEnabled = () => useSettingsStore.getState().saveHistory;

// Records completed visits and updates titles as pages finish loading.
export function useHistoryRecorder() {
  useEffect(() => {
    const listeners = Promise.all([
      browserApi.onTabLoad(({ tabId, url, isLoading }) => {
        const tab = findTab(tabId);
        if (isLoading || !tab || !isHistoryEnabled()) return;

        useHistoryStore.getState().recordVisit(url, tab.title);
      }),

      // Title updates typically arrive after page load completes.
      browserApi.onTabTitle(({ tabId, title }) => {
        const tab = findTab(tabId);
        const cleanTitle = title.trim();
        if (!tab || !cleanTitle || !isHistoryEnabled()) return;

        useHistoryStore.getState().updateTitle(tab.url, cleanTitle);
      }),
    ]);

    return () => {
      void listeners.then((stops) => stops.forEach((stop) => stop()));
    };
  }, []);
}