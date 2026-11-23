import { useEffect, useRef, useState } from "react";
import { browserApi } from "../services/browserApi";
import { CUSTOM_SEARCH_ENGINE_ID } from "../utils/resolveInput";
import { useSearchEngine } from "./useSearchEngine";

const DEBOUNCE_MS = 150;
const MIN_QUERY_LENGTH = 2;
const CACHE_LIMIT = 50;
const NO_SUGGESTIONS: string[] = [];

const WHITESPACE = /\s/;
const ADDRESS_CHARS = /[./:]/;

// Avoids sending URL-like queries to external suggestion providers.
function isAddressLike(query: string): boolean {
  return !WHITESPACE.test(query) && ADDRESS_CHARS.test(query);
}

function remember(cache: Map<string, string[]>, key: string, items: string[]) {
  cache.set(key, items);
  if (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
}

// Debounces and caches remote suggestions while keeping previous results visible during loads.
export function useRemoteSuggestions(query: string, isEnabled: boolean): string[] {
  const engine = useSearchEngine();
  const cache = useRef(new Map<string, string[]>());
  const [items, setItems] = useState<string[]>(NO_SUGGESTIONS);

  const shouldFetch =
    isEnabled &&
    engine.id !== CUSTOM_SEARCH_ENGINE_ID &&
    query.length >= MIN_QUERY_LENGTH &&
    !isAddressLike(query);

  useEffect(() => {
    if (!shouldFetch) {
      setItems(NO_SUGGESTIONS);
      return;
    }

    const cacheKey = `${engine.id}\n${query}`;
    const cached = cache.current.get(cacheKey);
    if (cached) {
      setItems(cached);
      return;
    }

    let isStale = false;
    const timer = window.setTimeout(() => {
      browserApi
        .searchSuggestions(engine.id, query)
        .then((result) => {
          remember(cache.current, cacheKey, result);
          if (!isStale) setItems(result);
        })
        .catch(() => {
          // Remote suggestions are best-effort; local suggestions remain available.
        });
    }, DEBOUNCE_MS);

    return () => {
      isStale = true;
      window.clearTimeout(timer);
    };
  }, [shouldFetch, engine.id, query]);

  return shouldFetch ? items : NO_SUGGESTIONS;
}