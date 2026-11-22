import { ArrowLeft, ArrowRight, RotateCw } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import { useBrowserStore } from "../../store/useBrowserStore";

const BUTTON_CLASS =
  "rounded-md p-1.5 text-muted transition-colors hover:bg-surface hover:text-fg disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-muted";

export function NavControls() {
  const { t } = useTranslation();
  const goBack = useBrowserStore((state) => state.goBack);
  const goForward = useBrowserStore((state) => state.goForward);
  const controlActiveTab = useBrowserStore((state) => state.controlActiveTab);

  const canGoBack = useBrowserStore((state) => {
    const history = state.histories[state.activeTabId];
    return history !== undefined && history.index > 0;
  });
  const canGoForward = useBrowserStore((state) => {
    const history = state.histories[state.activeTabId];
    return history !== undefined && history.index < history.entries.length - 1;
  });

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => {
          void goBack();
        }}
        disabled={!canGoBack}
        aria-label={t("back")}
        title={t("back")}
        className={BUTTON_CLASS}
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => {
          void goForward();
        }}
        disabled={!canGoForward}
        aria-label={t("forward")}
        title={t("forward")}
        className={BUTTON_CLASS}
      >
        <ArrowRight className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => {
          void controlActiveTab("reload");
        }}
        aria-label={t("reload")}
        title={t("reload")}
        className={BUTTON_CLASS}
      >
        <RotateCw className="h-4 w-4" />
      </button>
    </div>
  );
}