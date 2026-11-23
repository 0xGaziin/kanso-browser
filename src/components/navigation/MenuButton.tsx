import { EllipsisVertical } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import { browserApi } from "../../services/browserApi";

export function MenuButton() {
  const { t } = useTranslation();

  const handleClick = () => {
    browserApi
      .showMenu({
        newTab: t("newTab"),
        history: t("history"),
        downloads: t("downloads"),
        bookmarks: t("bookmarks"),
        settings: t("settings"),
        exit: t("exit"),
      })
      .catch((err) => console.error("[Kanso] menu error:", err));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={t("menu")}
      title={t("menu")}
      className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface hover:text-fg"
    >
      <EllipsisVertical className="h-4 w-4" />
    </button>
  );
}