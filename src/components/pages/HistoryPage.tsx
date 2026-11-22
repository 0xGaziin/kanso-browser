import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import { HistoryEntry, useHistoryStore } from "../../store/useHistoryStore";
import { useBrowserStore } from "../../store/useBrowserStore";
import { EmptyState, PageShell, SECONDARY_BUTTON_CLASS } from "./PageShell.tsx";
import { SiteIcon } from "./SiteIcon";

const DAY_MS = 24 * 60 * 60 * 1000;

interface DayLabels {
  today: string;
  yesterday: string;
}

function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function dayLabel(timestamp: number, labels: DayLabels, locale: string): string {
  const diffDays = Math.round((startOfDay(Date.now()) - startOfDay(timestamp)) / DAY_MS);
  if (diffDays === 0) return labels.today;
  if (diffDays === 1) return labels.yesterday;
  return new Date(timestamp).toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function groupByDay(
  entries: HistoryEntry[],
  labels: DayLabels,
  locale: string,
): Array<[string, HistoryEntry[]]> {
  const groups = new Map<string, HistoryEntry[]>();
  for (const entry of entries) {
    const label = dayLabel(entry.visitedAt, labels, locale);
    groups.set(label, [...(groups.get(label) ?? []), entry]);
  }
  return Array.from(groups.entries());
}

export function HistoryPage() {
  const { t, locale } = useTranslation();
  const entries = useHistoryStore((state) => state.entries);
  const removeEntry = useHistoryStore((state) => state.removeEntry);
  const clear = useHistoryStore((state) => state.clear);
  const navigate = useBrowserStore((state) => state.navigate);

  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? entries.filter(
          (entry) =>
            entry.title.toLowerCase().includes(needle) ||
            entry.url.toLowerCase().includes(needle),
        )
      : entries;
    return groupByDay(filtered, { today: t("today"), yesterday: t("yesterday") }, locale);
  }, [entries, query, t, locale]);

  const handleClear = () => {
    if (window.confirm(t("confirmClearHistory"))) clear();
  };

  return (
    <PageShell
      title={t("history")}
      description={t("historyDescription")}
      actions={
        <button
          type="button"
          onClick={handleClear}
          disabled={entries.length === 0}
          className={SECONDARY_BUTTON_CLASS}
        >
          {t("clearHistory")}
        </button>
      }
    >
      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface/80 px-3 py-2 focus-within:border-accent/60">
        <Search className="h-4 w-4 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchHistory")}
          className="w-full bg-transparent text-sm text-fg placeholder-muted outline-none"
        />
      </div>

      {groups.length === 0 ? (
        <EmptyState
          message={query ? t("noHistoryMatches") : t("noHistory")}
        />
      ) : (
        groups.map(([label, items]) => (
          <section key={label} className="flex flex-col gap-1">
            <h2 className="px-1 pb-1 text-xs font-medium tracking-wide text-muted uppercase">
              {label}
            </h2>
            {items.map((entry) => (
              <div
                key={entry.id}
                className="group flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-surface"
              >
                <span className="w-12 shrink-0 text-[11px] text-muted">
                  {new Date(entry.visitedAt).toLocaleTimeString(locale, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <SiteIcon url={entry.url} />
                <button
                  type="button"
                  onClick={() => void navigate(entry.url)}
                  className="flex min-w-0 flex-1 items-baseline gap-2 text-left"
                  title={entry.url}
                >
                  <span className="truncate text-sm text-fg">{entry.title}</span>
                  <span className="truncate text-[11px] text-muted">
                    {new URL(entry.url).hostname}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  aria-label={t("removeFromHistory")}
                  className="rounded-md p-1 text-muted opacity-0 transition hover:bg-active hover:text-fg group-hover:opacity-100 focus:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </section>
        ))
      )}
    </PageShell>
  );
}