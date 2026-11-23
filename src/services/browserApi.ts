import { emit, listen, type UnlistenFn } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { NavigationAction } from "../types/browser";
import { Suggestion } from "../utils/suggestions";

export interface TabLoadEvent {
  tabId: string;
  url: string;
  isLoading: boolean;
}

export interface TabTitleEvent {
  tabId: string;
  title: string;
}

export interface DownloadStartedEvent {
  path: string;
  fileName: string;
  url: string;
}

export interface DownloadFinishedEvent {
  path: string;
  success: boolean;
}

// Logical pixel bounds relative to the browser window.
export interface OverlayRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SuggestionsOverlayState {
  suggestions: Suggestion[];
  activeIndex: number;
}

const TAB_LOAD_EVENT = "tab:load";
const TAB_TITLE_EVENT = "tab:title";
const DOWNLOAD_STARTED_EVENT = "download:started";
const DOWNLOAD_FINISHED_EVENT = "download:finished";
const MENU_ACTION_EVENT = "menu:action";
const SUGGESTIONS_UPDATE_EVENT = "suggestions:update";
const SUGGESTIONS_PICK_EVENT = "suggestions:pick";
const SUGGESTIONS_READY_EVENT = "suggestions:ready";

// Centralizes Tauri invoke commands and event bridges between UI and Rust.
export const browserApi = {
  openTab: (tabId: string, url: string) =>
    invoke<void>("open_tab_webview", { tabId, url }),

  switchTab: (tabId: string) => invoke<void>("switch_tab_webview", { tabId }),

  hideAllTabs: () => invoke<void>("hide_all_tab_webviews"),

  closeTab: (tabId: string) => invoke<void>("close_tab_webview", { tabId }),

  control: (tabId: string, action: NavigationAction) =>
    invoke<void>("control_tab_webview", { tabId, action }),

  showMenu: () => invoke<void>("show_browser_menu"),

  openDownload: (path: string) => invoke<void>("open_download", { path }),

  revealDownload: (path: string) => invoke<void>("reveal_download", { path }),

  searchSuggestions: (engineId: string, query: string) =>
    invoke<string[]>("search_suggestions", { engineId, query }),

  // Pre-builds the hidden overlay so showing it later is instant.
  initSuggestionsOverlay: () => invoke<void>("init_suggestions_overlay"),

  showSuggestions: (rect: OverlayRect) => invoke<void>("show_suggestions", { ...rect }),

  hideSuggestions: () => invoke<void>("hide_suggestions"),

  emitSuggestions: (state: SuggestionsOverlayState) =>
    emit(SUGGESTIONS_UPDATE_EVENT, state),

  onSuggestionsUpdate: (
    handler: (state: SuggestionsOverlayState) => void,
  ): Promise<UnlistenFn> =>
    listen<SuggestionsOverlayState>(SUGGESTIONS_UPDATE_EVENT, (event) =>
      handler(event.payload),
    ),

  emitSuggestionPick: (target: string) => emit(SUGGESTIONS_PICK_EVENT, target),

  onSuggestionPick: (handler: (target: string) => void): Promise<UnlistenFn> =>
    listen<string>(SUGGESTIONS_PICK_EVENT, (event) => handler(event.payload)),

  emitOverlayReady: () => emit(SUGGESTIONS_READY_EVENT),

  onOverlayReady: (handler: () => void): Promise<UnlistenFn> =>
    listen(SUGGESTIONS_READY_EVENT, () => handler()),

  onTabLoad: (handler: (event: TabLoadEvent) => void): Promise<UnlistenFn> =>
    listen<TabLoadEvent>(TAB_LOAD_EVENT, (event) => handler(event.payload)),

  onTabTitle: (handler: (event: TabTitleEvent) => void): Promise<UnlistenFn> =>
    listen<TabTitleEvent>(TAB_TITLE_EVENT, (event) => handler(event.payload)),

  onDownloadStarted: (
    handler: (event: DownloadStartedEvent) => void,
  ): Promise<UnlistenFn> =>
    listen<DownloadStartedEvent>(DOWNLOAD_STARTED_EVENT, (event) =>
      handler(event.payload),
    ),

  onDownloadFinished: (
    handler: (event: DownloadFinishedEvent) => void,
  ): Promise<UnlistenFn> =>
    listen<DownloadFinishedEvent>(DOWNLOAD_FINISHED_EVENT, (event) =>
      handler(event.payload),
    ),

  onMenuAction: (handler: (actionId: string) => void): Promise<UnlistenFn> =>
    listen<string>(MENU_ACTION_EVENT, (event) => handler(event.payload)),
};