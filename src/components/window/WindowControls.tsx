import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Copy, Minus, Square, X } from "lucide-react";

const BUTTON_CLASS =
  "flex h-9 w-[46px] items-center justify-center text-[#9A9AA6] transition-colors hover:bg-[#222229] hover:text-[#F4F4F6]";

function logError(action: string) {
  return (err: unknown) => console.error(`[Kanso] window ${action} error:`, err);
}

// Custom window controls replacing native title bar buttons.
export function WindowControls() {
  const [isMaximized, setIsMaximized] = useState(false);

  // Syncs maximize state across double-click and window snap events.
  useEffect(() => {
    const appWindow = getCurrentWindow();
    let isCancelled = false;
    let stopListening: (() => void) | undefined;

    const syncMaximized = () => {
      appWindow
        .isMaximized()
        .then((value) => {
          if (!isCancelled) setIsMaximized(value);
        })
        .catch(logError("state"));
    };

    syncMaximized();
    appWindow
      .onResized(syncMaximized)
      .then((stop) => {
        if (isCancelled) stop();
        else stopListening = stop;
      })
      .catch(logError("listen"));

    return () => {
      isCancelled = true;
      stopListening?.();
    };
  }, []);

  return (
    <div className="flex shrink-0 items-stretch">
      <button
        type="button"
        onClick={() => void getCurrentWindow().minimize().catch(logError("minimize"))}
        aria-label="Minimize"
        title="Minimize"
        className={BUTTON_CLASS}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => void getCurrentWindow().toggleMaximize().catch(logError("maximize"))}
        aria-label={isMaximized ? "Restore" : "Maximize"}
        title={isMaximized ? "Restore" : "Maximize"}
        className={BUTTON_CLASS}
      >
        {isMaximized ? <Copy className="h-3 w-3" /> : <Square className="h-3 w-3" />}
      </button>

      <button
        type="button"
        onClick={() => void getCurrentWindow().close().catch(logError("close"))}
        aria-label="Close"
        title="Close"
        className="flex h-9 w-11.5 items-center justify-center text-[#9A9AA6] transition-colors hover:bg-[#E81123] hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}