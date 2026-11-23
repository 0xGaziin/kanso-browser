import {
  PointerEvent as ReactPointerEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Plus } from "lucide-react";
import { useBrowserStore } from "../../store/useBrowserStore";
import { TabItem } from "./TabItem";

// Minimum pointer movement before a press becomes a drag so clicks still register.
const DRAG_THRESHOLD_PX = 5;

interface DragState {
  id: string;
  dx: number;
  startOffsetLeft: number;
}

function findTabElement(container: HTMLElement, id: string): HTMLElement | null {
  return container.querySelector<HTMLElement>(`[data-tab-id="${CSS.escape(id)}"]`);
}

// Target slot equals how many other tabs have their center to the left of the dragged tab.
function computeTargetIndex(
  container: HTMLElement,
  draggedId: string,
  draggedCenterX: number,
): number {
  return Array.from(container.querySelectorAll<HTMLElement>("[data-tab-id]")).filter(
    (el) =>
      el.dataset.tabId !== draggedId &&
      el.offsetLeft + el.offsetWidth / 2 < draggedCenterX,
  ).length;
}

export function TabBar() {
  const tabs = useBrowserStore((state) => state.tabs);
  const activeTabId = useBrowserStore((state) => state.activeTabId);
  const selectTab = useBrowserStore((state) => state.selectTab);
  const closeTab = useBrowserStore((state) => state.closeTab);
  const createTab = useBrowserStore((state) => state.createTab);
  const moveTab = useBrowserStore((state) => state.moveTab);

  const containerRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  // Compensates for layout shift after reorder so the dragged tab stays under the pointer.
  useLayoutEffect(() => {
    if (!drag || !containerRef.current) return;
    const element = findTabElement(containerRef.current, drag.id);
    if (!element) return;
    const layoutShift = element.offsetLeft - drag.startOffsetLeft;
    element.style.transform = `translateX(${drag.dx - layoutShift}px)`;
  }, [drag, tabs]);

  const handleTabPointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
    tabId: string,
  ) => {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button")) return;

    const container = containerRef.current;
    if (!container) return;

    const element = event.currentTarget;
    const pointerId = event.pointerId;
    const startX = event.clientX;
    let startOffsetLeft = 0;
    let isDragging = false;

    const handleMove = (moveEvent: PointerEvent) => {
      const rawDx = moveEvent.clientX - startX;

      if (!isDragging) {
        if (Math.abs(rawDx) < DRAG_THRESHOLD_PX) return;
        isDragging = true;
        startOffsetLeft = element.offsetLeft;
        // Captures pointer so dragging continues outside the tab or window bounds.
        element.setPointerCapture(pointerId);
      }

      const width = element.offsetWidth;
      const minDx = -startOffsetLeft;
      const maxDx = container.scrollWidth - width - startOffsetLeft;
      const dx = Math.min(Math.max(rawDx, minDx), maxDx);

      setDrag({ id: tabId, dx, startOffsetLeft });
      moveTab(tabId, computeTargetIndex(container, tabId, startOffsetLeft + dx + width / 2));
    };

    const finish = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);

      if (!isDragging) return;
      if (element.hasPointerCapture(pointerId)) {
        element.releasePointerCapture(pointerId);
      }
      element.style.transform = "";
      setDrag(null);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
  };

  return (
    <div
      ref={containerRef}
      role="tablist"
      className="relative flex h-9 items-center gap-1 overflow-x-auto px-2 pt-1.5"
    >
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          tab={tab}
          isActive={tab.id === activeTabId}
          isDragging={drag?.id === tab.id}
          canClose={tabs.length > 1}
          onSelect={selectTab}
          onClose={closeTab}
          onPointerDown={(event) => handleTabPointerDown(event, tab.id)}
        />
      ))}

      {/* Keeps the new-tab button visible when tabs overflow horizontally. */}
      <button
        type="button"
        onClick={() => {
          void createTab();
        }}
        aria-label="New tab"
        title="New tab"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#9A9AA6] transition-colors hover:bg-[#18181D] hover:text-[#F4F4F6]"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}