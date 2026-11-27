import {
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  WheelEvent,
} from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import { useBrowserStore } from "../../store/useBrowserStore";
import { TabItem } from "./TabItem";

// Minimum pointer movement before a press becomes a drag so clicks still register.
const DRAG_THRESHOLD_PX = 5;
const SCROLL_STEP_PX = 160;
const SCROLL_EDGE_PX = 8;

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
  const { t } = useTranslation();
  const tabs = useBrowserStore((state) => state.tabs);
  const activeTabId = useBrowserStore((state) => state.activeTabId);
  const selectTab = useBrowserStore((state) => state.selectTab);
  const closeTab = useBrowserStore((state) => state.closeTab);
  const createTab = useBrowserStore((state) => state.createTab);
  const moveTab = useBrowserStore((state) => state.moveTab);

  const containerRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [overflow, setOverflow] = useState({ left: false, right: false });

  const updateOverflow = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const left = container.scrollLeft > 1;
    const right = container.scrollLeft + container.clientWidth < container.scrollWidth - 1;
    setOverflow((previous) =>
      previous.left === left && previous.right === right ? previous : { left, right },
    );
  }, []);

  useLayoutEffect(() => {
    updateOverflow();
  }, [tabs, updateOverflow]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(updateOverflow);
    observer.observe(container);
    return () => observer.disconnect();
  }, [updateOverflow]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const tabElement = findTabElement(container, activeTabId);
    if (!tabElement) return;

    const tabLeft = tabElement.offsetLeft;
    const tabRight = tabLeft + tabElement.offsetWidth;
    const viewLeft = container.scrollLeft;
    const viewRight = viewLeft + container.clientWidth;

    if (tabLeft < viewLeft) {
      container.scrollTo({ left: tabLeft - SCROLL_EDGE_PX, behavior: "smooth" });
    } else if (tabRight > viewRight) {
      container.scrollTo({
        left: tabRight - container.clientWidth + SCROLL_EDGE_PX,
        behavior: "smooth",
      });
    }
  }, [activeTabId, tabs.length]);

  const scrollTabs = (direction: -1 | 1) => {
    containerRef.current?.scrollBy({ left: direction * SCROLL_STEP_PX, behavior: "smooth" });
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || event.deltaY === 0) return;
    container.scrollLeft += event.deltaY;
  };

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

  const isOverflowing = overflow.left || overflow.right;

  const newTabButton = (
    <button
      type="button"
      onClick={() => {
        void createTab();
      }}
      aria-label={t("newTab")}
      title={t("newTab")}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-fg"
    >
      <Plus className="h-4 w-4" />
    </button>
  );

  return (
    <div className="flex h-9 min-w-0 flex-1 items-center pt-1.5">
      {overflow.left && (
        <button
          type="button"
          onClick={() => scrollTabs(-1)}
          aria-label={t("scrollTabsLeft")}
          title={t("scrollTabsLeft")}
          className="flex h-7 w-6 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-fg"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      <div
        ref={containerRef}
        role="tablist"
        data-tauri-drag-region
        onScroll={updateOverflow}
        onWheel={handleWheel}
        className="relative flex h-full min-w-0 flex-1 items-center gap-1 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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

        {!isOverflowing && newTabButton}
      </div>

      {overflow.right && (
        <button
          type="button"
          onClick={() => scrollTabs(1)}
          aria-label={t("scrollTabsRight")}
          title={t("scrollTabsRight")}
          className="flex h-7 w-6 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-fg"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Keeps the new-tab button visible when tabs overflow horizontally. */}
      {isOverflowing && <div className="mr-2 ml-0.5 flex shrink-0">{newTabButton}</div>}
    </div>
  );
}