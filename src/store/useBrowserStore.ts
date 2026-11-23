import { create } from "zustand";
import { browserApi, TabLoadEvent, TabTitleEvent } from "../services/browserApi";
import { NavigationAction, Tab } from "../types/browser";
import {
  getInternalPage,
  internalPageTitle,
  internalUrl,
  isInternalUrl,
  NEW_TAB_URL,
} from "../utils/internalPages";
import { resolveInput } from "../utils/resolveInput";
import { getActiveSearchEngine, useSettingsStore } from "./useSettingsStore";

// Must match TOP_BAR_HEIGHT in src-tauri/src/layout.rs so child webviews stay below the header.
export const TOP_BAR_HEIGHT = 84;

export interface TabHistory {
  entries: string[];
  index: number;
}

// Canonicalizes URLs so variants like "https://a.com" and "https://a.com/" match.
export function normalizeUrl(url: string): string {
  const internalPage = getInternalPage(url);
  if (internalPage) return internalUrl(internalPage);
  try {
    return new URL(url).href;
  } catch {
    return url;
  }
}

function createHistory(url: string): TabHistory {
  return { entries: [normalizeUrl(url)], index: 0 };
}

// App-initiated navigation clears forward history entries.
function pushEntry(history: TabHistory, url: string): TabHistory {
  const normalized = normalizeUrl(url);
  if (history.entries[history.index] === normalized) return history;
  const entries = [...history.entries.slice(0, history.index + 1), normalized];
  return { entries, index: entries.length - 1 };
}

// Syncs tab history with native load events: started adds link clicks, finished records final URLs.
function applyLoadEvent(
  history: TabHistory,
  url: string,
  isLoading: boolean,
): TabHistory {
  const normalized = normalizeUrl(url);
  const current = history.entries[history.index];
  if (current === normalized) return history;

  if (isLoading) return pushEntry(history, normalized);

  const entries = [...history.entries];
  entries[history.index] = normalized;
  return { entries, index: history.index };
}

function extractTitleFromUrl(url: string): string {
  try {
    return new URL(url).hostname || url;
  } catch {
    return url;
  }
}

function createDefaultTab(id: string, url = NEW_TAB_URL): Tab {
  return {
    id,
    title: isInternalUrl(url) ? internalPageTitle(url) : extractTitleFromUrl(url),
    url,
    isLoading: false,
    isPinned: false,
    isSuspended: false,
    isPlayingAudio: false,
    blockedCount: 0,
  };
}

function updateTabById(tabs: Tab[], id: string, patch: Partial<Tab>): Tab[] {
  return tabs.map((tab) => (tab.id === id ? { ...tab, ...patch } : tab));
}

function toAddressInput(url: string): string {
  return isInternalUrl(url) ? "" : url;
}

// Uses site-root /favicon.ico directly without external lookup services.
function faviconUrlFor(url: string): string | undefined {
  try {
    const { protocol, origin } = new URL(url);
    return protocol === "http:" || protocol === "https:"
      ? `${origin}/favicon.ico`
      : undefined;
  } catch {
    return undefined;
  }
}

function startupHomepage(): string | null {
  const { startupMode, homepageUrl } = useSettingsStore.getState();
  const homepage = homepageUrl.trim();
  return startupMode === "homepage" && homepage ? homepage : null;
}

// Hides native webviews for internal React pages; otherwise activates the tab webview.
function showTabNatively(tab: Tab): Promise<void> {
  return isInternalUrl(tab.url)
    ? browserApi.hideAllTabs()
    : browserApi.switchTab(tab.id);
}

interface BrowserStore {
  tabs: Tab[];
  activeTabId: string;
  addressInput: string;
  isEditingAddress: boolean;
  histories: Record<string, TabHistory>;
  initBrowser: () => Promise<void>;
  setAddressInput: (value: string) => void;
  setAddressEditing: (isEditing: boolean) => void;
  navigate: (rawInput: string) => Promise<void>;
  goBack: () => Promise<void>;
  goForward: () => Promise<void>;
  createTab: (initialUrl?: string) => Promise<void>;
  selectTab: (id: string) => Promise<void>;
  closeTab: (id: string) => Promise<void>;
  moveTab: (id: string, toIndex: number) => void;
  controlActiveTab: (action: NavigationAction) => Promise<void>;
}

