import { lazy, Suspense } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";

// Must match OVERLAY_LABEL_PREFIX in src-tauri/src/overlay.rs.
const OVERLAY_LABEL_PREFIX = "suggestions";

// Keeps browser stores and overlay UI isolated to their respective webview bundles.
const App = lazy(() => import("./App"));
const SuggestionsOverlay = lazy(() =>
  import("./components/navigation/SuggestionsOverlay").then((module) => ({
    default: module.SuggestionsOverlay,
  })),
);

// Selects the entry component based on the current Tauri webview label.
export function Root() {
  const isOverlay = getCurrentWebview().label.startsWith(OVERLAY_LABEL_PREFIX);

  return (
    <Suspense fallback={null}>
      {isOverlay ? <SuggestionsOverlay /> : <App />}
    </Suspense>
  );
}