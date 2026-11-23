export const INTERNAL_SCHEME = "kanso://";

export const INTERNAL_PAGES = [
  "newtab",
  "history",
  "downloads",
  "bookmarks",
  "settings",
] as const;

export type InternalPage = (typeof INTERNAL_PAGES)[number];

const PAGE_TITLES: Record<InternalPage, string> = {
  newtab: "New Tab",
  history: "History",
  downloads: "Downloads",
  bookmarks: "Bookmarks",
  settings: "Settings",
};

export function internalUrl(page: InternalPage): string {
  return `${INTERNAL_SCHEME}${page}`;
}

export const NEW_TAB_URL = internalUrl("newtab");

export function isInternalPage(name: string): name is InternalPage {
  return (INTERNAL_PAGES as readonly string[]).includes(name);
}

// Resolves internal pages or falls back to newtab for blank and unknown kanso:// URLs.
export function getInternalPage(url: string): InternalPage | null {
  const trimmed = url.trim();
  if (trimmed === "" || trimmed === "about:blank") return "newtab";
  if (!trimmed.startsWith(INTERNAL_SCHEME)) return null;

  const name = trimmed.slice(INTERNAL_SCHEME.length).replace(/\/+$/, "");
  return isInternalPage(name) ? name : "newtab";
}

export function isInternalUrl(url: string): boolean {
  return getInternalPage(url) !== null;
}

export function internalPageTitle(url: string): string {
  return PAGE_TITLES[getInternalPage(url) ?? "newtab"];
}