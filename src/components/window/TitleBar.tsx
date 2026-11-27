import { TabBar } from "../tabs/TabBar";
import { WindowControls } from "./WindowControls";

// Keep height at 36px (h-9) so the header stays 84px, matching TOP_BAR_HEIGHT.
export function TitleBar() {
  return (
    <div className="flex h-9 w-full items-stretch">
      <TabBar />

      {/* Only this spacer drags the window so tabs and window controls remain clickable. */}
      <div data-tauri-drag-region className="w-8 shrink-0" />

      <WindowControls />
    </div>
  );
}