export const useBrowserStore = create<BrowserStore>((set, get) => {
  // Prevents duplicate bootstrap runs under React StrictMode.
  let initPromise: Promise<void> | null = null;

  // Caches document titles per URL so back/forward/reload restores titles immediately.
  const pageTitles = new Map<string, string>();

  const resolveTitle = (url: string): string =>
    isInternalUrl(url)
      ? internalPageTitle(url)
      : pageTitles.get(normalizeUrl(url)) ?? extractTitleFromUrl(url);

  // Mirrors native load events as source of truth for redirects, links, and load state.
  const handleTabLoad = (event: TabLoadEvent) => {
    set((state) => {
      const tab = state.tabs.find((t) => t.id === event.tabId);
      // Ignores events from hidden webviews while an internal page is shown.
      if (!tab || isInternalUrl(tab.url)) return state;

      const history = state.histories[event.tabId];
      const shouldUpdateAddress =
        state.activeTabId === event.tabId &&
        !event.isLoading &&
        !state.isEditingAddress;

      return {
        tabs: updateTabById(state.tabs, event.tabId, {
          url: event.url,
          // Resets title only on load start so finished loads keep incoming titles.
          ...(event.isLoading ? { title: resolveTitle(event.url) } : {}),
          favicon: faviconUrlFor(event.url),
          isLoading: event.isLoading,
        }),
        histories: history
          ? {
              ...state.histories,
              [event.tabId]: applyLoadEvent(history, event.url, event.isLoading),
            }
          : state.histories,
        addressInput: shouldUpdateAddress ? event.url : state.addressInput,
      };
    });
  };

  const handleTabTitle = (event: TabTitleEvent) => {
    const title = event.title.trim();
    if (!title) return;

    set((state) => {
      const tab = state.tabs.find((t) => t.id === event.tabId);
      if (!tab || isInternalUrl(tab.url)) return state;

      pageTitles.set(normalizeUrl(tab.url), title);
      return { tabs: updateTabById(state.tabs, event.tabId, { title }) };
    });
  };

  const bootstrap = async () => {
    await Promise.all([
      browserApi.onTabLoad(handleTabLoad),
      browserApi.onTabTitle(handleTabTitle),
    ]);

    const homepage = startupHomepage();
    if (homepage) {
      await get().navigate(homepage);
    }
  };

  const travelHistory = async (delta: -1 | 1) => {
    const previous = get();
    const { activeTabId } = previous;
    const history = previous.histories[activeTabId];
    if (!history) return;

    const nextIndex = history.index + delta;
    const target = history.entries[nextIndex];
    if (target === undefined) return;

    const current = history.entries[history.index];

    set((state) => ({
      histories: {
        ...state.histories,
        [activeTabId]: { ...history, index: nextIndex },
      },
      addressInput: toAddressInput(target),
      tabs: updateTabById(state.tabs, activeTabId, {
        url: target,
        title: resolveTitle(target),
        favicon: faviconUrlFor(target),
        isLoading: false,
      }),
    }));

    try {
      if (isInternalUrl(target)) {
        await browserApi.hideAllTabs();
      } else if (isInternalUrl(current)) {
        // Reveals the existing tab webview when returning from an internal page.
        await browserApi.switchTab(activeTabId);
      } else {
        await browserApi.control(activeTabId, delta < 0 ? "back" : "forward");
      }
    } catch (err) {
      console.error("[Kanso] history navigation error:", err);
      set({
        tabs: previous.tabs,
        histories: previous.histories,
        addressInput: previous.addressInput,
      });
    }
  };

  return {
    tabs: [createDefaultTab("tab-1", NEW_TAB_URL)],
    activeTabId: "tab-1",
    addressInput: "",
    isEditingAddress: false,
    histories: { "tab-1": createHistory(NEW_TAB_URL) },

    initBrowser: () => {
      initPromise ??= bootstrap();
      return initPromise;
    },

    setAddressInput: (value) => set({ addressInput: value }),

    setAddressEditing: (isEditing) =>
      set((state) => {
        if (isEditing) return { isEditingAddress: true };

        const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId);
        return {
          isEditingAddress: false,
          addressInput: toAddressInput(activeTab?.url ?? NEW_TAB_URL),
        };
      }),

    navigate: async (rawInput) => {
      const trimmed = rawInput.trim();
      if (!trimmed) return;

      const targetTabId = get().activeTabId;
      const targetUrl = resolveInput(trimmed, getActiveSearchEngine());

      set((state) => {
        const history = state.histories[targetTabId] ?? createHistory(NEW_TAB_URL);
        return {
          addressInput:
            state.activeTabId === targetTabId ? targetUrl : state.addressInput,
          histories: {
            ...state.histories,
            [targetTabId]: pushEntry(history, targetUrl),
          },
          tabs: updateTabById(state.tabs, targetTabId, {
            url: targetUrl,
            title: resolveTitle(targetUrl),
            favicon: faviconUrlFor(targetUrl),
            isLoading: true,
            isSuspended: false,
          }),
        };
      });

      try {
        await browserApi.openTab(targetTabId, targetUrl);
      } catch (err) {
        console.error("[Kanso] navigate error:", err);
        set((state) => ({
          tabs: updateTabById(state.tabs, targetTabId, { isLoading: false }),
        }));
      }
    },

    goBack: () => travelHistory(-1),
    goForward: () => travelHistory(1),

    createTab: async (initialUrl = NEW_TAB_URL) => {
      const previous = get();
      const newId = `tab-${crypto.randomUUID()}`;
      const isInternal = isInternalUrl(initialUrl);
      const newTab = createDefaultTab(newId, initialUrl);

      set((state) => ({
        tabs: [...state.tabs, { ...newTab, isLoading: !isInternal }],
        histories: { ...state.histories, [newId]: createHistory(initialUrl) },
        activeTabId: newId,
        addressInput: toAddressInput(initialUrl),
      }));

      try {
        // Hides prior webviews so internal pages are not covered by an active tab webview.
        if (isInternal) {
          await browserApi.hideAllTabs();
        } else {
          await browserApi.openTab(newId, initialUrl);
        }
      } catch (err) {
        console.error("[Kanso] createTab error:", err);
        set({
          tabs: previous.tabs,
          histories: previous.histories,
          activeTabId: previous.activeTabId,
          addressInput: previous.addressInput,
        });
      }
    },

    selectTab: async (id) => {
      const previous = get();
      const tab = previous.tabs.find((t) => t.id === id);
      if (!tab) return;

      set((state) => ({
        activeTabId: tab.id,
        addressInput: toAddressInput(tab.url),
        tabs: updateTabById(state.tabs, tab.id, { isSuspended: false }),
      }));

      try {
        await showTabNatively(tab);
      } catch (err) {
        console.error("[Kanso] selectTab error:", err);
        set({
          activeTabId: previous.activeTabId,
          addressInput: previous.addressInput,
        });
      }
    },

    closeTab: async (id) => {
      const previous = get();
      if (previous.tabs.length <= 1) return;
      if (!previous.tabs.some((tab) => tab.id === id)) return;

      const remaining = previous.tabs.filter((tab) => tab.id !== id);
      const wasActive = previous.activeTabId === id;
      const nextTab = wasActive
        ? remaining[remaining.length - 1]
        : remaining.find((t) => t.id === previous.activeTabId) ??
          remaining[remaining.length - 1];

      const { [id]: _removed, ...remainingHistories } = previous.histories;

      set({
        tabs: remaining,
        histories: remainingHistories,
        activeTabId: nextTab.id,
        addressInput: toAddressInput(nextTab.url),
      });

      try {
        await browserApi.closeTab(id);
        if (wasActive) {
          await showTabNatively(nextTab);
        }
      } catch (err) {
        console.error("[Kanso] closeTab error:", err);
        set({
          tabs: previous.tabs,
          histories: previous.histories,
          activeTabId: previous.activeTabId,
          addressInput: previous.addressInput,
        });
      }
    },

    moveTab: (id, toIndex) =>
      set((state) => {
        const from = state.tabs.findIndex((tab) => tab.id === id);
        if (from === -1) return state;

        const pinnedCount = state.tabs.filter((tab) => tab.isPinned).length;
        const isPinned = state.tabs[from].isPinned;
        const min = isPinned ? 0 : pinnedCount;
        const max = isPinned ? pinnedCount - 1 : state.tabs.length - 1;
        const target = Math.min(Math.max(toIndex, min), max);
        if (target === from) return state;

        const tabs = [...state.tabs];
        const [moved] = tabs.splice(from, 1);
        tabs.splice(target, 0, moved);
        return { tabs };
      }),

    controlActiveTab: async (action) => {
      if (action === "back") return travelHistory(-1);
      if (action === "forward") return travelHistory(1);

      const { activeTabId, tabs } = get();
      const currentTab = tabs.find((t) => t.id === activeTabId);
      if (!currentTab || isInternalUrl(currentTab.url)) return;

      try {
        await browserApi.control(activeTabId, action);
      } catch (err) {
        console.error("[Kanso] controlActiveTab error:", err);
      }
    },
  };
});