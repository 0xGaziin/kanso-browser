import { X } from "lucide-react";
import { useBookmarksStore } from "../../store/useBookmarksStore.ts";
import { useBrowserStore } from "../../store/useBrowserStore.ts";
import { EmptyState, PageShell } from "./PageShell.tsx";
import { SiteIcon } from "./SiteIcon.tsx";

export function BookmarksPage() {
  const items = useBookmarksStore((state) => state.items);
  const remove = useBookmarksStore((state) => state.remove);
  const navigate = useBrowserStore((state) => state.navigate);

  return (
    <PageShell
      title="Bookmarks"
      description="Use the star in the address bar to save the page you are on."
    >
      {items.length === 0 ? (
        <EmptyState message="No bookmarks yet." />
      ) : (
        <div className="flex flex-col gap-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-surface"
            >
              <SiteIcon url={item.url} />
              <button
                type="button"
                onClick={() => void navigate(item.url)}
                className="flex min-w-0 flex-1 items-baseline gap-2 text-left"
                title={item.url}
              >
                <span className="truncate text-sm text-fg">{item.title}</span>
                <span className="truncate text-[11px] text-muted">
                  {new URL(item.url).hostname}
                </span>
              </button>
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label="Remove bookmark"
                className="rounded-md p-1 text-muted opacity-0 transition hover:bg-active hover:text-fg group-hover:opacity-100 focus:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}