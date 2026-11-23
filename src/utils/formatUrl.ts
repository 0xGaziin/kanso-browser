const SEARCH_URL = "https://duckduckgo.com/?q=";
const DEFAULT_HOME_URL = "https://duckduckgo.com";
const LOCAL_HOST_REGEX = /^(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i;

function isValidHttpUrl(candidate: string): boolean {
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function formatUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return DEFAULT_HOME_URL;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return isValidHttpUrl(trimmed) ? trimmed : `${SEARCH_URL}${encodeURIComponent(trimmed)}`;
  }

  if (trimmed.includes(" ")) {
    return `${SEARCH_URL}${encodeURIComponent(trimmed)}`;
  }

  if (LOCAL_HOST_REGEX.test(trimmed)) {
    const localCandidate = `http://${trimmed}`;
    return isValidHttpUrl(localCandidate)
      ? localCandidate
      : `${SEARCH_URL}${encodeURIComponent(trimmed)}`;
  }

  if (trimmed.includes(".")) {
    const webCandidate = `https://${trimmed}`;
    return isValidHttpUrl(webCandidate)
      ? webCandidate
      : `${SEARCH_URL}${encodeURIComponent(trimmed)}`;
  }

  return `${SEARCH_URL}${encodeURIComponent(trimmed)}`;
}