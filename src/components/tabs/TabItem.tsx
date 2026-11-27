import { MouseEvent, PointerEvent, useEffect, useState } from "react";
import { Globe, Loader2, Moon, Volume2, X } from "lucide-react";
import { useElementWidth } from "../../hooks/useElementWidth";
import { INTERNAL_PAGE_TITLE_KEYS } from "../../i18n/internalPageTitleKeys";
import { useTranslation } from "../../i18n/useTranslation";
import { Tab } from "../../types/browser";
import { getInternalPage } from "../../utils/internalPages";

const ICON_ONLY_MAX_WIDTH_PX = 56;
const INLINE_CLOSE_MIN_WIDTH_PX = 128;

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
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const { t } = useTranslation();
  const internalPage = getInternalPage(tab.url);
  const displayTitle = internalPage
    ? t(INTERNAL_PAGE_TITLE_KEYS[internalPage])
    : tab.title || tab.url;
  const isIconOnly = !tab.isPinned && width < ICON_ONLY_MAX_WIDTH_PX;
  const hasInlineClose = width >= INLINE_CLOSE_MIN_WIDTH_PX;

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
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-accent" />
      );
    }

    if (tab.isSuspended && !isActive) {
      return <Moon className="h-3.5 w-3.5 shrink-0 text-muted/70" />;
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

    return <Globe className="h-3.5 w-3.5 shrink-0 text-muted" />;
  };

  const containerDimensions = tab.isPinned
    ? "w-9 justify-center px-0 shrink-0"
    : isIconOnly
    ? "min-w-9 max-w-[200px] flex-1 justify-center px-0"
    : `${isActive ? "min-w-24" : "min-w-9"} max-w-[200px] flex-1 justify-between px-2.5`;

  const surfaceStyle = isActive
    ? "bg-active text-fg ring-1 ring-line"
    : tab.isSuspended
    ? "bg-chrome text-muted/60 hover:bg-hover hover:text-fg"
    : "bg-surface text-muted hover:bg-hover hover:text-fg";

  // The dragged tab floats above its siblings and follows the pointer.
  const dragStyle = isDragging
    ? "z-10 cursor-grabbing shadow-lg shadow-black/50"
    : "cursor-pointer";

  return (
    <div
      ref={ref}
      role="tab"
      data-tab-id={tab.id}
      aria-selected={isActive}
      onClick={() => onSelect(tab.id)}
      onAuxClick={handleAuxClick}
      onPointerDown={onPointerDown}
      title={displayTitle}
      className={`group relative flex h-7 items-center gap-2 rounded-md text-xs transition-colors ${containerDimensions} ${surfaceStyle} ${dragStyle}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        {renderIcon()}

        {!tab.isPinned && !isIconOnly && (
          <span className="truncate">{displayTitle}</span>
        )}
      </div>

      {!tab.isPinned && !isIconOnly && (
        <div className="flex shrink-0 items-center gap-1">
          {tab.isPlayingAudio && hasInlineClose && (
            <Volume2 className="h-3 w-3 text-accent" />
          )}

          {canClose && (
            <button
              type="button"
              onClick={handleCloseClick}
              aria-label={t("closeTab")}
              className={`flex h-4 w-4 items-center justify-center rounded text-muted opacity-0 transition-opacity hover:bg-line hover:text-fg focus:opacity-100 group-hover:opacity-100 ${
                hasInlineClose ? "" : "absolute top-1/2 right-1 -translate-y-1/2 bg-line"
              }`}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}