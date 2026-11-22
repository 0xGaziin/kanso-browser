import { EllipsisVertical } from "lucide-react";
import { browserApi } from "../../services/browserApi";

export function MenuButton() {
  return (
    <button
      type="button"
      onClick={() => {
        browserApi.showMenu().catch((err) => console.error("[Kanso] menu error:", err));
      }}
      aria-label="Menu"
      title="Menu"
      className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface hover:text-fg"
    >
      <EllipsisVertical className="h-4 w-4" />
    </button>
  );
}