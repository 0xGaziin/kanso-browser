import { useEffect } from "react";
import { browserApi } from "../services/browserApi";
import { useDownloadsStore } from "../store/useDownloadsStore";

export function useDownloadListeners() {
  useEffect(() => {
    const { handleStarted, handleFinished } = useDownloadsStore.getState();

    const listeners = Promise.all([
      browserApi.onDownloadStarted(handleStarted),
      browserApi.onDownloadFinished(handleFinished),
    ]);

    return () => {
      void listeners.then((stops) => stops.forEach((stop) => stop()));
    };
  }, []);
}