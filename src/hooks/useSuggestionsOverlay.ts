import { RefObject, useEffect, useLayoutEffect, useRef } from "react";
import { browserApi, SuggestionsOverlayState } from "../services/browserApi";
import { SUGGESTION_LIST_GAP, suggestionListHeight } from "../utils/suggestionLayout";
import { Suggestion } from "../utils/suggestions";

interface UseSuggestionsOverlayOptions {
  // Overlay aligns its left edge and width with this anchor element.
  anchorRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  suggestions: Suggestion[];
  activeIndex: number;
  onPick: (target: string) => void;
}

function logError(action: string) {
  return (err: unknown) => console.error(`[Kanso] suggestions overlay ${action} error:`, err);
}

// Syncs suggestion state, bounds, and pick events with the native overlay webview.
export function useSuggestionsOverlay({
  anchorRef,
  isOpen,
  suggestions,
  activeIndex,
  onPick,
}: UseSuggestionsOverlayOptions) {
  const latest = useRef<SuggestionsOverlayState>({ suggestions, activeIndex });
  const onPickRef = useRef(onPick);

  useLayoutEffect(() => {
    latest.current = { suggestions, activeIndex };
    onPickRef.current = onPick;
  });

  // Pre-creates the overlay and binds pick/ready listeners once on mount.
  useEffect(() => {
    browserApi.initSuggestionsOverlay().catch(logError("init"));

    const subscriptions = Promise.all([
      browserApi.onSuggestionPick((target) => onPickRef.current(target)),
      // Re-pushes latest state whenever the overlay mounts or reloads asynchronously.
      browserApi.onOverlayReady(() => {
        void browserApi.emitSuggestions(latest.current);
      }),
    ]);

    return () => {
      void subscriptions.then((stops) => stops.forEach((stop) => stop()));
      browserApi.hideSuggestions().catch(logError("hide"));
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      browserApi.hideSuggestions().catch(logError("hide"));
    }
  }, [isOpen]);

  // Avoids redundant IPC updates when rendered items and selection are unchanged.
  const contentKey = `${activeIndex}|${suggestions.map((s) => s.id).join("|")}`;

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!isOpen || !anchor) return;

    const rect = anchor.getBoundingClientRect();
    const { suggestions: rows, activeIndex: highlighted } = latest.current;

    void (async () => {
      try {
        await browserApi.emitSuggestions({ suggestions: rows, activeIndex: highlighted });
        await browserApi.showSuggestions({
          x: rect.left,
          y: rect.bottom + SUGGESTION_LIST_GAP,
          width: rect.width,
          height: suggestionListHeight(rows.length),
        });
      } catch (err) {
        logError("show")(err);
      }
    })();
  }, [isOpen, contentKey, anchorRef]);
}