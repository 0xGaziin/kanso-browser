import { ChangeEvent, FormEvent, KeyboardEvent, MouseEvent, useRef, useState } from "react";
import { Search, Star } from "lucide-react";
import { useSuggestions } from "../../hooks/useSuggestions";
import { useTranslation } from "../../i18n/useTranslation";
import { useSuggestionsOverlay } from "../../hooks/useSuggestionsOverlay";
import { useBookmarksStore } from "../../store/useBookmarksStore";
import { normalizeUrl, useBrowserStore } from "../../store/useBrowserStore";
import { isInternalUrl } from "../../utils/internalPages";

export function OmniBox() {
  const { t } = useTranslation();
  const addressInput = useBrowserStore((state) => state.addressInput);
  const setAddressInput = useBrowserStore((state) => state.setAddressInput);
  const setAddressEditing = useBrowserStore((state) => state.setAddressEditing);
  const navigate = useBrowserStore((state) => state.navigate);
  const activeUrl = useBrowserStore(
    (state) => state.tabs.find((tab) => tab.id === state.activeTabId)?.url ?? "",
  );
  const activeTitle = useBrowserStore(
    (state) => state.tabs.find((tab) => tab.id === state.activeTabId)?.title ?? "",
  );

  const canBookmark = !isInternalUrl(activeUrl);
  const bookmarkUrl = normalizeUrl(activeUrl);
  const isBookmarked = useBookmarksStore((state) =>
    state.items.some((item) => item.url === bookmarkUrl),
  );
  const toggleBookmark = useBookmarksStore((state) => state.toggle);

  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // True only after the user changed the text, not while the box shows the page's URL.
  const [isTyping, setIsTyping] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const suggestions = useSuggestions(addressInput, isTyping);
  // With only the typed row there is nothing to choose from.
  const isOpen = isTyping && suggestions.length > 1;
  const activeIndex = Math.max(0, Math.min(highlight, suggestions.length - 1));

  const goTo = (target: string) => {
    // Blurring ends the edit, so the box follows the page's final URL again.
    inputRef.current?.blur();
    void navigate(target);
  };

  // The list is drawn by a separate native webview so it can overlap the page.
  useSuggestionsOverlay({
    anchorRef: formRef,
    isOpen,
    suggestions,
    activeIndex,
    onPick: goTo,
  });

  const handleFocus = () => {
    setAddressEditing(true);
    // Select on the next frame so pointer release does not override the full selection.
    window.requestAnimationFrame(() => {
      inputRef.current?.select();
    });
  };

  const handleBlur = () => {
    setIsTyping(false);
    setAddressEditing(false);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAddressInput(event.target.value);
    setIsTyping(true);
    setHighlight(0);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsTyping(false);
      return;
    }
    if (!isOpen) return;

    const step = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
    if (step === 0) return;

    event.preventDefault();
    setHighlight((activeIndex + step + suggestions.length) % suggestions.length);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Row 0 is the typed text; using the live input avoids a stale deferred value.
    const picked = isOpen && activeIndex > 0 ? suggestions[activeIndex].target : addressInput;
    goTo(picked);
  };

  const handleBookmarkClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    toggleBookmark(bookmarkUrl, activeTitle);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-1 items-center">
      <div
        onClick={() => inputRef.current?.focus()}
        className="flex h-8 w-full cursor-text items-center gap-2 rounded-lg border border-line bg-surface px-3 focus-within:border-accent/60"
      >
        <Search className="h-3.5 w-3.5 text-muted" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          value={addressInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={t("searchPlaceholder")}
          className="w-full select-text bg-transparent text-xs text-fg placeholder-muted outline-none"
        />
        {canBookmark && (
          <button
            type="button"
            onClick={handleBookmarkClick}
            aria-label={isBookmarked ? t("removeBookmark") : t("addBookmark")}
            title={isBookmarked ? t("removeBookmark") : t("addBookmark")}
            className="shrink-0 rounded p-0.5 transition-colors hover:bg-line"
          >
            <Star
              className={`h-3.5 w-3.5 ${
                isBookmarked ? "fill-accent text-accent" : "text-muted"
              }`}
            />
          </button>
        )}
      </div>
    </form>
  );
}