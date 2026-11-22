import { ShieldCheck } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import { useBrowserStore } from "../../store/useBrowserStore";

export function ShieldBadge() {
  const { t } = useTranslation();
  const blockedCount = useBrowserStore((state) => {
    const activeTab = state.tabs.find((t) => t.id === state.activeTabId);
    return activeTab?.blockedCount ?? 0;
  });

  return (
    <div
      aria-label={t("trackersBlocked", { count: blockedCount })}
      className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs text-accent"
      title={t("trackersBlocked", { count: blockedCount })}
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      <span className="font-mono text-[11px]">{blockedCount}</span>
    </div>
  );
}