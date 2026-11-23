export interface SearchEngine {
  id: string;
  name: string;
  searchUrl: string;
  homeUrl: string;
}

export const SEARCH_PLACEHOLDER = "%s";
export const CUSTOM_SEARCH_ENGINE_ID = "custom";
export const DEFAULT_SEARCH_ENGINE_ID = "duckduckgo";

export const SEARCH_ENGINES: readonly SearchEngine[] = [
  {
    id: "duckduckgo",
    name: "DuckDuckGo",
    searchUrl: "https://duckduckgo.com/?q=%s",
    homeUrl: "https://duckduckgo.com",
  },
  {
    id: "google",
    name: "Google",
    searchUrl: "https://www.google.com/search?q=%s",
    homeUrl: "https://www.google.com",
  },
  {
    id: "bing",
    name: "Bing",
    searchUrl: "https://www.bing.com/search?q=%s",
    homeUrl: "https://www.bing.com",
  },
  {
    id: "brave",
    name: "Brave Search",
    searchUrl: "https://search.brave.com/search?q=%s",
    homeUrl: "https://search.brave.com",
  },
  {
    id: "ecosia",
    name: "Ecosia",
    searchUrl: "https://www.ecosia.org/search?q=%s",
    homeUrl: "https://www.ecosia.org",
  },
  {
    id: "startpage",
    name: "Startpage",
    searchUrl: "https://www.startpage.com/sp/search?query=%s",
    homeUrl: "https://www.startpage.com",
  },
  {
    id: "yahoo",
    name: "Yahoo",
    searchUrl: "https://search.yahoo.com/search?p=%s",
    homeUrl: "https://search.yahoo.com",
  },
];

const HAS_WHITESPACE = /\s/;
const HTTP_URL = /^https?:\/\/\S+$/i;
const LOCAL_HOST = /^(localhost|(\d{1,3}\.){3}\d{1,3})(:\d+)?([/?#]\S*)?$/i;
const DOMAIN = /^([a-z\d-]+\.)+[a-z]{2,}(:\d+)?([/?#]\S*)?$/i;

export function isValidSearchTemplate(template: string): boolean {
  if (!template.includes(SEARCH_PLACEHOLDER)) return false;
  try {
    const { protocol } = new URL(template.replace(SEARCH_PLACEHOLDER, "test"));
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

// Falls back to the default engine if the custom template is invalid or id is unknown.
export function resolveSearchEngine(id: string, customSearchUrl: string): SearchEngine {
  if (id === CUSTOM_SEARCH_ENGINE_ID && isValidSearchTemplate(customSearchUrl)) {
    return {
      id,
      name: "Custom",
      searchUrl: customSearchUrl,
      homeUrl: new URL(customSearchUrl.replace(SEARCH_PLACEHOLDER, "")).origin,
    };
  }
  return SEARCH_ENGINES.find((engine) => engine.id === id) ?? SEARCH_ENGINES[0];
}

function buildSearchUrl(engine: SearchEngine, query: string): string {
  return engine.searchUrl.replace(SEARCH_PLACEHOLDER, encodeURIComponent(query));
}

// Checks whether input resembles an HTTP URL, local host, or domain rather than search text.
export function looksLikeAddress(raw: string): boolean {
  const input = raw.trim();
  if (HAS_WHITESPACE.test(input)) return false;
  return HTTP_URL.test(input) || LOCAL_HOST.test(input) || DOMAIN.test(input);
}

// Converts raw omnibox input into a navigable URL or search engine query URL.
export function resolveInput(raw: string, engine: SearchEngine): string {
  const input = raw.trim();

  if (!looksLikeAddress(input)) return buildSearchUrl(engine, input);
  if (HTTP_URL.test(input)) return input;
  return `${LOCAL_HOST.test(input) ? "http" : "https"}://${input}`;
}