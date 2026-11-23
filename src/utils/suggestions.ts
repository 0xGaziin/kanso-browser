import { looksLikeAddress, SearchEngine } from "./resolveInput";

export type SuggestionKind = "navigate" | "search" | "bookmark" | "history";

export interface Suggestion {
  id: string;
  kind: SuggestionKind;
  label: string;
  detail?: string;
  target: string;
}

interface SavedPage {
  url: string;
  title: string;
}

interface BuildInput {
  query: string;
  engine: SearchEngine;
  bookmarks: readonly SavedPage[];
  history: readonly SavedPage[];
  remote: readonly string[];
}

const MAX_TOTAL = 8;
const MAX_BOOKMARKS = 3;
const MAX_HISTORY = 3;
const SCHEME_AND_WWW = /^https?:\/\/(www\.)?/;

type MatchQuality = "prefix" | "contains" | null;

function matchQuality(page: SavedPage, needle: string): MatchQuality {
  const url = page.url.toLowerCase();
  if (url.replace(SCHEME_AND_WWW, "").startsWith(needle)) return "prefix";
  if (url.includes(needle) || page.title.toLowerCase().includes(needle)) return "contains";
  return null;
}

// Stops early once enough prefix matches are found in newest-first entries.
function pickMatches<T extends SavedPage>(
  pages: readonly T[],
  needle: string,
  limit: number,
  seen: Set<string>,
): T[] {
  const prefixed: T[] = [];
  const others: T[] = [];

  for (const page of pages) {
    if (prefixed.length === limit) break;
    if (seen.has(page.url)) continue;

    const quality = matchQuality(page, needle);
    if (!quality) continue;

    seen.add(page.url);
    (quality === "prefix" ? prefixed : others).push(page);
  }

  return [...prefixed, ...others].slice(0, limit);
}

function typedRow(query: string, engine: SearchEngine): Suggestion {
  return looksLikeAddress(query)
    ? { id: "typed", kind: "navigate", label: query, detail: "Open address", target: query }
    : { id: "typed", kind: "search", label: query, detail: engine.name, target: query };
}

function pageRow(kind: "bookmark" | "history", page: SavedPage): Suggestion {
  const hasDistinctTitle = page.title !== "" && page.title !== page.url;
  return {
    id: `${kind}:${page.url}`,
    kind,
    label: hasDistinctTitle ? page.title : page.url,
    detail: hasDistinctTitle ? page.url : undefined,
    target: page.url,
  };
}

function searchRow(text: string): Suggestion {
  return { id: `search:${text}`, kind: "search", label: text, target: text };
}

// Keeps typed input first so Enter preserves expected address/search behavior.
export function buildSuggestions({
  query,
  engine,
  bookmarks,
  history,
  remote,
}: BuildInput): Suggestion[] {
  const needle = query.toLowerCase();
  const seen = new Set<string>();

  const rows: Suggestion[] = [
    typedRow(query, engine),
    ...pickMatches(bookmarks, needle, MAX_BOOKMARKS, seen).map((page) =>
      pageRow("bookmark", page),
    ),
    ...pickMatches(history, needle, MAX_HISTORY, seen).map((page) =>
      pageRow("history", page),
    ),
  ];

  for (const text of remote) {
    if (rows.length >= MAX_TOTAL) break;
    if (text.toLowerCase() !== needle) rows.push(searchRow(text));
  }

  return rows;
}