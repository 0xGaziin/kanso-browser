// Resolves /favicon.ico directly from the origin without external services.
export function faviconUrlFor(url: string): string | undefined {
  try {
    const { protocol, origin } = new URL(url);
    return protocol === "http:" || protocol === "https:"
      ? `${origin}/favicon.ico`
      : undefined;
  } catch {
    return undefined;
  }
}