import { File, Loader2 } from "lucide-react";
import { browserApi } from "../../services/browserApi";
import { DownloadItem, useDownloadsStore } from "../../store/useDownloadsStore";
import { EmptyState, PageShell, SECONDARY_BUTTON_CLASS } from "./PageShell.tsx";

const STATUS_LABEL: Record<DownloadItem["status"], string> = {
  downloading: "Downloading…",
  completed: "Completed",
  failed: "Failed",
};

function reportError(action: string) {
  return (err: unknown) => console.error(`[Kanso] ${action} error:`, err);
}

export function DownloadsPage() {
  const items = useDownloadsStore((state) => state.items);
  const remove = useDownloadsStore((state) => state.remove);
  const clear = useDownloadsStore((state) => state.clear);

  return (
    <PageShell
      title="Downloads"
      description="Files are saved to your Downloads folder."
      actions={
        <button
          type="button"
          onClick={clear}
          disabled={items.length === 0}
          className={SECONDARY_BUTTON_CLASS}
        >
          Clear list
        </button>
      }
    >
      {items.length === 0 ? (
        <EmptyState message="Files you download will appear here." />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-2xl border border-line bg-surface/60 px-4 py-3"
            >
              {item.status === "downloading" ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-accent" />
              ) : (
                <File className="h-5 w-5 shrink-0 text-muted" />
              )}

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-fg" title={item.path}>
                  {item.fileName}
                </div>
                <div
                  className={`truncate text-[11px] ${
                    item.status === "failed" ? "text-danger" : "text-muted"
                  }`}
                >
                  {STATUS_LABEL[item.status]} · {new Date(item.startedAt).toLocaleString()}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {item.status === "completed" && (
                  <>
                    <button
                      type="button"
                      onClick={() => void browserApi.openDownload(item.path).catch(reportError("open"))}
                      className={SECONDARY_BUTTON_CLASS}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void browserApi.revealDownload(item.path).catch(reportError("reveal"))
                      }
                      className={SECONDARY_BUTTON_CLASS}
                    >
                      Show in folder
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className={SECONDARY_BUTTON_CLASS}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}