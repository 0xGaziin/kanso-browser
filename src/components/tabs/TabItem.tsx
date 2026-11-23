import { MouseEvent, PointerEvent, useEffect, useState } from "react";
import { Globe, Loader2, Moon, Volume2, X } from "lucide-react";
import { Tab } from "../../types/browser";

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  isDragging: boolean;
  canClose: boolean;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
}

export function TabItem({
  tab,
  isActive,
  isDragging,
  canClose,
  onSelect,
  onClose,
  onPointerDown,
}: TabItemProps) {
  const [faviconError, setFaviconError] = useState(false);

  // Reset error state on navigation so a new tab icon can load cleanly.
  useEffect(() => {
    setFaviconError(false);
  }, [tab.favicon, tab.url]);

  const handleAuxClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.button === 1 && canClose && !tab.isPinned) {
      e.preventDefault();
      e.stopPropagation();
      onClose(tab.id);
    }
  };

  const handleCloseClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClose(tab.id);
  };

  const renderIcon = () => {
    if (tab.isLoading) {
      return (
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[#34D399]" />
      );
    }

    if (tab.isSuspended && !isActive) {
      return <Moon className="h-3.5 w-3.5 shrink-0 text-[#9A9AA6]/70" />;
    }

    if (tab.favicon && !faviconError) {
      return (
        <img
          src={tab.favicon}
          alt=""
          draggable={false}
          onError={() => setFaviconError(true)}
          className="h-3.5 w-3.5 shrink-0 rounded-xs object-contain"
        />
      );
    }

    return <Globe className="h-3.5 w-3.5 shrink-0 text-[#9A9AA6]" />;
  };

  const containerDimensions = tab.isPinned
    ? "w-9 justify-center px-0 shrink-0"
    : "min-w-[120px] max-w-[200px] flex-1 justify-between px-2.5";

  const surfaceStyle = isActive
    ? "bg-[#222229] text-[#F4F4F6] ring-1 ring-[#2C2C35]"
    : tab.isSuspended
    ? "bg-[#141418] text-[#9A9AA6]/60 hover:bg-[#1E1E24] hover:text-[#F4F4F6]"
    : "bg-[#18181D] text-[#9A9AA6] hover:bg-[#1E1E24] hover:text-[#F4F4F6]";

  // The dragged tab floats above its siblings and follows the pointer.
  const dragStyle = isDragging
    ? "z-10 cursor-grabbing shadow-lg shadow-black/50"
    : "cursor-pointer";

  return (
    <div
      role="tab"
      data-tab-id={tab.id}
      aria-selected={isActive}
      onClick={() => onSelect(tab.id)}
      onAuxClick={handleAuxClick}
      onPointerDown={onPointerDown}
      title={tab.title || tab.url}
      className={`group relative flex h-7 items-center gap-2 rounded-md text-xs transition-colors ${containerDimensions} ${surfaceStyle} ${dragStyle}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        {renderIcon()}

        {!tab.isPinned && (
          <span className="truncate">{tab.title || tab.url}</span>
        )}
      </div>

      {!tab.isPinned && (
        <div className="flex shrink-0 items-center gap-1">
          {tab.isPlayingAudio && (
            <Volume2 className="h-3 w-3 text-[#34D399]" />
          )}

          {canClose && (
            <button
              type="button"
              onClick={handleCloseClick}
              aria-label="Close tab"
              className="flex h-4 w-4 items-center justify-center rounded text-[#9A9AA6] opacity-0 transition-opacity hover:bg-[#2C2C35] hover:text-[#F4F4F6] focus:opacity-100 group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}