import { useEffect } from "react";
import { AddressBar } from "./components/navigation/AddressBar";
import { InternalPageView } from "./components/pages/InternalPageView";
import { TitleBar } from "./components/window/TitleBar";
import { useDownloadListeners } from "./hooks/useDownloadListeners";
import { useHistoryRecorder } from "./hooks/useHistoryRecorder";
import { useMenuActions } from "./hooks/useMenuActions";
import { useBrowserStore } from "./store/useBrowserStore";
import { isInternalUrl, NEW_TAB_URL } from "./utils/internalPages";

export default function App() {
  const initBrowser = useBrowserStore((state) => state.initBrowser);
  const activeUrl = useBrowserStore(
    (state) => state.tabs.find((tab) => tab.id === state.activeTabId)?.url ?? NEW_TAB_URL,
  );

  useMenuActions();
  useHistoryRecorder();
  useDownloadListeners();

  useEffect(() => {
    void initBrowser();
  }, [initBrowser]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#111114] text-[#F4F4F6] select-none">
      {/* Keep header height at 84px (h-21) to match TOP_BAR_HEIGHT used by child WebViews. */}
      <header className="flex h-21 w-full flex-col border-b border-[#2C2C35] bg-[#111114]">
        <TitleBar />
        <AddressBar />
      </header>

      <main className="relative flex min-h-0 flex-1 overflow-hidden bg-[#111114]">
        {isInternalUrl(activeUrl) && <InternalPageView url={activeUrl} />}
      </main>
    </div>
  );
}