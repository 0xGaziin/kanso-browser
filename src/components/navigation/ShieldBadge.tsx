import { ShieldCheck } from "lucide-react";
import { useBrowserStore } from "../../store/useBrowserStore";

export function ShieldBadge() {
  const blockedCount = useBrowserStore((state) => {
    const activeTab = state.tabs.find((t) => t.id === state.activeTabId);
    return activeTab?.blockedCount ?? 0;
  });

  return (
    <div
      aria-label={`Trackers blocked in this tab: ${blockedCount}`}
      className="flex h-8 items-center gap-1.5 rounded-lg border border-[#2C2C35] bg-[#18181D] px-2.5 text-xs text-[#34D399]"
      title={`Trackers blocked in this tab: ${blockedCount}`}
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      <span className="font-mono text-[11px]">{blockedCount}</span>
    </div>
  );
}