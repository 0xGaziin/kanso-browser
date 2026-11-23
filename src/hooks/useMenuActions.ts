import { useEffect } from "react";
import { browserApi } from "../services/browserApi";
import { useBrowserStore } from "../store/useBrowserStore";
import { internalUrl, isInternalPage } from "../utils/internalPages";

// Action ids match internal page names emitted by menu.rs.
const NEW_TAB_ACTION = "new-tab";

export function useMenuActions() {
  const createTab = useBrowserStore((state) => state.createTab);

  useEffect(() => {
    const unlisten = browserApi.onMenuAction((actionId) => {
      if (actionId === NEW_TAB_ACTION) {
        void createTab();
      } else if (isInternalPage(actionId)) {
        void createTab(internalUrl(actionId));
      }
    });

    return () => {
      void unlisten.then((stop) => stop());
    };
  }, [createTab]);
}