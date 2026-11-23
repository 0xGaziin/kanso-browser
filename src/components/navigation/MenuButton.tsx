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
      className="rounded-md p-1.5 text-[#9A9AA6] transition-colors hover:bg-[#18181D] hover:text-[#F4F4F6]"
    >
      <EllipsisVertical className="h-4 w-4" />
    </button>
  );
}