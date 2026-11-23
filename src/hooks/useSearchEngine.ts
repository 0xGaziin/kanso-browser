import { useMemo } from "react";
import { useSettingsStore } from "../store/useSettingsStore";
import { resolveSearchEngine, SearchEngine } from "../utils/resolveInput";

export function useSearchEngine(): SearchEngine {
  const engineId = useSettingsStore((state) => state.searchEngineId);
  const customSearchUrl = useSettingsStore((state) => state.customSearchUrl);

  return useMemo(
    () => resolveSearchEngine(engineId, customSearchUrl),
    [engineId, customSearchUrl],
  );
}