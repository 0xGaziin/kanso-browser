import { useEffect, useState } from "react";
import { browserApi, SuggestionsOverlayState } from "../../services/browserApi";
import { SuggestionList } from "./SuggestionList";

const EMPTY_STATE: SuggestionsOverlayState = { suggestions: [], activeIndex: 0 };

// Dumb renderer: main window owns input/keyboard and pushes display state here.
export function SuggestionsOverlay() {
  const [state, setState] = useState(EMPTY_STATE);

  useEffect(() => {
    let isCancelled = false;
    let unlisten: (() => void) | undefined;

    browserApi
      .onSuggestionsUpdate(setState)
      .then((stop) => {
        if (isCancelled) {
          stop();
          return;
        }
        unlisten = stop;
        // Requests initial state in case updates fired before the listener mounted.
        void browserApi.emitOverlayReady();
      })
      .catch((err) => console.error("[Kanso] overlay listen error:", err));

    return () => {
      isCancelled = true;
      unlisten?.();
    };
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#18181D] select-none">
      <SuggestionList
        id="omnibox-suggestions"
        suggestions={state.suggestions}
        activeIndex={state.activeIndex}
        onPick={(target) => {
          void browserApi.emitSuggestionPick(target);
        }}
      />
    </div>
  );
}