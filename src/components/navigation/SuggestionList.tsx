import { Clock, Globe, LucideIcon, Search, Star } from "lucide-react";
import { SUGGESTION_ROW_HEIGHT } from "../../utils/suggestionLayout";
import { Suggestion, SuggestionKind } from "../../utils/suggestions";

const ICONS: Record<SuggestionKind, LucideIcon> = {
  navigate: Globe,
  search: Search,
  bookmark: Star,
  history: Clock,
};

interface SuggestionListProps {
  id: string;
  suggestions: Suggestion[];
  activeIndex: number;
  onPick: (target: string) => void;
}

// Fills the overlay webview; height is controlled externally via suggestionListHeight.
export function SuggestionList({ id, suggestions, activeIndex, onPick }: SuggestionListProps) {
  return (
    <ul
      id={id}
      role="listbox"
      className="h-full w-full overflow-hidden border border-line bg-surface py-1"
    >
      {suggestions.map((suggestion, index) => {
        const Icon = ICONS[suggestion.kind];

        return (
          <li
            key={suggestion.id}
            role="option"
            aria-selected={index === activeIndex}
            // Uses onPointerDown instead of click so focusing this overlay webview does not dismiss the list first.
            onPointerDown={(event) => {
              event.preventDefault();
              onPick(suggestion.target);
            }}
            style={{ height: SUGGESTION_ROW_HEIGHT }}
            className={`flex cursor-pointer items-center gap-2.5 px-3 text-xs hover:bg-hover ${
              index === activeIndex ? "bg-active" : ""
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-muted" />
            <span className="truncate text-fg">{suggestion.label}</span>
            {suggestion.detail && (
              <span className="truncate text-[11px] text-muted">{suggestion.detail}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}